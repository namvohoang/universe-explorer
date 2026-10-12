"""Works out how long a tsunami takes to reach every part of the sea, from the real depths.

Dev-only, like the recording tool: nothing here ships but its two outputs.

    <python with numpy and pillow> tools/tsunami/travel_times.py kermadec2021Tsunami 5771

The number is the tsunami's id in NOAA's Global Historical Tsunami Database. The tool asks
that database for the tsunami and for every place its arrival was timed, asks NOAA's DEM
Global Mosaic for the depth of the sea on a grid of an eighth of a degree, and then finds the
quickest way for a wave to get from where the tsunami began to every cell of the sea. Out at
sea a tsunami goes at the square root of (gravity times depth), so over each step from one
cell to the next it takes the length of the step over the mean of the two cells' speeds.

It writes:
  public/media/stories/<name>-arrival.png  the minutes to each half-degree cell, as a picture
  src/data/paths/<name>.ts                 the tsunami, and each gauge with the time measured
                                           there and the time worked out for it

The wave is taken to begin at one point, though the sea floor really moved over a wide patch,
and a cell is 14 km across at the equator: a harbour, where most gauges are, is far smaller.
A grid half as fine again (a twelfth of a degree) was tried on 2026-10-12 and agreed with the
gauges no better, so what is left is not the size of the cells.
"""

from __future__ import annotations

import heapq
import io
import json
import math
import re
import sys
import urllib.request
from datetime import date, datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
HAZEL = "https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/tsunamis"
DEPTHS = (
    "https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/DEM_global_mosaic/ImageServer/"
    "exportImage?bbox=-180,-90,180,90&bboxSR=4326&imageSR=4326&size={w},{h}&format=tiff"
    "&pixelType=F32&interpolation=RSP_BilinearInterpolation&f=image"
)
CELLS_ACROSS = 2880  # an eighth of a degree
CELLS_UP = 1440
STANDARD_GRAVITY = 9.80665  # m/s², the standard value (CGPM, 1901)
EARTH_RADIUS_KM = 6371.0088  # the mean radius (IUGG)
# A cell shallower than this is given this depth: one number stands for 14 km of sea, and near
# a shore a few metres would stop the wave dead in a cell that is mostly deeper.
LEAST_DEPTH_M = 10.0
# Steps to the 16 cells round a cell: beside it, cornerwise, and a knight's move away, so that
# the wave can set off in 16 directions and its front comes out nearly round.
STEPS = [(dy, dx) for dy in (-2, -1, 0, 1, 2) for dx in (-2, -1, 0, 1, 2)
         if (dy, dx) != (0, 0) and abs(dy) + abs(dx) <= 3 and not (abs(dy) == 2 and abs(dx) == 0)
         and not (abs(dy) == 0 and abs(dx) == 2) and not (abs(dy) == 2 and abs(dx) == 2)]
SHIPPED_ACROSS = 720  # half a degree
SHIPPED_UP = 360
TENTHS_OF_A_MINUTE = 10  # the picture holds minutes times ten, in two bytes
UNIX_EPOCH_JD = 2440587.5
# A gauge on a cell of land is given the time of the cell of sea nearest it, looked for this far off.
GAUGE_REACH_CELLS = 3


def get_json(url: str):
    with urllib.request.urlopen(url, timeout=120) as response:
        return json.load(response)


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit("usage: travel_times.py <name> <NOAA tsunami event id>")
    name, event_id = sys.argv[1], sys.argv[2]

    event = get_json(f"{HAZEL}/events/{event_id}")
    runups, page = [], 1
    while True:
        answer = get_json(f"{HAZEL}/runups?tsunamiEventId={event_id}&itemsPerPage=200&page={page}")
        runups += answer["items"]
        if page >= answer.get("totalPages", 1):
            break
        page += 1

    with urllib.request.urlopen(DEPTHS.format(w=CELLS_ACROSS, h=CELLS_UP), timeout=300) as response:
        height = np.array(Image.open(io.BytesIO(response.read())), dtype=np.float64)
    sea = height < 0
    depth = np.maximum(-height, LEAST_DEPTH_M)
    speed = np.sqrt(STANDARD_GRAVITY * depth) / 1000.0  # km/s
    lat = 90.0 - (np.arange(CELLS_UP) + 0.5) * 180.0 / CELLS_UP
    lon = -180.0 + (np.arange(CELLS_ACROSS) + 0.5) * 360.0 / CELLS_ACROSS

    def cell(lon_deg: float, lat_deg: float) -> tuple[int, int]:
        row = min(CELLS_UP - 1, max(0, int((90.0 - lat_deg) / 180.0 * CELLS_UP)))
        column = int((lon_deg + 180.0) / 360.0 * CELLS_ACROSS) % CELLS_ACROSS
        return row, column

    def nearest_sea(row: int, column: int, reach: int) -> list[tuple[int, int]]:
        found = []
        for dy in range(-reach, reach + 1):
            for dx in range(-reach, reach + 1):
                y, x = row + dy, (column + dx) % CELLS_ACROSS
                if 0 <= y < CELLS_UP and sea[y, x]:
                    found.append((y, x))
        return found

    # How long each kind of step is from each row, in km: it depends only on the latitude.
    lat_rad = np.radians(lat)
    step_km = {}
    for dy, dx in STEPS:
        lengths = np.zeros(CELLS_UP)
        for row in range(CELLS_UP):
            to = row + dy
            if not 0 <= to < CELLS_UP:
                continue
            across = math.radians(dx * 360.0 / CELLS_ACROSS)
            a = (math.sin((lat_rad[to] - lat_rad[row]) / 2) ** 2
                 + math.cos(lat_rad[row]) * math.cos(lat_rad[to]) * math.sin(across / 2) ** 2)
            lengths[row] = 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(a))
        step_km[(dy, dx)] = lengths

    start_row, start_column = cell(event["longitude"], event["latitude"])
    starts = nearest_sea(start_row, start_column, 0) or nearest_sea(start_row, start_column, 2)
    if not starts:
        sys.exit("the tsunami began on land, as far as this grid can tell")
    seconds = np.full((CELLS_UP, CELLS_ACROSS), np.inf)
    queue = []
    for row, column in starts:
        seconds[row, column] = 0.0
        heapq.heappush(queue, (0.0, row, column))
    sea_rows, speed_rows = sea.tolist(), speed.tolist()
    while queue:
        so_far, row, column = heapq.heappop(queue)
        if so_far > seconds[row, column]:
            continue
        here = speed_rows[row][column]
        for (dy, dx), lengths in step_km.items():
            to_row = row + dy
            if not 0 <= to_row < CELLS_UP:
                continue
            to_column = (column + dx) % CELLS_ACROSS
            if not sea_rows[to_row][to_column]:
                continue
            arrives = so_far + lengths[row] / ((here + speed_rows[to_row][to_column]) / 2)
            if arrives < seconds[to_row, to_column]:
                seconds[to_row, to_column] = arrives
                heapq.heappush(queue, (arrives, to_row, to_column))
    minutes = seconds / 60.0

    gauges = []
    for runup in runups:
        if runup.get("travHours") is None or runup.get("doubtful") == "y":
            continue
        measured = runup["travHours"] * 60 + (runup.get("travMins") or 0)
        row, column = cell(runup["longitude"], runup["latitude"])
        near = [
            (math.hypot(y - row, x - column), minutes[y, x])
            for y, x in nearest_sea(row, column, GAUGE_REACH_CELLS)
            if math.isfinite(minutes[y, x])
        ]
        worked_out = round(float(min(near)[1]), 1) if near else None
        gauges.append([
            round(runup["longitude"], 4), round(runup["latitude"], 4), measured, worked_out,
            runup.get("runupHt"), re.sub(r"\s+", " ", f"{runup['locationName']}, {runup['country']}").title(),
        ])
    gauges.sort(key=lambda gauge: gauge[2])

    # The picture: half-degree cells, each with the soonest of the cells of the grid inside it.
    fold = CELLS_UP // SHIPPED_UP
    blocks = minutes.reshape(SHIPPED_UP, fold, SHIPPED_ACROSS, fold).min(axis=(1, 3))
    reached = np.isfinite(blocks)
    tenths = np.where(reached, np.minimum(np.round(blocks * TENTHS_OF_A_MINUTE), 65535), 0).astype(np.uint16)
    picture = np.zeros((SHIPPED_UP, SHIPPED_ACROSS, 3), dtype=np.uint8)
    picture[..., 0] = tenths >> 8
    picture[..., 1] = tenths & 255
    picture[..., 2] = np.where(reached, 255, 0)
    file = f"public/media/stories/{re.sub(r'(?<!^)(?=[A-Z0-9])', '-', name).lower().replace('-tsunami', '')}-tsunami-arrival.png"
    file = re.sub(r"-(\d)-(\d)-(\d)-(\d)", r"-\1\2\3\4", file)
    Image.fromarray(picture, "RGB").save(ROOT / file, optimize=True)

    began = datetime(event["year"], event["month"], event["day"], event["hour"], event["minute"],
                     int(event.get("second") or 0), tzinfo=timezone.utc)
    origin_jd = began.timestamp() / 86400 + UNIX_EPOCH_JD
    constant = re.sub(r"(?<!^)(?=[A-Z])|(?<=[a-z])(?=\d)", "_", name).upper()
    source = f"noaa-tsunami-{event_id}"
    def ts(value) -> str:
        if value is None:
            return "null"
        if isinstance(value, str):
            return "'" + value.replace("\\", "\\\\").replace("'", "\\'") + "'"
        return json.dumps(value)

    rows = "\n".join("      [" + ", ".join(ts(value) for value in gauge) + "]," for gauge in gauges)
    (ROOT / "src/data/paths" / f"{name}.ts").write_text(f"""// Written by tools/tsunami/travel_times.py on {date.today().isoformat()}. Do not edit a number by hand: run the tool again.
// The tsunami of {began:%-d %B %Y} ({event['locationName'].title()}), id {event_id} in NOAA's Global
// Historical Tsunami Database: when and where it began, and every gauge that timed its arrival,
// soonest first: [longitude (degrees east), latitude (degrees north), minutes after it began
// that the wave was measured arriving, minutes the tool worked out for the sea beside the gauge
// from the depths (null where it found no sea there), the highest the water was measured (m,
// null if not given), and the place].
import type {{ TsunamiRecord }} from '../types';

export const {constant}: TsunamiRecord = {{
  originJd: {{ value: {origin_jd:.9f}, sourceId: '{source}' }},
  place: {{ value: [{event['longitude']}, {event['latitude']}], sourceId: '{source}' }},
  arrivalMap: {{
    file: '{file}',
    cellsAcross: {SHIPPED_ACROSS},
    cellsUp: {SHIPPED_UP},
    unitsPerMinute: {TENTHS_OF_A_MINUTE},
  }},
  gauges: {{
    sourceId: '{source}',
    value: [
{rows}
    ],
  }},
}};
""", encoding="utf-8")

    both = [(g[2], g[3]) for g in gauges if g[3] is not None]
    off = sorted(abs(w - m) / m for m, w in both)
    print(f"{name}: {len(gauges)} gauges, {len(both)} with a worked-out time; {file}")
    print(f"  off by: median {off[len(off) // 2]:.1%}, nine in ten within {off[int(len(off) * 0.9)]:.1%}, worst {off[-1]:.1%}")
    print("  early (-) or late (+), in minutes: " + ", ".join(f"{w - m:+.0f}" for m, w in both))


if __name__ == "__main__":
    main()
