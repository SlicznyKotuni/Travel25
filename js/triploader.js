// Renderowanie szczegółów wycieczki
function renderTripDetails(tripData) {
    document.getElementById('trip-title').textContent = tripData.title;
    document.getElementById('trip-description').textContent = tripData.description;
    document.title = `${tripData.title} - Cyber Travel Planner`;
}

// Renderowanie sekcji i podsekcji
function renderSections(sections, tripName) {
    const container = document.getElementById('sections-container');
    container.innerHTML = '';
    
    sections.forEach(section => {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'section cyber-section';
        sectionElement.id = `section-${section.id}`;
        
        // Nagłówek sekcji
        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `
            <h2 class="section-title neon-blue">${section.title}</h2>
            <button class="cyber-button small toggle-section">Zwiń/Rozwiń</button>
        `;
        header.querySelector('.toggle-section').addEventListener('click', function() {
            const content = sectionElement.querySelector('.section-content');
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });
        
        // Zawartość sekcji
        const content = document.createElement('div');
        content.className = 'section-content';
        content.innerHTML = `<p>${section.description}</p>`;
        
        // Galeria dla sekcji
        const gallery = document.createElement('div');
        gallery.className = 'gallery';
        gallery.id = `gallery-${section.id}`;
        content.appendChild(gallery);
        
        // Podsekcje
        if (section.subsections && section.subsections.length > 0) {
            const subsectionsContainer = document.createElement('div');
            subsectionsContainer.className = 'subsections';
            
            section.subsections.forEach(subsection => {
                const subsectionElement = document.createElement('div');
                subsectionElement.className = 'subsection';
                subsectionElement.id = `subsection-${subsection.id}`;
                
                subsectionElement.innerHTML = `
                    <h3 class="subsection-title neon-pink">${subsection.title}</h3>
                    <p>${subsection.description}</p>
                `;
                
                // Galeria dla podsekcji
                const subGallery = document.createElement('div');
                subGallery.className = 'gallery';
                subGallery.id = `gallery-${subsection.id}`;
                subsectionElement.appendChild(subGallery);
                
                subsectionsContainer.appendChild(subsectionElement);
            });
            
            content.appendChild(subsectionsContainer);
        }
        
        sectionElement.appendChild(header);
        sectionElement.appendChild(content);
        container.appendChild(sectionElement);
    });
}