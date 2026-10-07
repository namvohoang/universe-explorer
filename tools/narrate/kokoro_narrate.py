"""Records every card being read aloud, with Kokoro-82M (Apache-2.0), voice af_heart.

Dev-only: the model never ships and nothing is sent anywhere; only the recordings ship.

    npx tsx tools/narrate/lines.ts > tools/narrate/out/lines.json
    <python with kokoro> tools/narrate/kokoro_narrate.py [--only saturn,titan]

Setup, in a virtual environment (the same one the dolphinspeak repo uses works):

    pip install torch numpy huggingface-hub loguru transformers attrs addict regex num2words spacy
    pip install --no-deps kokoro==0.9.4 misaki==0.9.4     # without espeak-ng, which is GPL
    python -m spacy download en_core_web_sm

Needs ffmpeg on the PATH to write MP3. A word missing from the pronouncing dictionary stops the
run: add how it is said to SAY below rather than letting it be guessed.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import tempfile
import types
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LINES = ROOT / "tools/narrate/out/lines.json"
OUT_DIR = ROOT / "public/voice"
MANIFEST = ROOT / "src/data/content/narration.ts"
SAMPLE_RATE = 24_000  # Kokoro's output rate
REPO = "hexgrad/Kokoro-82M"
VOICE = "af_heart"
SPEED = 0.92  # a little slower than normal talking, as in the prototype
GAP_SECONDS = 0.45  # between sentences
UNKNOWN = "❓"

# How to say names the dictionary lacks, in the model's phonemes (misaki's markup).
SAY: dict[str, str] = {
    "Halley's": "hˈæliz",  # HAL-eez
    "Makemake": "mˌɑkimˈɑki",  # MAH-kee-MAH-kee
    "Proxima": "pɹˈɑksəmə",  # PROK-sih-muh
    "Centauri": "sɛntˈɔɹi",  # sen-TOR-ee
    "Betelgeuse": "bˈiTəlʤˌuz",  # BEE-tul-jooz
    "Canis": "kˈAnɪs",  # KAY-niss
    "Chandra": "ʧˈɑndɹə",  # CHAHN-druh
    "Cassini": "kəsˈini",  # kuh-SEE-nee
    "Arrokoth": "ˈæɹəkɑθ",  # AR-uh-koth
    "Huygens": "hˈYɡənz",  # HOY-guns
    "Majoris": "məʤˈɔɹɪs",  # muh-JOR-iss
    "Pegasi": "pˈɛɡəsˌI",  # PEG-uh-sigh
    "Bode’s": "bˈOdəz",  # BOH-duz
    "Mir": "mˈɪɹ",  # MEER
    "Soyuz": "sˈɔjuz",  # SOY-ooz
    "Ariane": "ˌɑɹiˈɑn",  # ah-ree-AHN
    "Guiana": "ɡiˈɑnə",  # ghee-AH-nuh
    "Markarian": "mɑɹkˈɑɹiən",  # mar-KAR-ee-un
    "Bennu": "bˈɛnu",  # BEN-oo
    "Glenn": "ɡlˈɛn",  # GLEN
    "Osiris": "OsˈIɹɪs",  # oh-SIGH-riss
}


def fingerprint(lines: list[str]) -> str:
    """FNV-1a over the text; must match linesFingerprint in src/ui/narration.ts."""
    value = 0x811C9DC5
    for byte in "\n".join(lines).encode("utf-8"):
        value ^= byte
        value = (value * 0x01000193) & 0xFFFFFFFF
    return f"{value:08x}"


def with_pronunciations(text: str) -> str:
    for word, phonemes in SAY.items():
        text = re.sub(rf"(?<!\w){re.escape(word)}(?!\w)", f"[{word}](/{phonemes}/)", text)
    return text


def load_kokoro():
    # kokoro/__init__ imports misaki.espeak (espeak-ng, GPL). Stub it so it can never load.
    sys.modules["misaki.espeak"] = types.ModuleType("misaki.espeak")
    from kokoro import KModel
    from misaki import en

    model = KModel(repo_id=REPO).eval()
    g2p = en.G2P(trf=False, british=False, fallback=None, unk=UNKNOWN)
    return model, g2p


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--only", help="comma-separated card ids (default: every card)")
    parser.add_argument("--check", action="store_true", help="only list words the dictionary lacks")
    args = parser.parse_args()

    import numpy as np
    import torch
    from huggingface_hub import hf_hub_download

    cards: dict[str, list[str]] = json.loads(LINES.read_text())
    wanted = set(args.only.split(",")) if args.only else None
    model, g2p = load_kokoro()
    pack = torch.load(hf_hub_download(REPO, f"voices/{VOICE}.pt"), weights_only=True)

    missing: dict[str, set[str]] = {}
    spoken: dict[str, list[str]] = {}
    for card, lines in cards.items():
        if wanted and card not in wanted:
            continue
        spoken[card] = []
        for line in lines:
            phonemes, tokens = g2p(with_pronunciations(line))
            lacking = {t.text for t in tokens if t.phonemes is None or UNKNOWN in (t.phonemes or "")}
            if lacking:
                missing.setdefault(card, set()).update(lacking)
            spoken[card].append(phonemes)
    if missing:
        for card, words in missing.items():
            print(f"{card}: not in the dictionary: {sorted(words)}", file=sys.stderr)
        return 1
    if args.check:
        print("every word is known")
        return 0

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    gap = np.zeros(int(GAP_SECONDS * SAMPLE_RATE), dtype=np.float32)
    # When each line starts in its recording, in seconds, so the app can show which is being read.
    starts: dict[str, list[float]] = {}
    for card, phoneme_lines in spoken.items():
        parts = []
        starts[card] = []
        length = 0
        for phonemes in phoneme_lines:
            if len(phonemes) > 510:
                print(f"{card}: a line is too long for the model ({len(phonemes)} phonemes)", file=sys.stderr)
                return 1
            with torch.no_grad():
                line = model(phonemes, pack[len(phonemes) - 1], SPEED).numpy()
            starts[card].append(round(length / SAMPLE_RATE, 2))
            parts += [line, gap]
            length += len(line) + len(gap)
        audio = np.concatenate(parts[:-1])
        pcm = (np.clip(audio, -1, 1) * 32767).round().astype("<i2").tobytes()
        with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
            with wave.open(tmp.name, "wb") as w:
                w.setnchannels(1)
                w.setsampwidth(2)
                w.setframerate(SAMPLE_RATE)
                w.writeframes(pcm)
            target = OUT_DIR / f"{card}.mp3"
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", tmp.name, "-ac", "1", "-b:a", "56k", str(target)],
                check=True,
            )
        print(f"{card}: {len(audio) / SAMPLE_RATE:.1f} s")

    # The manifest lists every recording on disk whose card still exists, with what it says.
    # A partial run keeps the entries of the cards it did not touch. Prettier rewrites the file
    # (bare or quoted keys, lists over several lines), so read it however it is laid out.
    old = {
        card: (mark, [float(n) for n in times.replace("\n", " ").split(",") if n.strip()])
        for card, mark, times in re.findall(
            r"['\"]?([\w-]+)['\"]?:\s*\{\s*file: '[^']+',\s*fingerprint: '([0-9a-f]+)',\s*starts: \[([^\]]*)\],?\s*\}",
            MANIFEST.read_text(),
        )
    }
    entries = []
    for card, lines in cards.items():
        if not (OUT_DIR / f"{card}.mp3").exists():
            continue
        if card in starts:
            mark, times = fingerprint(lines), starts[card]
        elif card in old:
            mark, times = old[card]
        else:
            continue
        entries.append(
            f"  {json.dumps(card)}: {{ file: 'public/voice/{card}.mp3', fingerprint: '{mark}', starts: {json.dumps(times)} }},"
        )
    MANIFEST.write_text(
        "// Written by tools/narrate/kokoro_narrate.py. Do not edit by hand.\n"
        "/**\n"
        " * The recording of each card being read aloud, a fingerprint of the words it says, and the\n"
        " * second at which each line starts.\n"
        " */\n"
        "export const NARRATION: Readonly<\n"
        "  Record<string, { file: string; fingerprint: string; starts: readonly number[] }>\n"
        "> = {\n"
        + "\n".join(entries)
        + "\n};\n"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
