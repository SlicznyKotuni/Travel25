// Ładowanie zdjęć do galerii
async function loadGallery(tripName, sections) {
    try {
        // Pobieranie listy plików w katalogu wycieczki
        const response = await fetch(`trips/${tripName}/files.json`);
        const files = await response.json();
        
        // Przetwarzanie sekcji
        sections.forEach(section => {
            const sectionGallery = document.getElementById(`gallery-${section.id}`);
            
            // Filtrowanie zdjęć dla sekcji
            const sectionImages = files.filter(file => 
                file.startsWith(`${section.id}_`) && 
                (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg'))
            );
            
            // Dodawanie zdjęć do galerii sekcji
            sectionImages.forEach(image => {
                addImageToGallery(sectionGallery, `trips/${tripName}/${image}`, section.title);
            });
            
            // Przetwarzanie podsekcji
            if (section.subsections && section.subsections.length > 0) {
                section.subsections.forEach(subsection => {
                    const subsectionGallery = document.getElementById(`gallery-${subsection.id}`);
                    
                    // Filtrowanie zdjęć dla podsekcji
                    const subsectionImages = files.filter(file => 
                        file.startsWith(`${subsection.id}_`) && 
                        (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg'))
                    );
                    
                    // Dodawanie zdjęć do galerii podsekcji
                    subsectionImages.forEach(image => {
                        addImageToGallery(subsectionGallery, `trips/${tripName}/${image}`, subsection.title);
                    });
                });
            }
        });
        
        // Inicjalizacja lightbox dla wszystkich zdjęć
        lightbox.option({
            'resizeDuration': 200,
            'wrapAround': true
        });
        
    } catch (error) {
        console.error('Błąd podczas ładowania galerii:', error);
    }
}

// Dodawanie pojedynczego zdjęcia do galerii
function addImageToGallery(galleryElement, imageUrl, title) {
    const item = document.createElement('a');
    item.href = imageUrl;
    item.className = 'gallery-item';
    item.setAttribute('data-lightbox', 'trip-gallery');
    item.setAttribute('data-title', title);
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = title;
    
    item.appendChild(img);
    galleryElement.appendChild(item);
}