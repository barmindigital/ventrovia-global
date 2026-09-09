from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "og.png"
BACKGROUND = ROOT / "assets" / "brand" / "ventrovia-og-background.png"
WIDTH, HEIGHT = 1200, 630
TERRACOTTA = "#c9a46a"
SIGNAL = "#d31027"
INK = "#332f2a"
PAPER = "#f2ebdd"
WHITE = "#ffffff"


def font(size: int, bold: bool = False):
    name = "Arial Bold.ttf" if bold else "Arial.ttf"
    return ImageFont.truetype(f"/System/Library/Fonts/Supplemental/{name}", size)


def symbol(draw: ImageDraw.ImageDraw, x: int, y: int, scale: float, fill: str):
    polygon = [(0, 150), (62, 0), (92, 0), (152, 150), (120, 150), (77, 40), (31, 150)]
    draw.polygon([(x + px * scale, y + py * scale) for px, py in polygon], fill=fill)
    cx, cy, r = x + 136 * scale, y + 116 * scale, 27 * scale
    w = max(2, round(4 * scale))
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=fill, width=w)
    draw.ellipse((cx - r * 0.45, cy - r, cx + r * 0.45, cy + r), outline=fill, width=w)
    for dy in (-r * 0.5, 0, r * 0.5):
        draw.line((cx - r, cy + dy, cx + r, cy + dy), fill=fill, width=w)


if not BACKGROUND.exists():
    raise SystemExit(f"Missing approved OG background: {BACKGROUND}")

source = Image.open(BACKGROUND).convert("RGB")
source_ratio = source.width / source.height
target_ratio = WIDTH / HEIGHT
if source_ratio > target_ratio:
    crop_width = round(source.height * target_ratio)
    left = (source.width - crop_width) // 2
    source = source.crop((left, 0, left + crop_width, source.height))
else:
    crop_height = round(source.width / target_ratio)
    top = (source.height - crop_height) // 2
    source = source.crop((0, top, source.width, top + crop_height))

canvas = source.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
draw = ImageDraw.Draw(canvas)
symbol(draw, 92, 84, 0.72, TERRACOTTA)
draw.text((228, 92), "AIHAMYN HAMPA TRADING – FZCO", font=font(40, True), fill=INK)
draw.text((230, 150), "GLOBAL PROCUREMENT & INDUSTRIAL SUPPLY", font=font(18, True), fill=TERRACOTTA)
draw.line((92, 220, 642, 220), fill=SIGNAL, width=3)
draw.text((92, 260), "Global industrial sourcing", font=font(38, True), fill=INK)
draw.text((92, 312), "for complex supply requirements", font=font(38, True), fill=INK)
draw.text((92, 402), "MANUFACTURER SOURCING  •  RFQ  •  WORLDWIDE", font=font(17, True), fill="#6b6459")
draw.text((92, 520), "AIHAMYN.AE  •  +971 50 981 2776  •  INFO@AIHAMYN.AE", font=font(19, True), fill=INK)
draw.text((92, 553), "DUBAI, UAE  •  SERVING BUYERS WORLDWIDE", font=font(16, False), fill="#6b6459")
canvas.save(OUTPUT, optimize=True, compress_level=9)
print(OUTPUT)
