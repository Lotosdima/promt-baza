# promt-baza

Этот набор файлов предназначен для автономной работы конструктора промптов для плана урока. Все зависимости собраны в одной папке для удобства переноса и использования.

## Описание файлов

- **prompt-builder.html** — основной HTML-файл конструктора промптов. Содержит разметку формы, стили и подключение всех необходимых скриптов.
- **prompt-builder-script.js** — основной скрипт, реализующий логику работы конструктора: обработка формы, генерация промпта, взаимодействие с элементами интерфейса.
- **prompt-builder-styles.css** — отдельный CSS-файл для стилизации конструктора промптов. Обеспечивает современный и адаптивный внешний вид.
- **topics-integration.js** — скрипт для загрузки и интеграции тематик уроков в зависимости от выбранного предмета и класса. Автоматизирует подстановку тем.
- **topic-handlers.js** — вспомогательный скрипт для работы с темами уроков: обработка выбора, кастомизация, дополнительные функции для тем.

---

## Как использовать
1. Откройте файл `prompt-builder.html` в браузере.
2. Все остальные файлы должны находиться в одной папке с этим HTML-файлом.
3. Конструктор будет работать автономно, без внешних зависимостей.

Если потребуется интеграция с другими системами или расширение функционала — см. комментарии в исходных файлах. 