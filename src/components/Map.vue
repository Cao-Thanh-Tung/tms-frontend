<script setup lang ="ts">
import { onMounted, ref } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const lat = ref(0);
const lng = ref(0);
const map = ref();
const mapContainer = ref();
const url = "https://nominatim.openstreetmap.org/search";
var reversedCoordinates: number[][] = [];
const createMarker = (lat:number, lng:number, draggable = false) => {
    const marker = L.marker([lat, lng], { draggable });
    if (draggable) {
        marker.on("dragend", (event:Event) => {
            console.log(event);
        });
    }
    return marker;
};

const createMap = () => {
    const mapInstance = L.map(mapContainer.value).setView([lat.value, lng.value], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors",
        maxZoom: 18,
    }).addTo(mapInstance);
    return mapInstance;
};

onMounted(() => {
    map.value = createMap();
    createMarker(lat.value, lng.value, true).addTo(map.value);
    L.circle([lat.value, lng.value], {
        color: "red",
        fillColor: "#f03",
        fillOpacity: 0.5,
        radius: 500,
    }).addTo(map.value);
    map.value.on("mousemove", (event: L.LeafletMouseEvent) => {
        const { lat, lng } = event.latlng;
        displayCoordinates(lat, lng);
    });

    map.value.on('dblclick', function (e: L.LeafletMouseEvent) {
        createMarker(e.latlng.lat, e.latlng.lng).addTo(map.value);
    });

});

const getLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition((position) => {
            lat.value = position.coords.latitude;
            lng.value = position.coords.longitude;
            map.value.setView([lat.value, lng.value], 13);
        });
    }
    
};
const searchLocation = () => {
    const search = document.querySelector("input");
    if(search)
        fetch(`${url}?q=${search.value}&format=json&addressdetails=1&limit=1&polygon_geojson=1&bounded=1`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                const { lat, lon } = data[0];
                const geojson = data[0].geojson;
                const coordinates = geojson.coordinates[0];
                reversedCoordinates = coordinates.map((coordinate:number[]) => [coordinate[1], coordinate[0]]);
                L.polygon(reversedCoordinates, { color: "red" }).addTo(map.value);
                map.value.setView([lat, lon], 13);
                createMarker(lat, lon, true).addTo(map.value);
                L.marker([lat, lon])
                    .addTo(map.value)
                    .bindPopup(`<b>Địa chỉ:</b> ${data[0].display_name}`)
                    .openPopup();
            })
            .catch((error) => {
                console.error('There has been a problem with your fetch operation:', error);
            });
}
const getDirection = () => {
    map.value.eachLayer((layer:L.Layer) => {
        if (layer instanceof L.Marker) {
            console.log(layer.getLatLng());
        }
    });
};
const displayCoordinates = (lat:number, lng:number) => {
    const coordinatesDisplay = document.getElementById("coordinatesDisplay");
    if (coordinatesDisplay)
        coordinatesDisplay.innerHTML = `Lat: ${lat} Lng: ${lng}`;
};
const displayGrid = () =>{

    console.log("Grid");
    console.log(lat.value);
    console.log(lng.value);
    const gridSize = 0.0045; //0.0045 ~ 500m
    // for Hà Nội:20.5645154 21.3852777 105.2889615 106.0200725
    const minLat = Math.min(...reversedCoordinates.map((coordinate:number[]) => coordinate[0]));
    const maxLat = Math.max(...reversedCoordinates.map((coordinate:number[]) => coordinate[0]));
    const minLng = Math.min(...reversedCoordinates.map((coordinate:number[]) => coordinate[1]));
    const maxLng = Math.max(...reversedCoordinates.map((coordinate:number[]) => coordinate[1]));
    console.log(minLat, maxLat, minLng, maxLng);
    // lưu vào file data.json
    const data = {
        locations: []
    };
    for (let i = minLat; i < maxLat; i += gridSize) {
        for (let j = minLng; j < maxLng; j += gridSize) {
            //show grid
            // L.rectangle([[i, j], [i + gridSize, j + gridSize]], { color: "red" }).addTo(map.value);
            //  save to file
            data.locations.push({
                lat: i+gridSize/2,
                lng: j+gridSize/2
            });
        }
    }
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.json';
    link.click();
    console.log(data.locations.length);
}
getLocation();
</script>
<template>
    <div ref="mapContainer" style="height: 100vh; width: 100vw; position: relative;">
        <div style="position: absolute; top: 10px; left: 50px; z-index: 1000;">
            <input type="text" placeholder="Search..." />
            <button @click="searchLocation">Search</button>
            <button @click="getDirection">Direction</button>
            <button @click="displayGrid">Grid</button>
        </div>
        <div id="coordinatesDisplay" style="position: absolute; top: 50px; left: 50px; z-index: 1000; color: black;"></div>
    </div>
</template>
<style scoped></style>