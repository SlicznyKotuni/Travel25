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
            console.error(error);
            return null;
        }
    };

    /**
     * Tworzy galerię zdjęć dla sekcji
     * @param {Array} images - Tablica nazw plików zdjęć
     * @param {string} sectionId - ID sekcji
     * @param {string} type - Typ galerii
     * @returns {HTMLElement} Element galerii
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

    /**
     * Tworzy galerię zdjęć dla sekcji na podstawie ID
     * @param {string} sectionId - ID sekcji (np. "ptuj")
     * @param {number} maxImages - Maksymalna liczba zdjęć do sprawdzenia
     * @returns {HTMLElement} Element galerii
     */
    const createGalleryFromId = (sectionId, maxImages = 10) => {
        const gallery = document.createElement('div');
        gallery.className = 'section-gallery';
        
        const baseUrl = `trips/${currentTrip}/images`;

        for (let i = 1; i <= maxImages; i++) {
            const imgUrl = `${baseUrl}/${sectionId}_${i}.jpg`;
            const img = new Image();
            
            img.onload = () => {
                const galleryItem = document.createElement('a');
                galleryItem.className = 'gallery-item';
                galleryItem.href = imgUrl;
                galleryItem.setAttribute('data-fancybox', `gallery-${sectionId}`);
                galleryItem.setAttribute('data-caption', `Zdjęcie ${i} - ${sectionId}`);
                
                const imgElement = document.createElement('img');
                imgElement.src = imgUrl;
                imgElement.alt = `${sectionId} - zdjęcie ${i}`;
                imgElement.loading = 'lazy';
                
                galleryItem.appendChild(imgElement);
                gallery.appendChild(galleryItem);
            };
            
            img.onerror = () => {
                console.log(`Brak zdjęcia: ${imgUrl}`);
            };
            
            img.src = imgUrl;
        }

        return gallery;
    };

    /**
     * Inicjalizuje moduł
     */
    const init = async () => {
        // Tutaj dodaj kod inicjalizacji
        tripData = await loadTripData(currentTrip);
        // Wywołaj event załadowania wycieczki
        document.dispatchEvent(new CustomEvent('tripLoaded', { 
            detail: { data: tripData }
        }));
    };

    /**
     * Zwraca ID aktualnie załadowanej wycieczki
     * @returns {string} ID wycieczki
     */
    const getCurrentTripId = () => {
        return currentTrip;
    };

    return {
        init,
        loadTripData,
        createGallery,
        createGalleryFromId,
        getCurrentTripId
    };
})();
