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
        const baseUrl = `trips/${tripId}/images/${sectionId}`;

        for (let i = 1; i <= maxImages; i++) {
            const imgUrl = `${baseUrl}_${i}.jpg`;
            const img = new Image();
            
            img.onload = () => {
                const galleryItem = document.createElement('a');
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

    return {
        createGallery
    };
})();