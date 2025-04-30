// Główny skrypt aplikacji
document.addEventListener('DOMContentLoaded', async function() {
    // Inicjalizacja aplikacji
    await loadTrips();
    setupEventListeners();
    
    // Ładowanie domyślnej wycieczki (jeśli istnieje)
    const urlParams = new URLSearchParams(window.location.search);
    const tripName = urlParams.get('trip');
    
    if (tripName) {
        loadTrip(tripName);
    } else {
        const firstTrip = document.querySelector('#trips-nav a');
        if (firstTrip) {
            firstTrip.click();
        }
    }
});

// Ładowanie listy wycieczek z katalogu /trips
async function loadTrips() {
    try {
        const response = await fetch('trips/index.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const trips = await response.json();
        
        const nav = document.getElementById('trips-nav');
        nav.innerHTML = '';
        
        if (!trips || trips.length === 0) {
            console.warn('Brak dostępnych wycieczek w index.json');
            return;
        }
        
        trips.forEach(trip => {
            const link = document.createElement('a');
            link.href = `?trip=${encodeURIComponent(trip.folder)}`;
            link.className = 'cyber-button small';
            link.textContent = trip.title || trip.folder;
            link.addEventListener('click', function(e) {
                e.preventDefault();
                loadTrip(trip.folder);
                history.pushState(null, '', `?trip=${encodeURIComponent(trip.folder)}`);
            });
            nav.appendChild(link);
        });
    } catch (error) {
        console.error('Błąd podczas ładowania listy wycieczek:', error);
        // Komunikat dla użytkownika
        const nav = document.getElementById('trips-nav');
        nav.innerHTML = '<p class="error">Nie udało się załadować wycieczek</p>';
    }
}

// Ładowanie szczegółów wycieczki
async function loadTrip(tripName) {
    try {
        const response = await fetch(`trips/${encodeURIComponent(tripName)}/trip.yaml`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const yamlText = await response.text();
        if (!yamlText || yamlText.trim() === '') {
            throw new Error('Plik YAML jest pusty');
        }
        
        try {
            const tripData = jsyaml.load(yamlText);
            
            if (!tripData) {
                throw new Error('Nie udało się przetworzyć danych YAML');
            }
            
            renderTripDetails(tripData);
            renderSections(tripData.sections, tripName);
            initMap(tripData.defaultMapCenter, tripData.defaultZoom, tripData.sections);
            initPlanner(tripData.sections);
            loadGallery(tripName, tripData.sections);
        } catch (yamlError) {
            console.error('Błąd podczas parsowania YAML:', yamlError);
            showErrorMessage(`Błąd formatu danych wycieczki: ${yamlError.message}`);
        }
    } catch (error) {
        console.error(`Błąd podczas ładowania wycieczki ${tripName}:`, error);
        showErrorMessage(`Nie udało się załadować wycieczki: ${error.message}`);
    }
}

// Funkcja do wyświetlania komunikatów o błędach
function showErrorMessage(message) {
    const tripDetails = document.getElementById('trip-details');
    tripDetails.innerHTML = `
        <h1 class="neon-text error">Błąd</h1>
        <p class="error-message">${message}</p>
        <p>Spróbuj wybrać inną wycieczkę lub odświeżyć stronę.</p>
    `;
    
    // Czyszczenie innych sekcji
    document.getElementById('sections-container').innerHTML = '';
    document.getElementById('map').innerHTML = '';
    document.getElementById('attractions-items').innerHTML = '';
    document.getElementById('days-container').innerHTML = '';
    document.getElementById('detailed-days-container').innerHTML = '';
}

// Renderowanie szczegółów wycieczki
function renderTripDetails(tripData) {
    document.getElementById('trip-title').textContent = tripData.title;
    document.getElementById('trip-description').textContent = tripData.description;
}

// Renderowanie sekcji wycieczki
function renderSections(sections, tripName) {
    const container = document.getElementById('sections-container');
    container.innerHTML = '';
    
    sections.forEach(section => {
        const sectionElement = createSectionElement(section, tripName);
        container.appendChild(sectionElement);
    });
}

// Tworzenie elementu sekcji
function createSectionElement(section, tripName) {
    const sectionElement = document.createElement('div');
    sectionElement.className = 'cyber-section';
    sectionElement.id = `section-${section.id}`;
    
    const header = document.createElement('h2');
    header.className = 'neon-blue';
    header.textContent = section.title;
    
    const content = document.createElement('div');
    content.className = 'section-content';
    content.innerHTML = section.content;
    
    const gallery = document.createElement('div');
    gallery.className = 'gallery';
    gallery.id = `gallery-${section.id}`;
    
    sectionElement.appendChild(header);
    sectionElement.appendChild(content);
    sectionElement.appendChild(gallery);
    
    // Dodawanie podsekcji
    if (section.subsections && section.subsections.length > 0) {
        const subsectionsContainer = document.createElement('div');
        subsectionsContainer.className = 'subsections';
        
        section.subsections.forEach(subsection => {
            const subsectionElement = createSubsectionElement(subsection);
            subsectionsContainer.appendChild(subsectionElement);
        });
        
        sectionElement.appendChild(subsectionsContainer);
    }
    
    return sectionElement;
}

// Tworzenie elementu podsekcji
function createSubsectionElement(subsection) {
    const subsectionElement = document.createElement('div');
    subsectionElement.className = 'cyber-subsection';
    subsectionElement.id = `subsection-${subsection.id}`;
    
    const header = document.createElement('h3');
    header.className = 'neon-purple';
    header.textContent = subsection.title;
    
    const content = document.createElement('div');
    content.className = 'subsection-content';
    content.innerHTML = subsection.content;
    
    const gallery = document.createElement('div');
    gallery.className = 'gallery';
    gallery.id = `gallery-${subsection.id}`;
    
    subsectionElement.appendChild(header);
    subsectionElement.appendChild(content);
    subsectionElement.appendChild(gallery);
    
    return subsectionElement;
}

// Konfiguracja nasłuchiwania zdarzeń
function setupEventListeners() {
    // Przełączanie widoczności sekcji
    document.getElementById('toggle-sections').addEventListener('click', function() {
        const sections = document.querySelectorAll('.cyber-section');
        sections.forEach(section => {
            if (section.id !== 'trip-details') {
                const content = section.querySelector('.section-content');
                if (content) {
                    content.classList.toggle('collapsed');
                }
            }
        });
    });
    
    // Zmiana motywu
    document.getElementById('theme-selector').addEventListener('change', function(e) {
        document.body.className = e.target.value;
    });
    
    // Obsługa liczby dni w planerze
    document.getElementById('days-count').addEventListener('change', function(e) {
        updateDaysCount(parseInt(e.target.value));
    });
    
    // Eksport/import YAML
    document.getElementById('export-yaml').addEventListener('click', exportYaml);
    document.getElementById('import-yaml').addEventListener('click', importYaml);
    
    // Eksport PDF
    document.getElementById('export-pdf').addEventListener('click', exportPdf);
}
