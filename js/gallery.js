/**
 * Tworzy galerię zdjęć dla danego ID sekcji
 * @param {string} sectionId - Identyfikator sekcji
 * @param {number} maxImages - Maksymalna liczba zdjęć (domyślnie 10)
 * @param {function} getCaption - Funkcja do generowania podpisu zdjęcia
 * @returns {HTMLElement} Element galerii
 */
const createGallery = (sectionId, maxImages = 10, getCaption = (i) => `Zdjęcie ${i}`) => {
    const gallery = document.createElement('div');
    gallery.className = 'section-gallery';

    const baseUrl = `trips/${ContentLoader.getCurrentTripId()}/images/${sectionId}`;

    for (let i = 1; i <= maxImages; i++) {
        const imageUrl = `${baseUrl}_${i}.jpg`;

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
                
                // Inicjalizacja Fancybox po dodaniu nowego zdjęcia
                Fancybox.bind(`[data-fancybox="gallery-${sectionId}"]`, {
                    Thumbs: false,
                    Toolbar: true
                });
            })
            .catch(error => {
                console.warn(`Błąd ładowania zdjęcia: ${imageUrl}`, error);
            });
    }

    return gallery;
};