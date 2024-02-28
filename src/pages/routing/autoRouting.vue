<template>
  <div>
    <a-breadcrumb style="margin: 16px 0">
      <a-breadcrumb-item>Phân tuyến</a-breadcrumb-item>
      <a-breadcrumb-item>Phân tuyến tự động</a-breadcrumb-item>
    </a-breadcrumb>
    <a-button type="primary" @click="clickSetup">
      Cài đặt <SettingOutlined />
    </a-button>
    <a-drawer v-model:open="isModalVisible" width="50%" placement="right">
      <a-steps :current="setupStep" style="margin-bottom: 20px">
        <a-step title="Cài đặt xe" @click="setupVehiclesHandler" />
        <a-step title="Cài đặt đơn hàng" @click="setupOrdersHandler" />
        <a-step
          title="Cấu hình thuật toán"
          @click="configureAlgorithmHandler"
        />
        <a-step title="Xem kết quả" @click="viewResultsHandler" />
      </a-steps>
      <ul v-if="setupStep === 1">
        <a-table
          :dataSource="vehicleList"
          :rowSelection="rowSelection"
          :pagination="false"
        >
          <a-table-column dataIndex="type" key="type">
            <template #title>
              <div>
                Loại xe
                <a-input
                  placeholder="Filter Type"
                  @input="onTypeFilterChange"
                />
              </div>
            </template>
          </a-table-column>
          <a-table-column
            dataIndex="licensePlatesNumber"
            key="licensePlatesNumber"
          >
            <template #title>
              <div>
                Biển số xe
                <a-input
                  placeholder="Filter License Plates Number"
                  @input="onLicensePlatesNumberFilterChange"
                />
              </div>
            </template>
          </a-table-column>
          <a-table-column dataIndex="maxLoadKg" key="maxLoadKg">
            <template #title>
              <div>
                Trọng tải
                <a-input-number
                  placeholder=""
                  @input="onLicensePlatesNumberFilterChange"
                />
              </div>
            </template>
          </a-table-column>
          <a-table-column dataIndex="maxPallets" key="maxPallets">
            <template #title>
              <div>
                Pallet tối đa
                <a-input-number
                  placeholder=""
                  @input="onLicensePlatesNumberFilterChange"
                />
              </div>
            </template>
          </a-table-column>
        </a-table>
      </ul>
      <ul v-if="setupStep === 2"></ul>
      <ul v-if="setupStep === 3">
        Cài đặt thuật toán
      </ul>
      <ul v-if="setupStep === 4">
        Kết quả
      </ul>
      <div class="next-button-container">
        <a-button type="primary" @click="nextStep">Tiếp theo</a-button>
      </div>
    </a-drawer>
    <map-app />
  </div>
</template>

<script setup lang="ts">
import mapApp from "@/components/Map.vue";
import { SettingOutlined } from "@ant-design/icons-vue";
import { ref } from "vue";
import { VehicleResourceApi } from "@/api";
import { Configuration } from "../../configuration";
import store from "../../store";
import { VehicleDTO } from "../../api";

let vehicleList = ref([] as VehicleDTO[]);
let vehicleResourceApi = new VehicleResourceApi(
  new Configuration({
    accessToken: () => store.getters.jwt,
  })
);
let setupStep = ref(0);
let isModalVisible = ref(false);

const clickSetup = () => {
  isModalVisible.value = true;
  setupStep.value = 1;
  vehicleResourceApi.getAllVehicles().then((res) => {
    vehicleList.value = res.data;
  });
};
const onTypeFilterChange = (value: any, record: VehicleDTO) =>
  record.type === value;
const onLicensePlatesNumberFilterChange = (value: any, record: VehicleDTO) =>
  record.licensePlatesNumber === value;
const nextStep = () => {
  setupStep.value += 1;
};
const idFilters = vehicleList.value.map((vehicle) => ({
  text: vehicle.id,
  value: vehicle.id,
}));
const onIdFilterChange = (value: any, record: VehicleDTO) =>
  record.id === value;

const rowSelection = {
  selectedRowKeys: ref([]),
  onChange: (selectedRowKeys: any) => {
    rowSelection.selectedRowKeys.value = selectedRowKeys;
  },
  selectAll: (selected: boolean) => {
    if (selected) {
      rowSelection.selectedRowKeys.value = vehicleList.value.map(
        (vehicle) => vehicle.id
      );
    } else {
      rowSelection.selectedRowKeys.value = [];
    }
  },
};
const setupVehiclesHandler = () => {
  setupStep.value = 1;
};

const setupOrdersHandler = () => {
  setupStep.value = 2;
};

const configureAlgorithmHandler = () => {
  // Logic for configuring algorithms
  setupStep.value = 3;
};

const viewResultsHandler = () => {
  // Logic for viewing results
};
</script>

<style scoped>
.next-button-container {
  position: absolute;
  right: 20px;
  bottom: 20px;
}
</style>
