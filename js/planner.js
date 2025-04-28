/**
 * Moduł odpowiedzialny za obsługę organizera podróży
 */
const PlannerHandler = (() => {
    // Przechowuje dane planera
    let plannerData = {
        days: [], // Dynamiczna tablica dni
        sectionAssignments: {},
        subsectionAssignments: {},
        selectedDay: null,
        numberOfDays: 7 // Domyślna liczba dni
    };

    /**
     * Inicjalizuje liczbę dni w kalendarzu
     */
    const initDayCount = () => {
        const dayCountInput = document.getElementById('day-count-input');
        if(dayCountInput) {
            dayCountInput.value = plannerData.numberOfDays; // Ustawienie wartości początkowej
        }
        plannerData.days = Array.from({ length: plannerData.numberOfDays }, (_, i) => i + 1);
    };
    
    /**
     * Aktualizuje liczbę dni w kalendarzu
     * @param {number} dayCount - Nowa liczba dni
     */
    const updateDayCount = (dayCount) => {
        plannerData.numberOfDays = dayCount;
        plannerData.days = Array.from({ length: dayCount }, (_, i) => i + 1);
        plannerData.selectedDay = plannerData.days[0] || null; // Reset do pierwszego dnia lub null, jeśli brak dni
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
        if (!calendarContainer) return;
        calendarContainer.innerHTML = '';
    
        // Nagłówek kalendarza
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.innerHTML = '<h4>Wybierz dzień i przypisz atrakcje</h4>';
        calendarContainer.appendChild(header);
    
        // Dodanie inputu do zmiany liczby dni
        const dayCountContainer = document.createElement('div');
        dayCountContainer.className = 'day-count-container';
        const dayCountLabel = document.createElement('label');
        dayCountLabel.textContent = 'Liczba dni:';
        dayCountLabel.setAttribute('for', 'day-count-input');
        dayCountContainer.appendChild(dayCountLabel);
    
        const dayCountInput = document.createElement('input');
        dayCountInput.type = 'number';
        dayCountInput.id = 'day-count-input';
        dayCountInput.min = 1;
        dayCountInput.max = 31;
        dayCountInput.value = plannerData.numberOfDays;
        dayCountInput.addEventListener('change', (e) => {
            const newDayCount = parseInt(e.target.value, 10);
            if (newDayCount > 0 && newDayCount <= 31) {
                updateDayCount(newDayCount);
                initGeneralCalendar(data); // Ponowna inicjalizacja kalendarza
                updateDetailedDayPlan(data); // Aktualizacja planu szczegółowego
            } else {
                alert('Liczba dni musi być w zakresie od 1 do 31.');
                dayCountInput.value = plannerData.numberOfDays; // Przywrócenie poprzedniej wartości
            }
        });
        dayCountContainer.appendChild(dayCountInput);
        calendarContainer.appendChild(dayCountContainer);
    
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
        assignedSectionsTitle.textContent = `Atrakcje na dzień ${plannerData.selectedDay ? plannerData.selectedDay : '...'}`;
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
                    } else {
                        // Jeśli element już istnieje, usuń go
                        const index = plannerData.sectionAssignments[plannerData.selectedDay].indexOf(sectionId);
                        if (index !== -1) {
                            plannerData.sectionAssignments[plannerData.selectedDay].splice(index, 1);
                            evt.item.remove(); // Usuń element z DOM
                            return; // Przerwij dodawanie
                        }
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
         if (!assignedSections) return;
        assignedSections.innerHTML = '';
        
        const assignedSectionsTitle = document.getElementById('assigned-sections-title');
         if(assignedSectionsTitle) {
            assignedSectionsTitle.textContent = `Atrakcje na dzień ${plannerData.selectedDay ? plannerData.selectedDay : '...'}`;
         }
        
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
        if (!detailedDayPlan) return;
        detailedDayPlan.innerHTML = '';
    
        // Nagłówek planu szczegółowego
        const header = document.createElement('div');
        header.className = 'day-plan-header';
        header.innerHTML = `<h4>Szczegółowy plan na dzień ${plannerData.selectedDay ? plannerData.selectedDay : '...'}</h4>`;
        detailedDayPlan.appendChild(header);
    
        // Sprawdzenie, czy wybrano dzień
        if (!plannerData.selectedDay) {
            const noDaySelected = document.createElement('div');
            noDaySelected.className = 'empty-plan';
            noDaySelected.textContent = 'Wybierz dzień z kalendarza, aby zobaczyć szczegółowy plan.';
            detailedDayPlan.appendChild(noDaySelected);
            return;
        }
    
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
                            } else {
                                // Jeśli element już istnieje, usuń go
                                const index = plannerData.subsectionAssignments[dayKey].indexOf(subsectionId);
                                if (index !== -1) {
                                    plannerData.subsectionAssignments[dayKey].splice(index, 1);
                                    evt.item.remove(); // Usuń element z DOM
                                    return; // Przerwij dodawanie
                                }
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
     * Zapisuje plan do pliku JSON
     */
    const savePlanToFile = () => {
        const filename = 'travel_plan.json';
        const jsonStr = JSON.stringify(plannerData);
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr));
        element.setAttribute('download', filename);
    
        element.style.display = 'none';
        document.body.appendChild(element);
    
        element.click();
    
        document.body.removeChild(element);
    };
    
    /**
     * Wczytuje plan z pliku JSON
     */
    const loadPlanFromFile = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
    
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) {
                alert('Nie wybrano pliku.');
                return;
            }
    
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const loadedData = JSON.parse(e.target.result);
                    plannerData = loadedData;
    
                    // Wywołanie funkcji odświeżających interfejs
                    const tripData = document.tripData; // Pobierz dane wycieczki
                    if (tripData) {
                        initGeneralCalendar(tripData);
                        updateDetailedDayPlan(tripData);
                    }
                    alert('Plan wczytano pomyślnie!');
    
                } catch (error) {
                    console.error('Błąd podczas parsowania pliku JSON:', error);
                    alert('Błąd podczas wczytywania pliku.');
                }
            };
    
            reader.readAsText(file);
        });
    
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    };

    /**
     * Generuje i eksportuje plan podróży do PDF
     * @param {Object} data - Dane wycieczki
     */
    const exportPlanToPdf = (data) => {
        if (!plannerData.selectedDay) {
            alert('Wybierz dzień z kalendarza, aby wyeksportować plan.');
            return;
        }
    
        if (!plannerData.sectionAssignments[plannerData.selectedDay] ||
            plannerData.sectionAssignments[plannerData.selectedDay].length === 0) {
            alert('Brak zaplanowanych atrakcji na ten dzień.');
            return;
        }
    
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        let yOffset = 20;
        const xOffset = 10;
    
        pdf.setFontSize(24);
        pdf.text(`Plan podróży - Dzień ${plannerData.selectedDay}`, xOffset, yOffset);
        yOffset += 15;
    
        plannerData.sectionAssignments[plannerData.selectedDay].forEach(sectionId => {
            const sectionIdClean = sectionId.replace('section-', '');
            const section = data.sections.find(s => s.id === sectionIdClean);
    
            if (section) {
                pdf.setFontSize(18);
                pdf.text(section.title, xOffset, yOffset);
                yOffset += 10;
    
                pdf.setFontSize(12);
                const description = pdf.splitTextToSize(section.description, 180); // 180 to max szerokość tekstu
                description.forEach(line => {
                    pdf.text(line, xOffset, yOffset);
                    yOffset += 5;
                });
    
                yOffset += 5; // Dodatkowa przestrzeń po opisie
    
                // Dodawanie zdjęć sekcji
                if (section.images && section.images.length > 0) {
                    section.images.forEach(imageName => {
                        // Zakładamy, że wszystkie zdjęcia są w folderze 'img'
                        const imagePath = `img/${imageName}`;
    
                        // Dodanie obrazu do PDF
                        try {
                            const img = new Image();
                            img.src = imagePath;
    
                            img.onload = () => {
                                // Użyj wymiarów obrazu, ale ogranicz wysokość
                                let imgWidth = 70; // Szerokość obrazu
                                let imgHeight = (img.height / img.width) * imgWidth; // Wysokość proporcjonalna do szerokości
    
                                // Jeśli obraz przekracza dostępną przestrzeń, zmniejsz go
                                if (yOffset + imgHeight > pdf.internal.pageSize.getHeight() - 10) {
                                    imgHeight = pdf.internal.pageSize.getHeight() - yOffset - 10; // Dostosuj wysokość
                                    imgWidth = (img.width / img.height) * imgHeight; // Dostosuj szerokość proporcjonalnie
                                }
    
                                pdf.addImage(img.src, 'JPEG', xOffset, yOffset, imgWidth, imgHeight);
                                yOffset += imgHeight + 5;
    
                                // Sprawdź, czy jest miejsce na więcej treści na stronie
                                if (yOffset > pdf.internal.pageSize.getHeight() - 20) {
                                    pdf.addPage();
                                    yOffset = 20;
                                }
                            };
    
                            img.onerror = (error) => {
                                console.error(`Błąd podczas ładowania obrazu: ${imagePath}`, error);
                                pdf.text(`Błąd ładowania obrazu: ${imageName}`, xOffset, yOffset);
                                yOffset += 10;
                            };
    
                            img.crossOrigin = "anonymous";
                        } catch (error) {
                            console.error(`Błąd podczas dodawania obrazu: ${imageName}`, error);
                            pdf.text(`Błąd dodawania obrazu: ${imageName}`, xOffset, yOffset);
                            yOffset += 10;
                        }
    
                    });
                }
    
    
                // Dodawanie podsekcji (jeśli istnieją)
                const dayKey = `${plannerData.selectedDay}-${sectionId}`;
                if (plannerData.subsectionAssignments[dayKey]) {
                    plannerData.subsectionAssignments[dayKey].forEach(subsectionId => {
                        const subsectionIdClean = subsectionId.replace('subsection-', '');
                        const subsection = section.subsections.find(s => s.id === subsectionIdClean);
    
                        if (subsection) {
                            pdf.setFontSize(14);
                            pdf.text(`- ${subsection.title}`, xOffset, yOffset);
                            yOffset += 8;
    
                            pdf.setFontSize(10);
                            const subDescription = pdf.splitTextToSize(subsection.description, 170); // 170 to max szerokość tekstu
                            subDescription.forEach(line => {
                                pdf.text(line, xOffset + 5, yOffset);
                                yOffset += 5;
                            });
                            yOffset += 5; // Dodatkowa przestrzeń po opisie
                        }
                    });
                }
    
                // Dodaj nową stronę, jeśli brakuje miejsca na kolejną sekcję
                if (yOffset > pdf.internal.pageSize.getHeight() - 50) {
                    pdf.addPage();
                    yOffset = 20;
                }
            }
        });
    
        pdf.save(`plan_podrozy_dzien_${plannerData.selectedDay}.pdf`);
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
                days: [],
                sectionAssignments: {},
                subsectionAssignments: {},
                selectedDay: null,
                numberOfDays: 7
            };
    
            // Ustawienie danych wycieczki w obiekcie document
            document.tripData = data;
    
            initDayCount(); // Inicjalizacja liczby dni
            updateDayCount(plannerData.numberOfDays); // Aktualizacja liczby dni
            initGeneralCalendar(data);
            updateDetailedDayPlan(data);
        });
    
        // Dodanie obsługi przycisków zapisu i wczytywania
        const savePlanButton = document.getElementById('save-plan-button');
        if(savePlanButton) {
            savePlanButton.addEventListener('click', savePlanToFile);
        }
        
        const loadPlanButton = document.getElementById('load-plan-button');
        if(loadPlanButton) {
            loadPlanButton.addEventListener('click', loadPlanFromFile);
        }
        
        const exportPdfButton = document.getElementById('export-pdf-button');
        if(exportPdfButton) {
            exportPdfButton.addEventListener('click', () => {
                const tripData = document.tripData; // Pobierz dane wycieczki
                if (tripData) {
                    exportPlanToPdf(tripData);
                } else {
                    alert('Dane wycieczki nie zostały jeszcze załadowane.');
                }
            });
        }
    };
    
    return {
        init
    };
})();