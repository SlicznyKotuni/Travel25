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
        const trips = await response.json();
        
        const nav = document.getElementById('trips-nav');
        nav.innerHTML = '';
        
        trips.forEach(trip => {
            const link = document.createElement('a');
            link.href = `?trip=${trip.folder}`;
            link.className = 'cyber-button small';
            link.textContent = trip.title || trip.folder;
            link.addEventListener('click', function(e) {
                e.preventDefault();
                loadTrip(trip.folder);
                history.pushState(null, '', `?trip=${trip.folder}`);
            });
            nav.appendChild(link);
        });
    } catch (error) {
        console.error('Błąd podczas ładowania listy wycieczek:', error);
    }
}

// Ładowanie szczegółów wycieczki
async function loadTrip(tripName) {
    try {
        const response = await fetch(`trips/${tripName}/trip.yaml`);
        const yamlText = await response.text();
        const tripData = jsyaml.load(yamlText);
        
        renderTripDetails(tripData);
        renderSections(tripData.sections, tripName);
        initMap(tripData.defaultMapCenter, tripData.defaultZoom, tripData.sections);
        initPlanner(tripData.sections);
        loadGallery(tripName, tripData.sections);
        
    } catch (error) {
        console.error('Błąd podczas ładowania wycieczki:', error);
    }
}

// Konfiguracja nasłuchiwaczy zdarzeń
function setupEventListeners() {
    // Przycisk zwijania/rozwijania sekcji
    document.getElementById('toggle-sections').addEventListener('click', toggleAllSections);
    
    // Zmiana motywu
    document.getElementById('theme-selector').addEventListener('change', changeTheme);
    
    // Planer - zmiana liczby dni
    document.getElementById('days-count').addEventListener('change', updatePlannerDays);
    
    // Przyciski eksportu/importu
    document.getElementById('export-yaml').addEventListener('click', exportPlanToYaml);
    document.getElementById('import-yaml').addEventListener('click', importPlanFromYaml);
    document.getElementById('export-pdf').addEventListener('click', exportPlanToPdf);
}

// Funkcja zwijania/rozwijania wszystkich sekcji
function toggleAllSections() {
    const sectionContents = document.querySelectorAll('.section-content');
    const allCollapsed = Array.from(sectionContents).every(content => 
        content.style.display === 'none');
    
    sectionContents.forEach(content => {
        content.style.display = allCollapsed ? 'block' : 'none';
    });
}

// Zmiana motywu
function changeTheme(e) {
    // Tu można dodać logikę zmiany motywu
    console.log('Wybrany motyw:', e.target.value);
}