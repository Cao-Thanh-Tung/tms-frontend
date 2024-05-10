<script setup lang="ts">
import {
    SearchOutlined,
} from "@ant-design/icons-vue";
import { reactive, ref, UnwrapRef, onMounted } from "vue";
import store from "@/store";
import { Configuration } from "@/configuration";
import { VehicleDTO, VehicleResourceApi, UserXResourceApi, UserResourceApi } from '../../api';

// config request object
const config = new Configuration({
    accessToken: () => store.getters.jwt,
    baseOptions: {
        headers: { "Content-Type": "application/json" },
    },
});
const vehicleApi = new VehicleResourceApi(config);
const pagination = {
    pageSize: 6,
};
// table config

const columns = [
    {
        title: "Kiểu xe",
        key: "type",
        dataIndex: "type",
        customFilterDropdown: true,
        onFilter: (value: string, record: VehicleDTO) =>
            record.type!.toLowerCase().includes(value.toLowerCase()),

    },
    {
        title: "Biển số xe",
        key: "licensePlatesNumber",
        dataIndex: "licensePlatesNumber",
    },
    {
        title: "Chiều cao",
        dataIndex: "height",
        key: "height",
    },
    {
        title: "Chiều rộng",
        dataIndex: "width",
        key: "width",
    },
    {
        title: "Chiều dài",
        dataIndex: "length",
        key: "length",
    },
    {
        title: "Kiểu dầu",
        dataIndex: "fuelType",
        key: "fuelType",
    },
    {
        title: "Điều phối viên",
        dataIndex: ["ownerUserX", "user", "lastName"],
        key: "userX",
    },
    {
        title: "Tài xế",
        dataIndex: ["driver", "user", "lastName"],
        key: "driver",
    },
    {
        title: "Địa chỉ",
        dataIndex: ["currentAddress", "fullName"],
        key: "currentAddress",
        customFilterDropdown: true,
        onFilter: (value: string, record: VehicleDTO) =>
            record.currentAddress!.fullName!.toLowerCase().includes(value.toLowerCase()),

    },
];

const vehicles = reactive<VehicleDTO[]>([]);

// Get vehicles from server to push in table content
const fetchData = () => {
    vehicleApi
        .getAllVehicles()
        .then((res) => {
            vehicles.splice(0, vehicles.length, ...res.data.reverse());
        })
        .catch((err) => {
            console.log("Get All Vehicle." + err);
        });
};
onMounted(fetchData);
const state = reactive({
    searchText: "",
    searchedColumn: "",
});
const searchInput = ref();

const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm();
    state.searchText = selectedKeys[0];
    state.searchedColumn = dataIndex;
};

const handleReset = (clearFilters: any) => {
    clearFilters({ confirm: true });
    state.searchText = "";
};
</script>
<template>
    <!-- -->
    <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item>Xe</a-breadcrumb-item>
        <a-breadcrumb-item>Danh sách xe</a-breadcrumb-item>
    </a-breadcrumb>
    <!-- <MultipleSearch :searchFields="searchFields" :entityName="'Vehicle'" @search="handleSearchResults" /> -->
    <!-- vehicle list table -->
    <a-layout-content :style="{
        background: '#fff',
        padding: '24px',
        margin: 0,
        minHeight: '280px',
    }">
        <a-table :dataSource="vehicles" :columns="columns" :scroll="{ x: 2000 }" :pagination="pagination">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'type'">
                    <a>
                        {{ record.type }}
                    </a>
                </template>
            </template>
            <!-- Filter-->
            <template #customFilterIcon="{ filtered }">
                <search-outlined :style="{ color: filtered ? '#108ee9' : undefined }" />
            </template>
            <template #customFilterDropdown="{
                setSelectedKeys,
                selectedKeys,
                confirm,
                clearFilters,
                column,
            }">
                <div style="padding: 8px">
                    <a-input ref="searchInput" :placeholder="`Search`" :value="selectedKeys[0]"
                        style="width: 188px; margin-bottom: 8px; display: block"
                        @change="(e: any) => setSelectedKeys(e.target.value ? [e.target.value] : [])"
                        @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)" />
                    <a-button type="primary" size="small" style="width: 90px; margin-right: 8px"
                        @click="handleSearch(selectedKeys, confirm, column.dataIndex)">
                        <template #icon>
                            <SearchOutlined />
                        </template>
                        Search
                    </a-button>
                    <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
                        Reset
                    </a-button>
                </div>
            </template>
            <!-- Filter end -->
        </a-table>
    </a-layout-content>
</template>

<style scoped></style>
