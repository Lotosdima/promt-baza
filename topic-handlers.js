/**
 * Обработчики для выбора предмета, класса и темы
 */

// Функция для проверки наличия элементов в DOM
function checkRequiredElements() {
    const requiredElements = [
        'expertType',
        'ageClass',
        'knowledgeLevel',
        'teachingApproach',
        'audienceFeatures',
        'lessonFormat',
        'generatedPrompt',
        'copyButton',
        'topicsError'
    ];

    for (const elementId of requiredElements) {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Элемент ${elementId} не найден в DOM`);
        }
    }
}

// Функция для инициализации обработчиков
function initTopicHandlers() {
    console.log('Инициализация обработчиков выбора предмета, класса и темы');
    
    const expertType = document.getElementById('expertType');
    const ageClass = document.getElementById('ageClass');
    const subjectAlert = document.getElementById('subjectAlert');
    const classAlert = document.getElementById('classAlert');
    const topicSelect = document.getElementById('topicSelect');
    const topicInput = document.getElementById('topic');
    
    if (!expertType || !ageClass) {
        console.error('Элементы формы не найдены:', {
            expertType: !!expertType,
            ageClass: !!ageClass
        });
        return;
    }
    
    console.log('Элементы формы найдены');
    
    // Обработчик выбора предмета
    expertType.addEventListener('change', function() {
        console.log('Выбран предмет:', this.value);
        
        // Разблокируем выбор класса
        ageClass.disabled = false;
        ageClass.options[0].text = "Выберите класс";
        
        // Скрываем предупреждение о выборе предмета
        if (subjectAlert) {
            subjectAlert.style.display = 'none';
        }
        
        // Получаем доступные классы из data-атрибута
        if (this.selectedIndex > 0) {
            const selectedOption = this.options[this.selectedIndex];
            const grades = selectedOption.dataset.grades;
            
            if (grades) {
                console.log('Доступные классы:', grades);
                const availableGrades = grades.split(',');
                
                // Обновляем доступность опций
                Array.from(ageClass.options).forEach(option => {
                    if (option.value === "" || option.value === "Другое") return;
                    
                    const grade = option.dataset.grade;
                    if (grade) {
                        const isAvailable = availableGrades.includes(grade);
                        option.disabled = !isAvailable;
                        
                        // Добавляем визуальное отображение
                        if (isAvailable) {
                            option.classList.remove('disabled-option');
                            option.style.display = '';
                        } else {
                            option.classList.add('disabled-option');
                            option.style.display = 'none'; // Скрываем недоступные опции
                        }
                        
                        console.log(`Класс ${option.value}: ${isAvailable ? 'доступен' : 'недоступен'}`);
                    }
                });
                
                // Проверяем, есть ли доступные опции
                const hasAvailableOptions = Array.from(ageClass.options).some(option => 
                    option.value !== "" && option.value !== "Другое" && !option.disabled
                );
                
                if (!hasAvailableOptions) {
                    console.warn('Нет доступных классов для выбранного предмета');
                    showError(`Для предмета "${selectedOption.text}" нет доступных классов`);
                } else {
                    hideError();
                }
            }
        }
    });
    
    // Обработчик выбора класса
    ageClass.addEventListener('change', function() {
        console.log('Выбран класс:', this.value);
        
        // Скрываем предупреждение о выборе класса
        if (classAlert) {
            classAlert.style.display = 'none';
        }
        
        // Загружаем темы для выбранного предмета и класса
        const selectedSubject = expertType.value;
        const selectedClass = this.value;
        
        if (selectedSubject && selectedClass) {
            console.log('Загружаем темы для предмета:', selectedSubject, 'и класса:', selectedClass);
            
            // Показываем индикатор загрузки
            const loadingTopics = document.getElementById('loadingTopics');
            if (loadingTopics) {
                loadingTopics.style.display = 'block';
            }
            
            // Очищаем предыдущие темы
            if (topicSelect) {
                topicSelect.innerHTML = '<option value="">Загрузка тем...</option>';
            }
            
            // Вызываем функцию загрузки тем
            try {
                // Получаем номер класса из выбранного значения
                let gradeNumber = -1;
                const selectedOption = this.options[this.selectedIndex];
                if (selectedOption && selectedOption.dataset.grade) {
                    gradeNumber = parseInt(selectedOption.dataset.grade);
                }
                
                console.log('Номер класса для загрузки тем:', gradeNumber);
                
                // Получаем название предмета из текста опции
                const subjectText = expertType.options[expertType.selectedIndex].textContent.trim();
                console.log('Название предмета:', subjectText);
                
                // Проверяем, загружены ли данные о темах
                if (typeof getSubjectKey === 'function' && typeof getTopicsForSubjectAndGrade === 'function') {
                    // Получаем ключ предмета
                    const subjectKey = getSubjectKey(subjectText);
                    console.log('Ключ предмета:', subjectKey);
                    
                    if (subjectKey) {
                        // Получаем темы для предмета и класса
                        const topics = getTopicsForSubjectAndGrade(subjectKey, gradeNumber.toString());
                        console.log('Найдено тем:', topics ? topics.length : 0);
                        
                        // Заполняем выпадающий список темами
                        if (typeof populateTopicSelect === 'function' && topicSelect) {
                            populateTopicSelect(topicSelect, topics || []);
                        } else {
                            console.error('Функция populateTopicSelect не определена или элемент topicSelect не найден');
                            showError('Ошибка загрузки тем: функция заполнения не определена');
                        }
                    } else {
                        console.warn('Предмет не найден в базе данных:', subjectText);
                        if (typeof addNotFoundOption === 'function' && topicSelect) {
                            addNotFoundOption('Предмет не найден в базе данных');
                        } else {
                            showError('Предмет не найден в базе данных');
                        }
                    }
                } else {
                    console.error('Функции для работы с темами не определены');
                    showError('Ошибка загрузки тем: необходимые функции не определены');
                }
            } catch (error) {
                console.error('Ошибка при загрузке тем:', error);
                showError(`Ошибка загрузки тем: ${error.message}`);
            } finally {
                // Скрываем индикатор загрузки
                if (loadingTopics) {
                    loadingTopics.style.display = 'none';
                }
            }
        }
    });
    
    // Обработчик выбора темы из выпадающего списка
    if (topicSelect && topicInput) {
        topicSelect.addEventListener('change', function() {
            console.log('Выбрана тема из списка:', this.value);
            
            if (this.value) {
                // Устанавливаем выбранную тему в поле ввода
                topicInput.value = this.value;
                console.log('Тема установлена в поле ввода:', topicInput.value);
                
                // Генерируем событие для обновления промпта
                const event = new Event('input', { bubbles: true });
                topicInput.dispatchEvent(event);
                console.log('Событие input отправлено для обновления промпта');
                
                // Проверяем, что тема действительно установлена
                setTimeout(() => {
                    console.log('Текущее значение поля темы:', topicInput.value);
                    console.log('Текущее значение выбранной темы:', topicSelect.value);
                }, 100);
            }
        });
        
        console.log('Обработчик выбора темы установлен для элементов:', {
            topicSelect: topicSelect.id,
            topicInput: topicInput.id
        });
    } else {
        console.error('Элементы для выбора темы не найдены:', {
            topicSelect: !!topicSelect,
            topicInput: !!topicInput
        });
    }
}

// Вспомогательные функции для обработки ошибок
function showError(message) {
    const errorElement = document.getElementById('topicsError');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    console.error(message);
}

function hideError() {
    const errorElement = document.getElementById('topicsError');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// Инициализация обработчиков при загрузке DOM
document.addEventListener('DOMContentLoaded', initTopicHandlers); 