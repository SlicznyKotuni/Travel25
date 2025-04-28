/**
 * Moduł odpowiedzialny za obsługę organizera podróży
 */
const PlannerHandler = (() => {
    // Przechowuje dane planera
    let plannerData = {
        // Tablica dni [1-31]
        days: Array.from({ length: 31 }, (_, i) => i + 1),
        // Mapa przypisań sekcji do dni
        sectionAssignments: {},
        // Mapa przypisań podsekcji do dni
        subsectionAssignments: {},
        // Aktualnie wybrany dzień
        selectedDay: 1
    };
    
    /**
     * Tworzy element przeciągalny dla sekcji lub podsekcji
     * @param {string} id - ID sekcji lub podsekcji
     * @param {string} title - Tytuł sekcji lub podsekcji
     * @param {string} type - Typ elementu ('section' lub 'subsection')
     * @returns {HTMLElement} - Element przeciągalny
     */
    const createDraggableItem = (id, title, type) => {
        const item = document.createElement('div');
        item.className = `draggable ${type}-draggable`;
        item.setAttribute('data-id', id);
        item.setAttribute('data-type', type);
        item.textContent = title;
        
        // Dodanie ikony przeciągania
        const dragIcon = document.createElement('span');
        dragIcon.className = 'drag-icon';
        dragIcon.innerHTML = '&#8597;'; // Strzałka w górę i w dół
        item.prepend(dragIcon);
        
        return item;
    };
    
    /**
     * Inicjalizuje kalendarz ogólny
     * @param {Object} data - Dane wycieczki
     */
    const initGeneralCalendar = (data) => {
        const calendarContainer = document.getElementById('general-calendar');
        calendarContainer.innerHTML = '';
        
        // Nagłówek kalendarza
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.innerHTML = '<h4>Wybierz dzień i przypisz atrakcje</h4>';
        calendarContainer.appendChild(header);
        
        // Siatka dni
        const daysGrid = document.createElement('div');
        daysGrid.className = 'days-grid';
        
        plannerData.days.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'day-item';
            dayElement.textContent = `Dzień ${day}`;
            dayElement.setAttribute('data-day', day);
            
            // Zaznaczenie aktualnie wybranego dnia
            if (day === plannerData.selectedDay) {
                dayElement.classList.add('selected');
            }
            
            // Obsługa kliknięcia na dzień
            dayElement.addEventListener('click', () => {
                // Usunięcie klasy 'selected' z wszystkich elementów
                document.querySelectorAll('.day-item').forEach(el => {
                    el.classList.remove('selected');
                });
                
                // Dodanie klasy 'selected' do klikniętego elementu
                dayElement.classList.add('selected');
                
                // Aktualizacja wybranego dnia
                plannerData.selectedDay = day;
                
                // Aktualizacja widoku planu szczegółowego
                updateDetailedDayPlan(data);
            });
            
            daysGrid.appendChild(dayElement);
        });
        
        calendarContainer.appendChild(daysGrid);
        
        // Lista dostępnych sekcji do przypisania
        const sectionsListTitle = document.createElement('h4');
        sectionsListTitle.textContent = 'Dostępne atrakcje';
        calendarContainer.appendChild(sectionsListTitle);
        
        const sectionsList = document.createElement('div');
        sectionsList.className = 'sections-list drop-zone';
        sectionsList.id = 'available-sections';
        
        // Dodanie sekcji jako elementy przeciągalne
        data.sections.forEach(section => {
            const sectionItem = createDraggableItem(`section-${section.id}`, section.title, 'section');
            sectionsList.appendChild(sectionItem);
        });
        
        calendarContainer.appendChild(sectionsList);
        
        // Inicjalizacja Sortable dla listy sekcji
        new Sortable(sectionsList, {
            group: {
                name: 'sections',
                pull: 'clone',
                put: false // Nie pozwala na upuszczanie elementów na tę listę
            },
            sort: false, // Wyłączenie sortowania w obrębie listy źródłowej
            animation: 150,
            onClone: function(evt) {
                const origEl = evt.item;
                const cloneEl = evt.clone;
                
                // Oznaczenie oryginału jako sklonowany (by nie znikał)
                origEl.classList.add('cloned');
            }
        });
        
        // Przypisane sekcje dla wybranego dnia
        const assignedSectionsTitle = document.createElement('h4');
        assignedSectionsTitle.textContent = `Atrakcje na dzień ${plannerData.selectedDay}`;
        assignedSectionsTitle.id = 'assigned-sections-title';
        calendarContainer.appendChild(assignedSectionsTitle);
        
        const assignedSections = document.createElement('div');
        assignedSections.className = 'assigned-sections drop-zone';
        assignedSections.id = 'day-assigned-sections';
        calendarContainer.appendChild(assignedSections);
        
        // Inicjalizacja Sortable dla przypisanych sekcji
        new Sortable(assignedSections, {
            group: 'sections',
            animation: 150,
            onAdd: function(evt) {
                const sectionId = evt.item.getAttribute('data-id');
                const sectionType = evt.item.getAttribute('data-type');
                
                // Zapisanie przypisania sekcji do wybranego dnia
                if (sectionType === 'section') {
                    if (!plannerData.sectionAssignments[plannerData.selectedDay]) {
                        plannerData.sectionAssignments[plannerData.selectedDay] = [];
                    }
                    
                    if (!plannerData.sectionAssignments[plannerData.selectedDay].includes(sectionId)) {
                        plannerData.sectionAssignments[plannerData.selectedDay].push(sectionId);
                    }
                }
                
                // Aktualizacja widoku planu szczegółowego
                updateDetailedDayPlan(data);
            },
            onRemove: function(evt) {
                const sectionId = evt.item.getAttribute('data-id');
                
                // Usunięcie przypisania sekcji do wybranego dnia
                if (plannerData.sectionAssignments[plannerData.selectedDay]) {
                    const index = plannerData.sectionAssignments[plannerData.selectedDay].indexOf(sectionId);
                    if (index !== -1) {
                        plannerData.sectionAssignments[plannerData.selectedDay].splice(index, 1);
                    }
                }
                
                // Aktualizacja widoku planu szczegółowego
                updateDetailedDayPlan(data);
            },
            onUpdate: function(evt) {
                // Aktualizacja kolejności przypisanych sekcji
                const sectionIds = Array.from(document.querySelectorAll('#day-assigned-sections .draggable'))
                    .map(el => el.getAttribute('data-id'));
                
                plannerData.sectionAssignments[plannerData.selectedDay] = sectionIds;
                
                // Aktualizacja widoku planu szczegółowego
                updateDetailedDayPlan(data);
            }
        });
        
        // Załadowanie zapisanych przypisań dla wybranego dnia
        loadDayAssignments(data);
    };
    
    /**
     * Ładuje zapisane przypisania dla wybranego dnia
     * @param {Object} data - Dane wycieczki
     */
    const loadDayAssignments = (data) => {
        const assignedSections = document.getElementById('day-assigned-sections');
        assignedSections.innerHTML = '';
        
        document.getElementById('assigned-sections-title').textContent = `Atrakcje na dzień ${plannerData.selectedDay}`;
        
        // Jeśli istnieją przypisania dla wybranego dnia, dodaj je do kontenera
        if (plannerData.sectionAssignments[plannerData.selectedDay]) {
            plannerData.sectionAssignments[plannerData.selectedDay].forEach(sectionId => {
                // Znajdź sekcję w danych wycieczki
                const sectionIdClean = sectionId.replace('section-', '');
                const section = data.sections.find(s => s.id === sectionIdClean);
                
                if (section) {
                    const sectionItem = createDraggableItem(sectionId, section.title, 'section');
                    assignedSections.appendChild(sectionItem);
                }
            });
        }
    };
    
    /**
     * Aktualizuje widok planu szczegółowego dla wybranego dnia
     * @param {Object} data - Dane wycieczki
     */
    const updateDetailedDayPlan = (data) => {
        const detailedDayPlan = document.getElementById('detailed-day-plan');
        detailedDayPlan.innerHTML = '';
        
        // Nagłówek planu szczegółowego
        const header = document.createElement('div');
        header.className = 'day-plan-header';
        header.innerHTML = `<h4>Szczegółowy plan na dzień ${plannerData.selectedDay}</h4>`;
        detailedDayPlan.appendChild(header);
        
        // Sprawdzenie, czy istnieją przypisane sekcje dla wybranego dnia
        if (!plannerData.sectionAssignments[plannerData.selectedDay] || 
            plannerData.sectionAssignments[plannerData.selectedDay].length === 0) {
            
            const emptyPlan = document.createElement('div');
            emptyPlan.className = 'empty-plan';
            emptyPlan.textContent = 'Brak zaplanowanych atrakcji na ten dzień. Przeciągnij atrakcje z listy po lewej stronie.';
            detailedDayPlan.appendChild(emptyPlan);
            
            return;
        }
        
        // Tworzenie szczegółowego planu dla każdej przypisanej sekcji
        plannerData.sectionAssignments[plannerData.selectedDay].forEach(sectionId => {
            const sectionIdClean = sectionId.replace('section-', '');
            const section = data.sections.find(s => s.id === sectionIdClean);
            
            if (section) {
                // Kontener dla sekcji
                const sectionContainer = document.createElement('div');
                sectionContainer.className = 'day-plan-section';
                
                // Nagłówek sekcji
                const sectionHeader = document.createElement('div');
                sectionHeader.className = 'day-plan-section-header';
                sectionHeader.innerHTML = `<h5>${section.title}</h5>`;
                sectionContainer.appendChild(sectionHeader);
                
                // Podsekcje (jeśli istnieją)
                if (section.subsections && section.subsections.length > 0) {
                    const subsectionsTitle = document.createElement('p');
                    subsectionsTitle.textContent = 'Dodaj szczegółowe atrakcje:';
                    sectionContainer.appendChild(subsectionsTitle);
                    
                    // Lista dostępnych podsekcji
                    const subsectionsList = document.createElement('div');
                    subsectionsList.className = 'subsections-list drop-zone';
                    subsectionsList.id = `available-subsections-${section.id}`;
                    
                    section.subsections.forEach(subsection => {
                        const subsectionItem = createDraggableItem(
                            `subsection-${subsection.id}`, 
                            subsection.title, 
                            'subsection'
                        );
                        subsectionItem.setAttribute('data-parent', sectionId);
                        subsectionsList.appendChild(subsectionItem);
                    });
                    
                    sectionContainer.appendChild(subsectionsList);
                    
                    // Inicjalizacja Sortable dla listy podsekcji
                    new Sortable(subsectionsList, {
                        group: {
                            name: `subsections-${section.id}`,
                            pull: 'clone',
                            put: false
                        },
                        sort: false,
                        animation: 150
                    });
                    
                    // Przypisane podsekcje
                    const assignedSubsections = document.createElement('div');
                    assignedSubsections.className = 'assigned-subsections drop-zone';
                    assignedSubsections.id = `day-assigned-subsections-${section.id}`;
                    sectionContainer.appendChild(assignedSubsections);
                    
                    // Inicjalizacja Sortable dla przypisanych podsekcji
                    new Sortable(assignedSubsections, {
                        group: `subsections-${section.id}`,
                        animation: 150,
                        onAdd: function(evt) {
                            const subsectionId = evt.item.getAttribute('data-id');
                            
                            // Zapisanie przypisania podsekcji do wybranego dnia
                            const dayKey = `${plannerData.selectedDay}-${sectionId}`;
                            if (!plannerData.subsectionAssignments[dayKey]) {
                                plannerData.subsectionAssignments[dayKey] = [];
                            }
                            
                            if (!plannerData.subsectionAssignments[dayKey].includes(subsectionId)) {
                                plannerData.subsectionAssignments[dayKey].push(subsectionId);
                            }
                        },
                        onRemove: function(evt) {
                            const subsectionId = evt.item.getAttribute('data-id');
                            
                            // Usunięcie przypisania podsekcji do wybranego dnia
                            const dayKey = `${plannerData.selectedDay}-${sectionId}`;
                            if (plannerData.subsectionAssignments[dayKey]) {
                                const index = plannerData.subsectionAssignments[dayKey].indexOf(subsectionId);
                                if (index !== -1) {
                                    plannerData.subsectionAssignments[dayKey].splice(index, 1);
                                }
                            }
                        }
                    });
                    
                    // Załadowanie zapisanych przypisań podsekcji
                    const dayKey = `${plannerData.selectedDay}-${sectionId}`;
                    if (plannerData.subsectionAssignments[dayKey]) {
                        plannerData.subsectionAssignments[dayKey].forEach(subsectionId => {
                            const subsectionIdClean = subsectionId.replace('subsection-', '');
                            const subsection = section.subsections.find(s => s.id === subsectionIdClean);
                            
                            if (subsection) {
                                const subsectionItem = createDraggableItem(
                                    subsectionId, 
                                    subsection.title, 
                                    'subsection'
                                );
                                subsectionItem.setAttribute('data-parent', sectionId);
                                assignedSubsections.appendChild(subsectionItem);
                            }
                        });
                    }
                }
                
                detailedDayPlan.appendChild(sectionContainer);
            }
        });
    };
    
    /**
     * Inicjalizuje moduł
     */
    const init = () => {
        // Inicjalizacja planera po załadowaniu nowej wycieczki
        document.addEventListener('tripLoaded', (e) => {
            const data = e.detail.data;
            
            // Resetowanie danych planera dla nowej wycieczki
            plannerData = {
                days: Array.from({ length: 31 }, (_, i) => i + 1),
                sectionAssignments: {},
                subsectionAssignments: {},
                selectedDay: 1
            };
            
            initGeneralCalendar(data);
            updateDetailedDayPlan(data);
        });
    };
    
    return {
        init
    };
})();