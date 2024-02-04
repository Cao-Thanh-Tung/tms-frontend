<script lang="ts" setup>
import {onMounted, ref} from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import concaveman from 'concaveman';

const lat = ref(0);
const lng = ref(0);
const map = ref();
const mapContainer = ref();
const polygonLayer = ref<L.Polygon | null>(null);
const url = "https://nominatim.openstreetmap.org/search";
const autocomplete_url = "https://api.geoapify.com/v1/geocode/autocomplete"
const geoapify_api_key = "9a7f9b6701a449e8a97f9cad0d22125e"
const searchInput = ref();
const searchResults = ref([]);
let searchTimeout: NodeJS.Timeout | null = null;
var reversedCoordinates: number[][] = [];
const createMarker = (lat: number, lng: number, draggable = false) => {
  const marker = L.marker([lat, lng], {draggable});
  if (draggable) {
    marker.on("dragend", (event: L.DragEndEvent) => {
      const {lat, lng} = event.target.getLatLng();
      displayCoordinates(lat, lng);
    });
  }
  marker.on("dblclick", () => {
    map.value.removeLayer(marker);
  });
  return marker;
};

const createMap = () => {
  const mapInstance = L.map(mapContainer.value, {
    doubleClickZoom: false, // Disable double-click zoom
  }).setView([lat.value, lng.value], 13);


  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
        "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors",
    maxZoom: 18,
  }).addTo(mapInstance);
  return mapInstance;
};

onMounted(() => {
  map.value = createMap();

  getLocation()
  map.value.on("mousemove", (event: L.LeafletMouseEvent) => {
    const {lat, lng} = event.latlng;
    displayCoordinates(lat, lng);
    map.value.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        if (layer.isPopupOpen()) {
          layer.closePopup();
        }
        if (layer.getLatLng().lat === lat && layer.getLatLng().lng === lng) {
          layer.openPopup();
        }
      }
    });
  });

  map.value.on("dblclick", function (e: L.LeafletMouseEvent) {
    createMarker(e.latlng.lat, e.latlng.lng).addTo(map.value);
  });
  searchInput.value.addEventListener('input', handleSearchInput);
});
const handleSearchInput = async () => {
  const searchText = searchInput.value.value;
  if (searchText) {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    searchTimeout = setTimeout(async () => {
      try {
        const response = await fetch(
            `${autocomplete_url}?text=${searchText}&apiKey=${geoapify_api_key}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        searchResults.value = data.features.map(feature => feature.properties);
        console.log(searchResults.value);
      } catch (error) {
        console.error(
            "There has been a problem with your fetch operation:",
            error
        );
      }
    }, 500); // delay of 500ms
  }
};
const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
      lat.value = position.coords.latitude;
      lng.value = position.coords.longitude;
      map.value.setView([lat.value, lng.value], 13);
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
};
const searchLocation = async () => {
  const search = document.querySelector("input");
  if (search) {
    try {
      const response = await fetch(
          `${url}?q=${search.value}&format=json&addressdetails=1&limit=1&polygon_geojson=1&bounded=1`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      updateMapWithSearchResults(data);
    } catch (error) {
      console.error(
          "There has been a problem with your fetch operation:",
          error
      );
    }
  }
};
const updateMapWithSearchResults = (data: any) => {
  const {lat, lon} = data[0];
  const geojson = data[0].geojson;
  try {
    const coordinates = geojson.coordinates[0];
    reversedCoordinates.value = coordinates.map((coordinate: number[]) => [
      coordinate[1],
      coordinate[0],
    ]);
    L.polygon(reversedCoordinates.value, {color: "red"}).addTo(map.value);
  } catch (e) {
    console.log(e);
  }
  map.value.setView([lat, lon], 13);
  createMarker(lat, lon, true).addTo(map.value);
  L.marker([lat, lon])
      .addTo(map.value)
      .bindPopup(`<b>Địa chỉ:</b> ${data[0].display_name}`)
      .openPopup();
};
const displayCoordinates = (lat: number, lng: number) => {
  const coordinatesDisplay = document.getElementById("coordinatesDisplay");
  if (coordinatesDisplay)
    coordinatesDisplay.innerHTML = `Lat: ${lat} Lng: ${lng}`;
};
const displayGrid = () => {
  const gridSize = 0.0045; //0.0045 ~ 500m
  const minLat = 20.5645154000;
  const maxLat = 21.3852777000;
  const minLng = 105.2889615000;
  const maxLng = 106.0200725000;
  const data = {
    locations: [],
  };
  for (let i = minLat; i < maxLat; i += gridSize) {
    for (let j = minLng; j < maxLng; j += gridSize) {
      data.locations.push([parseFloat((j).toFixed(12)), parseFloat((i).toFixed(12))]); // bottom left
      data.locations.push([parseFloat((j + gridSize).toFixed(12)), parseFloat((i).toFixed(12))]); // bottom right
      data.locations.push([parseFloat((j).toFixed(12)), parseFloat((i + gridSize).toFixed(12))]); // top left
      data.locations.push([parseFloat((j + gridSize).toFixed(12)), parseFloat((i + gridSize).toFixed(12))]); // top right
    }
  }

  const uniqueLocations = data.locations.filter(
      (v: number[], i: number, a: number[][]) =>
          a.findIndex((t) => t[0] === v[0] && t[1] === v[1]) === i
  );

  console.log(uniqueLocations.length);

};


const drawPolygon = () => {
  const markers: L.Marker[] = [];
  map.value.eachLayer((layer: L.Layer) => {
    if (layer instanceof L.Marker) {
      markers.push(layer);
    }
  });

  const points = markers.map(marker => Object.values(marker.getLatLng()).reverse());

  const concaveHull = concaveman(points);
  //for convex hull do:
  //const convexHull = getConvexHull(markers);
  //const latLngs = convexHull.map(([lng, lat]) => [lat, lng]);

  const latLngs = concaveHull.map(([lng, lat]) => [lat, lng]);

  if (polygonLayer.value) {
    map.value.removeLayer(polygonLayer.value);
  }

  polygonLayer.value = L.polygon(latLngs, {color: 'red'}).addTo(map.value);
};

/*
getConvexHull function using jarvis march algorithm(bao lồi)
https://en.wikipedia.org/wiki/Gift_wrapping_algorithm
*/
function getConvexHull(markers: L.Marker[]) {
  markers.sort((a, b) => a.getLatLng().lng - b.getLatLng().lng);

  const output = [];
  const leftMost = markers[0];
  let current = leftMost;
  output.push(current);
  let next;

  do {
    next = markers[(markers.indexOf(current) + 1) % markers.length];
    for (let i = 0; i < markers.length; i++) {
      const p = markers[i];
      const direction =
          (next.getLatLng().lng - current.getLatLng().lng) *
          (p.getLatLng().lat - current.getLatLng().lat) -
          (next.getLatLng().lat - current.getLatLng().lat) *
          (p.getLatLng().lng - current.getLatLng().lng);
      if (direction < 0) {
        next = p;
      }
    }
    current = next;
    output.push(current);
  } while (current !== leftMost);

  return output;
}

const route = () => {
  const markers: L.Marker[] = [];
  map.value.eachLayer((layer: L.Layer) => {
    if (layer instanceof L.Marker) {
      markers.push(layer);
    }
  });
  const waypoints = markers.map((marker) => marker.getLatLng());
  L.Routing.control({
    waypoints,
    routeWhileDragging: true,
    showAlternatives: false,
    lineOptions: {
      styles: [{color: "red", opacity: 1, weight: 2}],
    },
    formatter: new L.Routing.Formatter({
      units: "metric",
      show: false,
      formatInstruction: function (
          instruction,
          distances,
          totalTime,
          formatter
      ) {
        // Customize the instruction text here
        // instruction is an object representing the current routing instruction
        // distances is an object representing the total and remaining distances of the route
        // totalTime is the total time of the route in seconds
        // formatter is an instance of L.Routing.Formatter for formatting distances and times
        return instruction.text;
      },
    }),
  }).addTo(map.value);
};

</script>
<template>
  <div class="controls">
    <input
        ref="searchInput"
        class="control-input"
        placeholder="Search..."
        type="text"
    />
    <button
        class="control-button"
        @click="searchLocation"
    >
      Search
    </button>
    <button
        class="control-button"
        @click="displayGrid"
    >
      Grid
    </button>
    <button
        class="control-button"
        @click="drawPolygon"
    >
      Polygon
    </button>
    <button
        class="control-button"
        @click="route"
    >
      Route
    </button>
  </div>

<div class="search-results" v-if="searchResults.length">
  <div class="search-result" v-for="result in searchResults"
       :key="result.formatted"
       @click="navigateToResult(result.lat, result.lon)"
  >
    <div><strong>Name:</strong> {{ result.name }}</div>
    <div><strong>Country:</strong> {{ result.country }}</div>
    <div><strong>City:</strong> {{ result.city }}</div>
    <div><strong>Address:</strong> {{ result.formatted }}</div>
  </div>
</div>
  <div ref="mapContainer" class="map-container">
    <div id="coordinatesDisplay" class="coordinates-display"></div>
  </div>
</template>
<style scoped>
.map-container {
  height: 95vh;
  width: 95vw;
  position: relative;
  font: inherit;
  font-size: 14px;
}

.controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 3px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
}

.control-input,
.control-button {
  display: block;
  margin-bottom: 5px;
  padding: 10px;
  border: none;
  border-radius: 3px;
  font-size: 14px;
}

.control-input {
  width: 200px;
}

.control-button {
  width: 100%;
  background-color: #4285f4;
  color: white;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.36);
  transition: all 0.3s cubic-bezier(.25, .8, .25, 1);
}

.control-button:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25), 0 2px 3px rgba(0, 0, 0, 0.22);
}

.coordinates-display {
  position: absolute;
  bottom: 10px;
  left: 10px;
  z-index: 1000;
  color: black;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 5px;
  border-radius: 3px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
}

.search-results {
  position: absolute;
  top: 250px; /* Adjust this value as needed */
  left: 0;
  width: 200px; /* Match the width of the search input */
  max-height: 200px; /* Limit the height of the search results */
  overflow-y: auto; /* Make the search results scrollable */
  background: white;
  border: 1px solid #ccc;
  border-radius: 3px;
  color: black;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;

}

.search-result {
  padding: 10px;
  cursor: pointer;
}

.search-result:hover {
  background: #eee;
}
</style>