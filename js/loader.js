async function loadTrips() {
    const tripsDir = 'trips';
    const response = await fetch(`${tripsDir}/`);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    const links = doc.querySelectorAll('a');
    const trips = [];

    for (const link of links) {
        const tripDir = link.href.split('/').pop();
        if (tripDir) {
            const tripPath = `${tripsDir}/${tripDir}/trip.yaml`;
            const tripDataResponse = await fetch(tripPath);
            if (tripDataResponse.ok) {
                const tripDataText = await tripDataResponse.text();
                const trip = jsyaml.load(tripDataText);
                trip.id = tripDir;
                trips.push(trip);
            }
        }
    }

    return trips;
}

window.onload = () => {
    loadTrips().then(trips => {
        renderNavigation(trips);
    });
};