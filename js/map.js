function initMap(tripData) {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error('Element mapy nie znaleziony!');
        return;
    }

    const defaultMapCenter = tripData.defaultMapCenter || [0, 0];
    const defaultZoom = tripData.defaultZoom || 8;

    const map = L.map('map').setView(defaultMapCenter, defaultZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Dodawanie markerów dla sekcji z lokalizacjami
    tripData.sections.forEach(section => {
        if (section.location) {
            L.marker(section.location).addTo(map)
                .bindPopup(`<b>${section.title}</b><br>${section.description}`);
        }
    });
}