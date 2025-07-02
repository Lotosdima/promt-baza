// Функция для загрузки данных о темах
let topicsData = null;

// Функция для логирования с временными метками
function logWithTime(message, type = 'log') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    switch(type) {
        case 'error':
            console.error(logMessage);
            break;
        case 'warn':
            console.warn(logMessage);
            break;
        default:
            console.log(logMessage);
    }
}

// Загрузка данных о темах из трех файлов
async function loadTopicsData() {
    logWithTime('=== Начало загрузки данных о темах ===');
    
    try {
        const loadingIndicator = document.getElementById('loadingTopics');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
            logWithTime('Показан индикатор загрузки');
        }
        
        // Функция для загрузки одного файла
        async function loadFile(filename) {
            logWithTime(`Попытка загрузки файла: ${filename}`);
            try {
                const response = await fetch(filename);
                if (response.ok) {
                    const data = await response.json();
                    logWithTime(`Файл ${filename} успешно загружен`);
                    return data;
                } else {
                    logWithTime(`Не удалось загрузить файл ${filename}. Статус: ${response.status}`, 'warn');
                    return null;
                }
            } catch (error) {
                logWithTime(`Ошибка при загрузке файла ${filename}: ${error.message}`, 'error');
                return null;
            }
        }
        
        // Загружаем все файлы параллельно
        const [mainData, additionalData, higherEdData] = await Promise.all([
            loadFile('lesson-topics-data.json'),
            loadFile('additional-subjects.json'),
            loadFile('higher-education-subjects.json')
        ]);
        
        // Объединяем темы из всех файлов
        topicsData = {
            subjects: {
                ...(mainData?.subjects || {}),
                ...(additionalData?.subjects || {}),
                ...(higherEdData?.subjects || {})
            }
        };
        
        // Скрываем индикатор загрузки
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
            logWithTime('Скрыт индикатор загрузки');
        }
        
        // Проверяем наличие данных
        const subjectsCount = Object.keys(topicsData.subjects).length;
        logWithTime(`Загружено предметов: ${subjectsCount}`);
        
        if (subjectsCount === 0) {
            logWithTime('Не удалось загрузить ни один файл с темами', 'warn');
            showError('Не удалось загрузить темы. Пожалуйста, обновите страницу или введите тему вручную.');
            return null;
        }
        
        // Подробная информация о загруженных предметах
        for (const subject in topicsData.subjects) {
            const gradesCount = Object.keys(topicsData.subjects[subject].grades || {}).length;
            logWithTime(`Предмет ${subject}: доступно для ${gradesCount} классов`);
        }
        
        // Инициализация функциональности выбора тем
        initTopicsSelection();
        logWithTime('Инициализация выбора тем завершена');
        
        return topicsData;
        
    } catch (error) {
        logWithTime(`Критическая ошибка при загрузке тем: ${error.message}`, 'error');
        if (error.stack) {
            logWithTime(`Стек ошибки: ${error.stack}`, 'error');
        }
        
        const loadingIndicator = document.getElementById('loadingTopics');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        showError('Произошла ошибка при загрузке тем. Пожалуйста, обновите страницу или введите тему вручную.');
        return null;
    } finally {
        logWithTime('=== Завершение загрузки данных о темах ===');
    }
}

// Инициализация функциональности выбора тем
function initTopicsSelection() {
    logWithTime('=== Начало инициализации выбора тем ===');
    
    const elements = {
        expertType: document.getElementById('expertType'),
        ageClass: document.getElementById('ageClass'),
        topicSelect: document.getElementById('topicSelect'),
        topic: document.getElementById('topic')
    };
    
    // Проверяем наличие всех необходимых элементов
    for (const [name, element] of Object.entries(elements)) {
        if (!element) {
            logWithTime(`Элемент ${name} не найден`, 'error');
            throw new Error(`Элемент ${name} не найден в DOM`);
        }
    }
    
    logWithTime('Все необходимые элементы найдены');
    
    // Обработчик изменения темы
    elements.topicSelect.addEventListener('change', function() {
        logWithTime('Изменение выбранной темы');
        if (this.value) {
            elements.topic.value = this.value;
            logWithTime(`Установлена тема: ${this.value}`);
            // Генерируем событие для обновления промпта
            const event = new Event('input', { bubbles: true });
            elements.topic.dispatchEvent(event);
        }
    });
    
    // Функция обновления списка тем
    function updateTopicsList() {
        logWithTime('=== Начало обновления списка тем ===');
        
        // Очищаем текущий список тем
        elements.topicSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Выберите тему из списка или введите свою';
        elements.topicSelect.appendChild(defaultOption);
        
        // Получаем выбранный предмет и класс
        if (!elements.expertType.value || !elements.ageClass.value) {
            logWithTime('Не выбран предмет или класс');
            return;
        }
        
        const subjectElement = elements.expertType.options[elements.expertType.selectedIndex];
        if (!subjectElement) {
            logWithTime('Не найден элемент выбранного предмета', 'warn');
            return;
        }
        
        // Получаем имя предмета из текста опции
        const subjectText = subjectElement.textContent.trim();
        logWithTime(`Выбранный предмет: ${subjectText}`);
        
        const subjectKey = getSubjectKey(subjectText);
        if (!subjectKey) {
            logWithTime(`Предмет не найден в базе данных: ${subjectText}`, 'warn');
            addNotFoundOption('Предмет не найден в базе данных');
            return;
        }
        
        logWithTime(`Ключ предмета: ${subjectKey}`);
        
        // Получаем номер класса
        const gradeNum = extractGradeNumber(elements.ageClass.value);
        if (!gradeNum) {
            logWithTime('Не удалось определить класс/курс', 'warn');
            addNotFoundOption('Не удалось определить класс/курс');
            return;
        }
        
        logWithTime(`Номер класса/курса: ${gradeNum}`);
        
        // Получаем темы для выбранного предмета и класса
        const topics = getTopicsForSubjectAndGrade(subjectKey, gradeNum);
        logWithTime(`Найдено тем: ${topics.length}`);
        
        // Заполняем выпадающий список темами
        populateTopicSelect(elements.topicSelect, topics);
        
        logWithTime('=== Завершение обновления списка тем ===');
    }
    
    // Добавляем обработчики событий
    elements.expertType.addEventListener('change', () => {
        logWithTime('Изменение предмета');
        updateTopicsList();
    });
    
    elements.ageClass.addEventListener('change', () => {
        logWithTime('Изменение класса');
        updateTopicsList();
    });
    
    // Проверяем, были ли уже выбраны предмет и класс
    if (elements.expertType.value && elements.ageClass.value) {
        logWithTime('Найдены предварительно выбранные предмет и класс');
        updateTopicsList();
    }
    
    logWithTime('=== Завершение инициализации выбора тем ===');
}

// Соответствие русских названий предметов ключам в JSON
function getSubjectKey(subjectName) {
    const subjectMapping = {
        // Основные предметы
        "Математика": "mathematics",
        "Алгебра": "algebra",
        "Геометрия": "geometry",
        "Физика": "physics",
        "Химия": "chemistry",
        "Биология": "biology",
        "География": "geography",
        "Информатика": "computer_science",
        "Русский язык": "russian_language",
        "Литература": "literature",
        "История": "history",
        "Обществознание": "social_studies",
        
        // Начальная школа
        "Начальные классы (общее)": "mathematics",
        "Обучение грамоте": "russian_language",
        "Литературное чтение": "literature_reading",
        "Окружающий мир": "natural_science",
        
        // Иностранные языки
        "Английский язык": "english_language",
        "Немецкий язык": "german_language",
        "Французский язык": "french_language",
        "Испанский язык": "spanish_language",
        "Китайский язык": "chinese_language",
        
        // Физкультура и ОБЖ
        "Физическая культура": "physical_education",
        "ОБЖ": "civil_defense",
        
        // Искусство и технологии
        "ИЗО": "art",
        "МХК": "world_arts",
        "Музыка": "music",
        "Технология": "technology",
        "Черчение": "drafting",
        
        // Региональные компоненты
        "Родной язык": "native_language",
        "Родная литература": "native_literature",
        "Краеведение": "regional_studies",
        "Национальная культура": "national_culture",
        
        // Вариативные курсы
        "Экономика": "economics",
        "Право": "law",
        "Экология": "ecology",
        "Астрономия": "astronomy",
        "Психология": "psychology",
        
        // Высшее образование
        "Высшая математика": "higher_mathematics",
        "Статистика": "statistics",
        "Программирование": "programming",
        "Философия": "philosophy",
        "Социология": "sociology",
        "Политология": "politology",
        "Культурология": "culturology"
    };
    
    // Пытаемся найти точное соответствие
    if (subjectMapping[subjectName]) {
        return subjectMapping[subjectName];
    }
    
    // Если точного соответствия нет, ищем частичное
    for (const key in subjectMapping) {
        if (subjectName.includes(key)) {
            return subjectMapping[key];
        }
    }
    
    // Особые случаи обработки
    if (subjectName.toLowerCase().includes('язык')) {
        if (subjectName.toLowerCase().includes('родн')) {
            return 'native_language';
        } else if (subjectName.toLowerCase().includes('англ')) {
            return 'english_language';
        } else if (subjectName.toLowerCase().includes('немец')) {
            return 'german_language';
        } else if (subjectName.toLowerCase().includes('франц')) {
            return 'french_language';
        } else if (subjectName.toLowerCase().includes('испан')) {
            return 'spanish_language';
        } else if (subjectName.toLowerCase().includes('китай') || subjectName.toLowerCase().includes('китайск')) {
            return 'chinese_language';
        } else {
            return 'russian_language';
        }
    } else if (subjectName.toLowerCase().includes('литератур')) {
        if (subjectName.toLowerCase().includes('родн')) {
            return 'native_literature';
        } else if (subjectName.toLowerCase().includes('чтен')) {
            return 'literature_reading';
        } else {
            return 'literature';
        }
    } else if (subjectName.toLowerCase().includes('математ')) {
        if (subjectName.toLowerCase().includes('высш')) {
            return 'higher_mathematics';
        } else {
            return 'mathematics';
        }
    } else if (subjectName.toLowerCase().includes('программ')) {
        return 'programming';
    } else if (subjectName.toLowerCase().includes('национ')) {
        return 'national_culture';
    }
    
    return null;
}

// Извлечение номера класса из строки
function extractGradeNumber(ageClassText) {
    if (!ageClassText) return null;
    
    // Для дошкольного образования
    if (ageClassText.toLowerCase().includes('года') || ageClassText.toLowerCase().includes('лет')) {
        return '0';
    }
    
    // Ищем число в строке (например, "5 класс" -> 5)
    const match = ageClassText.match(/(\d+)/);
    if (match) {
        const num = parseInt(match[1]);
        
        // Для высшего образования и колледжа корректируем номер
        if (ageClassText.toLowerCase().includes('колледж') || 
            ageClassText.toLowerCase().includes('курс колледжа')) {
            return (11 + num).toString(); // 1 курс -> 12, 2 курс -> 13 и т.д.
        } 
        else if (ageClassText.toLowerCase().includes('бакалавр')) {
            return (11 + num).toString(); // 1 курс -> 12, 2 курс -> 13 и т.д.
        }
        else if (ageClassText.toLowerCase().includes('магистр')) {
            return '16';
        }
        else if (ageClassText.toLowerCase().includes('аспирант')) {
            return '17';
        }
        
        // Если это обычный класс, просто возвращаем номер
        return num.toString();
    }
    
    // Особые случаи
    if (ageClassText.toLowerCase().includes('магистр')) {
        return '16';
    }
    if (ageClassText.toLowerCase().includes('аспирант')) {
        return '17';
    }
    
    return null;
}

// Получение тем для предмета и класса
function getTopicsForSubjectAndGrade(subjectKey, grade) {
    if (!topicsData || !topicsData.subjects) return [];
    
    try {
        const subject = topicsData.subjects[subjectKey];
        if (!subject) {
            console.warn(`Предмет не найден: ${subjectKey}`);
            return [];
        }
        
        const gradeData = subject.grades[grade];
        if (!gradeData) {
            console.warn(`Класс не найден для предмета ${subjectKey}: ${grade}`);
            return [];
        }
        
        return gradeData.topics || [];
    } catch (error) {
        console.error('Ошибка при получении тем:', error);
        return [];
    }
}

// Функция для добавления опции "не найдено"
function addNotFoundOption(message) {
    logWithTime(`Добавление опции "не найдено": ${message}`);
    
    const topicSelect = document.getElementById('topicSelect');
    if (!topicSelect) {
        logWithTime('Элемент topicSelect не найден', 'error');
        return;
    }
    
    const option = document.createElement('option');
    option.disabled = true;
    option.textContent = message || 'Темы не найдены';
    topicSelect.appendChild(option);
    
    updateTopicsHint(true, message);
}

// Обновление подсказки о темах
function updateTopicsHint(notFound = false, message = '') {
    logWithTime(`Обновление подсказки: ${notFound ? 'не найдено' : 'найдено'}`);
    
    const hint = document.querySelector('.topics-hint');
    if (!hint) {
        logWithTime('Элемент topics-hint не найден', 'warn');
        return;
    }
    
    if (notFound) {
        hint.textContent = message || 'Темы не найдены. Пожалуйста, введите свою тему в поле ниже.';
        hint.style.color = '#d9534f';
        logWithTime('Установлена подсказка об отсутствии тем');
    } else {
        hint.textContent = 'Выберите тему из списка или введите свою';
        hint.style.color = '#666666';
        logWithTime('Установлена стандартная подсказка');
    }
}

// Заполнение выпадающего списка темами
function populateTopicSelect(selectElement, topics) {
    logWithTime('=== Начало заполнения списка тем ===');
    logWithTime(`Количество тем для добавления: ${topics?.length || 0}`);
    
    if (!selectElement) {
        logWithTime('Элемент select не передан', 'error');
        return;
    }
    
    // Очищаем текущий список тем (кроме первой опции)
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }
    logWithTime('Список тем очищен');
    
    if (!topics || topics.length === 0) {
        logWithTime('Темы отсутствуют, добавляем сообщение');
        const option = document.createElement('option');
        option.disabled = true;
        option.textContent = 'Темы не найдены для выбранного предмета и класса';
        selectElement.appendChild(option);
        
        updateTopicsHint(true);
        return;
    }
    
    // Возвращаем стандартную подсказку, если темы найдены
    updateTopicsHint(false);
    
    // Добавляем опции с темами
    topics.forEach((topic, index) => {
        const option = document.createElement('option');
        option.value = topic;
        option.textContent = topic;
        selectElement.appendChild(option);
        logWithTime(`Добавлена тема ${index + 1}: ${topic}`);
    });
    
    logWithTime('=== Завершение заполнения списка тем ===');
}

// Функция копирования промпта в буфер обмена
async function copyPrompt() {
    logWithTime('Попытка копирования промпта');
    
    const generatedPrompt = document.getElementById('generatedPrompt');
    if (!generatedPrompt) {
        logWithTime('Элемент generatedPrompt не найден', 'error');
        showError('Не удалось найти текст промпта для копирования');
        return;
    }
    
    const textToCopy = generatedPrompt.textContent;
    if (!textToCopy) {
        logWithTime('Текст промпта пуст', 'warn');
        showError('Нет текста для копирования');
        return;
    }
    
    try {
        // Используем современный API буфера обмена
        if (navigator.clipboard) {
            logWithTime('Используем Clipboard API');
            await navigator.clipboard.writeText(textToCopy);
            logWithTime('Промпт успешно скопирован');
            
            const copyButton = document.getElementById('copyButton');
            if (copyButton) {
                copyButton.textContent = 'Скопировано!';
                setTimeout(() => {
                    copyButton.textContent = 'Копировать промпт';
                }, 2000);
            }
        } else {
            logWithTime('Clipboard API не доступен, используем запасной вариант');
            fallbackCopyPrompt(textToCopy);
        }
    } catch (error) {
        logWithTime(`Ошибка при копировании: ${error.message}`, 'error');
        fallbackCopyPrompt(textToCopy);
    }
}

// Запасной метод копирования для старых браузеров
function fallbackCopyPrompt(text) {
    logWithTime('Использование запасного метода копирования');
    
    try {
        // Создаем временный элемент textarea
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        
        // Выделяем и копируем текст
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (success) {
            logWithTime('Текст успешно скопирован запасным методом');
            const copyButton = document.getElementById('copyButton');
            if (copyButton) {
                copyButton.textContent = 'Скопировано!';
                setTimeout(() => {
                    copyButton.textContent = 'Копировать промпт';
                }, 2000);
            }
        } else {
            throw new Error('execCommand вернул false');
        }
    } catch (error) {
        logWithTime(`Ошибка в запасном методе копирования: ${error.message}`, 'error');
        showError('Не удалось скопировать текст. Пожалуйста, выделите и скопируйте его вручную (Ctrl+C).');
    }
}

// Загружаем данные о темах при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    logWithTime('=== Инициализация страницы ===');
    
    // Привязываем обработчик события клика к кнопке копирования
    const copyButton = document.getElementById('copyButton');
    if (copyButton) {
        copyButton.addEventListener('click', copyPrompt);
        logWithTime('Добавлен обработчик для кнопки копирования');
    } else {
        logWithTime('Кнопка копирования не найдена', 'warn');
    }
    
    // Загружаем данные о темах
    loadTopicsData().catch(error => {
        logWithTime(`Ошибка при загрузке данных о темах: ${error.message}`, 'error');
        if (error.stack) {
            logWithTime(`Стек ошибки: ${error.stack}`, 'error');
        }
        
        // Показываем сообщение пользователю
        const topicSelect = document.getElementById('topicSelect');
        if (topicSelect) {
            while (topicSelect.options.length > 0) {
                topicSelect.remove(0);
            }
            
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Ошибка загрузки тем. Введите тему вручную.';
            topicSelect.appendChild(option);
            logWithTime('Добавлено сообщение об ошибке в select');
        }
        
        // Отображаем сообщение в подсказке
        updateTopicsHint(true, 'Не удалось загрузить темы. Пожалуйста, введите свою тему в поле ниже.');
    });
    
    logWithTime('=== Завершение инициализации страницы ===');
});
