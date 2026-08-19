from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "og.png"
WIDTH, HEIGHT = 1200, 630
NAVY = "#173f5a"
BLUE = "#5d77a5"
INK = "#272326"
PAPER = "#f4f0e8"
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


canvas = Image.new("RGB", (WIDTH, HEIGHT), PAPER)
draw = ImageDraw.Draw(canvas)
draw.rounded_rectangle((56, 54, 1144, 576), radius=42, fill=NAVY)
draw.rectangle((56, 430, 1144, 576), fill="#123449")
symbol(draw, 104, 126, 1.9, WHITE)
draw.text((470, 164), "VENTROVIA", font=font(78, True), fill=WHITE, spacing=4)
draw.text((474, 258), "GLOBAL INDUSTRIAL TRADE", font=font(26, True), fill="#b9c8d5")
draw.line((474, 318, 1048, 318), fill=BLUE, width=2)
draw.text((474, 350), "Industrial equipment sourcing worldwide", font=font(32, False), fill=WHITE)
draw.text((104, 479), "VENTROVIAGLOBAL.COM", font=font(20, True), fill="#b9c8d5")
draw.text((735, 479), "DUBAI  •  WORLDWIDE", font=font(20, True), fill="#b9c8d5")
canvas.save(OUTPUT, optimize=True)
print(OUTPUT)
