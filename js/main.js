const navigation = document.getElementById('navigation');
const content = document.getElementById('content');

let currentTrip = null;

function renderNavigation(trips) {
    const navList = document.createElement('ul');
    trips.forEach(trip => {
        const tripItem = document.createElement('li');
        tripItem.textContent = trip.title;
        tripItem.addEventListener('click', () => renderTrip(trip));
        navList.appendChild(tripItem);
    });
    navigation.appendChild(navList);
}

function renderTrip(trip) {
    currentTrip = trip;
    content.innerHTML = ''; // Clear previous content
    const tripTitle = document.createElement('h2');
    tripTitle.textContent = trip.title;
    content.appendChild(tripTitle);

    const tripDescription = document.createElement('p');
    tripDescription.textContent = trip.description;
    content.appendChild(tripDescription);

    const sectionsContainer = document.createElement('div');
    sectionsContainer.id = 'sections-container';
    content.appendChild(sectionsContainer);

    trip.sections.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'section';
        sectionDiv.id = section.id;

        const sectionTitle = document.createElement('h3');
        sectionTitle.textContent = section.title;
        sectionDiv.appendChild(sectionTitle);

        const sectionDescription = document.createElement('p');
        sectionDescription.textContent = section.description;
        sectionDiv.appendChild(sectionDescription);

        const galleryContainer = document.createElement('div');
        galleryContainer.className = 'gallery';
        sectionDiv.appendChild(galleryContainer);

        const images = getImagesForSection(trip.id, section.id);
        if (images.length > 0) {
            renderGallery(galleryContainer, images);
        }

        sectionsContainer.appendChild(sectionDiv);
    });

    renderMap(trip.defaultMapCenter, trip.defaultZoom, trip.sections);
}

function getImagesForSection(tripId, sectionId) {
    const imagesDir = `trips/${tripId}/${sectionId}`;
    const images = [];
    fetch(imagesDir)
        .then(response => response.text())
        .then(text => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, "text/html");
            const links = doc.querySelectorAll('a');
            for (const link of links) {
                const file = link.href.split('/').pop();
                if (file.endsWith('.jpg')) {
                    images.push(`${imagesDir}/${file}`);
                }
            }
        })
        .catch(error => console.error('Error:', error));

    return images;
}

function renderGallery(container, images) {
    images.forEach(imagePath => {
        const img = document.createElement('img');
        img.src = imagePath;
        img.className = 'gallery-image';
        container.appendChild(img);
    });
}