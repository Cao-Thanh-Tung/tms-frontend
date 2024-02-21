import L from "leaflet";
import {map} from "./Map.vue";

export const route = () => {
    const markers: L.Marker[] = [];
    map.value.eachLayer((layer: L.Layer) => {
        if (layer instanceof L.Marker) {
            markers.push(layer);
        }
    });
    const waypoints = markers.map((marker) => marker.getLatLng());
    L.Routing.control({
        waypoints,
// không cần chỉ dẫn đường
// router: new L.Routing.OSRMv1({
    }).addTo(map.value);

};
