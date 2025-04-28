/**
 * Moduł odpowiedzialny za obsługę galerii zdjęć
 */
const GalleryHandler = (() => {
    /**
     * Inicjalizuje galerie zdjęć
     */
    const initGalleries = () => {
        Fancybox.bind("[data-fancybox]", {
            Carousel: {
                infinite: false,
            },
            Thumbs: {
                autoStart: true,
            },
            Images: {
                zoom: true,
            },
            Toolbar: {
                display: [
                    { id: "prev", position: "center" },
                    { id: "counter", position: "center" },
                    { id: "next", position: "center" },
                    "zoom",
                    "slideshow",
                    "fullscreen",
                    "close",
                ],
            },
        });
    };

    /**
     * Inicjalizuje moduł
     */
    const init = () => {
        document.addEventListener('DOMContentLoaded', initGalleries);
        document.addEventListener('tripLoaded', initGalleries);
    };

    return {
        init
    };
})();

/**
 * Tworzy galerię zdjęć dla danego ID sekcji
 * @param {string} sectionId - Identyfikator sekcji
 * @param {string} type - Typ sekcji (domyślnie "section")
 * @param {number} maxImages - Maksymalna liczba zdjęć (domyślnie 10)
 * @param {function} getCaption - Funkcja do generowania podpisu zdjęcia
 * @returns {HTMLElement} Element galerii
 */
const createGallery = (sectionId, type = 'section', maxImages = 10, getCaption = (i) => `Zdjęcie ${i}`) => {
    const gallery = document.createElement('div');
    gallery.className = 'section-gallery';

    const baseUrl = `trips/${currentTrip}/images/${sectionId}`;

    for (let i = 1; i <= maxImages; i++) {
        const imageUrl = `${baseUrl}-${i}.jpg`;

        fetch(imageUrl)
            .then(response => {
                if (!response.ok) throw new Error(`Nie znaleziono: ${imageUrl}`);
                
                const galleryItem = document.createElement('a');
                galleryItem.className = 'gallery-item';
                galleryItem.href = imageUrl;
                galleryItem.setAttribute('data-fancybox', `gallery-${sectionId}`);
                galleryItem.setAttribute('data-caption', getCaption(i));

                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = `${sectionId} - zdjęcie ${i}`;
                img.loading = 'lazy';

                galleryItem.appendChild(img);
                gallery.appendChild(galleryItem);
            })
            .catch(error => {
                console.warn(`Błąd ładowania zdjęcia: ${imageUrl}`, error);
            });
    }

    return gallery;
};