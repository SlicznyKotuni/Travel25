/**
 * Moduł odpowiedzialny za ładowanie treści z plików YAML i budowanie interfejsu
 */
const createGallery = (images, sectionId, type = 'section') => {
    const gallery = document.createElement('div');
    gallery.className = 'section-gallery';
    
    images.forEach((image, index) => {
        const imgUrl = `trips/${currentTrip}/images/${image}`;
        const img = new Image();
        
        img.onload = () => {
            const galleryItem = document.createElement('a');
            galleryItem.className = 'gallery-item';
            galleryItem.href = imgUrl;
            galleryItem.setAttribute('data-fancybox', `gallery-${sectionId}`);
            galleryItem.setAttribute('data-caption', `Zdjęcie ${index + 1}`);
            
            const imgElement = document.createElement('img');
            imgElement.src = imgUrl;
            imgElement.alt = `${sectionId} - zdjęcie ${index + 1}`;
            imgElement.loading = 'lazy';
            
            galleryItem.appendChild(imgElement);
            gallery.appendChild(galleryItem);
        };
        
        img.onerror = () => {
            console.warn(`Nie można załadować zdjęcia: ${imgUrl}`);
        };
        
        img.src = imgUrl;
    });
    
    return gallery;
};
const ContentLoader = (() => {
    // Przechowuje aktualnie załadowaną wycieczkę
    let currentTrip = 'slovenia';
    // Przechowuje dane wycieczki
    let tripData = null;

    /**
     * Ładuje dane wycieczki z pliku YAML
     * @param {string} tripId - ID wycieczki (nazwa katalogu)
     * @returns {Promise} - Promise z danymi wycieczki
     */
    const loadTripData = async (tripId) => {
        try {
            const response = await fetch(`trips/${tripId}/trip.yaml`);
            if (!response.ok) {
                throw new Error(`Nie można załadować danych dla wycieczki: ${tripId}`);
            }
            
            const yamlText = await response.text();
            const data = jsyaml.load(yamlText);
            
            return data;
        } catch (error) {
            console.error('Błąd podczas ładowania danych wycieczki:', error);
            return null;
        }
    };

    /**
     * Tworzy nawigację do sekcji na podstawie danych wycieczki
     * @param {Object} data - Dane wycieczki
     */
    const buildSectionNavigation = (data) => {
        const sectionsList = document.getElementById('sections-list');
        sectionsList.innerHTML = '';
        
        data.sections.forEach(section => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#section-${section.id}`;
            a.textContent = section.title;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById(`section-${section.id}`).scrollIntoView({
                    behavior: 'smooth'
                });
            });
            
            li.appendChild(a);
            sectionsList.appendChild(li);
        });
    };

    /**
     * Tworzy element galerii dla sekcji
     * @param {Array} images - Tablica nazw plików zdjęć
     * @param {string} sectionId - ID sekcji
     * @param {string} type - Typ sekcji ('section' lub 'subsection')
     * @returns {HTMLElement} - Element galerii
     */
    const createGallery = (images, sectionId, type = 'section') => {
        const gallery = document.createElement('div');
        gallery.className = 'section-gallery';
        
        images.forEach((image, index) => {
            const galleryItem = document.createElement('a');
            galleryItem.className = 'gallery-item';
            galleryItem.href = `trips/${currentTrip}/images/${image}`;
            galleryItem.setAttribute('data-fancybox', `gallery-${sectionId}`);
            galleryItem.setAttribute('data-caption', `Zdjęcie ${index + 1}`);
            
            const img = document.createElement('img');
            img.src = `trips/${currentTrip}/images/${image}`;
            img.alt = `${sectionId} - zdjęcie ${index + 1}`;
            img.loading = 'lazy';
            
            galleryItem.appendChild(img);
            gallery.appendChild(galleryItem);
        });
        
        return gallery;
    };

    /**
     * Tworzy podsekcję na podstawie danych
     * @param {Object} subsection - Dane podsekcji
     * @param {string} parentId - ID sekcji nadrzędnej
     * @returns {HTMLElement} - Element podsekcji
     */
    const createSubsection = (subsection, parentId) => {
        const subsectionElement = document.createElement('div');
        subsectionElement.className = 'subsection';
        subsectionElement.id = `subsection-${subsection.id}`;
        subsectionElement.setAttribute('data-parent', parentId);
        
        // Nagłówek podsekcji
        const subsectionHeader = document.createElement('div');
        subsectionHeader.className = 'subsection-header';
        
        const subsectionTitle = document.createElement('h3');
        subsectionTitle.textContent = subsection.title;
        
        const toggleButton = document.createElement('button');
        toggleButton.className = 'section-toggle';
        toggleButton.innerHTML = '&#8722;'; // Znak minus
        toggleButton.setAttribute('aria-label', 'Zwiń/rozwiń podsekcję');
        toggleButton.addEventListener('click', () => {
            const content = subsectionElement.querySelector('.subsection-content');
            content.style.display = content.style.display === 'none' ? 'grid' : 'none';
            toggleButton.innerHTML = content.style.display === 'none' ? '&#43;' : '&#8722;'; // Znak plus/minus
        });
        
        subsectionHeader.appendChild(subsectionTitle);
        subsectionHeader.appendChild(toggleButton);
        subsectionElement.appendChild(subsectionHeader);
        
        // Zawartość podsekcji
        const subsectionContent = document.createElement('div');
        subsectionContent.className = 'subsection-content section-content';
        
        if (subsection.images && subsection.images.length > 0) {
            const gallery = createGallery(subsection.images, subsection.id, 'subsection');
            subsectionContent.appendChild(gallery);
        }
        
        const subsectionText = document.createElement('div');
        subsectionText.className = 'section-text';
        subsectionText.innerHTML = `<p>${subsection.description}</p>`;
        subsectionContent.appendChild(subsectionText);
        
        subsectionElement.appendChild(subsectionContent);
        
        return subsectionElement;
    };

    /**
     * Tworzy sekcję na podstawie danych
     * @param {Object} section - Dane sekcji
     * @returns {HTMLElement} - Element sekcji
     */
    const createSection = (section) => {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'content-section cyber-section';
        sectionElement.id = `section-${section.id}`;
        sectionElement.setAttribute('data-location', JSON.stringify(section.location));
        
        // Nagłówek sekcji
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'section-header';
        
        const sectionTitle = document.createElement('h2');
        sectionTitle.className = 'neon-text';
        sectionTitle.textContent = section.title;
        
        const toggleButton = document.createElement('button');
        toggleButton.className = 'section-toggle';
        toggleButton.innerHTML = '&#8722;'; // Znak minus
        toggleButton.setAttribute('aria-label', 'Zwiń/rozwiń sekcję');
        toggleButton.addEventListener('click', () => {
            const content = sectionElement.querySelector('.section-content');
            content.style.display = content.style.display === 'none' ? 'grid' : 'none';
            toggleButton.innerHTML = content.style.display === 'none' ? '&#43;' : '&#8722;'; // Znak plus/minus
        });
        
        sectionHeader.appendChild(sectionTitle);
        sectionHeader.appendChild(toggleButton);
        sectionElement.appendChild(sectionHeader);
        
        // Zawartość sekcji
        const sectionContent = document.createElement('div');
        sectionContent.className = 'section-content';
        
        if (section.images && section.images.length > 0) {
            const gallery = createGallery(section.images, section.id);
            sectionContent.appendChild(gallery);
        }
        
        const sectionText = document.createElement('div');
        sectionText.className = 'section-text';
        sectionText.innerHTML = `<p>${section.description}</p>`;
        sectionContent.appendChild(sectionText);
        
        sectionElement.appendChild(sectionContent);
        
        // Dodaj podsekcje, jeśli istnieją
        if (section.subsections && section.subsections.length > 0) {
            const subsectionsContainer = document.createElement('div');
            subsectionsContainer.className = 'subsections-container';
            
            section.subsections.forEach(subsection => {
                const subsectionElement = createSubsection(subsection, section.id);
                subsectionsContainer.appendChild(subsectionElement);
            });
            
            sectionElement.appendChild(subsectionsContainer);
        }
        
        return sectionElement;
    };

    /**
     * Buduje zawartość strony na podstawie danych wycieczki
     * @param {Object} data - Dane wycieczki
     */
    const buildContent = (data) => {
        const contentContainer = document.getElementById('content-container');
        contentContainer.innerHTML = '';
        
        document.getElementById('trip-title').textContent = data.title;
        document.getElementById('trip-description').textContent = data.description;
        
        data.sections.forEach(section => {
            const sectionElement = createSection(section);
            contentContainer.appendChild(sectionElement);
        });
    };

    /**
     * Ładuje wycieczkę i renderuje jej zawartość
     * @param {string} tripId - ID wycieczki (nazwa katalogu)
     */
    const loadTrip = async (tripId) => {
        currentTrip = tripId;
        
        const data = await loadTripData(tripId);
        if (!data) return;
        
        tripData = data;
        
        buildSectionNavigation(data);
        buildContent(data);
        
        // Powiadom inne moduły o załadowaniu nowych danych
        document.dispatchEvent(new CustomEvent('tripLoaded', { detail: { data } }));
    };

    /**
     * Zwraca aktualnie załadowane dane wycieczki
     * @returns {Object} - Dane wycieczki
     */
    const getCurrentTripData = () => {
        return tripData;
    };

    /**
     * Zwraca ID aktualnie załadowanej wycieczki
     * @returns {string} - ID wycieczki
     */
    const getCurrentTripId = () => {
        return currentTrip;
    };

    /**
     * Inicjalizuje moduł
     */
    const init = () => {
        // Obsługa przełączania między wycieczkami
        document.getElementById('trip-selector').addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-trip')) {
                e.preventDefault();
                const tripId = e.target.getAttribute('data-trip');
                
                // Aktywuj link
                document.querySelectorAll('#trip-selector a').forEach(link => {
                    link.classList.remove('active', 'neon-border');
                });
                e.target.classList.add('active', 'neon-border');
                
                loadTrip(tripId);
            }
        });

        // Ładowanie domyślnej wycieczki
        loadTrip(currentTrip);
    };

    return {
        init,
        loadTrip,
        getCurrentTripData,
        getCurrentTripId
    };
})();