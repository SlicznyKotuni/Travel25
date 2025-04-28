/**
 * Moduł odpowiedzialny za obsługę organizera podróży
 */
const PlannerHandler = (() => {
    // Przechowuje dane planera
    let plannerData = {
        daysCount: 7,
        days: Array.from({ length: 7 }, (_, i) => i + 1),
        sectionAssignments: {},
        subsectionAssignments: {},
        selectedDay: 1,
        tripData: null
    };

    /**
     * Tworzy element przeciągalny dla sekcji lub podsekcji
     */
    const createDraggableItem = (id, title, type) => {
        const item = document.createElement('div');
        item.className = `draggable ${type}-draggable`;
        item.setAttribute('data-id', id);
        item.setAttribute('data-type', type);
        item.textContent = title;
        
        const dragIcon = document.createElement('span');
        dragIcon.className = 'drag-icon';
        dragIcon.innerHTML = '&#8597;';
        item.prepend(dragIcon);

        if (type !== 'available') {
            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeItemFromDay(id, type);
            });
            item.appendChild(deleteBtn);
        }
        
        return item;
    };

    /**
     * Usuwa element z przypisanego dnia
     */
    const removeItemFromDay = (id, type) => {
        if (type === 'section') {
            if (plannerData.sectionAssignments[plannerData.selectedDay]) {
                const index = plannerData.sectionAssignments[plannerData.selectedDay].indexOf(id);
                if (index !== -1) {
                    plannerData.sectionAssignments[plannerData.selectedDay].splice(index, 1);
                    
                    // Usunięcie powiązanych podsekcji
                    const dayKey = `${plannerData.selectedDay}-${id}`;
                    if (plannerData.subsectionAssignments[dayKey]) {
                        delete plannerData.subsectionAssignments[dayKey];
                    }
                }
            }
        } else {
            const parentSectionId = document.querySelector(`[data-id="${id}"]`)?.getAttribute('data-parent');
            if (parentSectionId) {
                const dayKey = `${plannerData.selectedDay}-${parentSectionId}`;
                if (plannerData.subsectionAssignments[dayKey]) {
                    const index = plannerData.subsectionAssignments[dayKey].indexOf(id);
                    if (index !== -1) {
                        plannerData.subsectionAssignments[dayKey].splice(index, 1);
                    }
                }
            }
        }
        
        updateAvailableItems();
        updateDetailedDayPlan();
    };

    /**
     * Aktualizuje listę dostępnych elementów
     */
    const updateAvailableItems = () => {
        if (!plannerData.tripData) return;

        const sectionsList = document.getElementById('available-sections');
        if (sectionsList) {
            sectionsList.innerHTML = '';

            plannerData.tripData.sections.forEach(section => {
                let isAssigned = false;
                for (const day in plannerData.sectionAssignments) {
                    if (plannerData.sectionAssignments[day].includes(`section-${section.id}`)) {
                        isAssigned = true;
                        break;
                    }
                }

                if (!isAssigned) {
                    const sectionItem = createDraggableItem(`section-${section.id}`, section.title, 'available');
                    sectionsList.appendChild(sectionItem);
                }
            });
        }
    };

    /**
     * Aktualizuje listę dni
     */
    const updateDaysList = () => {
        plannerData.days = Array.from({ length: plannerData.daysCount }, (_, i) => i + 1);
        
        const daysGrid = document.querySelector('.days-grid');
        if (daysGrid) {
            daysGrid.innerHTML = '';
            
            plannerData.days.forEach(day => {
                const dayElement = document.createElement('div');
                dayElement.className = 'day-item';
                dayElement.textContent = `Dzień ${day}`;
                dayElement.setAttribute('data-day', day);
                
                if (day === plannerData.selectedDay) {
                    dayElement.classList.add('selected');
                }
                
                dayElement.addEventListener('click', () => selectDay(day));
                daysGrid.appendChild(dayElement);
            });
        }
    };

    /**
     * Wybiera dzień i aktualizuje widok
     */
    const selectDay = (day) => {
        plannerData.selectedDay = day;
        
        document.querySelectorAll('.day-item').forEach(el => {
            el.classList.remove('selected');
            if (parseInt(el.getAttribute('data-day')) === day) {
                el.classList.add('selected');
            }
        });
        
        document.getElementById('assigned-sections-title').textContent = `Atrakcje na dzień ${day}`;
        updateAssignedSections();
        updateDetailedDayPlan();
    };

    /**
     * Aktualizuje przypisane sekcje dla wybranego dnia
     */
    const updateAssignedSections = () => {
        const assignedSections = document.getElementById('day-assigned-sections');
        if (!assignedSections) return;
        
        assignedSections.innerHTML = '';
        
        if (plannerData.sectionAssignments[plannerData.selectedDay]) {
            plannerData.sectionAssignments[plannerData.selectedDay].forEach(sectionId => {
                const sectionIdClean = sectionId.replace('section-', '');
                const section = plannerData.tripData.sections.find(s => s.id === sectionIdClean);
                
                if (section) {
                    const sectionItem = createDraggableItem(sectionId, section.title, 'section');
                    assignedSections.appendChild(sectionItem);
                }
            });
        }
    };

    /**
     * Inicjalizuje kalendarz ogólny
     */
    const initGeneralCalendar = () => {
        const calendarContainer = document.getElementById('general-calendar');
        calendarContainer.innerHTML = '';
        
        // Nagłówek
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.innerHTML = '<h4>Wybierz dzień i przypisz atrakcje</h4>';
        calendarContainer.appendChild(header);
        
        // Kontrolka ilości dni
        const daysControl = document.createElement('div');
        daysControl.className = 'days-control';
        daysControl.innerHTML = `
            <label for="days-count">Ilość dni:</label>
            <select id="days-count">
                <option value="7">7 dni</option>
                <option value="14">14 dni</option>
                <option value="21">21 dni</option>
                <option value="31">31 dni</option>
            </select>
        `;
        calendarContainer.appendChild(daysControl);
        
        document.getElementById('days-count').value = plannerData.daysCount;
        document.getElementById('days-count').addEventListener('change', (e) => {
            plannerData.daysCount = parseInt(e.target.value);
            updateDaysList();
        });
        
        // Siatka dni
        const daysGrid = document.createElement('div');
        daysGrid.className = 'days-grid';
        calendarContainer.appendChild(daysGrid);
        updateDaysList();
        
        // Lista dostępnych sekcji
        const sectionsListTitle = document.createElement('h4');
        sectionsListTitle.textContent = 'Dostępne atrakcje';
        calendarContainer.appendChild(sectionsListTitle);
        
        const sectionsList = document.createElement('div');
        sectionsList.className = 'sections-list drop-zone';
        sectionsList.id = 'available-sections';
        calendarContainer.appendChild(sectionsList);
        
        updateAvailableItems();
        
        // Inicjalizacja Sortable dla dostępnych sekcji
        new Sortable(sectionsList, {
            group: {
                name: 'sections',
                pull: 'clone',
                put: false
            },
            sort: false,
            animation: 150,
            onClone: function(evt) {
                evt.item.classList.add('cloned');
            }
        });
        
        // Przypisane sekcje
        const assignedSectionsTitle = document.createElement('h4');
        assignedSectionsTitle.textContent = `Atrakcje na dzień ${plannerData.selectedDay}`;
        assignedSectionsTitle.id = 'assigned-sections-title';
        calendarContainer.appendChild(assignedSectionsTitle);
        
        const assignedSections = document.createElement('div');
        assignedSections.className = 'assigned-sections drop-zone';
        assignedSections.id = 'day-assigned-sections';
        calendarContainer.appendChild(assignedSections);
        
        updateAssignedSections();
        
        // Inicjalizacja Sortable dla przypisanych sekcji
        new Sortable(assignedSections, {
            group: 'sections',
            animation: 150,
            onAdd: function(evt) {
                const sectionId = evt.item.getAttribute('data-id');
                
                if (!plannerData.sectionAssignments[plannerData.selectedDay]) {
                    plannerData.sectionAssignments[plannerData.selectedDay] = [];
                }
                
                if (!plannerData.sectionAssignments[plannerData.selectedDay].includes(sectionId)) {
                    plannerData.sectionAssignments[plannerData.selectedDay].push(sectionId);
                    updateAvailableItems();
                    updateDetailedDayPlan();
                }
            },
            onRemove: function(evt) {
                const sectionId = evt.item.getAttribute('data-id');
                
                if (plannerData.sectionAssignments[plannerData.selectedDay]) {
                    const index = plannerData.sectionAssignments[plannerData.selectedDay].indexOf(sectionId);
                    if (index !== -1) {
                        plannerData.sectionAssignments[plannerData.selectedDay].splice(index, 1);
                    }
                }
                
                updateAvailableItems();
                updateDetailedDayPlan();
            },
            onUpdate: function(evt) {
                const sectionIds = Array.from(document.querySelectorAll('#day-assigned-sections .draggable'))
                    .map(el => el.getAttribute('data-id'));
                
                plannerData.sectionAssignments[plannerData.selectedDay] = sectionIds;
                updateDetailedDayPlan();
            }
        });
        
        // Przyciski akcji
        const actionButtons = document.createElement('div');
        actionButtons.className = 'planner-actions';
        actionButtons.innerHTML = `
            <button id="save-plan" class="btn btn-primary">Zapisz plan</button>
            <button id="print-guide" class="btn btn-secondary">Drukuj przewodnik</button>
            <input type="file" id="load-plan-input" accept=".json" style="display: none;">
            <button id="load-plan" class="btn btn-outline-secondary">Wczytaj plan</button>
        `;
        calendarContainer.appendChild(actionButtons);
        
        document.getElementById('save-plan').addEventListener('click', savePlanToFile);
        document.getElementById('print-guide').addEventListener('click', generatePrintableGuide);
        document.getElementById('load-plan').addEventListener('click', () => {
            document.getElementById('load-plan-input').click();
        });
        document.getElementById('load-plan-input').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                loadPlanFromFile(e.target.files[0]);
            }
        });
    };

    /**
     * Aktualizuje widok planu szczegółowego
     */
    const updateDetailedDayPlan = () => {
        const detailedDayPlan = document.getElementById('detailed-day-plan');
        if (!detailedDayPlan) return;
        
        detailedDayPlan.innerHTML = '';
        
        const header = document.createElement('div');
        header.className = 'day-plan-header';
        header.innerHTML = `<h4>Szczegółowy plan na dzień ${plannerData.selectedDay}</h4>`;
        detailedDayPlan.appendChild(header);
        
        if (!plannerData.sectionAssignments[plannerData.selectedDay] || 
            plannerData.sectionAssignments[plannerData.selectedDay].length === 0) {
            
            const emptyPlan = document.createElement('div');
            emptyPlan.className = 'empty-plan';
            emptyPlan.textContent = 'Brak zaplanowanych atrakcji na ten dzień. Przeciągnij atrakcje z listy po lewej stronie.';
            detailedDayPlan.appendChild(emptyPlan);
            return;
        }
        
        plannerData.sectionAssignments[plannerData.selectedDay].forEach(sectionId => {
            const sectionIdClean = sectionId.replace('section-', '');
            const section = plannerData.tripData.sections.find(s => s.id === sectionIdClean);
            
            if (section) {
                const sectionContainer = document.createElement('div');
                sectionContainer.className = 'day-plan-section';
                
                const sectionHeader = document.createElement('div');
                sectionHeader.className = 'day-plan-section-header';
                sectionHeader.innerHTML = `<h5>${section.title}</h5>`;
                if (section.description) {
                    const desc = document.createElement('p');
                    desc.className = 'section-description';
                    desc.textContent = section.description;
                    sectionHeader.appendChild(desc);
                }
                sectionContainer.appendChild(sectionHeader);
                
                if (section.subsections && section.subsections.length > 0) {
                    const subsectionsTitle = document.createElement('p');
                    subsectionsTitle.textContent = 'Dodaj szczegółowe atrakcje:';
                    sectionContainer.appendChild(subsectionsTitle);
                    
                    // Lista dostępnych podsekcji
                    const subsectionsList = document.createElement('div');
                    subsectionsList.className = 'subsections-list drop-zone';
                    subsectionsList.id = `available-subsections-${section.id}`;
                    
                    section.subsections.forEach(subsection => {
                        const dayKey = `${plannerData.selectedDay}-${sectionId}`;
                        const isAssigned = plannerData.subsectionAssignments[dayKey] && 
                                        plannerData.subsectionAssignments[dayKey].includes(`subsection-${subsection.id}`);
                        
                        if (!isAssigned) {
                            const subsectionItem = createDraggableItem(
                                `subsection-${subsection.id}`, 
                                subsection.title, 
                                'available'
                            );
                            subsectionItem.setAttribute('data-parent', sectionId);
                            subsectionsList.appendChild(subsectionItem);
                        }
                    });
                    
                    sectionContainer.appendChild(subsectionsList);
                    
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
                                
                                if (subsection.description) {
                                    const desc = document.createElement('p');
                                    desc.className = 'subsection-description';
                                    desc.textContent = subsection.description;
                                    subsectionItem.appendChild(desc);
                                }
                                
                                assignedSubsections.appendChild(subsectionItem);
                            }
                        });
                    }
                    
                    new Sortable(assignedSubsections, {
                        group: `subsections-${section.id}`,
                        animation: 150,
                        onAdd: function(evt) {
                            const subsectionId = evt.item.getAttribute('data-id');
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
                            const dayKey = `${plannerData.selectedDay}-${sectionId}`;
                            
                            if (plannerData.subsectionAssignments[dayKey]) {
                                const index = plannerData.subsectionAssignments[dayKey].indexOf(subsectionId);
                                if (index !== -1) {
                                    plannerData.subsectionAssignments[dayKey].splice(index, 1);
                                }
                            }
                        }
                    });
                }
                
                detailedDayPlan.appendChild(sectionContainer);
            }
        });
    };

    /**
     * Zapisuje plan do pliku JSON
     */
    const savePlanToFile = () => {
        if (!plannerData.tripData) return;
        
        const dataToSave = {
            daysCount: plannerData.daysCount,
            sectionAssignments: plannerData.sectionAssignments,
            subsectionAssignments: plannerData.subsectionAssignments,
            selectedDay: plannerData.selectedDay,
            tripId: plannerData.tripData.id,
            tripTitle: plannerData.tripData.title
        };
        
        const dataStr = JSON.stringify(dataToSave, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportName = `travel_plan_${plannerData.tripData.title.replace(/\s+/g, '_')}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportName);
        linkElement.click();
    };

    /**
     * Ładuje plan z pliku JSON
     */
    const loadPlanFromFile = (file) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const savedData = JSON.parse(e.target.result);
                
                if (!plannerData.tripData || savedData.tripId !== plannerData.tripData.id) {
                    alert('Ten plan został zapisany dla innej wycieczki. Nie można go załadować.');
                    return;
                }
                
                plannerData.daysCount = savedData.daysCount || 7;
                plannerData.sectionAssignments = savedData.sectionAssignments || {};
                plannerData.subsectionAssignments = savedData.subsectionAssignments || {};
                plannerData.selectedDay = savedData.selectedDay || 1;
                
                document.getElementById('days-count').value = plannerData.daysCount;
                updateDaysList();
                selectDay(plannerData.selectedDay);
                updateAvailableItems();
                
                alert('Plan został pomyślnie załadowany.');
            } catch (error) {
                console.error('Błąd podczas wczytywania planu:', error);
                alert('Wystąpił błąd podczas wczytywania planu. Plik może być uszkodzony.');
            }
        };
        
        reader.readAsText(file);
    };

    /**
     * Generuje przewodnik do druku
     */
    const generatePrintableGuide = () => {
        if (!plannerData.tripData) return;
        
        // Tutaj należy dodać implementację generowania PDF
        // Wymaga to dodania odpowiednich bibliotek (np. jsPDF)
        
        alert('Przewodnik zostanie wygenerowany jako PDF. Ta funkcja wymaga implementacji biblioteki jsPDF.');
        
        // Przykładowa implementacja:
        /*
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Nagłówek
        doc.setFontSize(20);
        doc.text(`Przewodnik: ${plannerData.tripData.title}`, 10, 10);
        
        let yPosition = 30;
        
        // Generowanie zawartości
        for (let day = 1; day <= plannerData.daysCount; day++) {
            if (plannerData.sectionAssignments[day] && plannerData.sectionAssignments[day].length > 0) {
                doc.setFontSize(16);
                doc.text(`Dzień ${day}:`, 10, yPosition);
                yPosition += 10;
                
                // Tutaj dodaj zawartość dla każdego dnia
                // ...
                
                yPosition += 10;
                if (yPosition > 280) {
                    doc.addPage();
                    yPosition = 10;
                }
            }
        }
        
        doc.save(`przewodnik_${plannerData.tripData.title.replace(/\s+/g, '_')}.pdf`);
        */
    };

    /**
     * Inicjalizuje moduł
     */
    const init = () => {
        document.addEventListener('tripLoaded', (e) => {
            plannerData = {
                daysCount: 7,
                days: Array.from({ length: 7 }, (_, i) => i + 1),
                sectionAssignments: {},
                subsectionAssignments: {},
                selectedDay: 1,
                tripData: e.detail.data
            };
            
            initGeneralCalendar();
            updateDetailedDayPlan();
        });
    };
    
    return {
        init
    };
})();