<template>
  <div class="map-page">
    <map-app />
  </div>
</template>
<script setup lang="ts">
import mapApp from "@/components/Map.vue";
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
