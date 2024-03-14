<template>
  <div>
    <a-breadcrumb style="margin: 16px 0">
      <a-breadcrumb-item>Phân tuyến</a-breadcrumb-item>
      <a-breadcrumb-item>Phân tuyến tự động</a-breadcrumb-item>
    </a-breadcrumb>
    <a-button type="primary" @click="clickSetup">
      Cài đặt
      <SettingOutlined />
    </a-button>
    <a-drawer v-model:open="isModalVisible" width="50%" placement="right">
      <a-steps :current="setupStep" style="margin-bottom: 20px">
        <a-step title="Cài đặt xe" @click="setupVehiclesHandler" />
        <a-step title="Cài đặt đơn hàng" @click="setupOrdersHandler" />
        <a-step title="Cấu hình thuật toán" @click="configureAlgorithmHandler" />
        <a-step title="Xem kết quả" @click="viewResultsHandler" />
      </a-steps>
      <ul v-if="setupStep === 1">
        <a-table :dataSource="vehicleList" :row-selection="{
      selectedRowKeys: state.selectedRowKeys,
      onChange: onVehicleSelectChange,
    }" :pagination="true" rowKey="id">
          <a-table-column dataIndex="type" key="type">
            <template #title>
              <div>
                Loại xe
                <a-input placeholder="Filter Type" @input="handleVehicleSearch($event.target.value, 'type')" />
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
                <a-input-number placeholder="" @input="handleVehicleNumberSearch($event, 'maxLoadKg')" />
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
        </a-table>
      </ul>
      <ul v-if="setupStep === 2">
        <a-table :dataSource="orderList" :row-selection="{
      selectedRowKeys: state.selectedOrderKeys,
      onChange: onOrderSelectChange,
    }" :pagination="true" rowKey="id">
          <a-table-column dataIndex="goodType" key="goodType">
            <template #title>
              <div>
                Loại hàng
                <a-input placeholder="Loại hàng" @input="handleOrderSearch($event.target.value, 'goodType')" />
              </div>
            </template>
          </a-table-column>
          <a-table-column dataIndex="volume" key="volume">
            <template #title>
              <div>
                Số lượng
                <a-input-number placeholder="Số lượng" @input="" />
              </div>
            </template>
          </a-table-column>
          <a-table-column dataIndex="weight" key="weight">
            <template #title>
              <div>
                Trọng tải
                <a-input-number placeholder="Tổng trọng tải" @input="" />
              </div>
            </template>
          </a-table-column>
          <a-table-column key="immediateDelivery">
            <template #title>
              <div>Giao lập tức</div>
            </template>
            <template #customRender="{ record }">
              <a-switch :checked="record.immediateDelivery" v-model="record.immediateDelivery" @change="" />
            </template>
          </a-table-column>
        </a-table>
      </ul>
      <ul v-if="setupStep === 3">
        Cài đặt thuật toán
      </ul>
      <ul v-if="setupStep === 4">
        Kết quả
      </ul>
      <div class="next-button-container">
        <a-button type="primary" @click="nextStep">Tiếp theo</a-button>
      </div>
      <div class="selection-counts">
        <div class="count-item">
          <span class="count-label">Xe đã chọn:</span>
          <span class="count-value">{{ state.selectedVehicleCount }}</span>
        </div>
        <div class="count-item">
          <span class="count-label">Đơn hàng đã chọn:</span>
          <span class="count-value">{{ state.selectedOrderCount }}</span>
        </div>
      </div>
    </a-drawer>
    <map-app />
  </div>
</template>

<script setup lang="ts">
import mapApp from "@/components/Map.vue";
import { SettingOutlined } from "@ant-design/icons-vue";
import { ref, reactive } from "vue";
import { VehicleResourceApi, OrderResourceApi } from "@/api";
import { Configuration } from "../../configuration";
import store from "../../store";
import { VehicleDTO, OrderDTO } from "../../api";

let vehicleList = ref([] as VehicleDTO[]);
let orderList = ref([] as OrderDTO[]);
let vehicleResourceApi = new VehicleResourceApi(
  new Configuration({
    accessToken: () => store.getters.jwt,
  })
);
let orderResourceApi = new OrderResourceApi(
  new Configuration({
    accessToken: () => store.getters.jwt,
  })
);
let setupStep = ref(1);
let isModalVisible = ref(false);
let originalVehicleList = ref([] as VehicleDTO[]); // Store the original list
let originalOrderList = ref([] as OrderDTO[]); // Store the original list
const clickSetup = async () => {
  isModalVisible.value = true;
  vehicleResourceApi
    .getAllVehicles()
    .then((res) => {
      vehicleList.value = res.data;
      originalVehicleList.value = res.data;
    })
    .catch((err) => {
      console.log(err);
    });
  orderResourceApi
    .getAllOrders()
    .then((res) => {
      orderList.value = res.data;
      originalOrderList.value = res.data;
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
const handleOrderSearch = (value: string, property: keyof OrderDTO) => {
  if (value) {
    orderList.value = originalOrderList.value.filter((order) => {
      const propertyValue = order[property];
      return (
        typeof propertyValue === "string" &&
        propertyValue.toLowerCase().includes(value.toLowerCase())
      );
    });
  } else {
    orderList.value = [...originalOrderList.value];
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
const nextStep = () => {
  if (setupStep.value === 4) {
    setupStep.value = 1;
    return;
  }
  setupStep.value += 1;
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

const onOrderSelectChange = (selectedRowKeys: (string | number)[]) => {
  state.selectedOrderKeys = selectedRowKeys;
  state.selectedOrderCount = selectedRowKeys.length;
};

const setupVehiclesHandler = () => {
  setupStep.value = 1;
};

const setupOrdersHandler = () => {
  setupStep.value = 2;
};

const configureAlgorithmHandler = () => {
  setupStep.value = 3;
};

const viewResultsHandler = () => {
  setupStep.value = 4;
};
</script>

<style scoped>
.next-button-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  bottom: 0;
  left: 85%;
  width: 100%;
  padding: 20px;
  z-index: 999;
}

.count-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.count-label {
  font-weight: bold;
  margin-right: 5px;
  font-size: 18px;
  /* Increase the font size */
  color: #333;
  /* Change the color to a dark gray */
}

.selection-counts {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-bottom: 20px;
  position: absolute;
  bottom: 0;
  left: 10%;
  width: 100%;
  font-size: 20px;
  margin-right: 100px;
}

.count-value {
  color: #1890ff;
  font-size: 22px;
  /* Increase the font size */
  font-weight: bold;
  /* Make the font bold */
}
</style>
