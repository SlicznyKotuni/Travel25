async function loadTrip(tripFolder) {
  try {
    // Upewniamy się, że ścieżka jest określona względem katalogu głównego (index.html)
    const url = `./trips/${tripFolder}/trip.yaml`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error while fetching ${url}: ${response.status}`);
    }
    const yamlText = await response.text();
    const tripData = jsyaml.load(yamlText);
    if (!tripData) {
      throw new Error("YAML parsing failed");
    }
    return tripData;
  } catch (error) {
    console.error("Error loading trip:", error);
    return null;
  }
}

async function loadTripsList() {
  try {
    const response = await fetch('./trips/index.json');
    if (!response.ok) {
      throw new Error(`HTTP error while fetching trips list: ${response.status}`);
    }
    const tripsList = await response.json();
    if (!tripsList || !Array.isArray(tripsList)) {
      throw new Error("Trips list is invalid");
    }
    return tripsList;
  } catch (error) {
    console.error("Error loading trips list:", error);
    return [];
  }
}