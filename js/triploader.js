async function loadTrip(tripFolder) {
    try {
        const response = await fetch(`trips/${tripFolder}/trip.yaml`);
        const yamlText = await response.text();
        const tripData = jsyaml.load(yamlText);
        return tripData;
    } catch (error) {
        console.error('Błąd ładowania danych wycieczki:', error);
        return null;
    }
}

async function loadTripsList() {
    try {
        const response = await fetch('trips/index.json');
        const tripsList = await response.json();
        return tripsList;
    } catch (error) {
        console.error('Błąd ładowania listy wycieczek:', error);
        return [];
    }
}