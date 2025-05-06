async function loadTrip(tripFolder) {
    try {
        const response = await fetch(`trips/${tripFolder}/trip.yaml`);

        if (!response.ok) {
            throw new Error(`Błąd HTTP: ${response.status}`);
        }

        const yamlText = await response.text();
        const tripData = jsyaml.load(yamlText);

        if (!tripData) {
            throw new Error("Błąd: Nie udało się sparsować YAML.");
        }

        return tripData;
    } catch (error) {
        console.error('Błąd ładowania danych wycieczki:', error);
        return null;
    }
}

async function loadTripsList() {
    try {
        const response = await fetch('trips/index.json');

        if (!response.ok) {
            throw new Error(`Błąd HTTP: ${response.status}`);
        }

        const tripsList = await response.json();

        if (!tripsList || !Array.isArray(tripsList)) {
            throw new Error("Błąd: Nie udało się sparsować JSON lub lista wycieczek jest niepoprawna.");
        }

        return tripsList;
    } catch (error) {
        console.error('Błąd ładowania listy wycieczek:', error);
        return [];
    }
}