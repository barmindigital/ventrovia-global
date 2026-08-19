from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "og.png"
BACKGROUND = ROOT / "assets" / "brand" / "ventrovia-og-background.png"
WIDTH, HEIGHT = 1200, 630
TERRACOTTA = "#b4533c"
SIGNAL = "#d31027"
INK = "#332f2a"
PAPER = "#f2ebdd"
WHITE = "#ffffff"


def font(size: int, bold: bool = False):
    name = "Arial Bold.ttf" if bold else "Arial.ttf"
    return ImageFont.truetype(f"/System/Library/Fonts/Supplemental/{name}", size)


def symbol(draw: ImageDraw.ImageDraw, x: int, y: int, scale: float, fill: str):
    polygons = [
        [(0, 0), (42, 0), (64, 40), (22, 40)],
        [(70, 0), (112, 0), (48, 110), (24, 70)],
        [(120, 0), (165, 0), (141, 40), (96, 40)],
        [(91, 50), (135, 50), (110, 92), (66, 92)],
        [(66, 92), (110, 92), (70, 160), (46, 118)],
    ]
    for polygon in polygons:
        draw.polygon([(x + px * scale, y + py * scale) for px, py in polygon], fill=fill)


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
draw.text((228, 87), "VENTROVIA", font=font(54, True), fill=INK)
draw.text((232, 154), "GLOBAL INDUSTRIAL TRADE", font=font(19, True), fill=TERRACOTTA)
draw.line((92, 220, 642, 220), fill=SIGNAL, width=3)
draw.text((92, 260), "Global industrial sourcing", font=font(38, True), fill=INK)
draw.text((92, 312), "for complex supply requirements", font=font(38, True), fill=INK)
draw.text((92, 402), "MANUFACTURER SOURCING  •  RFQ  •  WORLDWIDE", font=font(17, True), fill="#6b6459")
draw.text((92, 520), "VENTROVIAGLOBAL.COM", font=font(19, True), fill=INK)
draw.text((92, 553), "DUBAI, UAE  •  SERVING BUYERS WORLDWIDE", font=font(16, False), fill="#6b6459")
canvas.save(OUTPUT, optimize=True, compress_level=9)
print(OUTPUT)
