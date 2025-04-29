/**
 * Moduł odpowiedzialny za ładowanie treści z plików YAML i budowanie interfejsu
 */
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
            console.error('Błąd ładowania danych wycieczki:', error);
            return null;
        }
    };

    /**
     * Tworzy galerię zdjęć dla sekcji na podstawie tablicy nazw plików
     * @param {Array} images - Tablica nazw plików zdjęć
     * @param {string} sectionId - ID sekcji
     * @param {string} type - Typ galerii
     * @returns {HTMLElement} Element galerii
     */
    const createGallery = (images, sectionId, type = 'section') => {
        const gallery = document.createElement('div');
        gallery.className = 'section-gallery';
        
        if (!images || images.length === 0) {
            console.log(`Brak zdjęć dla sekcji: ${sectionId}`);
            return gallery;
        }
        
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
                
                // Reinicjalizuj Fancybox po dodaniu nowych elementów
                if (typeof Fancybox !== 'undefined') {
                    Fancybox.bind(`[data-fancybox="gallery-${sectionId}"]`);
                }
            };
            
            img.onerror = () => {
                console.warn(`Nie można załadować zdjęcia: ${imgUrl}`);
            };
            
            img.src = imgUrl;
        });
        
        return gallery;
    };

    /**
     * Tworzy galerię zdjęć dla sekcji na podstawie ID sekcji
     * @param {string} sectionId - ID sekcji (np. "ptuj")
     * @param {number} maxImages - Maksymalna liczba zdjęć do sprawdzenia
     * @returns {HTMLElement} Element galerii
     */
    const createGalleryFromId = (sectionId, maxImages = 10) => {
        const gallery = document.createElement('div');
        gallery.className = 'section-gallery';
        
        // Tablica do przechowywania znalezionych zdjęć
        const foundImages = [];
        
        // Sprawdź każde potencjalne zdjęcie
        for (let i = 1; i <= maxImages; i++) {
            const imgName = `${sectionId}_${i}.jpg`;
            const imgUrl = `trips/${currentTrip}/images/${imgName}`;
            
            // Dodaj do tablicy zdjęć do sprawdzenia
            foundImages.push(imgName);
        }
        
        // Utwórz galerię z potencjalnych zdjęć
        return createGallery(foundImages, sectionId);
    };

    /**
     * Buduje interfejs na podstawie danych wycieczki
     * @param {Object} data - Dane wycieczki
     */
    const buildInterface = (data) => {
        if (!data) return;
        
        const contentContainer = document.getElementById('content-container');
        if (!contentContainer) {
            console.error('Nie znaleziono kontenera treści');
            return;
        }
        
        // Wyczyść kontener
        contentContainer.innerHTML = '';
        
        // Dodaj tytuł wycieczki
        const tripTitle = document.createElement('h1');
        tripTitle.className = 'trip-title';
        tripTitle.textContent = data.title || 'Wycieczka bez tytułu';
        contentContainer.appendChild(tripTitle);
        
        // Dodaj opis wycieczki, jeśli istnieje
        if (data.description) {
            const tripDescription = document.createElement('div');
            tripDescription.className = 'trip-description';
            tripDescription.innerHTML = data.description;
            contentContainer.appendChild(tripDescription);
        }
        
        // Dodaj sekcje
        if (data.sections && data.sections.length > 0) {
            data.sections.forEach((section, index) => {
                const sectionElement = createSectionElement(section, index);
                contentContainer.appendChild(sectionElement);
            });
        }
        
        // Dodaj obsługę przycisków zwijania sekcji
        setupSectionToggles();
    };

    /**
     * Tworzy element sekcji
     * @param {Object} section - Dane sekcji
     * @param {number} index - Indeks sekcji
     * @returns {HTMLElement} Element sekcji
     */
    const createSectionElement = (section, index) => {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'section';
        sectionElement.id = `section-${section.id}`;
        
        // Nagłówek sekcji
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'section-header';
        
        const sectionTitle = document.createElement('h2');
        sectionTitle.className = 'section-title';
        sectionTitle.textContent = section.title || `Sekcja ${index + 1}`;
        
        const sectionToggle = document.createElement('button');
        sectionToggle.className = 'section-toggle';
        sectionToggle.innerHTML = '&#8722;'; // Znak minus
        sectionToggle.setAttribute('data-section-id', section.id);
        sectionToggle.title = 'Zwiń/Rozwiń sekcję';
        
        sectionHeader.appendChild(sectionTitle);
        sectionHeader.appendChild(sectionToggle);
        sectionElement.appendChild(sectionHeader);
        
        // Zawartość sekcji
        const sectionContent = document.createElement('div');
        sectionContent.className = 'section-content';
        sectionContent.id = `section-content-${section.id}`;
        
        // Dodaj opis sekcji, jeśli istnieje
        if (section.description) {
            const sectionDescription = document.createElement('div');
            sectionDescription.className = 'section-description';
            sectionDescription.innerHTML = section.description;
            sectionContent.appendChild(sectionDescription);
        }
        
        // Dodaj galerię zdjęć, jeśli istnieją
        if (section.images && section.images.length > 0) {
            const gallery = createGallery(section.images, section.id);
            sectionContent.appendChild(gallery);
        } else {
            // Jeśli nie ma zdefiniowanych zdjęć, spróbuj znaleźć zdjęcia na podstawie ID
            const gallery = createGalleryFromId(section.id);
            sectionContent.appendChild(gallery);
        }
        
        // Dodaj podsekcje, jeśli istnieją
        if (section.subsections && section.subsections.length > 0) {
            section.subsections.forEach((subsection, subIndex) => {
                const subsectionElement = createSubsectionElement(subsection, subIndex, section.id);
                sectionContent.appendChild(subsectionElement);
            });
        }
        
        sectionElement.appendChild(sectionContent);
        return sectionElement;
    };

    /**
     * Tworzy element podsekcji
     * @param {Object} subsection - Dane podsekcji
     * @param {number} index - Indeks podsekcji
     * @param {string} parentId - ID sekcji nadrzędnej
     * @returns {HTMLElement} Element podsekcji
     */
    const createSubsectionElement = (subsection, index, parentId) => {
        const subsectionElement = document.createElement('div');
        subsectionElement.className = 'subsection';
        subsectionElement.id = `subsection-${subsection.id || `${parentId}-sub-${index}`}`;
        
        // Nagłówek podsekcji
        const subsectionHeader = document.createElement('div');
        subsectionHeader.className = 'subsection-header';
        
        const subsectionTitle = document.createElement('h3');
        subsectionTitle.className = 'subsection-title';
        subsectionTitle.textContent = subsection.title || `Podsekcja ${index + 1}`;
        
        const subsectionId = subsection.id || `${parentId}-sub-${index}`;
        
        const subsectionToggle = document.createElement('button');
        subsectionToggle.className = 'section-toggle';
        subsectionToggle.innerHTML = '&#8722;'; // Znak minus
        subsectionToggle.setAttribute('data-section-id', subsectionId);
        subsectionToggle.title = 'Zwiń/Rozwiń podsekcję';
        
        subsectionHeader.appendChild(subsectionTitle);
        subsectionHeader.appendChild(subsectionToggle);
        subsectionElement.appendChild(subsectionHeader);
        
        // Zawartość podsekcji
        const subsectionContent = document.createElement('div');
        subsectionContent.className = 'subsection-content';
        subsectionContent.id = `section-content-${subsectionId}`;
        
        // Dodaj opis podsekcji, jeśli istnieje
        if (subsection.description) {
            const subsectionDescription = document.createElement('div');
            subsectionDescription.className = 'subsection-description';
            subsectionDescription.innerHTML = subsection.description;
            subsectionContent.appendChild(subsectionDescription);
        }
        
        // Dodaj galerię zdjęć, jeśli istnieją
        if (subsection.images && subsection.images.length > 0) {
            const gallery = createGallery(subsection.images, subsectionId);
            subsectionContent.appendChild(gallery);
        } else if (subsection.id) {
            // Jeśli nie ma zdefiniowanych zdjęć, spróbuj znaleźć zdjęcia na podstawie ID
            const gallery = createGalleryFromId(subsection.id);
            subsectionContent.appendChild(gallery);
        }
        
        subsectionElement.appendChild(subsectionContent);
        return subsectionElement;
    };

    /**
     * Konfiguruje obsługę przycisków zwijania sekcji
     */
    const setupSectionToggles = () => {
        document.querySelectorAll('.section-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const sectionId = toggle.getAttribute('data-section-id');
                const sectionContent = document.getElementById(`section-content-${sectionId}`);
                
                if (sectionContent) {
                    const isVisible = sectionContent.style.display !== 'none';
                    sectionContent.style.display = isVisible ? 'none' : 'grid';
                    toggle.innerHTML = isVisible ? '&#43;' : '&#8722;'; // Znak plus lub minus
                }
            });
        });
    };

    /**
     * Inicjalizuje moduł
     */
    const init = async () => {
        try {
            // Załaduj dane wycieczki
            tripData = await loadTripData(currentTrip);
            
            // Zbuduj interfejs
            if (tripData) {
                buildInterface(tripData);
                
                // Wywołaj event załadowania wycieczki
                document.dispatchEvent(new CustomEvent('tripLoaded', { 
                    detail: { data: tripData }
                }));
            }
        } catch (error) {
            console.error('Błąd inicjalizacji ContentLoader:', error);
        }
    };

    /**
     * Zmienia aktualną wycieczkę
     * @param {string} tripId - ID wycieczki
     */
    const loadTrip = async (tripId) => {
        try {
            currentTrip = tripId;
            tripData = await loadTripData(tripId);
            
            // Zbuduj interfejs
            if (tripData) {
                buildInterface(tripData);
                
                // Wywołaj event załadowania wycieczki
                document.dispatchEvent(new CustomEvent('tripLoaded', { 
                    detail: { data: tripData }
                }));
            }
        } catch (error) {
            console.error(`Błąd ładowania wycieczki ${tripId}:`, error);
        }
    };

    /**
     * Zwraca ID aktualnie załadowanej wycieczki
     * @returns {string} ID wycieczki
     */
    const getCurrentTripId = () => {
        return currentTrip;
    };

    /**
     * Zwraca dane aktualnie załadowanej wycieczki
     * @returns {Object} Dane wycieczki
     */
    const getTripData = () => {
        return tripData;
    };

    return {
        init,
        loadTripData,
        createGallery,
        createGalleryFromId,
        loadTrip,
        getCurrentTripId,
        getTripData
    };
})();
