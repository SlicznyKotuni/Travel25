const MapHandler = (() => {
    let map;
    const markers = {};
    
    const init = () => {
        map = L.map('map-container').setView([46.1512, 14.9955], 8);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        document.addEventListener('tripLoaded', (e) => {
            clearMarkers();
            addTripMarkers(e.detail.data);
        });
    };
    
    const addTripMarkers = (tripData) => {
        tripData.sections.forEach(section => {
            const marker = L.marker(section.location)
                .addTo(map)
                .bindPopup(`<b>${section.title}</b><p>${section.description.substring(0, 100)}...</p>`);
            
            markers[section.id] = marker;
            
            // Obsługa kliknięcia w marker
            marker.on('click', () => {
                document.getElementById(`section-${section.id}`).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    };
    
    const clearMarkers = () => {
        Object.values(markers).forEach(marker => map.removeLayer(marker));
        markers = {};
    };
    
    return { init };
})();