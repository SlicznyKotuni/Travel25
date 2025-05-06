function createGallery(tripFolder, sectionId) {
    const gallery = document.createElement('div');
    gallery.className = 'gallery';

    // Zakładamy, że zdjęcia są w folderze trips/tripFolder/sectionId/
    const imagePath = `trips/${tripFolder}/${sectionId}/`;

    // Funkcja pomocnicza do tworzenia elementów galerii
    const createGalleryItem = (imageName) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';

        const imageLink = document.createElement('a');
        imageLink.href = imagePath + imageName; // Pełna ścieżka do dużego zdjęcia
        imageLink.setAttribute('data-lightbox', sectionId); // Ustawienie atrybutu dla Lightbox

        const image = document.createElement('img');
        image.src = imagePath + imageName; // Ścieżka do miniaturki
        image.alt = imageName;

        imageLink.appendChild(image);
        galleryItem.appendChild(imageLink);
        return galleryItem;
    };

    // Przykładowe nazwy zdjęć - możesz to rozszerzyć o dynamiczne pobieranie listy plików
    const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];

    images.forEach(imageName => {
        gallery.appendChild(createGalleryItem(imageName));
    });

    return gallery;
}