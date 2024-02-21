<template>
  <div>
    <a-breadcrumb style="margin: 16px 0">
      <a-breadcrumb-item>Phân tuyến</a-breadcrumb-item>
      <a-breadcrumb-item>Phân tuyến tự động</a-breadcrumb-item>
    </a-breadcrumb>

    <a-dropdown trigger="click">
      <a-button type="primary" @click="clickSetup">
        Cài đặt <DownOutlined />
      </a-button>
      <a-menu slot="overlay">
        <a-menu-item @click="setupOrdersHandler"
          >Thiết lập đơn hàng</a-menu-item
        >
        <a-menu-item @click="setupVehiclesHandler">Thiết lập xe</a-menu-item>
        <a-menu-item @click="configureAlgorithmHandler"
          >Cấu hình thuật toán</a-menu-item
        >
        <a-menu-item @click="viewResultsHandler">Xem kết quả</a-menu-item>
      </a-menu>
    </a-dropdown>

    <map-app />
  </div>
</template>

<script setup lang="ts">
import mapApp from "@/components/Map.vue";
import { DownOutlined } from "@ant-design/icons-vue";
const clickSetup = () => {
  console.log("setup");
};
const setupOrdersHandler = () => {
  console.log("Setting up order");
};

const setupVehiclesHandler = () => {
  // Logic for setting up vehicles
};

const configureAlgorithmHandler = () => {
  // Logic for configuring algorithms
};

const viewResultsHandler = () => {
  // Logic for viewing results
};
</script>

<style scoped></style>
