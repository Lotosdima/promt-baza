// Глобальная функция для отображения ошибок
window.showError = function(message) {
    console.error(message);
    const errorElement = document.getElementById('topicsError');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
};

// Глобальная функция для скрытия ошибок
window.hideError = function() {
    const errorElement = document.getElementById('topicsError');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
};

// Глобальная функция для генерации промпта
window.updatePrompt = function() {
    console.log('=== Начало генерации промпта ===');
    
    try {
        // Получаем ссылки на элементы формы
        const elements = {
            expertType: document.getElementById('expertType'),
            customExpertType: document.getElementById('customExpertType'),
            topic: document.getElementById('topic'),
            ageClass: document.getElementById('ageClass'),
            customAgeClass: document.getElementById('customAgeClass'),
            knowledgeLevel: document.getElementById('knowledgeLevel'),
            customKnowledgeLevel: document.getElementById('customKnowledgeLevel'),
            skillsCompetencies: document.getElementById('skillsCompetencies'),
            customSkillsCompetencies: document.getElementById('customSkillsCompetencies'),
            teachingApproach: document.getElementById('teachingApproach'),
            customTeachingApproach: document.getElementById('customTeachingApproach'),
            audienceFeatures: document.getElementById('audienceFeatures'),
            customAudienceFeatures: document.getElementById('customAudienceFeatures'),
            lessonFormat: document.getElementById('lessonFormat'),
            useCustomSections: document.getElementById('useCustomSections'),
            customSections: document.getElementById('customSections'),
            totalLessonDuration: document.getElementById('totalLessonDuration'),
            introActivityDuration: document.getElementById('introActivityDuration'),
            mainPartDuration: document.getElementById('mainPartDuration'),
            generatedPrompt: document.getElementById('generatedPrompt')
        };

        // Проверяем наличие всех необходимых элементов
        for (const [name, element] of Object.entries(elements)) {
            if (!element) {
                throw new Error(`Элемент ${name} не найден в DOM`);
            }
        }
        
        // Определение предметного эксперта
        let expert = elements.expertType.value;
        console.log('Выбранный эксперт:', expert);
        if (expert === 'Другое' && elements.customExpertType?.value.trim()) {
            expert = elements.customExpertType.value;
        }
        
        // Определение темы
        const topicValue = elements.topic.value.trim();
        console.log('Выбранная тема:', topicValue);
        
        // Определение возраста/класса
        let ageClassValue = elements.ageClass.value;
        console.log('Выбранный возраст/класс:', ageClassValue);
        if (ageClassValue === 'Другое' && elements.customAgeClass?.value.trim()) {
            ageClassValue = elements.customAgeClass.value;
        }
        
        // Проверка обязательных полей
        if (!expert || !topicValue || !ageClassValue) {
            showError('Пожалуйста, заполните все обязательные поля: предмет, тему и возраст/класс');
            return;
        }
        
        // Определение уровня знаний
        let knowledgeLevelValue = elements.knowledgeLevel.value;
        console.log('Выбранный уровень знаний:', knowledgeLevelValue);
        if (knowledgeLevelValue === 'Другое' && elements.customKnowledgeLevel?.value.trim()) {
            knowledgeLevelValue = elements.customKnowledgeLevel.value;
        }
        
        // Обработка выбранных навыков/компетенций
        let selectedSkills = Array.from(elements.skillsCompetencies?.selectedOptions || [])
            .map(option => option.value);
        
        let skillsText = selectedSkills.join(', ');
        if (elements.customSkillsCompetencies?.value.trim()) {
            skillsText += skillsText ? ', ' + elements.customSkillsCompetencies.value : elements.customSkillsCompetencies.value;
        }
        
        if (!skillsText) {
            skillsText = 'базовые навыки по предмету';
        }
        
        // Определение подхода к обучению
        let approach = elements.teachingApproach?.value;
        if (approach === 'Другое' && elements.customTeachingApproach?.value.trim()) {
            approach = elements.customTeachingApproach.value;
        }
        
        if (!approach) {
            approach = 'стандартный подход к обучению';
        }
        
        // Обработка выбранных особенностей аудитории
        let selectedFeatures = Array.from(elements.audienceFeatures?.selectedOptions || [])
            .map(option => option.value);
        
        let featuresText = selectedFeatures.join(', ');
        if (elements.customAudienceFeatures?.value.trim()) {
            featuresText += featuresText ? ', ' + elements.customAudienceFeatures.value : elements.customAudienceFeatures.value;
        }
        
        if (!featuresText) {
            featuresText = 'стандартные особенности аудитории';
        }
        
        // Определение формата урока
        const formatValue = elements.lessonFormat?.value || 'оффлайн';
        
        // Определение длительности
        const durationValue = elements.totalLessonDuration?.value || '45';
        
        // Базовые разделы урока
        let lessonSections = '';
        
        if (elements.useCustomSections?.checked && elements.customSections?.value.trim()) {
            lessonSections = elements.customSections.value;
        } else {
            lessonSections = `1. Четкие цели обучения
2. Вводную активность (${elements.introActivityDuration?.value || '5-10'} минут)
3. Основную часть с объяснением материала (${elements.mainPartDuration?.value || '20-25'} минут)
4. Практические задания разного уровня сложности
5. Заключительную часть с подведением итогов
6. Домашнее задание`;
        }
        
        // Формирование финального промпта
        const finalPrompt = `Ты ${expert}. Создай план ${formatValue} урока продолжительностью ${durationValue} минут на тему "${topicValue}" для учеников ${ageClassValue} с ${knowledgeLevelValue} уровнем знаний.

Урок должен включать:
${lessonSections}

Урок должен развивать ${skillsText}. Используй ${approach} и ориентируйся на ${featuresText}.`;
        
        console.log('=== Финальный промпт ===');
        console.log(finalPrompt);
        
        // Обновляем текст промпта
        elements.generatedPrompt.textContent = finalPrompt;
        console.log('Промпт успешно обновлен в DOM');
        
        // Скрываем сообщение об ошибке, если оно было
        hideError();
        
    } catch (error) {
        console.error('Ошибка при генерации промпта:', error);
        showError(`Ошибка при генерации промпта: ${error.message}`);
    }
};

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

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('=== Начало инициализации страницы ===');
        
        // Проверяем наличие всех необходимых элементов
        checkRequiredElements();
        console.log('Все обязательные элементы найдены');
        
        // Получаем ссылки на все элементы формы
        const formElements = {
            expertType: document.getElementById('expertType'),
            customExpertType: document.getElementById('customExpertType'),
            customExpertContainer: document.getElementById('customExpertContainer'),
            topic: document.getElementById('topic'),
            ageClass: document.getElementById('ageClass'),
            customAgeClass: document.getElementById('customAgeClass'),
            customAgeClassContainer: document.getElementById('customAgeClassContainer'),
            knowledgeLevel: document.getElementById('knowledgeLevel'),
            customKnowledgeLevel: document.getElementById('customKnowledgeLevel'),
            customKnowledgeLevelContainer: document.getElementById('customKnowledgeLevelContainer'),
            skillsCompetencies: document.getElementById('skillsCompetencies'),
            customSkillsCompetencies: document.getElementById('customSkillsCompetencies'),
            teachingApproach: document.getElementById('teachingApproach'),
            customTeachingApproach: document.getElementById('customTeachingApproach'),
            customTeachingApproachContainer: document.getElementById('customTeachingApproachContainer'),
            audienceFeatures: document.getElementById('audienceFeatures'),
            customAudienceFeatures: document.getElementById('customAudienceFeatures'),
            lessonFormat: document.getElementById('lessonFormat'),
            useCustomSections: document.getElementById('useCustomSections'),
            standardStructure: document.getElementById('standardStructure'),
            customStructure: document.getElementById('customStructure'),
            customSections: document.getElementById('customSections'),
            totalLessonDuration: document.getElementById('totalLessonDuration'),
            introActivityDuration: document.getElementById('introActivityDuration'),
            mainPartDuration: document.getElementById('mainPartDuration'),
            durationDisplay: document.getElementById('durationDisplay'),
            introDisplay: document.getElementById('introDisplay'),
            mainDisplay: document.getElementById('mainDisplay'),
            copyButton: document.getElementById('copyButton'),
            subjectAlert: document.getElementById('subjectAlert'),
            classAlert: document.getElementById('classAlert'),
            generatedPrompt: document.getElementById('generatedPrompt')
        };

        // Проверяем наличие основных элементов и логируем результаты
        for (const [name, element] of Object.entries(formElements)) {
            console.log(`Элемент ${name}: ${element ? 'найден' : 'не найден'}`);
        }

        // Функция для обновления доступных классов на основе выбранного предмета
        function updateAvailableClasses() {
            console.log('=== Начало обновления доступных классов ===');
            
            const expertType = formElements.expertType;
            const ageClass = formElements.ageClass;
            const subjectAlert = formElements.subjectAlert;
            const classAlert = formElements.classAlert;
            
            console.log('Текущий выбранный предмет:', expertType?.value);
            console.log('Текущий выбранный класс:', ageClass?.value);
            
            // Проверяем наличие элементов
            if (!expertType || !ageClass) {
                console.error('Не найдены необходимые элементы формы');
                showError('Ошибка при обновлении классов: не найдены элементы формы');
                return;
            }
            
            // Если предмет не выбран
            if (!expertType.value || expertType.value === "") {
                console.log('Предмет не выбран, блокируем выбор класса');
                ageClass.disabled = true;
                ageClass.options[0].text = "Сначала выберите предмет";
                if (subjectAlert) {
                    subjectAlert.style.display = 'block';
                    console.log('Показываем предупреждение о выборе предмета');
                }
                return;
            }
            
            // Получаем доступные классы из data-атрибута
            const selectedOption = expertType.options[expertType.selectedIndex];
            const grades = selectedOption.dataset.grades;
            
            console.log('Выбранный предмет:', selectedOption.text);
            console.log('Доступные классы из data-атрибута:', grades);
            
            if (!grades) {
                console.error('Не указаны доступные классы для предмета:', selectedOption.text);
                ageClass.disabled = true;
                showError(`Ошибка: не указаны доступные классы для предмета "${selectedOption.text}"`);
                return;
            }
            
            // Разблокируем выбор класса
            ageClass.disabled = false;
            ageClass.options[0].text = "Выберите класс";
            if (subjectAlert) {
        subjectAlert.style.display = 'none';
                console.log('Скрываем предупреждение о выборе предмета');
            }
            
            // Разбиваем строку с классами в массив
            const availableGrades = grades.split(',').map(g => g.trim());
            console.log('Доступные классы после обработки:', availableGrades);
            
            // Обновляем доступность опций
            let hasAvailableOptions = false;
            Array.from(ageClass.options).forEach(option => {
                const grade = option.dataset.grade;
                if (grade) {
                    const isAvailable = availableGrades.includes(grade);
                    option.disabled = !isAvailable;
                    option.style.display = isAvailable ? '' : 'none';
                    if (isAvailable) hasAvailableOptions = true;
                    console.log(`Класс ${grade}: ${isAvailable ? 'доступен' : 'недоступен'}`);
                }
            });
            
            // Если нет доступных опций, показываем сообщение
            if (!hasAvailableOptions) {
                console.warn('Нет доступных классов для выбранного предмета');
                showError(`Для предмета "${selectedOption.text}" нет доступных классов`);
                return;
            }
            
            // Проверяем текущий выбранный класс
            if (ageClass.value && ageClass.value !== "Другое") {
                const selectedGrade = ageClass.options[ageClass.selectedIndex]?.dataset.grade;
                console.log('Проверка текущего выбранного класса:', selectedGrade);
                
                if (selectedGrade && !availableGrades.includes(selectedGrade)) {
                    console.log('Текущий выбранный класс недоступен, сбрасываем выбор');
                    ageClass.value = "";
                    if (classAlert) {
                    classAlert.style.display = 'block';
                        console.log('Показываем предупреждение о недоступном классе');
                    }
                } else {
                    if (classAlert) {
                    classAlert.style.display = 'none';
                        console.log('Скрываем предупреждение о недоступном классе');
                    }
                }
            }
            
            console.log('=== Завершение обновления доступных классов ===');
        }

        // Функция для обработки отображения пользовательских полей
        function toggleCustomField(selectElement, customContainer) {
            if (selectElement && customContainer) {
                customContainer.style.display = selectElement.value === 'Другое' ? 'block' : 'none';
            }
        }

        // Функция для обновления отображения длительности
        function updateDurationDisplay() {
            const elements = {
                total: formElements.totalLessonDuration,
                totalDisplay: formElements.durationDisplay,
                intro: formElements.introActivityDuration,
                introDisplay: formElements.introDisplay,
                main: formElements.mainPartDuration,
                mainDisplay: formElements.mainDisplay
            };
            
            if (elements.total && elements.totalDisplay) {
                elements.totalDisplay.textContent = elements.total.value;
            }
            if (elements.intro && elements.introDisplay) {
                elements.introDisplay.textContent = elements.intro.value;
            }
            if (elements.main && elements.mainDisplay) {
                elements.mainDisplay.textContent = elements.main.value;
            }
        }

        // Функция для обработки переключения структуры урока
        function toggleLessonStructure() {
            const useCustom = formElements.useCustomSections;
            const standard = formElements.standardStructure;
            const custom = formElements.customStructure;
            
            if (useCustom && standard && custom) {
                standard.style.display = useCustom.checked ? 'none' : 'block';
                custom.style.display = useCustom.checked ? 'block' : 'none';
            }
        }

        // Добавляем обработчики событий
        if (formElements.expertType) {
            formElements.expertType.addEventListener('change', () => {
                toggleCustomField(formElements.expertType, formElements.customExpertContainer);
                updateAvailableClasses();
                updatePrompt();
            });
        }

        if (formElements.ageClass) {
            formElements.ageClass.addEventListener('change', () => {
                toggleCustomField(formElements.ageClass, formElements.customAgeClassContainer);
                if (formElements.classAlert) {
                    formElements.classAlert.style.display = 'none';
                }
        updatePrompt();
    });
        }

        if (formElements.knowledgeLevel) {
            formElements.knowledgeLevel.addEventListener('change', () => {
                toggleCustomField(formElements.knowledgeLevel, formElements.customKnowledgeLevelContainer);
        updatePrompt();
    });
        }

        if (formElements.teachingApproach) {
            formElements.teachingApproach.addEventListener('change', () => {
                toggleCustomField(formElements.teachingApproach, formElements.customTeachingApproachContainer);
        updatePrompt();
    });
        }

        if (formElements.useCustomSections) {
            formElements.useCustomSections.addEventListener('change', () => {
                toggleLessonStructure();
        updatePrompt();
    });
        }

        if (formElements.totalLessonDuration) {
            formElements.totalLessonDuration.addEventListener('change', () => {
                updateDurationDisplay();
        updatePrompt();
    });
        }

        if (formElements.introActivityDuration) {
            formElements.introActivityDuration.addEventListener('change', () => {
                updateDurationDisplay();
        updatePrompt();
    });
        }

        if (formElements.mainPartDuration) {
            formElements.mainPartDuration.addEventListener('change', () => {
                updateDurationDisplay();
        updatePrompt();
    });
        }

        // Добавляем обработчики для остальных полей
        ['topic', 'customExpertType', 'customAgeClass', 'customKnowledgeLevel', 
         'skillsCompetencies', 'customSkillsCompetencies', 'audienceFeatures', 
         'customAudienceFeatures', 'customSections', 'lessonFormat'].forEach(id => {
            const element = formElements[id];
            if (element) {
                element.addEventListener(element.tagName === 'SELECT' ? 'change' : 'input', () => {
                    updatePrompt();
                });
            }
        });

        // Добавляем обработчик для кнопки копирования
        if (formElements.copyButton) {
            formElements.copyButton.addEventListener('click', function() {
                const generatedPrompt = document.getElementById('generatedPrompt');
                if (generatedPrompt && generatedPrompt.textContent) {
                    navigator.clipboard.writeText(generatedPrompt.textContent)
            .then(() => {
                            console.log('Промпт скопирован в буфер обмена');
                            this.textContent = 'Скопировано!';
                            setTimeout(() => {
                                this.textContent = 'Скопировать промпт';
                            }, 2000);
            })
            .catch(err => {
                            console.error('Ошибка при копировании:', err);
                            showError('Не удалось скопировать промпт в буфер обмена');
                        });
                }
            });
        }
    
        // Инициализируем начальное состояние
        updateAvailableClasses();
        updateDurationDisplay();
        toggleLessonStructure();
    updatePrompt();
        
        console.log('Инициализация завершена успешно');
        
    } catch (error) {
        console.error('Ошибка при инициализации:', error);
        showError(`Ошибка при инициализации: ${error.message}`);
    }
});
