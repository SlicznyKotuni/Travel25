function renderMap(center, zoom, sections) {
    const mapContainer = document.createElement('div');
    mapContainer.id = 'map';
    mapContainer.style.height = '400px';
    mapContainer.style.width = '100%';
    document.getElementById('content').appendChild(mapContainer);

    const map = L.map('map').setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    sections.forEach(section => {
        if (section.location) {
            const marker = L.marker(section.location).addTo(map);
            marker.bindPopup(section.title);
        }
    });
}