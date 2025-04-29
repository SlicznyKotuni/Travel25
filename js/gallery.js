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
        return ContentLoader.createGalleryFromId(sectionId, maxImages);
    };

    return {
        createGallery
    };
})();
