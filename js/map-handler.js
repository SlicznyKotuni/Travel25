/**
 * Moduł obsługi mapy i pinezek
 */
const MapHandler = (() => {
    // Przechowuje obiekt mapy
    let map = null;
    // Przechowuje warstwę z markerami
    let markersLayer = null;
    // Domyślne ustawienia mapy
    const defaultMapSettings = {
        center: [46.151, 14.995], // Domyślne centrum mapy (Słowenia)
        zoom: 8
    };

    /**
     * Inicjalizuje mapę
     */
    const init = () => {
        // Inicjalizacja mapy Leaflet
        map = L.map('map', {
            center: defaultMapSettings.center,
            zoom: defaultMapSettings.zoom,
            zoomControl: false
        });

        // Dodanie warstwy OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Dodanie kontrolki zoom w prawym dolnym rogu
        L.control.zoom({
            position: 'bottomright'
        }).addTo(map);

        // Inicjalizacja warstwy markerów
        markersLayer = L.layerGroup().addTo(map);
    };

    /**
     * Aktualizuje mapę na podstawie danych sekcji
     * @param {Array} sections - Tablica sekcji z danymi lokalizacji
     */
    const updateMap = (sections) => {
        // Wyczyść istniejące markery
        markersLayer.clearLayers();
        
        // Tablica do przechowywania współrzędnych wszystkich markerów
        const allCoordinates = [];
        
        // Dodaj markery dla każdej sekcji, która ma lokalizację
        sections.forEach((section, index) => {
            if (section.location) {
                // Sprawdź, czy lokalizacja jest podana jako tablica [lat, lng]
                let lat, lng;
                
                if (Array.isArray(section.location)) {
                    [lat, lng] = section.location;
                } else if (typeof section.location === 'string') {
                    // Jeśli lokalizacja jest stringiem, spróbuj ją sparsować
                    const coords = section.location.split(',').map(coord => parseFloat(coord.trim()));
                    if (coords.length === 2) {
                        [lat, lng] = coords;
                    }
                } else if (section.location.lat && section.location.lng) {
                    // Jeśli lokalizacja jest obiektem z polami lat i lng
                    lat = section.location.lat;
                    lng = section.location.lng;
                }
                
                // Jeśli udało się uzyskać współrzędne, dodaj marker
                if (lat && lng) {
                    const coordinates = [lat, lng];
                    allCoordinates.push(coordinates);
                    
                    // Utwórz marker z popupem
                    const marker = L.marker(coordinates).addTo(markersLayer);
                    
                    // Dodaj popup z informacjami o sekcji
                    const popupContent = `
                        <div class="map-popup">
                            <h3>${section.title || section.id}</h3>
                            ${section.description ? `<p>${section.description}</p>` : ''}
                            <button class="btn-goto-section" data-section-id="${section.id}">
                                Przejdź do sekcji
                            </button>
                        </div>
                    `;
                    
                    marker.bindPopup(popupContent);
                    
                    // Dodaj obsługę kliknięcia na przycisk w popupie
                    marker.on('popupopen', () => {
                        setTimeout(() => {
                            const btn = document.querySelector(`.btn-goto-section[data-section-id="${section.id}"]`);
                            if (btn) {
                                btn.addEventListener('click', () => {
                                    // Przewiń do odpowiedniej sekcji
                                    const sectionElement = document.getElementById(`section-${section.id}`);
                                    if (sectionElement) {
                                        sectionElement.scrollIntoView({ behavior: 'smooth' });
                                    }
                                    // Zamknij popup
                                    marker.closePopup();
                                });
                            }
                        }, 10);
                    });
                }
            }
        });
        
        // Jeśli mamy markery, dostosuj widok mapy
        if (allCoordinates.length > 0) {
            // Utwórz granice obejmujące wszystkie markery
            const bounds = L.latLngBounds(allCoordinates);
            // Dostosuj widok mapy do granic z niewielkim paddingiem
            map.fitBounds(bounds, { padding: [50, 50] });
        } else {
            // Jeśli nie ma markerów, wróć do domyślnego widoku
            map.setView(defaultMapSettings.center, defaultMapSettings.zoom);
        }
    };

    /**
     * Centruje mapę na określonej lokalizacji
     * @param {Array|Object} location - Lokalizacja jako [lat, lng] lub {lat, lng}
     */
    const centerMap = (location) => {
        let lat, lng;
        
        if (Array.isArray(location)) {
            [lat, lng] = location;
        } else if (typeof location === 'string') {
            const coords = location.split(',').map(coord => parseFloat(coord.trim()));
            if (coords.length === 2) {
                [lat, lng] = coords;
            }
        } else if (location.lat && location.lng) {
            lat = location.lat;
            lng = location.lng;
        }
        
        if (lat && lng) {
            map.setView([lat, lng], 13);
        }
    };

    /**
     * Pokazuje trasę między punktami
     * @param {Array} points - Tablica punktów trasy jako [lat, lng]
     * @param {Object} options - Opcje wyświetlania trasy
     */
    const showRoute = (points, options = {}) => {
        // Implementacja wyświetlania trasy
        // To jest opcjonalne, możesz zaimplementować później
    };

    return {
        init,
        updateMap,
        centerMap,
        showRoute
    };
})();
