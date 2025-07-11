# Ендо-Щоденник (PWA)

[🟢 Демо-версія на GitHub Pages](https://sergiisheikin.github.io/endo-diary/)

Веб-додаток для ведення щоденника харчування та інсулінотерапії при цукровому діабеті 1 типу.

## Основні можливості
- Додавання продуктів, автоматичний підрахунок хлібних одиниць (ХО)
- Рекомендації по дозі інсуліну Apidra
- Ведення історії прийомів їжі, глюкози, інсуліну
- Групування історії по датах, очищення, фільтрація
- Додавання власних продуктів, збереження у IndexedDB
- Експорт/імпорт даних у JSON, PDF
- Графік динаміки глюкози та інсуліну (Chart.js)
- Мобільна адаптація, українська мова

## ⚠️ Важливо: Індивідуальні налаштування

**Цей додаток налаштований під конкретні параметри користувача!**

### Поточні налаштування:
- **Цільова глюкоза**: 7 ммоль/л
- **Інсулін-чутливість (ІСФ)**: 2 ммоль/л на 1 одиницю інсуліну
- **Множники інсуліну за прийомами їжі**:
  - Сніданок: ×2
  - Обід: ×1.5
  - Вечеря: ×1
  - Перекуси: ×1.5

### Для інших користувачів:
Якщо ви хочете використовувати цей додаток, вам потрібно змінити налаштування в файлі `app.js`:
1. Змініть константи `TARGET_GLUCOSE` та `ISF` на початку файлу
2. Змініть множники в функції `calculateRecommendation`

**Консультуйтесь з вашим ендокринологом для правильних налаштувань!**

## ⚠️ Обмеження GitHub Pages

При використанні додатку на GitHub Pages:
- **Дані зберігаються локально** у браузері (IndexedDB)
- **Немає доступу до файлової системи** для збереження налаштувань
- **Налаштування потрібно змінювати в коді** кожного разу

## Як запустити
1. Відкрийте `index.html` у браузері (Google Chrome, Edge, Firefox, Safari).

## Структура проекту
- `index.html` — основна сторінка додатку
- `styles.css` — стилі
- `app.js` — логіка додатку
- `service-worker.js`, `manifest.json` — для PWA
- `generate_diet_plan_pdf.py` — генерація PDF (опціонально)

---

**Автор:** (Sergii Sheikin) 