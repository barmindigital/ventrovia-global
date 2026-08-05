from pathlib import Path
from shutil import copyfile

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output/pdf/industriya-postavok-presentation.pdf"
PUBLIC = ROOT / "public/documents/industriya-postavok-presentation.pdf"

PAGE_W, PAGE_H = landscape(A4)
INK = HexColor("#332f2a")
MUTED = HexColor("#6b6459")
RED = HexColor("#d31027")
TERRACOTTA = HexColor("#b4533c")
BEIGE = HexColor("#f2ebdd")
WHITE = HexColor("#ffffff")
LINE = HexColor("#d8d1c5")

pdfmetrics.registerFont(
    TTFont("ArialIP", "/System/Library/Fonts/Supplemental/Arial.ttf")
)
pdfmetrics.registerFont(
    TTFont("ArialIP-Bold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf")
)


def paragraph(canvas, text, x, y, width, size=18, color=INK, leading=None, bold=False):
    style = ParagraphStyle(
        name="presentation",
        fontName="ArialIP-Bold" if bold else "ArialIP",
        fontSize=size,
        leading=leading or size * 1.28,
        textColor=color,
        alignment=TA_LEFT,
        spaceAfter=0,
    )
    item = Paragraph(text, style)
    _, height = item.wrap(width, PAGE_H)
    item.drawOn(canvas, x, y - height)
    return height


def brand(canvas, light=False):
    color = WHITE if light else INK
    canvas.setFillColor(RED)
    canvas.roundRect(18 * mm, PAGE_H - 24 * mm, 8 * mm, 8 * mm, 2 * mm, fill=1, stroke=0)
    canvas.setFillColor(color)
    canvas.setFont("ArialIP-Bold", 10)
    canvas.drawString(30 * mm, PAGE_H - 20.5 * mm, "ИНДУСТРИЯ ПОСТАВОК")


def footer(canvas, page_number, light=False):
    color = HexColor("#e9dfd3") if light else MUTED
    canvas.setStrokeColor(HexColor("#817970") if light else LINE)
    canvas.line(18 * mm, 14 * mm, PAGE_W - 18 * mm, 14 * mm)
    canvas.setFillColor(color)
    canvas.setFont("ArialIP", 8)
    canvas.drawString(18 * mm, 8 * mm, "industriapostavok.ru")
    canvas.drawRightString(PAGE_W - 18 * mm, 8 * mm, str(page_number))


def title_slide(canvas):
    canvas.setFillColor(BEIGE)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setFillColor(TERRACOTTA)
    canvas.circle(PAGE_W - 42 * mm, PAGE_H / 2, 52 * mm, fill=1, stroke=0)
    canvas.setFillColor(RED)
    canvas.circle(PAGE_W - 28 * mm, PAGE_H / 2 + 16 * mm, 25 * mm, fill=1, stroke=0)
    brand(canvas)
    paragraph(
        canvas,
        "Глобальные промышленные<br/>закупки полного цикла",
        18 * mm,
        PAGE_H - 62 * mm,
        170 * mm,
        size=31,
        leading=36,
        bold=True,
    )
    paragraph(
        canvas,
        "От поиска оборудования до доставки - берём организацию поставки на себя.",
        18 * mm,
        PAGE_H - 112 * mm,
        145 * mm,
        size=15,
        color=MUTED,
        leading=21,
    )
    canvas.setFillColor(INK)
    canvas.setFont("ArialIP-Bold", 10)
    canvas.drawString(18 * mm, 28 * mm, "ПРЕЗЕНТАЦИЯ КОМПАНИИ - 2026")
    footer(canvas, 1)


def services_slide(canvas):
    canvas.setFillColor(WHITE)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    brand(canvas)
    paragraph(canvas, "Полный цикл или отдельный этап", 18 * mm, PAGE_H - 42 * mm, 190 * mm, 27, bold=True)
    paragraph(
        canvas,
        "Подключаемся к задаче в нужном объёме: от проверки одной позиции до координации всей поставки.",
        18 * mm,
        PAGE_H - 64 * mm,
        210 * mm,
        13,
        MUTED,
    )
    cards = [
        ("01", "Поиск и проверка", "Идентифицируем позицию, находим товар и проверяем поставщика."),
        ("02", "Оплата и документы", "Организуем расчёты, декларирование и сертификацию."),
        ("03", "Логистика", "Строим маршрут и контролируем движение груза и сроки."),
        ("04", "Поставка под ключ", "Координируем этапы и остаёмся одной точкой ответственности."),
    ]
    gap = 5 * mm
    card_w = (PAGE_W - 36 * mm - gap * 3) / 4
    card_y = 32 * mm
    card_h = 82 * mm
    for index, (number, heading, copy) in enumerate(cards):
        x = 18 * mm + index * (card_w + gap)
        canvas.setFillColor(BEIGE if index % 2 == 0 else HexColor("#f8f5ef"))
        canvas.roundRect(x, card_y, card_w, card_h, 3 * mm, fill=1, stroke=0)
        canvas.setFillColor(RED)
        canvas.setFont("ArialIP-Bold", 11)
        canvas.drawString(x + 7 * mm, card_y + card_h - 11 * mm, number)
        paragraph(canvas, heading, x + 7 * mm, card_y + 49 * mm, card_w - 14 * mm, 16, bold=True)
        paragraph(canvas, copy, x + 7 * mm, card_y + 29 * mm, card_w - 14 * mm, 10, MUTED, 14)
    footer(canvas, 2)


def catalog_slide(canvas):
    canvas.setFillColor(MUTED)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    brand(canvas, light=True)
    paragraph(canvas, "Каталог для точного подбора", 18 * mm, PAGE_H - 45 * mm, 200 * mm, 28, WHITE, bold=True)
    paragraph(
        canvas,
        "Поиск по модели, артикулу, производителю и назначению. Исполнение и совместимость подтверждаем до предложения.",
        18 * mm,
        PAGE_H - 70 * mm,
        205 * mm,
        13,
        HexColor("#e9dfd3"),
        18,
    )
    metrics = [
        ("156 000+", "доступных позиций"),
        ("2 800+", "производителей в базе"),
        ("28", "направлений оборудования"),
    ]
    metric_w = (PAGE_W - 44 * mm) / 3
    for index, (value, label) in enumerate(metrics):
        x = 18 * mm + index * (metric_w + 4 * mm)
        canvas.setFillColor(HexColor("#776f65"))
        canvas.roundRect(x, 43 * mm, metric_w, 58 * mm, 3 * mm, fill=1, stroke=0)
        canvas.setFillColor(WHITE)
        canvas.setFont("ArialIP-Bold", 25)
        canvas.drawString(x + 8 * mm, 76 * mm, value)
        paragraph(canvas, label, x + 8 * mm, 65 * mm, metric_w - 16 * mm, 11, HexColor("#e9dfd3"))
    footer(canvas, 3, light=True)


def workflow_slide(canvas):
    canvas.setFillColor(WHITE)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    brand(canvas)
    paragraph(canvas, "Как начинается поставка", 18 * mm, PAGE_H - 43 * mm, 190 * mm, 28, bold=True)
    steps = [
        ("1", "Заявка", "Модель, артикул, техническое задание или фото шильдика."),
        ("2", "Проверка", "Уточняем исполнение, количество, срок и возможность аналога."),
        ("3", "Маршрут", "Согласовываем оплату, документы, логистику и контрольные точки."),
        ("4", "Поставка", "Сопровождаем движение груза и передаём комплект документов."),
    ]
    start_y = PAGE_H - 75 * mm
    row_h = 25 * mm
    for index, (number, heading, copy) in enumerate(steps):
        y = start_y - index * row_h
        canvas.setFillColor(RED if index == 0 else TERRACOTTA)
        canvas.circle(26 * mm, y, 7 * mm, fill=1, stroke=0)
        canvas.setFillColor(WHITE)
        canvas.setFont("ArialIP-Bold", 11)
        canvas.drawCentredString(26 * mm, y - 1.4 * mm, number)
        paragraph(canvas, heading, 40 * mm, y + 5 * mm, 52 * mm, 15, bold=True)
        paragraph(canvas, copy, 94 * mm, y + 6 * mm, 160 * mm, 11, MUTED, 15)
        if index < len(steps) - 1:
            canvas.setStrokeColor(LINE)
            canvas.line(26 * mm, y - 8 * mm, 26 * mm, y - 18 * mm)
    footer(canvas, 4)


def contact_slide(canvas):
    canvas.setFillColor(BEIGE)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    brand(canvas)
    paragraph(canvas, "Обсудим вашу задачу", 18 * mm, PAGE_H - 54 * mm, 190 * mm, 31, bold=True)
    paragraph(
        canvas,
        "Пришлите спецификацию или краткое описание. Для подбора достаточно модели, артикула или фотографии маркировки.",
        18 * mm,
        PAGE_H - 84 * mm,
        175 * mm,
        14,
        MUTED,
        20,
    )
    canvas.setFillColor(TERRACOTTA)
    canvas.roundRect(18 * mm, 39 * mm, 112 * mm, 42 * mm, 4 * mm, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont("ArialIP-Bold", 15)
    canvas.drawString(26 * mm, 65 * mm, "+7 (495) 148-59-67")
    canvas.setFont("ArialIP", 12)
    canvas.drawString(26 * mm, 51 * mm, "sales@industriapostavok.ru")
    paragraph(canvas, "Москва, БЦ «Центральный Ярд»", 150 * mm, 72 * mm, 110 * mm, 15, bold=True)
    paragraph(canvas, "Понедельник-пятница: 09:00-18:00", 150 * mm, 57 * mm, 110 * mm, 11, MUTED)
    footer(canvas, 5)


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC.parent.mkdir(parents=True, exist_ok=True)
    canvas = Canvas(str(OUTPUT), pagesize=(PAGE_W, PAGE_H))
    for slide in [title_slide, services_slide, catalog_slide, workflow_slide, contact_slide]:
        slide(canvas)
        canvas.showPage()
    canvas.save()
    copyfile(OUTPUT, PUBLIC)


if __name__ == "__main__":
    build()
