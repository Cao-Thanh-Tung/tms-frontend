<template>
  <div class="map-app" style="display: flex; width: 100%; height: 100%">
    <div ref="mapContainer" class="map-container">
      <div id="coordinatesDisplay" class="coordinates-display"></div>
    </div>
    <div class="leaflet-control-layers-separator"></div>
  </div>
</template>

<script setup lang="ts">
// using ant-design-vue
import { onMounted, ref, watch } from "vue";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.control.layers.tree/L.Control.Layers.Tree.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
// import concaveman from "concaveman";
import "leaflet.control.layers.tree";
import { PositionDTO } from '../api';
// interface SearchResults {
//   name: string;
//   country: string;
//   city: string;
//   formatted: string;
//   lat: number;
//   lon: number;
// }
const props = defineProps<{
  vehiclePositonList: PositionDTO[];
  positionList: PositionDTO[];
}>();
watch(() => props.vehiclePositonList, (newVal) => {
  // make marker
  if (map.value) {
    map.value.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Marker) {
        map.value?.removeLayer(layer);
      }
    });
    newVal.forEach((position) => {
      if (map.value && position.lat && position.lng)
        createMarker(position.lat, position.lng).addTo(map.value as L.Map);
    });
  }
});
const getMarkerInfo = (position: PositionDTO, index: number) => {
  return `<b>Lat:</b> ${position.lat} <br> <b>Lng:</b> ${position.lng} <br> <b>Index:</b> ${index}`;
};
// hiển thị route từ positionList
let markers = [] as L.Marker[]; // Array to store the markers
watch(() => props.positionList, (newVal) => {
  console.log("newVal", newVal)
  if (map.value) {
  
    markers.forEach(marker => {
    if(map.value)
    map.value.removeLayer(marker)
    });
    markers = []; // Clear the markers array
    map.value.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Polyline || layer instanceof L.Marker) {
        map.value?.removeLayer(layer);
      }
    });
    if (newVal.length > 1) {
      const latlngs = newVal.map((position, index) => {
        if (!position.lat || !position.lng) return;
        const latlng = L.latLng(position.lat, position.lng);
        const marker = createMarker(position.lat, position.lng, true);
        marker.bindPopup(getMarkerInfo(position, index));
        marker.addTo(map.value as L.Map);
        markers.push(marker); // Add the marker to the array
        return latlng;
      });
      const control = L.Routing.control({
        waypoints: latlngs,
        routeWhileDragging: false,
        showInstructions: false,
        show: false,
      }).addTo(map.value as L.Map);
      map.value.fitBounds(control.getWaypoints());
    }
  }
});
// function createVehicleMarker(lat: number, lng: number) {
//   const icon = L.icon({
//     iconUrl: 'src/assets/car-placeholder.png', // Path to your image file
//     iconSize: [38, 38], // Size of the icon
//     iconAnchor: [22, 94], // Point of the icon which will correspond to marker's location
//     popupAnchor: [-3, -76] // Point from which the popup should open relative to the iconAnchor
//   });

//   return L.marker([lat, lng], { icon });
// }
//   return L.marker([lat, lng], { icon });
// }
const lat = ref(0);
const lng = ref(0);

const map = ref<L.Map | null>(null);
const mapContainer = ref();
// const polygonLayer = ref<L.Polygon | null>(null);
// const url = "https://nominatim.openstreetmap.org/search";
// const autocomplete_url = "https://api.geoapify.com/v1/geocode/autocomplete";
// const geoapify_api_key = "9a7f9b6701a449e8a97f9cad0d22125e";
// const searchInput = ref();
// const searchResults = ref<SearchResults[]>([]);
// let searchTimeout: NodeJS.Timeout | null = null;
// const coordinatesDisplay = ref(""); // initialize with empty string or whatever default value you want
// const reversedCoordinates = ref<L.LatLngExpression[]>([]);
// const showSearchResults = ref(true);
const createMarker = (lat: number, lng: number, draggable = true) => {
  const marker = L.marker([lat, lng], { draggable });
  let initialLatLng: L.LatLng;
  if (draggable) {
    marker.on("dragstart", () => {
      console.log("dragstart");
      initialLatLng = marker.getLatLng();
    });
    marker.on("dragend", (event: L.DragEndEvent) => {
      console.log("dragend");
      const { lat = 0, lng = 0 } = event.target.getLatLng();
      displayCoordinates(lat, lng);
      if (map && map.value) {
        map.value.eachLayer((layer) => {
          if (layer instanceof L.Marker && layer.getLatLng().equals(initialLatLng)) {
            if (map.value)
              map.value.removeLayer(layer);
          }
        });
      }
      createMarker(lat, lng).addTo(map.value as L.Map);
    });
    marker.on("drag", () => {
      console.log("drag")
    })
  }

  marker.on("dblclick", () => {
    if (map && map.value) {
      map.value.removeLayer(marker);
    }
  });
  marker.on("mouseover", () => {
    if (marker.isPopupOpen()) {
      marker.closePopup();
    }
    console.log("open popup");
    marker.bindPopup(`<b>Lat:</b> ${lat} <br> <b>Lng:</b> ${lng}`);
    marker.openPopup();
  });
  marker.on("mouseout", () => {
    if (marker.isPopupOpen()) {
      marker.closePopup();
    }
  });
  // open when click
  marker.on("click", () => {
    marker.openPopup();
  });
  marker.bindPopup(`<b>Lat:</b> ${lat} <br> <b>Lng:</b> ${lng}`);
  return marker;
};
const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "OpenStreetMap",
});
const gMm = L.tileLayer(
  "https://mt0.google.com/vt/lyrs=m&hl=vi&x={x}&y={y}&z={z}",
  {
    maxZoom: 19,
    attribution: "<a href='https://www.google.com/maps'>Google Maps</a>",
  }
);
const gMp = L.tileLayer(
  "https://mt0.google.com/vt/lyrs=p&hl=vi&x={x}&y={y}&z={z}",
  {
    maxZoom: 19,
    attribution: "<a href='https://www.google.com/maps'>Google Maps</a>",
  }
);
const gMs = L.tileLayer(
  "https://mt0.google.com/vt/lyrs=s&hl=vi&x={x}&y={y}&z={z}",
  {
    maxZoom: 19,
    attribution: "<a href='https://www.google.com/maps'>Google Maps</a>",
  }
);
const gMy = L.tileLayer(
  "https://mt0.google.com/vt/lyrs=y&hl=vi&x={x}&y={y}&z={z}",
  {
    maxZoom: 19,
    attribution: "<a href='https://www.google.com/maps'>Google Maps</a>",
  }
);
const gMr = L.tileLayer(
  "https://mt0.google.com/vt/lyrs=r&hl=vi&x={x}&y={y}&z={z}",
  {
    maxZoom: 19,
    attribution: "<a href='https://www.google.com/maps'>Google Maps</a>",
  }
);

const gMh = L.tileLayer(
  "https://mt0.google.com/vt/lyrs=h&hl=vi&x={x}&y={y}&z={z}",
  {
    maxZoom: 19,
    attribution: "<a href='https://www.google.com/maps'>Google Maps</a>",
  }
);
const createMap = () => {
  const mapInstance = L.map(mapContainer.value, {
    layers: [gMm],
    doubleClickZoom: false,
  }).setView([lat.value, lng.value], 13);

  var baseTree = {
    label: "Chọn bản đồ",
    children: [
      {
        label: "OpenStreetMap",
        children: [{ label: "OSM", layer: osm }],
      },
      {
        label: "Google Maps",
        children: [
          { label: "Road Map", layer: gMm },
          { label: "Satellite", layer: gMs },
          { label: "Hybrid", layer: gMh },
          { label: "Terrain", layer: gMp },
          { label: "Transit", layer: gMy },
          { label: "Altered Roadmap", layer: gMr },
        ],
      },
    ],
  };
  const treeOptions: L.Control.Layers.TreeOptions =
    {} as L.Control.Layers.TreeOptions;
  treeOptions.namedToggle = false;
  treeOptions.selectorBack = true;
  treeOptions.collapsed = true;

  L.control.layers.tree(baseTree, undefined, treeOptions).addTo(mapInstance);
  // const control = L.Routing.control({
  //   waypoints: [
  //     L.latLng(21.028511, 105.804817),
  //     L.latLng(21.028511, 105.41241),
  //     L.latLng(21.028511, 105.24234),
  //   ],
  //   routeWhileDragging: false,
  //   showInstructions: false,
  //   show: false,
  // }).addTo(mapInstance);
  return mapInstance;
};

onMounted(() => {
  map.value = createMap();
onMounted(() => {
  map.value = createMap();

  getLocation();
  map.value.on("mousemove", (event: L.LeafletMouseEvent) => {
    const { lat, lng } = event.latlng;
    displayCoordinates(lat, lng);
  });


  map.value.on("dblclick", function (e: L.LeafletMouseEvent) {
    if (map.value) {
      createMarker(e.latlng.lat, e.latlng.lng).addTo(map.value as L.Map);
    }
  });
});

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

const displayCoordinates = (lat: number, lng: number) => {
  const coordinatesDisplay = document.getElementById("coordinatesDisplay");
  if (coordinatesDisplay)
    coordinatesDisplay.innerHTML = `Lat: ${lat} Lng: ${lng}`;
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

.leaflet-layerstree-node {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px;
  margin: 5px;
  cursor: pointer;
}
</style>
