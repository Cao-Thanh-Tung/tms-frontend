<template>
    <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item>Phân tuyến</a-breadcrumb-item>
        <a-breadcrumb-item>Danh sách lập lịch</a-breadcrumb-item>
    </a-breadcrumb>
    <!-- bảng ScheduleDTO -->
    <a-layout-content :style="{
        background: '#fff',
        padding: '24px',
        margin: 0,
        minHeight: '280px',
    }">
        <a-table :columns="columns" :dataSource="scheduleList" rowKey="id">
            <!-- <template #name="text">
                <a @click="showDetail(text)">{{ text }}</a>
            </template>
            <template #action="text">
                <a-button type="primary" @click="showDetail(text)">Chi tiết</a-button>
            </template> -->
        </a-table>
    </a-layout-content>
</template>

<script setup lang="ts">
import { ScheduleDTO, ScheduleResourceApi, ScheduleInputResourceApi, ScheduleInputOrderResourceApi, ScheduleInputVehicleResourceApi } from "../../api";
import { Configuration } from "../../configuration";
import { ref, onMounted } from 'vue';
import store from "../../store";
const columns = [
    {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
    },
    {
        title: 'Tên lịch',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Ngày tạo',
        dataIndex: 'createdDate',
        key: 'createdDate',
    },
    {
        title: 'Ngày cập nhật',
        dataIndex: 'updatedDate',
        key: 'updatedDate',
    },
    {
        title: 'Hành động',
        key: 'action',
        slots: { customRender: 'action' },
    },
];
const config = new Configuration({
    accessToken: () => store.getters.jwt,
});
const user = store.getters.user;
const scheduleResourceApi = new ScheduleResourceApi(config);

const scheduleInputResourceApi = new ScheduleInputResourceApi(config);
const scheduleInputOrderResourceApi = new ScheduleInputOrderResourceApi(config);
const scheduleInputVehicleResourceApi = new ScheduleInputVehicleResourceApi(config);

const scheduleList = ref([] as ScheduleDTO[]);

onMounted(() => {
    fetchSchedules();
    scheduleList.value.forEach((schedule) => {
        if (schedule.id != undefined) {
            fetchScheduleInput(schedule.id);
            fetchScheduleInputOrder(schedule.id);
            fetchScheduleInputVehicle(schedule.id);
        }
    });
});
const fetchSchedules = () => {
    scheduleResourceApi.getAllSchedulesByEmployee(user.id).then((res) => {
        scheduleList.value = res.data;
        console.log(scheduleList.value);
    });
}
// const fetchSolverConfig = () => {
//     solverConfigResourceApi.getAllSolverConfigs().then((res) => {
//         console.log(res.data);
//     });
// }
const fetchScheduleInput = (_id?: number) => {
    scheduleInputResourceApi.getAllScheduleInputs().then((res) => {
        console.log(res.data);
    });
}
const fetchScheduleInputOrder = (scheduleId: number) => {
    scheduleInputOrderResourceApi.getScheduleInputOrder(scheduleId).then((res) => {
        console.log(res.data);
    });
}
const fetchScheduleInputVehicle = (scheduleId: number) => {
    scheduleInputVehicleResourceApi.getScheduleInputVehicle(scheduleId).then((res) => {
        console.log(res.data);
    });
}

</script>

<style scoped></style>
