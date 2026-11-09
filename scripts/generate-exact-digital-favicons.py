#!/usr/bin/env python3
"""Generate only V79 Digital site favicons from the user's exact transparent logo.

Never regenerate the Hub favicon or the website hero/brand artwork here.
The master image must remain byte-identical to the supplied approved PNG.
"""
from __future__ import annotations

import base64
import hashlib
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "branding" / "V79_Digital_Logo_Transparent.png"
PUBLIC = ROOT / "public"
EXPECTED_SHA256 = "a6dc14ca0ccf3d50b42f19761589f204c6c68210ead03cec8d7725a209e7d753"
VERSION = "v79-digital-exact-upload-20261109-r5"

raw = SOURCE.read_bytes()
actual = hashlib.sha256(raw).hexdigest()
if actual != EXPECTED_SHA256:
    raise SystemExit(f"Refusing to create favicons from an unapproved logo: {actual}")

source = Image.open(SOURCE).convert("RGBA")
if source.size != (939, 760):
    raise SystemExit(f"Unexpected logo dimensions: {source.size}")

# Top monogram occupies rows 0–508; text starts around row 555.
# Remove the wordmark and fully transparent outer space, retaining every
# coloured pixel in the original emblem, including the floating squares.
top = source.crop((0, 0, source.width, 540))
threshold = top.getchannel("A").point(lambda alpha: 255 if alpha > 12 else 0)
bbox = threshold.getbbox()
if not bbox or bbox[1] > 8 or bbox[3] > 530:
    raise SystemExit(f"Unexpected crop bounds: {bbox}")
mark = top.crop(bbox)
print("Approved source SHA-256:", actual)
print("Exact emblem crop:", bbox, "pixel dimensions:", mark.size)

def icon(size: int) -> Image.Image:
    # For the tiny tab icons, use nearly all of the available width.
    target_width = size if size <= 32 else round(size * 0.98)
    target_height = max(1, round(mark.height * target_width / mark.width))
    if target_height > size:
        raise SystemExit("Unexpected emblem aspect ratio")
    scaled = mark.resize((target_width, target_height), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(scaled, ((size - target_width) // 2, (size - target_height) // 2))
    return canvas

PUBLIC.mkdir(exist_ok=True)
for size, name in [(16, "favicon-16x16.png"),
                   (32, "favicon-32x32.png"),
                   (64, "favicon.png"),
                   (180, "apple-touch-icon.png")]:
    icon(size).save(PUBLIC / name, optimize=True)

# True Windows ICO file with embedded images, not a misnamed PNG.
icon(256).save(PUBLIC / "favicon.ico", format="ICO",
               sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])

# SVG is the version browsers commonly prefer. Embed the exact-source mark
# at high resolution so it cannot revert to the old ribbon or the Hub logo.
from io import BytesIO
mem = BytesIO()
icon(512).save(mem, format="PNG", optimize=True)
png64 = base64.b64encode(mem.getvalue()).decode("ascii")
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" '
       f'width="512" height="512"><image width="512" height="512" '
       f'href="data:image/png;base64,{png64}" /></svg>')
(PUBLIC / "favicon.svg").write_text(svg, encoding="utf-8")

# A small visual fixture is useful for reviewing 16/32-pixel recognition.
from PIL import ImageDraw
preview = Image.new("RGBA", (620, 190), "white")
draw = ImageDraw.Draw(preview)
for i, size in enumerate((16, 32, 64, 128)):
    point = (20 + i * 152, 45)
    rendered = icon(size)
    preview.alpha_composite(rendered, point)
    draw.text((point[0], 16), f"{size} x {size}", fill="#15243c")
preview.convert("RGB").save(ROOT / "branding" / "favicon-review.png", optimize=True)

for name in ("favicon-16x16.png", "favicon-32x32.png", "favicon.png",
             "favicon.ico", "favicon.svg", "apple-touch-icon.png"):
    print(name, (PUBLIC / name).stat().st_size, "bytes")

print("WEBSITE_ONLY_FAVICONS_GENERATED")
