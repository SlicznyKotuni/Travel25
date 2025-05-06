document.addEventListener('DOMContentLoaded', async () => {
    const tripDetails = document.getElementById('trip-details');
    const sectionsContainer = document.getElementById('sections-container');
    const tripsNav = document.getElementById('trips-nav');
    const toggleSectionsButton = document.getElementById('toggle-sections');

    let areSectionsCollapsed = false;

    // Pobierz listę wycieczek z trips/index.json
    const tripsList = await loadTripsList();

    // Funkcja do generowania linków nawigacyjnych dla wycieczek
    function generateTripLinks(trips) {
        trips.forEach(trip => {
            const link = document.createElement('a');
            link.href = `#${trip.folder}`;
            link.textContent = trip.title;
            link.className = 'cyber-button small';
            link.addEventListener('click', (event) => {
                event.preventDefault();
                loadAndDisplayTrip(trip.folder);
            });
            tripsNav.appendChild(link);
        });
    }

    // Załaduj i wyświetl wycieczkę
    async function loadAndDisplayTrip(tripFolder) {
        const tripData = await loadTrip(tripFolder);

        if (tripData) {
            // Wyświetl szczegóły wycieczki
            document.getElementById('trip-title').textContent = tripData.title;
            document.getElementById('trip-description').textContent = tripData.description;

            // Wygeneruj sekcje
            sectionsContainer.innerHTML = ''; // Wyczyść poprzednie sekcje
            tripData.sections.forEach(section => {
                const sectionElement = createSectionElement(tripFolder, section);
                sectionsContainer.appendChild(sectionElement);
            });

            // Inicjalizacja mapy
            initMap(tripData);
        }
    }

    // Funkcja do tworzenia elementu sekcji
    function createSectionElement(tripFolder, section) {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'cyber-section section'; // Dodano klasę 'section'

        const header = document.createElement('div');
        header.className = 'section-header';
        header.addEventListener('click', () => {
            content.classList.toggle('collapsed');
        });

        const title = document.createElement('h2');
        title.className = 'section-title neon-text';
        title.textContent = section.title;

        const content = document.createElement('div');
        content.className = 'section-content';

        const description = document.createElement('p');
        description.textContent = section.description;
        content.appendChild(description);

        // Galeria zdjęć
        if (section.id) {
            const gallery = createGallery(tripFolder, section.id);
            content.appendChild(gallery);
        }

        // Dodawanie podsekcji
        if (section.subsections && section.subsections.length > 0) {
            section.subsections.forEach(subsection => {
                const subsectionElement = createSubsectionElement(tripFolder, subsection);
                content.appendChild(subsectionElement);
            });
        }

        header.appendChild(title);
        sectionElement.appendChild(header);
        sectionElement.appendChild(content);

        return sectionElement;
    }

    // Funkcja do tworzenia elementu podsekcji
    function createSubsectionElement(tripFolder, subsection) {
        const subsectionElement = document.createElement('div');
        subsectionElement.className = 'subsection section'; // Dodano klasę 'section'

        const header = document.createElement('div');
        header.className = 'section-header'; // Używamy tej samej klasy co dla sekcji
        header.addEventListener('click', () => {
            content.classList.toggle('collapsed');
        });

        const title = document.createElement('h3'); // Zmieniono na h3
        title.className = 'section-title neon-pink'; // Zmieniono kolor
        title.textContent = subsection.title;

        const content = document.createElement('div');
        content.className = 'section-content';

        const description = document.createElement('p');
        description.textContent = subsection.description;
        content.appendChild(description);

         // Galeria zdjęć
         if (subsection.id) {
            const gallery = createGallery(tripFolder, subsection.id);
            content.appendChild(gallery);
        }

        header.appendChild(title);
        subsectionElement.appendChild(header);
        subsectionElement.appendChild(content);

        return subsectionElement;
    }

    // Przycisk Zwiń/Rozwiń wszystkie sekcje
    toggleSectionsButton.addEventListener('click', () => {
        areSectionsCollapsed = !areSectionsCollapsed;

        const allSections = document.querySelectorAll('.section-content');
        allSections.forEach(section => {
            section.classList.toggle('collapsed', areSectionsCollapsed);
        });
    });

    // Inicjalizacja strony z pierwszą wycieczką z listy
    if (tripsList.length > 0) {
        generateTripLinks(tripsList);
        loadAndDisplayTrip(tripsList[0].folder);
    } else {
        tripDetails.innerHTML = '<p>Brak dostępnych wycieczek.</p>';
    }
});