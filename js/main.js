/**
 * Główny moduł aplikacji
 */
const App = (() => {
    /**
     * Inicjalizuje przełącznik motywu
     */
    const initThemeToggle = () => {
        const toggleButton = document.getElementById('toggle-theme');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                document.body.classList.toggle('light-theme');
                
                // Zapisanie preferencji motywu w localStorage
                const isDarkTheme = !document.body.classList.contains('light-theme');
                localStorage.setItem('darkTheme', isDarkTheme);
                
                // Aktualizacja tekstu przycisku
                toggleButton.textContent = isDarkTheme ? 'Jasny motyw' : 'Ciemny motyw';
            });
            
            // Sprawdzenie zapisanego motywu przy ładowaniu
            const savedDarkTheme = localStorage.getItem('darkTheme');
            if (savedDarkTheme === 'false') {
                document.body.classList.add('light-theme');
                toggleButton.textContent = 'Ciemny motyw';
            } else {
                toggleButton.textContent = 'Jasny motyw';
            }
        }
    };

    /**
     * Inicjalizuje aplikację
     */
document.getElementById('toggle-all-sections').addEventListener('click', () => {
    const allContents = document.querySelectorAll('.section-content, .subsection-content');
    const isAnyVisible = Array.from(allContents).some(c => c.style.display !== 'none');
    
    allContents.forEach(content => {
        content.style.display = isAnyVisible ? 'none' : 'grid';
    });
    
    document.querySelectorAll('.section-toggle').forEach(btn => {
        btn.innerHTML = isAnyVisible ? '&#43;' : '&#8722;';
    });
});
    const init = () => {
        document.addEventListener('DOMContentLoaded', () => {
            initThemeToggle();
            
            // Inicjalizacja wszystkich modułów
            ContentLoader.init();
            GalleryHandler.init();
            MapHandler.init();
            PlannerHandler.init();
            
            console.log('Aplikacja została zainicjowana pomyślnie!');
        });
    };

    return {
        init
    };
})();

// Inicjalizacja aplikacji
App.init();