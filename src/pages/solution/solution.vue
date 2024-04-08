<template>
    <div class="container">
        <div class="content">
            <a-breadcrumb style="margin: 16px 0">
                <a-breadcrumb-item>Phân tuyến</a-breadcrumb-item>
                <a-breadcrumb-item>Kết quả Phân tuyến</a-breadcrumb-item>
            </a-breadcrumb>
            <div class="map-and-table-container">

                <div class="map-container">
                    <map-app :vehiclePositonList="vehiclePositonList" :positionList="positionList" />
                </div>
                <div class="table-container">
                    <ul>
                        <a-table :dataSource="vehicleList" :row-selection="{
                        selectedRowKeys: state.selectedRowKeys,
                        onChange: onVehicleSelectChange,
                    }" :pagination="true" rowKey="id">
                            <a-table-column dataIndex="type" key="type">
                                <template #title>
                                    <div>
                                        Loại xe
                                        <a-input placeholder="Filter Type"
                                            @input="handleVehicleSearch($event.target.value, 'type')" />
                                    </div>
                                </template>
                            </a-table-column>
                            <a-table-column dataIndex="licensePlatesNumber" key="licensePlatesNumber">
                                <template #title>
                                    <div>
                                        Biển số xe
                                        <a-input placeholder="Filter License Plates Number" @input="
                        handleVehicleSearch(
                            $event.target.value,
                            'licensePlatesNumber'
                        )
                        " />
                                    </div>
                                </template>
                            </a-table-column>
                            <a-table-column dataIndex="maxLoadKg" key="maxLoadKg">
                                <template #title>
                                    <div>
                                        Trọng tải
                                        <a-input-number placeholder=""
                                            @input="handleVehicleNumberSearch($event, 'maxLoadKg')" />
                                    </div>
                                </template>
                            </a-table-column>
                            <a-table-column dataIndex="maxPallets" key="maxPallets">
                                <template #title>
                                    <div>
                                        Pallet tối đa
                                        <a-input-number placeholder="" @input="" />
                                    </div>
                                </template>
                            </a-table-column>
                            <a-table-column key="details">
                                <template #title>
                                    <div>Chi tiết lộ trình</div>
                                </template>
                                <template #customRender="{ record }">
                                    <a-button @click="showVehicleDetails(record)">Chi tiết</a-button>
                                </template>
                            </a-table-column>
                        </a-table>
                    </ul>
                </div>
            </div>
        </div>
        <a-modal v-model:open="isDetailModalVisible" title="Chi tiết xe" :footer="null" @cancel="handleCancel">
            <div>
                Danh sách các điểm xe đi qua:
            </div>
            <ul>
                <li v-for="position in positionList" :key="position.id">
                    {{ position.lat }} - {{ position.lng }}
                </li>
            </ul>
            <div>
                Tổng tải trọng: 1000kg
            </div>
            <div>
                Tổng số pallet: 10
            </div>
            <div>
                Tổng quãng đường: 100km
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import mapApp from "@/components/Map.vue"
import { ref, reactive, onMounted } from 'vue';
import { VehicleResourceApi } from "@/api";
import { Configuration } from "../../configuration";
import store from "../../store";
import { SolverConfigDTO, VehicleDTO, PositionDTO, PositionResourceApi } from '../../api';

const vehiclePositonList= ref([] as PositionDTO[]);
let solverConfig = ref({} as SolverConfigDTO);
solverConfig.value = {
    startTime: "",
    endTime: "",
    solveTimeLimitSec: 0,
    strategy: "",
};
const handleCancel = () => {
    isDetailModalVisible.value = false;
}
let vehicleList = ref([] as VehicleDTO[]);
// let vehicle2Position = ref(new Map<number, PositionDTO>());
let vehicleResourceApi = new VehicleResourceApi(
    new Configuration({
        accessToken: () => store.getters.jwt,
    })
);
let isDetailModalVisible = ref(false);
let positionResourceApi = new PositionResourceApi(
    new Configuration({
        accessToken: () => store.getters.jwt,
    })
);
// random position
let positionList = ref([] as PositionDTO[]);
const showVehicleDetails = (record: VehicleDTO) => {
    isDetailModalVisible.value = true;
    console.log(record, isDetailModalVisible.value);
};
onMounted(() => {
    fetchVehicles();
});
let originalVehicleList = ref([] as VehicleDTO[]); // Store the original list

const fetchVehicles = async () => {
    vehicleResourceApi
        .getAllVehicles()
        .then((res) => {
            vehicleList.value = res.data;
            originalVehicleList.value = res.data;
        })
        .then(() => {
            console.log(vehicleList.value);
        })
        .catch((err) => {
            console.log(err);
        });
    positionResourceApi
        .getAllPositions(0, 10)
        .then((res) => {
            positionList.value = res.data;
            console.log(positionList.value);
        })
        .catch((err) => {
            console.log(err);
        });
};


const handleVehicleSearch = (value: string, property: keyof VehicleDTO) => {
    if (value) {
        vehicleList.value = originalVehicleList.value.filter((vehicle) => {
            const propertyValue = vehicle[property];
            return (
                typeof propertyValue === "string" &&
                propertyValue.toLowerCase().includes(value.toLowerCase())
            );
        });
    } else {
        vehicleList.value = [...originalVehicleList.value];
    }
};

const handleVehicleNumberSearch = (
    value: number,
    property: keyof VehicleDTO
) => {
    if (value) {
        console.log(value);
        vehicleList.value = originalVehicleList.value.filter((vehicle) => {
            const propertyValue = vehicle[property];
            if (typeof propertyValue === "number") {
                return propertyValue >= value;
            }
        });
    } else {
        vehicleList.value = [...originalVehicleList.value];
    }
};

const state = reactive<{
    selectedRowKeys: (string | number)[];
    selectedOrderKeys: (string | number)[];
    selectedVehicleCount: number;
    selectedOrderCount: number;
}>({
    selectedRowKeys: [],
    selectedOrderKeys: [],
    selectedVehicleCount: 0,
    selectedOrderCount: 0,
});
const onVehicleSelectChange = (selectedRowKeys: (string | number)[]) => {
    state.selectedRowKeys = selectedRowKeys;
    state.selectedVehicleCount = selectedRowKeys.length;
};

</script>

<style scoped>
.container {
    display: flex;
    height: 100vh;
}

.content {
    flex: 1;
    overflow: auto;
}

.map-and-table-container {
    display: flex;
    height: 100%;
    flex: 1;
}

.map-container,
.table-container {
    flex: 1;
}
</style>