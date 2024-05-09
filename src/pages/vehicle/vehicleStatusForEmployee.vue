<script setup lang="ts"></script>
<template>
  <a-breadcrumb style="margin: 16px 0">
    <a-breadcrumb-item>Quản lý xe</a-breadcrumb-item>
    <a-breadcrumb-item>Tình trạng xe</a-breadcrumb-item>
  </a-breadcrumb>
  <a-layout-content
    :style="{
      background: '#fff',
      padding: '24px',
      margin: 0,
      minHeight: '280px',
    }"
  >
    Tình trạng xe
    <modal open="Add New" title="Add New Employee"> Comming soon </modal>
  </a-layout-content>
  <!-- <a-button @click="testPush">Test</a-button> -->
</template>
<script lang="ts" setup>
// import { UserOutlined, LaptopOutlined, NotificationOutlined } from '@ant-design/icons-vue';
import { useRouter } from "vue-router";
const router = useRouter();

const testPush = () => {
  router
    .push(`/employee/solution`)
    .then(() => {
      console.log("Navigation to /employee/solution was successful!");
    })
    .catch((error) => {
      console.error("Navigation failed!", error);
    });
};
</script>
<style scoped></style>
