// Where the stories of the Watch screen get their times, paths and sentences. Shown as text,
// never fetched by the app.
import type { Source } from '../types';

export const USNO_MOON_PHASES: Source = {
  id: 'usno-moon-phases',
  title:
    'US Naval Observatory, Astronomical Applications — dates and times of the primary phases of the Moon from 2026-10-08',
  url: 'https://aa.usno.navy.mil/api/moon/phases/date?date=2026-10-08&nump=6',
  retrieved: '2026-10-07',
};

export const NASA_MOON_PHASES: Source = {
  id: 'nasa-moon-phases',
  title: 'NASA Science — Moon Phases',
  url: 'https://science.nasa.gov/moon/moon-phases/',
  retrieved: '2026-10-07',
};

export const JPL_HORIZONS_PATH_ARTEMIS_1_ORION: Source = {
  id: 'jpl-horizons-path-artemis1orion',
  title:
    'JPL Horizons — position and velocity of Artemis I (-1023, the Orion spacecraft, as flown, from NASA/JSC navigation) from the centre of Earth every 10 minutes, 2022-11-16 09:00 to 2022-12-11 17:00 TDB, ecliptic of J2000',
  url: 'https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27-1023%27&OBJ_DATA=%27NO%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27500%40399%27&REF_PLANE=%27ECLIPTIC%27&REF_SYSTEM=%27ICRF%27&OUT_UNITS=%27KM-S%27&VEC_TABLE=%272%27&CSV_FORMAT=%27YES%27&START_TIME=%272022-11-16+09%3A00%27&STOP_TIME=%272022-12-11+17%3A00%27&STEP_SIZE=%2710m%27',
  retrieved: '2026-10-07',
};

export const JPL_HORIZONS_PATH_ARTEMIS_1_MOON: Source = {
  id: 'jpl-horizons-path-artemis1moon',
  title:
    'JPL Horizons — position and velocity of the Moon (301) from the centre of Earth every 10 minutes, 2022-11-16 09:00 to 2022-12-11 17:00 TDB, ecliptic of J2000',
  url: 'https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27301%27&OBJ_DATA=%27NO%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27500%40399%27&REF_PLANE=%27ECLIPTIC%27&REF_SYSTEM=%27ICRF%27&OUT_UNITS=%27KM-S%27&VEC_TABLE=%272%27&CSV_FORMAT=%27YES%27&START_TIME=%272022-11-16+09%3A00%27&STOP_TIME=%272022-12-11+17%3A00%27&STEP_SIZE=%2710m%27',
  retrieved: '2026-10-07',
};

export const NASA_ARTEMIS_I: Source = {
  id: 'nasa-artemis-i',
  title: 'NASA — Artemis I',
  url: 'https://www.nasa.gov/mission/artemis-i/',
  retrieved: '2026-10-07',
};

export const NASA_ARTEMIS_I_SPLASHDOWN: Source = {
  id: 'nasa-artemis-i-splashdown',
  title: 'NASA — Splashdown! NASA’s Orion Returns to Earth After Historic Moon Mission',
  url: 'https://www.nasa.gov/missions/artemis/artemis-1/splashdown-nasas-orion-returns-to-earth-after-historic-moon-mission/',
  retrieved: '2026-10-07',
};
