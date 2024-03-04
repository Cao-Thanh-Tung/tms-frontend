<template>
    <div class="map-app">
        <div ref="mapContainer" class="map-container">
            <div id="coordinatesDisplay" class="coordinates-display">
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
// using ant-design-vue
import { onMounted, ref } from 'vue';
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";

export interface Coord {
    lat: number,
    lng: number,
}
const props = withDefaults(defineProps<Coord>(), {
    lat: 0, lng: 0
});
const marker = ref<L.Marker>();
const map = ref<L.Map | null>(null);
const mapContainer = ref();

const createMap = () => {
    const mapInstance = L.map(mapContainer.value, {
        doubleClickZoom: false,
    }).setView([props.lat, props.lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
    }).addTo(mapInstance);
    return mapInstance;
};
onMounted(() => {
    map.value = createMap();
    map.value.on("dblclick", function (e: L.LeafletMouseEvent) {
        if (map.value) {
            if (marker.value) {
                map.value.removeLayer(marker.value);
            }
            marker.value = L.marker([e.latlng.lat, e.latlng.lng], { draggable: false });
            marker.value!.addTo(map.value as L.Map);
        }
    });
});
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
  