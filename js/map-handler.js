/**
 * Moduł odpowiedzialny za obsługę mapy
 */
const MapHandler = (() => {
    // Przechowuje obiekt mapy
    let map = null;
    // Przechowuje warstwę z markerami
    let markersLayer = null;
    
    /**
     * Inicjalizuje mapę
     * @param {Array} center - Współrzędne środka mapy [lat, lng]
     * @param {number} zoom - Poziom przybliżenia
     */
    const initMap = (center = [46.1512, 14.9955], zoom = 8) => {
        if (map) {
            map.remove();
        }
        
        map = L.map('map-container').setView(center, zoom);
        
        // Dodanie warstwy mapy (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Utworzenie warstwy dla markerów
        markersLayer = L.layerGroup().addTo(map);
        
        // Dostosowanie mapy po zmianie rozmiaru okna
        window.addEventListener('resize', () => {
            map.invalidateSize();
        });
    };
    
    /**
     * Tworzy niestandardowy marker dla lokalizacji
     * @param {Array} location - Współrzędne lokalizacji [lat, lng]
     * @param {string} title - Tytuł markera
     * @param {string} sectionId - ID sekcji powiązanej z markerem
     * @returns {Object} - Marker Leaflet
     */
    const createCustomMarker = (location, title, sectionId) => {
        // Niestandardowa ikona markera z efektem neonu
        const customIcon = L.divIcon({
            className: 'custom-map-marker',
            html: `
                <div class="marker-container">
                    <div class="marker-pin neon-blue"></div>
                    <span class="marker-title">${title}</span>
                </div>
            `,
            iconSize: [30, 42],
            iconAnchor: [15, 42]
        });
        
        const marker = L.marker(location, { icon: customIcon });
        
        // Dodanie obsługi kliknięcia na marker
        marker.on('click', () => {
            // Przejście do odpowiedniej sekcji
            document.getElementById(`section-${sectionId}`).scrollIntoView({
                behavior: 'smooth'
            });
            
            // Podświetlenie sekcji
            const section = document.getElementById(`section-${sectionId}`);
            section.classList.add('highlight-section');
            setTimeout(() => {
                section.classList.remove('highlight-section');
            }, 2000);
        });
        
        return marker;
    };
    
    /**
     * Dodaje markery na mapę na podstawie danych wycieczki
     * @param {Object} data - Dane wycieczki
     */
    const addMarkers = (data) => {
        if (!map || !markersLayer) return;
        
        // Wyczyszczenie istniejących markerów
        markersLayer.clearLayers();
        
        // Tablica do przechowywania granic dla dopasowania widoku
        const bounds = [];
        
        // Dodanie markerów dla każdej sekcji z lokalizacją
        data.sections.forEach(section => {
            if (section.location && section.location.length === 2) {
                const marker = createCustomMarker(section.location, section.title, section.id);
                markersLayer.addLayer(marker);
                bounds.push(section.location);
            }
        });
        
        // Dostosowanie widoku mapy do wszystkich markerów
        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        } else {
            // Jeśli nie ma markerów, użyj domyślnego centrum i przybliżenia
            map.setView(data.defaultMapCenter || [46.1512, 14.9955], data.defaultZoom || 8);
        }
    };
    
    /**
     * Inicjalizuje moduł
     */
    const init = () => {
        // Inicjalizacja mapy po załadowaniu DOM
        document.addEventListener('DOMContentLoaded', () => {
            initMap();
        });
        
        // Aktualizacja mapy po załadowaniu nowej wycieczki
        document.addEventListener('tripLoaded', (e) => {
            const data = e.detail.data;
            initMap(data.defaultMapCenter, data.defaultZoom);
            addMarkers(data);
        });
    };
    
    return {
        init,
        getMap: () => map
    };
})();