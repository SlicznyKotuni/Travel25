/**
 * Główny plik JavaScript aplikacji Travel25
 * Inicjalizuje wszystkie moduły i zarządza ich współdziałaniem
 */

// Poczekaj na załadowanie DOM
document.addEventListener('DOMContentLoaded', () => {
    // Inicjalizacja podstawowych modułów
    ContentLoader.init();
    MapHandler.init();
    
    // Inicjalizacja opcjonalnych modułów (sprawdź czy istnieją)
    if (typeof Planner !== 'undefined') {
        Planner.init();
    }
    
    if (typeof PDFExport !== 'undefined') {
        PDFExport.init();
    }

    // Inicjalizacja Fancybox dla galerii zdjęć
    if (typeof Fancybox !== 'undefined') {
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

    // Obsługa przycisku zamykania/otwierania sekcji
    const toggleAllBtn = document.getElementById('toggle-all-sections');
    if (toggleAllBtn) {
        toggleAllBtn.addEventListener('click', () => {
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
    }

    // Dodaj obsługę przycisków zwijania dla poszczególnych sekcji
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('section-toggle')) {
            const sectionId = e.target.getAttribute('data-section-id');
            const sectionContent = document.getElementById(`section-content-${sectionId}`);
            
            if (sectionContent) {
                const isVisible = sectionContent.style.display !== 'none';
                sectionContent.style.display = isVisible ? 'none' : 'grid';
                e.target.innerHTML = isVisible ? '&#43;' : '&#8722;';
            }
        }
    });

    // Obsługa zmiany motywu
    const themeToggle = document.getElementById('toggle-theme');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
        });
    }

    // Przywróć zapisany motyw
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-theme');
    }

    // Globalny handler błędów
    window.onerror = function(message, source, lineno, colno, error) {
        console.error('Globalny błąd:', error);
    };
});
