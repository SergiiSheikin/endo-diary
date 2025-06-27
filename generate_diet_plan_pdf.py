from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from textwrap import wrap
import os


def create_diet_plan_pdf(filename: str = "diet_plan.pdf") -> None:
    """Create a simple PDF summarising the diet and insulin dosing plan."""
    lines = [
        "Черновик: Схема питания и дозы инсулина",
        "",  # пустая строка для отступа
        "Общая схема:",
        "- Toujeo (базальный): 34–38 ед. в 22:00",
        "- Apidra (короткий): ориентировочно 1 ед = 1 ХЕ (корректируйте по глюкометру)",
        "",
        "Дневное расписание (6 приёмов):",
        "1. Завтрак (~07:00): 3 бутерброда (≈5.5 ХЕ) → 6 ед Apidra",
        "2. Перекус (~10:00): фрукт / йогурт (1–2 ХЕ) → 1–2 ед Apidra",
        "3. Обед (~13:00): борщ + мясо + 1 ломтик хлеба (≈3 ХЕ) → 3 ед",
        "4. Полдник (~16:00): творог/кефир (≈1 ХЕ) → 1 ед",
        "5. Ужин (~19:00): каша 200 г + курица + салат (≈4.5 ХЕ) → 5 ед",
        "6. Поздний перекус (~22:00): 1 ХЕ + белок → 1 ед Apidra",
        "",
        "Алкоголь:",
        "- 100 мл водки ≈ 0 ХЕ, 1 л пива ≈ 4–5 ХЕ.",
        "- Уменьшите дозу Apidra на 1–2 ед и сделайте медленный углеводный перекус.",
        "- Обязательно проверяйте сахар перед сном и утром.",
        "",
        "Правила коррекции:",
        "- Если через 2 ч после еды > 10 ммоль/л → +1 ед в следующий раз.",
        "- Если < 4 ммоль/л или частые гипо → −1 ед.",
        "",
        "Мониторинг:",
        "- Измеряйте глюкозу: до еды, через 2 ч после, перед сном.",
        "- Записывайте: время, еду (ХЕ), дозу Apidra, уровень глюкозы, физ. активность, алкоголь.",
        "",
        "Внимание: любые изменения согласуйте с врачом!",
    ]

    # Регистрируем шрифт с поддержкой кириллицы (Arial). Если в системе
    # нет Arial, пользователь получит исключение — тогда нужно указать путь к другому TTF.
    font_path = os.path.join(os.environ.get("WINDIR", "C:/Windows"), "Fonts", "arial.ttf")
    try:
        pdfmetrics.registerFont(TTFont("Arial", font_path))
        font_name = "Arial"
    except Exception:
        # Если регистрация не удалась, используем стандартный шрифт — будет кракозябра, но предупредим.
        font_name = "Helvetica"

    c = canvas.Canvas(filename, pagesize=A4)
    width, height = A4

    # Start 40 pt from top margin
    y = height - 40
    line_height = 14

    c.setFont(font_name, 12)

    for line in lines:
        wrapped = wrap(line, 90)
        for segment in wrapped:
            if y < 40:
                c.showPage()
                y = height - 40
                c.setFont(font_name, 12)
            c.drawString(40, y, segment)
            y -= line_height
    c.save()


if __name__ == "__main__":
    create_diet_plan_pdf() 