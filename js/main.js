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