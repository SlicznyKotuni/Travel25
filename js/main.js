/**
 * Główny plik JavaScript aplikacji Travel25
 * Inicjalizuje wszystkie moduły i zarządza ich współdziałaniem
 */

// Poczekaj na załadowanie DOM
document.addEventListener('DOMContentLoaded', () => {
    // Inicjalizacja podstawowych modułów
    ContentLoader.init();
    MapHandler.init();
    Planner.init();
    PDFExport.init();

    // Inicjalizacja Fancybox dla galerii zdjęć
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

    // Obsługa przycisku zamykania/otwierania sekcji
    document.getElementById('toggle-all-sections').addEventListener('click', () => {
        const sections = document.querySelectorAll('.section-content, .subsection-content');
        const isAnyHidden = [...sections].some(s => s.style.display === 'none');
        
        sections.forEach(section => {
            section.style.display = isAnyHidden ? 'grid' : 'none';
        });

        // Aktualizacja przycisków toggle
        document.querySelectorAll('.section-toggle').forEach(btn => {
            btn.innerHTML = isAnyHidden ? '&#8722;' : '&#43;';
        });
    });

    // Obsługa zmiany motywu
    document.getElementById('toggle-theme').addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    });

    // Przywróć zapisany motyw
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-theme');
    }

    // Nasłuchuj zdarzenia załadowania nowej wycieczki
    document.addEventListener('tripLoaded', (e) => {
        const tripData = e.detail.data;
        
        // Aktualizacja mapy
        MapHandler.updateMap(tripData.sections);
        
        // Inicjalizacja Fancybox po załadowaniu nowych zdjęć
        setTimeout(() => {
            Fancybox.destroy();
            Fancybox.bind("[data-fancybox]", {
                Thumbs: false,
                Toolbar: true
            });
        }, 500);
    });

    // Debugowanie - logowanie zdarzeń
    console.log('Aplikacja została poprawnie zainicjalizowana');
});

// Obsługa błędów
window.addEventListener('error', (e) => {
    console.error('Globalny błąd:', e.error);
});