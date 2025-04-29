// gallery.js
/**
 * Moduł obsługi galerii zdjęć
 */
const Gallery = (() => {
    /**
     * Tworzy galerię zdjęć dla sekcji
     * @param {string} sectionId - ID sekcji (np. "ptuj")
     * @param {number} maxImages - Maksymalna liczba zdjęć do sprawdzenia
     * @returns {HTMLElement} Element galerii
     */
    const createGallery = (sectionId, maxImages = 10) => {
        const gallery = document.createElement('div');
        gallery.className = 'section-gallery';
        
        const tripId = ContentLoader.getCurrentTripId();
        const baseUrl = `trips/${tripId}/images`;

        // Tablica do przechowywania znalezionych zdjęć
        const loadedImages = [];

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
                
                // Dodaj do tablicy załadowanych obrazów
                loadedImages.push(imgUrl);
                
                // Reinicjalizuj Fancybox po dodaniu nowych elementów
                if (typeof Fancybox !== 'undefined') {
                    Fancybox.bind(`[data-fancybox="gallery-${sectionId}"]`);
                }
            };
            
            img.onerror = () => {
                console.log(`Brak zdjęcia: ${imgUrl}`);
            };
            
            img.src = imgUrl;
        }

        return gallery;
    };

    /**
     * Tworzy galerię zdjęć z podanej tablicy nazw plików
     * @param {Array} imageFiles - Tablica nazw plików zdjęć
     * @param {string} sectionId - ID sekcji
     * @returns {HTMLElement} Element galerii
     */
    const createGalleryFromFiles = (imageFiles, sectionId) => {
        const gallery = document.createElement('div');
        gallery.className = 'section-gallery';
        
        const tripId = ContentLoader.getCurrentTripId();
        
        imageFiles.forEach((fileName, index) => {
            const imgUrl = `trips/${tripId}/images/${fileName}`;
            const img = new Image();
            
            img.onload = () => {
                const galleryItem = document.createElement('a');
                galleryItem.className = 'gallery-item';
                galleryItem.href = imgUrl;
                galleryItem.setAttribute('data-fancybox', `gallery-${sectionId}`);
                galleryItem.setAttribute('data-caption', `Zdjęcie ${index + 1} - ${sectionId}`);
                
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
     * Inicjalizuje moduł galerii
     */
    const init = () => {
        // Inicjalizacja Fancybox dla galerii zdjęć, jeśli nie jest zainicjalizowana w main.js
        if (typeof Fancybox !== 'undefined' && !document.querySelector('[data-fancybox]')) {
            Fancybox.bind("[data-fancybox]", {
                Thumbs: {
                    type: "classic",
                },
                Toolbar: {
                    display: {
                        left: [],
                        middle: [],
                        right: ["close"],
                    },
                },
            });
        }
    };

    return {
        createGallery,
        createGalleryFromFiles,
        init
    };
})();
