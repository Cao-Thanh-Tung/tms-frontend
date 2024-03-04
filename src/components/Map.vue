<template>
  <div class="map-app">
    <!-- <div class="controls">
      <input
        ref="searchInput"
        class="control-input"
        placeholder="Search..."
        type="text"
        @input="handleSearchInput"
      />
      <button class="control-button" @click="searchLocation">Search</button>
      <button class="control-button" @click="drawPolygon">Polygon</button>
      <button class="control-button" @click="route">Route</button>
    </div> -->
    <!-- 
    <div class="search-results" v-if="showSearchResults">
      <div
        class="search-result"
        v-for="result in searchResults"
        :key="result.formatted"
        @click="navigateToResult(result.lat, result.lon)"
      >
        <div><strong>Name:</strong> {{ result.name }}</div>
        <div><strong>Country:</strong> {{ result.country }}</div>
        <div><strong>City:</strong> {{ result.city }}</div>
        <div><strong>Address:</strong> {{ result.formatted }}</div>
      </div>
    </div> -->
    <div ref="mapContainer" class="map-container">
      <div id="coordinatesDisplay" class="coordinates-display">
        {{ coordinatesDisplay }}
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
// using ant-design-vue
import { onMounted, ref, defineProps } from 'vue';
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import concaveman from "concaveman";
// import { anyType } from "ant-design-vue/es/_util/type";
interface SearchResults {
  name: string;
  country: string;
  city: string;
  formatted: string;
  lat: number;
  lon: number;
}
const lat = ref(0);
const lng = ref(0);

const map = ref<L.Map | null>(null);
const mapContainer = ref();
const polygonLayer = ref<L.Polygon | null>(null);
const url = "https://nominatim.openstreetmap.org/search";
const autocomplete_url = "https://api.geoapify.com/v1/geocode/autocomplete";
const geoapify_api_key = "9a7f9b6701a449e8a97f9cad0d22125e";
const searchInput = ref();
const searchResults = ref<SearchResults[]>([]);
let searchTimeout: NodeJS.Timeout | null = null;
const coordinatesDisplay = ref(""); // initialize with empty string or whatever default value you want
const reversedCoordinates = ref<L.LatLngExpression[]>([]);
const showSearchResults = ref(true);
const createMarker = (lat: number, lng: number, draggable = false) => {
  const marker = L.marker([lat, lng], { draggable });
  if (draggable) {
    marker.on("dragend", (event: L.DragEndEvent) => {
      const { lat, lng } = event.target.getLatLng();
      displayCoordinates(lat, lng);
    });
  }
  marker.on("dblclick", () => {
    if (map && map.value) {
      map.value.removeLayer(marker);
    }
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

  getLocation();
  map.value.on("mousemove", (event: L.LeafletMouseEvent) => {
    const { lat, lng } = event.latlng;
    displayCoordinates(lat, lng);
    if (map.value) {
      map.value.eachLayer((layer: L.Layer) => {
        if (layer instanceof L.Marker) {
          if (layer.isPopupOpen()) {
            layer.closePopup();
          }
          if (
            layer.getLatLng().lat === lat &&
            layer.getLatLng().lng === lng
          ) {
            layer.openPopup();
          }
        }
      });
    }
  });

  map.value.on("dblclick", function (e: L.LeafletMouseEvent) {
    if (map.value) {
      createMarker(e.latlng.lat, e.latlng.lng).addTo(map.value as L.Map);
    }
  });
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
        searchResults.value = data.features.map(
          (feature: any) => feature.properties
        );
        console.log(searchResults.value);
        showSearchResults.value = true;
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
      if (map.value) map.value.setView([lat.value, lng.value], 13);
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
  const { lat, lon } = data[0];
  const geojson = data[0].geojson;
  try {
    const coordinates = geojson.coordinates[0];
    reversedCoordinates.value = coordinates.map((coordinate: number[]) => [
      coordinate[1],
      coordinate[0],
    ]);
    if (map.value) {
      L.polygon(reversedCoordinates.value, { color: "red" }).addTo(
        map.value as L.Map
      );
    }
  } catch (e) {
    console.log(e);
  }
  if (map.value) {
    map.value.setView([lat, lon], 13);
    createMarker(lat, lon, true).addTo(map.value as L.Map);
    L.marker([lat, lon])
      .addTo(map.value as L.Map)
      .bindPopup(`<b>Địa chỉ:</b> ${data[0].display_name}`)
      .openPopup();
  }
};
const displayCoordinates = (lat: number, lng: number) => {
  const coordinatesDisplay = document.getElementById("coordinatesDisplay");
  if (coordinatesDisplay)
    coordinatesDisplay.innerHTML = `Lat: ${lat} Lng: ${lng}`;
};
// const displayGrid = () => {
//   const gridSize = 0.0045; //0.0045 ~ 500m
//   const minLat = 20.5645154;
//   const maxLat = 21.3852777;
//   const minLng = 105.2889615;
//   const maxLng = 106.0200725;
//   const data = {
//     locations: [],
//   };
//   for (let i = minLat; i < maxLat; i += gridSize) {
//     for (let j = minLng; j < maxLng; j += gridSize) {
//       data.locations.push([
//         parseFloat(j.toFixed(12)),
//         parseFloat(i.toFixed(12)),
//       ]); // bottom left
//       data.locations.push([
//         parseFloat((j + gridSize).toFixed(12)),
//         parseFloat(i.toFixed(12)),
//       ]); // bottom right
//       data.locations.push([
//         parseFloat(j.toFixed(12)),
//         parseFloat((i + gridSize).toFixed(12)),
//       ]); // top left
//       data.locations.push([
//         parseFloat((j + gridSize).toFixed(12)),
//         parseFloat((i + gridSize).toFixed(12)),
//       ]); // top right
//     }
//   }

//   const uniqueLocations = data.locations.filter(
//     (v: number[], i: number, a: number[][]) =>
//       a.findIndex((t) => t[0] === v[0] && t[1] === v[1]) === i
//   );

//   console.log(uniqueLocations.length);
// };

const drawPolygon = () => {
  const markers: L.Marker[] = [];
  if (!map.value) return;
  map.value.eachLayer((layer: L.Layer) => {
    if (layer instanceof L.Marker) {
      markers.push(layer);
    }
  });

  const points = markers.map((marker) =>
    Object.values(marker.getLatLng()).reverse()
  );

  const concaveHull = concaveman(points);

  const latLngs = concaveHull.map(
    (point) => point.reverse() as L.LatLngTuple
  );
  polygonLayer.value = L.polygon(latLngs, { color: "red" }).addTo(
    map.value as L.Map
  );
  console.log(polygonLayer.value);
};

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
const navigateToResult = (lat: number, lon: number) => {
  if (map.value) {
    map.value.setView([lat, lon], 13);
    createMarker(lat, lon).addTo(map.value as L.Map);
  }
  showSearchResults.value = false;
};
const route = () => {
  const markers: L.Marker[] = [];
  if (map.value) {
    map.value.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Marker) {
        markers.push(layer);
      }
    });
  }
  // const waypoints = markers.map((marker) => marker.getLatLng());
  // L.Routing.control({
  //   waypoints,
  //   routeWhileDragging: true,
  //   showAlternatives: false,
  //   lineOptions: {
  //     styles: [{ color: "red", opacity: 1, weight: 2 }],
  //   },
  //   formatter: new L.Routing.Formatter({
  //     units: "metric",
  //     show: false,
  //     formatInstruction: function (
  //       instruction,
  //       distances,
  //       totalTime,
  //       formatter
  //     ) {
  //       // Customize the instruction text here
  //       // instruction is an object representing the current routing instruction
  //       // distances is an object representing the total and remaining distances of the route
  //       // totalTime is the total time of the route in seconds
  //       // formatter is an instance of L.Routing.Formatter for formatting distances and times
  //       return instruction.text;
  //     },
  //   }),
  // }).addTo(map.value);
};
</script>

<style scoped>
.map-app {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
}

.controls {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #f5f5f5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.control-input,
.control-button {
  margin-right: 10px;
  padding: 5px 10px;
  border: none;
  border-radius: 3px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.control-button {
  cursor: pointer;
  transition: background-color 0.3s;
}

.control-button:hover {
  background-color: #f0f0f0;
}

.search-results {
  max-height: 200px;
  overflow-y: auto;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-result {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-result:hover {
  background-color: #f0f0f0;
}

.map-container {
  flex-grow: 1;
  position: relative;
}

.coordinates-display {
  position: absolute;
  bottom: 10px;
  left: 10px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
