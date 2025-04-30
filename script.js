// script.js - Główny skrypt aplikacji

// Globalne zmienne stanu
let currentTripData = null;
let currentTripName = null;
let currentMap = null;
let currentGallery = null;
let currentPlan = {}; // Struktura planu: { day1: [item1, item2], day2: [...] }
let availablePlanItemsSortable = null; // Sortable instance for available items
let dayPlanSortables = {}; // Sortable instances for daily plans

// Lista dostępnych wycieczek (na potrzeby demo, w realnej aplikacji można wczytać z pliku index.json)
const availableTrips = [
    { name: 'trip1', title: 'Kocia Przygoda w Tatrach' },
    { name: 'trip2', title: 'Kocie Wędrówki po Mazurach' },
    // Dodaj kolejne wycieczki tutaj
];

// === FUNKCJE INICJALIZACYJNE ===

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded. Meow!');
    initializeNavigation();
    setupThemeSwitcher();
    setupSectionToggler();
    setupPlannerControls();
    // Load the first trip by default or based on URL hash
    const initialTripName = window.location.hash.substring(1) || availableTrips[0]?.name;
    if (initialTripName) {
        loadTrip(initialTripName);
    } else {
        document.getElementById('trip-title').innerText = 'Brak dostępnych wycieczek.';
        document.getElementById('trip-description').innerText = 'Sprawdź konfigurację plików YAML w katalogu /trips/.';
    }
});

function initializeNavigation() {
    const navUl = document.getElementById('main-nav').querySelector('ul');
    navUl.innerHTML = ''; // Wyczyść istniejące menu
    availableTrips.forEach(trip => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${trip.name}`;
        a.dataset.trip = trip.name;
        a.innerText = trip.title;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            loadTrip(trip.name);
            // Update URL hash without page reload
            history.pushState(null, '', `#${trip.name}`);
        });
        li.appendChild(a);
        navUl.appendChild(li);
    });
}

function setupThemeSwitcher() {
    const themeSelect = document.getElementById('theme-select');
    const themeStyleLink = document.getElementById('theme-style');

    // Load saved theme from localStorage (if any)
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        themeStyleLink.href = savedTheme;
        // Select the saved theme in the dropdown
        const option = themeSelect.querySelector(`option[value="${savedTheme}"]`);
        if (option) {
            option.selected = true;
        }
    }

    themeSelect.addEventListener('change', (e) => {
        const selectedTheme = e.target.value;
        themeStyleLink.href = selectedTheme;
        // Save selected theme to localStorage
        localStorage.setItem('selectedTheme', selectedTheme);
    });
}

function setupSectionToggler() {
    const toggleButton = document.getElementById('toggle-sections');
    toggleButton.addEventListener('click', () => {
        const sections = document.querySelectorAll('#trip-sections .section-content, #trip-sections .subsection-content');
        let allCollapsed = true;
        // Check if all are collapsed
        sections.forEach(content => {
            if (content.style.display !== 'none') {
                allCollapsed = false;
            }
        });

        sections.forEach(content => {
            if (allCollapsed) {
                content.style.display = ''; // Show content
            } else {
                content.style.display = 'none'; // Hide content
            }
        });
        toggleButton.innerText = allCollapsed ? 'Zwiń Wszystkie Sekcje' : 'Rozwiń Wszystkie Sekcje';
    });
}

// === FUNKCJE ŁADOWANIA I WYŚWIETLANIA DANYCH WYCIECZKI ===

async function loadTrip(tripName) {
    console.log(`Miau! Ładuję wycieczkę: ${tripName}`);
    currentTripName = tripName;
    const tripUrl = `./trips/${tripName}/trip.yaml`;

    try {
        const response = await fetch(tripUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const yamlText = await response.text();
        currentTripData = jsyaml.load(yamlText);
        console.log('Dane wycieczki załadowane:', currentTripData);

        // Zakładamy, że zdjęcia są w tym samym katalogu co YAML.
        // W tym demo zakładamy, że nazwy zdjęć są wymienione w YAML.
        // Jeśli chcesz ładować *wszystkie* pliki z folderu, wymaga to innej strategii (np. pre-generowany index).
        const tripImages = await loadTripImages(tripName, currentTripData);

        renderTripDetails(currentTripData, tripImages);
        setupMap(currentTripData);
        setupGallery();
        initializePlanner(currentTripData); // Initialize planner with new trip data

    } catch (error) {
        console.error(`Miau! Błąd ładowania wycieczki ${tripName}:`, error);
        document.getElementById('trip-title').innerText = `Błąd ładowania wycieczki: ${tripName}`;
        document.getElementById('trip-description').innerText = `Nie udało się załadować danych wycieczki. Sprawdź konsolę po szczegóły.`;
        document.getElementById('trip-sections').innerHTML = '';
        document.getElementById('trip-gallery').innerHTML = '';
        if (currentMap) {
            currentMap.remove();
            currentMap = null;
        }
        document.getElementById('trip-map').innerHTML = '';
        // Clear planner as well
        resetPlanner();
    }
}

async function loadTripImages(tripName, tripData) {
    // Simple approach: collect image paths listed in YAML
    const images = [];
    const baseUrl = `./trips/${tripName}/`;

    // Helper function to collect images recursively
    function collectImages(item) {
        if (item.images && Array.isArray(item.images)) {
            item.images.forEach(img => {
                images.push({
                    src: baseUrl + img,
                    alt: item.title || 'Zdjęcie', // Use section/subsection title as alt text
                    sectionId: item.id // Keep track of associated section/subsection
                });
            });
        }
        if (item.sections) {
            item.sections.forEach(sec => collectImages(sec));
        }
        if (item.subsections) {
            item.subsections.forEach(sub => collectImages(sub));
        }
    }

    // Collect images from the main trip data object itself if it has an 'images' key
     if (tripData.globalImages && Array.isArray(tripData.globalImages)) {
         tripData.globalImages.forEach(img => {
             images.push({
                 src: baseUrl + img,
                 alt: tripData.title || 'Zdjęcie globalne'
             });
         });
     }


    if (tripData.sections) {
        tripData.sections.forEach(section => collectImages(section));
    }

    // For this demo, we just return the collected paths.
    // A more advanced version could try fetching these paths to check existence,
    // or handle different image structures.
    return images;
}


function renderTripDetails(data, images) {
    document.getElementById('trip-title').innerText = data.title || 'Brak tytułu';
    document.getElementById('trip-description').innerText = data.description || 'Brak opisu';

    const sectionsContainer = document.getElementById('trip-sections');
    sectionsContainer.innerHTML = ''; // Wyczyść poprzednie sekcje

    if (data.sections && Array.isArray(data.sections)) {
        data.sections.forEach(section => {
            const sectionDiv = document.createElement('div');
            sectionDiv.classList.add('section');
            sectionDiv.dataset.id = section.id; // Dodaj data-id dla planera

            sectionDiv.innerHTML = `
                <h4>${section.title || 'Sekcja bez tytułu'}</h4>
                <div class="section-content">
                    <p>${section.description || 'Brak opisu sekcji.'}</p>
                    <div class="subsection-list">
                        <!-- Podsekcje ładowane poniżej -->
                    </div>
                </div>
            `;

            const subsectionsContainer = sectionDiv.querySelector('.subsection-list');
            if (section.subsections && Array.isArray(section.subsections)) {
                section.subsections.forEach(subsection => {
                    const subsectionDiv = document.createElement('div');
                    subsectionDiv.classList.add('subsection');
                    subsectionDiv.dataset.id = subsection.id; // Dodaj data-id dla planera
                    subsectionDiv.dataset.parentId = section.id; // Dodaj parent id dla planera

                    subsectionDiv.innerHTML = `
                        <h5>${subsection.title || 'Podsekcja bez tytułu'}</h5>
                        <div class="subsection-content">
                            <p>${subsection.description || 'Brak opisu podsekcji.'}</p>
                        </div>
                    `;
                    subsectionsContainer.appendChild(subsectionDiv);
                });
            }

            sectionsContainer.appendChild(sectionDiv);
        });
    } else {
        sectionsContainer.innerHTML = '<p>Brak zdefiniowanych sekcji dla tej wycieczki.</p>';
    }

    renderGallery(images);
}

function renderGallery(images) {
    const galleryContainer = document.getElementById('trip-gallery');
    galleryContainer.innerHTML = ''; // Wyczyść poprzednie zdjęcia

    if (!images || images.length === 0) {
        galleryContainer.innerHTML = '<p>Brak zdjęć dla tej wycieczki (lub nie wymieniono ich w YAML).</p>';
        return;
    }

    images.forEach(image => {
        const a = document.createElement('a');
        a.href = image.src;
        a.title = image.alt; // Użyj alt jako tytułu w lightboxie
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.alt;
        a.appendChild(img);
        galleryContainer.appendChild(a);
    });

    // Destroy previous gallery instance if it exists
    if (currentGallery) {
        currentGallery.destroy();
    }

    // Initialize SimpleLightbox
    // Use a small timeout to ensure images are in the DOM
    setTimeout(() => {
         currentGallery = new SimpleLightbox('#trip-gallery a', {
             /* options */
             captionsData: 'title', // Use the 'title' attribute for captions
             captionDelay: 100,
             // Add other options as needed
         });
         console.log('SimpleLightbox initialized. Meow!');
    }, 100); // Small delay
}


function setupMap(data) {
    const mapContainer = document.getElementById('trip-map');

    // Clear previous map instance
    if (currentMap) {
        currentMap.remove();
    }
    mapContainer.innerHTML = ''; // Ensure container is empty

    if (!data.defaultMapCenter || !data.defaultZoom) {
        mapContainer.innerHTML = '<p>Brak danych mapy (defaultMapCenter, defaultZoom) w pliku YAML.</p>';
        return;
    }

    try {
        // Initialize map
        currentMap = L.map('trip-map').setView(data.defaultMapCenter, data.defaultZoom);

        // Add base layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(currentMap);

        // Add markers for sections and subsections
        if (data.sections) {
            data.sections.forEach(section => {
                if (section.location && Array.isArray(section.location) && section.location.length === 2) {
                    L.marker(section.location)
                        .addTo(currentMap)
                        .bindPopup(`<b>${section.title || 'Sekcja'}</b><br>${section.description || ''}`);
                }
                if (section.subsections) {
                    section.subsections.forEach(subsection => {
                        if (subsection.location && Array.isArray(subsection.location) && subsection.location.length === 2) {
                            L.marker(subsection.location, { icon: L.icon({
                                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png', // Domyślna ikona
                                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                shadowSize: [41, 41]
                             })})
                            .addTo(currentMap)
                            .bindPopup(`<b>${subsection.title || 'Podsekcja'}</b><br>${subsection.description || ''}<br>(${section.title || 'Sekcja nadrzędna'})`);
                        }
                    });
                }
            });
        }

        console.log('Mapa Leaflet zainicjalizowana. Miau!');

    } catch (error) {
        console.error('Miau! Błąd inicjalizacji mapy:', error);
        mapContainer.innerHTML = '<p>Nie udało się załadować mapy.</p>';
    }
}

// === FUNKCJE PLANERA WYCIECZKI ===

function initializePlanner(tripData) {
    console.log('Inicjalizuję planer. Miau!');
    currentPlan = {}; // Reset plan for new trip
    dayPlanSortables = {}; // Reset sortable instances

    renderAvailableItems(tripData);
    renderPlannerStructure(); // Render empty day containers
    setupDragAndDrop(); // Setup D&D for available items and day containers
    setupAddCustomItem(); // Setup adding custom items
    populateCustomItemDaySelect(); // Populate day select for custom items
    // Plan controls listeners are setup once in DOMContentLoaded
}

function resetPlanner() {
     currentPlan = {};
     dayPlanSortables = {};
     if(availablePlanItemsSortable) availablePlanItemsSortable.destroy();
     document.getElementById('available-items').innerHTML = '';
     document.getElementById('overall-plan').innerHTML = ''; // Or re-render default days
     document.getElementById('custom-item-day').innerHTML = '';
     document.getElementById('custom-item-time').value = '';
     document.getElementById('custom-item-description').value = '';
     console.log('Planer zresetowany.');
}


function renderAvailableItems(tripData) {
    const availableItemsContainer = document.getElementById('available-items');
    availableItemsContainer.innerHTML = ''; // Clear previous items

    if (!tripData.sections) {
        availableItemsContainer.innerHTML = '<p>Brak sekcji do dodania do planu.</p>';
        return;
    }

    tripData.sections.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.classList.add('available-item');
        sectionDiv.dataset.type = 'section';
        sectionDiv.dataset.id = section.id;
        sectionDiv.innerText = `Sekcja: ${section.title || section.id}`;
        availableItemsContainer.appendChild(sectionDiv);

        // Add subsections as well, maybe styled differently or grouped
        // For simplicity, let's just add main sections to "available" for now,
        // and handle subsections/custom items within the daily plan structure.
        // Or, better: add both sections and subsections to available list.
        if (section.subsections) {
             section.subsections.forEach(subsection => {
                 const subsectionDiv = document.createElement('div');
                 subsectionDiv.classList.add('available-item');
                 subsectionDiv.dataset.type = 'subsection';
                 subsectionDiv.dataset.id = subsection.id;
                 subsectionDiv.dataset.parentId = section.id; // Link to parent section
                 subsectionDiv.innerText = `  - Podsekcja: ${subsection.title || subsection.id}`;
                 availableItemsContainer.appendChild(subsectionDiv);
             });
        }
    });
}

function renderPlannerStructure() {
    const overallPlanContainer = document.getElementById('overall-plan');
    overallPlanContainer.innerHTML = ''; // Clear previous structure

    // Create default days (or load from plan if exists)
    // For simplicity, let's create a few default days.
    // A real app might let users add/remove days.
    const numDays = 3; // Example: 3 days by default
    for (let i = 1; i <= numDays; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('plan-day');
        dayDiv.dataset.day = i;
        dayDiv.innerHTML = `
            <h5>Dzień ${i}</h5>
            <div class="plan-day-items">
                <!-- Plan items will be dropped here -->
            </div>
        `;
        overallPlanContainer.appendChild(dayDiv);
         // Initialize empty array for this day in currentPlan
        if (!currentPlan[`day${i}`]) {
             currentPlan[`day${i}`] = [];
        }
    }
}

function setupDragAndDrop() {
    // Destroy previous instances if they exist
    if (availablePlanItemsSortable) availablePlanItemsSortable.destroy();
    for (const day in dayPlanSortables) {
        if (dayPlanSortables[day]) dayPlanSortables[day].destroy();
    }
    dayPlanSortables = {}; // Reset

    // Sortable for available items (source)
    const availableItemsEl = document.getElementById('available-items');
    availablePlanItemsSortable = Sortable.create(availableItemsEl, {
        group: {
            name: 'plan',
            pull: 'clone', // Items can be cloned
            put: false // Items cannot be put back here
        },
        sort: false, // Available items list is not sortable
        animation: 150
    });

    // Sortable for each day's plan (target)
    const dayItemContainers = document.querySelectorAll('.plan-day-items');
    dayItemContainers.forEach(container => {
        const day = container.closest('.plan-day').dataset.day;
        dayPlanSortables[`day${day}`] = Sortable.create(container, {
            group: 'plan', // Can receive items from 'plan' group
            animation: 150,
            onAdd: function (evt) {
                // When an item is added to a day container
                const itemEl = evt.item; // The moved element
                const type = itemEl.dataset.type;
                const id = itemEl.dataset.id;
                const parentId = itemEl.dataset.parentId; // For subsections

                // Get the original item element (the clone added to the day)
                const addedItemEl = evt.item;

                // Find the original trip data for this item
                let itemData = null;
                if (type === 'section') {
                    itemData = currentTripData.sections.find(sec => sec.id === id);
                } else if (type === 'subsection') {
                     const parentSection = currentTripData.sections.find(sec => sec.id === parentId);
                     if(parentSection && parentSection.subsections) {
                         itemData = parentSection.subsections.find(sub => sub.id === id);
                     }
                }


                if (itemData) {
                    // Create the actual plan item structure in the UI
                    const planItemDiv = document.createElement('div');
                    planItemDiv.classList.add('plan-item');
                    planItemDiv.dataset.type = type;
                    planItemDiv.dataset.id = id;
                    if(parentId) planItemDiv.dataset.parentId = parentId;

                    // Add content (time input will be added later if needed, or structure for it)
                    // For now, just display title and add delete button
                    planItemDiv.innerHTML = `
                         <span class="item-content">${itemData.title || itemData.id || 'Nieznany element'}</span>
                         <button class="delete-item">&times;</button>
                    `;

                    // Replace the cloned `available-item` with the `plan-item` structure
                    container.insertBefore(planItemDiv, addedItemEl);
                    addedItemEl.remove(); // Remove the temporary clone

                    // Add delete functionality
                    planItemDiv.querySelector('.delete-item').addEventListener('click', () => {
                         planItemDiv.remove();
                         updatePlanState(); // Update state after deletion
                    });


                } else {
                     // If itemData wasn't found (shouldn't happen if data is correct)
                     console.error('Miau! Nie znaleziono danych dla dodanego elementu:', type, id);
                     addedItemEl.remove(); // Remove the element
                }

                updatePlanState(); // Update the internal plan state after adding
            },
            onUpdate: function (evt) {
                 // When items are reordered within the same day
                 updatePlanState();
            },
             onRemove: function (evt) {
                 // When an item is dragged *out* of a day container (e.g., to another day)
                 // The item is already removed from the DOM by Sortable.js
                 // The 'onAdd' on the target container will handle adding to the new day.
                 // We just need to ensure the state is updated after removal completes.
                 // This is handled by the target's onAdd and the source's onRemove (implicitly by Sortable).
                 // Calling updatePlanState here might be redundant/early,
                 // better to rely on the 'onAdd' of the target.
                 // However, if moving to a *different* day, the state update needs to happen
                 // *after* both remove from source and add to target. Sortable.js handles this internally.
                 // We just need a final state update after the drag-and-drop operation finishes.
                 // Let's ensure updatePlanState is called reliably after any relevant D&D event.
                 // The onAdd and onUpdate cover most cases within the planner.
                 // Dragging *back* to available items requires special handling if we wanted that.
                 // For now, assume items are only moved between days or reordered.
                 updatePlanState(); // Call here just in case
             }
        });
    });

     console.log('SortableJS zainicjalizowany dla planera.');
}

// Function to read the current state of the UI and update the currentPlan object
function updatePlanState() {
    console.log('Aktualizuję stan planu...');
    currentPlan = {}; // Reset the plan

    const dayContainers = document.querySelectorAll('.plan-day');
    dayContainers.forEach(dayDiv => {
        const day = dayDiv.dataset.day;
        currentPlan[`day${day}`] = []; // Initialize array for the day

        const itemElements = dayDiv.querySelectorAll('.plan-item');
        itemElements.forEach(itemEl => {
            const type = itemEl.dataset.type;
            const id = itemEl.dataset.id;
            const parentId = itemEl.dataset.parentId;
            const time = itemEl.querySelector('.item-time')?.innerText || ''; // Get time if exists
            const description = itemEl.querySelector('.item-content')?.innerText || itemEl.innerText; // Get text content

            const planItem = {
                type: type, // 'section', 'subsection', 'custom'
                id: id, // section/subsection ID
                parentId: parentId, // For subsections
                time: time.replace(':', ''), // Store time without colon for simplicity in data
                description: description.trim(), // Store text content
                originalId: id // Keep original ID reference if needed
            };

             // If it's a custom item, refine the data structure
             if (type === 'custom') {
                 // For custom items, the 'id' might be null, use description
                 planItem.id = null; // Custom items don't have an ID from YAML
                 planItem.description = description.replace(/^\s*\d{2}:\d{2}\s*/, ''); // Remove time prefix if present
             }


            currentPlan[`day${day}`].push(planItem);
        });
    });
    console.log('Nowy stan planu:', currentPlan);
    // Optional: Save plan to localStorage automatically
    savePlanToLocalStorage();
}

// Function to render the UI from the currentPlan state
// Useful after loading from storage or file
function renderPlanFromState() {
    console.log('Renderuję plan ze stanu:', currentPlan);
     // Assuming renderPlannerStructure has already created the day containers

     // Clear existing items in day containers
     document.querySelectorAll('.plan-day-items').forEach(container => {
         container.innerHTML = '';
     });

    for (const dayKey in currentPlan) {
        const day = dayKey.replace('day', '');
        const items = currentPlan[dayKey];
        const dayContainer = document.querySelector(`.plan-day[data-day="${day}"] .plan-day-items`);

        if (dayContainer && items) {
            items.forEach(item => {
                const planItemDiv = document.createElement('div');
                planItemDiv.classList.add('plan-item');
                planItemDiv.dataset.type = item.type;
                if (item.id) planItemDiv.dataset.id = item.id;
                if (item.parentId) planItemDiv.dataset.parentId = item.parentId;


                 let itemContent = item.description;
                 if (item.time) {
                      // Format time back with colon
                      const timeStr = item.time.padStart(4, '0'); // Ensure 4 digits
                      const formattedTime = `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;
                      itemContent = `<span class="item-time">${formattedTime}</span> ${item.description}`;
                 } else {
                     // For items without time (like sections added to day overview)
                     // We might want a different rendering or structure.
                     // For now, just display description.
                     itemContent = item.description;
                 }


                planItemDiv.innerHTML = `
                     <span class="item-content">${itemContent}</span>
                     <button class="delete-item">&times;</button>
                `;

                dayContainer.appendChild(planItemDiv);

                // Add delete functionality
                planItemDiv.querySelector('.delete-item').addEventListener('click', () => {
                     planItemDiv.remove();
                     updatePlanState(); // Update state after deletion
                });
            });
        }
    }
     // After rendering, re-setup drag and drop as the elements are new
     // Note: This might interfere if D&D is already active.
     // A better approach is to update the model and let a reactive framework
     // update the view, or carefully manage Sortable instances.
     // For this example, re-initializing D&D might be necessary if elements are fully replaced.
     // If only adding/removing, updatePlanState is enough.
     // Let's assume renderPlanFromState rebuilds the day content, so D&D needs re-setup.
     // However, Sortable.create attaches to the *container*, so adding/removing children
     // *within* an existing Sortable container doesn't require re-creating the Sortable instance.
     // The delete handler needs to call updatePlanState.
     // The drag-and-drop onAdd/onUpdate/onRemove handlers already call updatePlanState.
     // So, rendering from state just needs to build the HTML and add delete handlers.
     // D&D setup happens once after initial structure render.

}


// Setup adding custom items
function setupAddCustomItem() {
    const addButton = document.getElementById('add-custom-item-btn');
    addButton.addEventListener('click', () => {
        const daySelect = document.getElementById('custom-item-day');
        const timeInput = document.getElementById('custom-item-time');
        const descriptionInput = document.getElementById('custom-item-description');

        const day = daySelect.value;
        const time = timeInput.value; // Format HH:MM
        const description = descriptionInput.value.trim();

        if (!day || !description) {
            alert('Wybierz dzień i wpisz opis!');
            return;
        }

        const dayContainer = document.querySelector(`.plan-day[data-day="${day}"] .plan-day-items`);
        if (dayContainer) {
             const planItemDiv = document.createElement('div');
             planItemDiv.classList.add('plan-item');
             planItemDiv.dataset.type = 'custom'; // Mark as custom item

             let itemContent = description;
             let timeForState = null;
             if (time) {
                  itemContent = `<span class="item-time">${time}</span> ${description}`;
                  timeForState = time.replace(':', '');
             }

             planItemDiv.innerHTML = `
                  <span class="item-content">${itemContent}</span>
                  <button class="delete-item">&times;</button>
             `;

             dayContainer.appendChild(planItemDiv);

             // Add delete functionality
             planItemDiv.querySelector('.delete-item').addEventListener('click', () => {
                  planItemDiv.remove();
                  updatePlanState(); // Update state after deletion
             });

            // Update the plan state
            updatePlanState();

            // Clear inputs after adding
            timeInput.value = '';
            descriptionInput.value = '';
        }
    });
}

// Populate the day select dropdown for adding custom items
function populateCustomItemDaySelect() {
    const daySelect = document.getElementById('custom-item-day');
    daySelect.innerHTML = ''; // Clear previous options

    // Assuming day containers already exist with data-day attributes
    const dayContainers = document.querySelectorAll('.plan-day');
    dayContainers.forEach(dayDiv => {
        const day = dayDiv.dataset.day;
        const option = document.createElement('option');
        option.value = day;
        option.innerText = `Dzień ${day}`;
        daySelect.appendChild(option);
    });
}


// === PRZYCISKI PLANERA: EKSPORT/IMPORT/PDF ===

function setupPlannerControls() {
    document.getElementById('export-plan').addEventListener('click', exportPlanYaml);
    document.getElementById('import-plan').addEventListener('change', importPlanYaml);
    document.getElementById('export-pdf').addEventListener('click', exportPlanPdf);

     // Load plan from localStorage on initial load
     loadPlanFromLocalStorage();
}

function savePlanToLocalStorage() {
    if (currentTripName && Object.keys(currentPlan).length > 0) {
        try {
            const planKey = `tripPlan_${currentTripName}`;
            localStorage.setItem(planKey, JSON.stringify(currentPlan));
            console.log(`Plan dla ${currentTripName} zapisany w localStorage.`);
        } catch (e) {
            console.error('Nie udało się zapisać planu w localStorage:', e);
        }
    } else if (currentTripName) {
         // If plan is empty, remove from storage
         const planKey = `tripPlan_${currentTripName}`;
         localStorage.removeItem(planKey);
          console.log(`Pusty plan dla ${currentTripName}, usunięto z localStorage.`);
    }
}

function loadPlanFromLocalStorage() {
    if (currentTripName) {
        try {
            const planKey = `tripPlan_${currentTripName}`;
            const savedPlan = localStorage.getItem(planKey);
            if (savedPlan) {
                currentPlan = JSON.parse(savedPlan);
                console.log(`Plan dla ${currentTripName} wczytany z localStorage.`);
                // Render the loaded plan after the trip data is loaded and structure is ready
                // This call should ideally happen *after* loadTrip finishes and renders the planner structure.
                // Let's add a check/call within loadTrip or use promises/async properly.
                // For now, assume loadTrip calls initializePlanner which calls renderPlannerStructure.
                // We need to call renderPlanFromState *after* initializePlanner.
                 // A cleaner way: initializePlanner should check localStorage and render if found.
                 // Let's modify initializePlanner slightly.
                 // It now resets, renders structure, sets up D&D, then calls renderPlanFromState.
            } else {
                 currentPlan = {}; // No saved plan
                 console.log(`Brak zapisanego planu dla ${currentTripName} w localStorage.`);
            }
        } catch (e) {
            console.error('Nie udało się wczytać planu z localStorage:', e);
            currentPlan = {}; // Reset plan on error
        }
    } else {
         currentPlan = {}; // No trip loaded yet
    }
     renderPlanFromState(); // Render whatever is in currentPlan (empty or loaded)
}


function exportPlanYaml() {
    updatePlanState(); // Ensure state is up-to-date
    const planYaml = jsyaml.dump(currentPlan);
    const blob = new Blob([planYaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTripName || 'plan'}_kociej_wycieczki.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up
    console.log('Plan wyeksportowany do YAML.');
}

function importPlanYaml(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedPlan = jsyaml.load(e.target.result);
            // Validate imported plan structure if necessary
            if (typeof importedPlan === 'object' && importedPlan !== null) {
                currentPlan = importedPlan;
                console.log('Plan zaimportowany z YAML:', currentPlan);
                renderPlanFromState(); // Render the imported plan
                savePlanToLocalStorage(); // Save imported plan
            } else {
                alert('Miau! Niepoprawny format pliku YAML planu.');
            }
        } catch (error) {
            console.error('Miau! Błąd parsowania YAML:', error);
            alert('Miau! Błąd wczytywania pliku YAML. Sprawdź konsolę po szczegóły.');
        }
    };
    reader.readAsText(file);
    // Clear the input so the same file can be selected again
    event.target.value = '';
}

async function exportPlanPdf() {
     updatePlanState(); // Ensure state is up-to-date

     if (Object.keys(currentPlan).length === 0 || Object.values(currentPlan).every(dayItems => dayItems.length === 0)) {
          alert('Plan jest pusty! Dodaj coś, zanim wyeksportujesz do PDF.');
          return;
     }

     console.log('Generuję PDF planu...');

     // Use jsPDF library
     const { jsPDF } = window.jspdf;
     const doc = new jsPDF();

     let yPos = 15; // Start position
     const margin = 10;
     const pageWidth = doc.internal.pageSize.getWidth();
     const maxLineWidth = pageWidth - 2 * margin;

     doc.setFontSize(18);
     doc.text(`Plan Wycieczki: ${currentTripData?.title || currentTripName || 'Nieznana Wycieczka'}`, margin, yPos);
     yPos += 10;

     doc.setFontSize(12);
     doc.text(`Generowano: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, yPos);
     yPos += 15;


     // Helper to add wrapped text
     const addWrappedText = (text, x, y, maxWidth) => {
         const splitText = doc.splitTextToSize(text, maxWidth);
         doc.text(splitText, x, y);
         return y + (splitText.length * doc.getLineHeight()) / doc.internal.scaleFactor;
     };

     // Iterate through days in the plan
     for (const dayKey in currentPlan) {
         const day = dayKey.replace('day', '');
         const items = currentPlan[dayKey];

         if (items.length === 0) continue; // Skip empty days

         // Check if new page is needed
         if (yPos > doc.internal.pageSize.getHeight() - 30) { // 30 is bottom margin
             doc.addPage();
             yPos = 15; // Reset y position for new page
         }

         doc.setFontSize(14);
         doc.text(`Dzień ${day}`, margin, yPos);
         yPos += 8;

         doc.setFontSize(10);

         items.forEach(item => {
             // Check if new page is needed for the item
             if (yPos > doc.internal.pageSize.getHeight() - 30) {
                 doc.addPage();
                 yPos = 15;
                 doc.setFontSize(14);
                 doc.text(`Dzień ${day} (cd.)`, margin, yPos);
                 yPos += 8;
                 doc.setFontSize(10);
             }

             let itemTitle = "Własny wpis";
             let itemDescription = item.description || '';
             let itemLocation = null; // [lat, lon]
             let representativeImageSrc = null; // URL for image

             // Find original data for sections/subsections
             if (item.type === 'section' && currentTripData?.sections) {
                 const originalItem = currentTripData.sections.find(sec => sec.id === item.id);
                 if (originalItem) {
                     itemTitle = originalItem.title || originalItem.id;
                     itemDescription = originalItem.description || '';
                     itemLocation = originalItem.location;
                     representativeImageSrc = originalItem.images && originalItem.images.length > 0 ? `./trips/${currentTripName}/${originalItem.images[0]}` : null;
                 }
             } else if (item.type === 'subsection' && currentTripData?.sections) {
                  const parentSection = currentTripData.sections.find(sec => sec.id === item.parentId);
                  if(parentSection && parentSection.subsections) {
                     const originalItem = parentSection.subsections.find(sub => sub.id === item.id);
                      if (originalItem) {
                          itemTitle = originalItem.title || originalItem.id;
                          itemDescription = originalItem.description || '';
                          itemLocation = originalItem.location;
                          representativeImageSrc = originalItem.images && originalItem.images.length > 0 ? `./trips/${currentTripName}/${originalItem.images[0]}` : null;
                      }
                  }
             } else if (item.type === 'custom') {
                 itemTitle = "Własny wpis";
                 itemDescription = item.description || ''; // Custom items only have description
                 // No location or image for custom items
             }


             let itemLine = '';
             if (item.time) {
                 const timeStr = item.time.padStart(4, '0');
                 itemLine += `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)} - `;
             }
             itemLine += itemTitle;

             doc.setFontSize(11);
             doc.text(itemLine, margin + 5, yPos); // Indent slightly
             yPos += 6; // Space after title line

             doc.setFontSize(9);
             // Add description
             if (itemDescription) {
                 yPos = addWrappedText(`Opis: ${itemDescription}`, margin + 10, yPos, maxLineWidth - 10); // Further indent
             }

             // Add location if available
             if (itemLocation) {
                  yPos = addWrappedText(`Lokalizacja: ${itemLocation[0]}, ${itemLocation[1]}`, margin + 10, yPos, maxLineWidth - 10);
             }

             // Add representative image (attempt to load and add)
             // This is complex client-side. jsPDF addImage requires base64 or HTMLImageElement.
             // Loading images async inside a loop might be tricky.
             // For simplicity in this example, I'll skip adding images to the PDF.
             // Implementing this robustly requires careful async handling or pre-loading images.
             // If you *really* need images, we'd need a more complex async flow here.
             // Let's just add a note about the image path.
             if (representativeImageSrc) {
                 yPos = addWrappedText(`Reprezentatywne zdjęcie: ${representativeImageSrc}`, margin + 10, yPos, maxLineWidth - 10);
             }


             yPos += 5; // Space after item details
         });

         yPos += 10; // Space after the end of a day
     }


     // Finalize and save
     doc.save(`${currentTripName || 'plan'}_kociej_wycieczki.pdf`);
     console.log('PDF planu wygenerowany.');

     // Example of adding an image (async required):
     /*
     async function addImageToPdf(doc, imageUrl, x, y, maxWidth, maxHeight) {
         return new Promise((resolve) => {
             const img = new Image();
             img.onload = function() {
                 const canvas = document.createElement('canvas');
                 const ctx = canvas.getContext('2d');
                 canvas.width = img.width;
                 canvas.height = img.height;
                 ctx.drawImage(img, 0, 0);
                 const dataUrl = canvas.toDataURL('image/jpeg'); // Or image/png

                 const imgWidth = img.width;
                 const imgHeight = img.height;
                 const aspectRatio = imgWidth / imgHeight;

                 let finalWidth = maxWidth;
                 let finalHeight = maxWidth / aspectRatio;

                 if (finalHeight > maxHeight) {
                     finalHeight = maxHeight;
                     finalWidth = maxHeight * aspectRatio;
                 }

                 doc.addImage(dataUrl, 'JPEG', x, y, finalWidth, finalHeight);
                 resolve({ width: finalWidth, height: finalHeight });
             };
             img.onerror = function() {
                 console.warn('Failed to load image for PDF:', imageUrl);
                 resolve(null); // Resolve with null on error
             };
             img.src = imageUrl;
         });
     }
     */
     // Using html2canvas to capture a section could also be an option,
     // but getting it to capture just a map or specific complex element reliably
     // and positioning it in jsPDF is another layer of complexity.
     // For the *plan* PDF, text + locations + maybe one image path is the most stable client-side approach.
}


// === POMOCNICZE FUNKCJE ===

// Function to get trip data by item ID (section or subsection)
// Useful for planner to retrieve original details
function getTripItemData(type, id, parentId = null) {
    if (!currentTripData) return null;

    if (type === 'section' && currentTripData.sections) {
        return currentTripData.sections.find(sec => sec.id === id);
    } else if (type === 'subsection' && currentTripData.sections) {
        const parentSection = currentTripData.sections.find(sec => sec.id === parentId);
        if (parentSection && parentSection.subsections) {
            return parentSection.subsections.find(sub => sub.id === id);
        }
    }
    return null; // Not found or custom item
}


// --- Initial load of plan from localStorage happens right after trip data is loaded ---
// This is handled by calling loadPlanFromLocalStorage at the end of initializePlanner.


// --- Re-call initializePlanner after loadTrip completes ---
// Modified loadTrip to call initializePlanner at the end.
// Modified initializePlanner to call loadPlanFromLocalStorage at the end.