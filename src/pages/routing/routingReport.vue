import { ScheduleDTO, ScheduleResourceApi } from '../../api';
<script setup lang="ts"></script>
<template>
    <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item>Phân tuyến</a-breadcrumb-item>
        <a-breadcrumb-item>Báo cáo phân tuyến</a-breadcrumb-item>
    </a-breadcrumb>
    <a-layout-content :style="{
        background: '#fff',
        padding: '24px',
        margin: 0,
        minHeight: '280px',
    }">
        Comming soon
    </a-layout-content>
</template>
<script lang="ts" setup>
import { ScheduleDTO, ScheduleResourceApi } from "../../api";
import { Configuration } from "../../configuration";
import { ref,onMounted } from 'vue';
import store from "../../store";

const config = new Configuration({
  accessToken: () => store.getters.jwt,
});
console.log(config);
const scheduleResourceApi = new ScheduleResourceApi(config);

const scheduleList = ref([] as ScheduleDTO[]);

onMounted(() => {
  fetchSchedules();
});
const fetchSchedules = ()=>{
  scheduleResourceApi.getAllSchedules().then((res) => {
    scheduleList.value = res.data;
    console.log(scheduleList.value);
  });
}
</script>
<style scoped></style>
