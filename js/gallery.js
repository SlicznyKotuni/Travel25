/**
 * Moduł odpowiedzialny za obsługę galerii zdjęć
 */
const GalleryHandler = (() => {
    /**
     * Inicjalizuje galerie zdjęć
     */
    const initGalleries = () => {
        // Inicjalizacja Fancybox dla wszystkich elementów galerii
        Fancybox.bind("[data-fancybox]", {
            // Opcje Fancybox
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
        // Inicjalizacja galerii przy załadowaniu strony
        document.addEventListener('DOMContentLoaded', initGalleries);
        
        // Inicjalizacja galerii po załadowaniu nowej wycieczki
        document.addEventListener('tripLoaded', initGalleries);
    };

    return {
        init
    };
})();