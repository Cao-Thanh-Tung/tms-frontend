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
        <a-step title="Tổng quan" @click="viewResultsHandler" />
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
        <a-form :model="solverConfig" class="solver-config-form">
          <a-form-item label="Thời gian bắt đầu">
            <a-time-picker v-model:value="solverConfig.startTime" />
          </a-form-item>
          <a-form-item label="Thời gian kết thúc">
            <a-time-picker v-model:value="solverConfig.endTime" />
          </a-form-item>
          <a-form-item label="Thời gian giới hạn(h)">
            <a-input-number v-model:value="solverConfig.solveTimeLimitSec" />
          </a-form-item>
          <a-form-item label="Chiến lược">
            <a-select v-model:value="solverConfig.strategy">
              <a-select-option value="Greddy">Tham Lam</a-select-option>
              <a-select-option value="Local Search">Local Search</a-select-option>
              <a-select-option value="Tabu Search">Tabu Search</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </ul>
      <a-card v-if="setupStep === 4" title="Thông tin chi tiết">
        <a-list>
          <a-list-item>
            <a-list-item-meta title="Số xe đã chọn" :description="state.selectedVehicleCount" />
          </a-list-item>
          <a-list-item>
            <a-list-item-meta title="Số đơn hàng đã chọn" :description="state.selectedOrderCount" />
          </a-list-item>
          <a-list-item>
            <a-list-item-meta title="Thời gian bắt đầu" :description="solverConfig.startTime" />
          </a-list-item>
          <a-list-item>
            <a-list-item-meta title="Thời gian kết thúc" :description="solverConfig.endTime" />
          </a-list-item>
          <a-list-item>
            <a-list-item-meta title="Thời gian giới hạn" :description="solverConfig.solveTimeLimitSec" />
          </a-list-item>
          <a-list-item>
            <a-list-item-meta title="Chiến lược" :description="solverConfig.strategy" />
          </a-list-item>
        </a-list>
      </a-card>
      <div class="next-button-container">
        <a-button type="primary" :loading="isLoading" @click="nextStep">{{ setupStep === 4 ? 'Hoàn Thành' : 'Tiếp Theo'
          }}</a-button>
      </div>
      <div v-if="setupStep != 4" class="selection-counts">
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
    <map-app :vehiclePositonList="positionList" style="height:600px" />
  </div>
</template>

<script setup lang="ts">
// import mapApp from "@/components/Map.vue";
import { SettingOutlined } from "@ant-design/icons-vue";
import { ref, reactive } from "vue";
import { VehicleResourceApi, OrderResourceApi } from "@/api";
import { Configuration } from "../../configuration";
import store from "../../store";
import { SolverConfigDTO, VehicleDTO, OrderDTO, PositionDTO, PositionResourceApi, SolverConfigResourceApi, ScheduleResourceApi, ScheduleInputOrderResourceApi, ScheduleInputVehicleResourceApi, ScheduleInputResourceApi } from '../../api';
import { message } from "ant-design-vue";

//import route for redirect
import { useRouter } from 'vue-router';
let solverConfig = ref({
  startTime: "",
  endTime: "",
  solveTimeLimitSec: 0,
  strategy: "",
} as SolverConfigDTO);
const router = useRouter();

let isLoading = ref(false);
let vehicleList = ref([] as VehicleDTO[]);
let orderList = ref([] as OrderDTO[]);
let vehicle2Position = ref(new Map<number, PositionDTO>());
let positionList = ref([] as PositionDTO[]);
const configWithBaseOptions = new Configuration({
  accessToken: () => store.getters.jwt,
  baseOptions: {
    headers: { 'Content-Type': 'application/json' }
  }
});
const configWithoutBaseOptions = new Configuration({
  accessToken: () => store.getters.jwt,
});
let vehicleResourceApi = new VehicleResourceApi(
  configWithoutBaseOptions
);
const currentEmployee = store.getters.user;
let orderResourceApi = new OrderResourceApi(
  configWithoutBaseOptions
);
let scheduleResourceApi = new ScheduleResourceApi(
  configWithBaseOptions
);
let scheduleInputResourceApi = new ScheduleInputResourceApi(
  configWithBaseOptions
);
let scheduleInputOrderResourceApi = new ScheduleInputOrderResourceApi(
  configWithBaseOptions
);
let scheduleInputVehicleResourceApi = new ScheduleInputVehicleResourceApi(
  configWithBaseOptions
);

let solverConfigResourceApi = new SolverConfigResourceApi(
  new Configuration({
    accessToken: () => store.getters.jwt,
    baseOptions: {
      headers: { 'Content-Type': 'application/json' }
    }
  })
);
let positionResourceApi = new PositionResourceApi(
  new Configuration({
    accessToken: () => store.getters.jwt,
  })
);
let setupStep = ref(1);
let isModalVisible = ref(false);
let originalVehicleList = ref([] as VehicleDTO[]); // Store the original list
let originalOrderList = ref([] as OrderDTO[]); // Store the original list
const fetchVehicles = async () => {
  vehicleResourceApi
    .getAllVehicles()
    .then((res) => {
      vehicleList.value = res.data;
      originalVehicleList.value = res.data;
      const positionPromises = res.data.map((vehicle) => {
        if (vehicle.id === undefined) return Promise.resolve();
        return positionResourceApi
          .getAllPositionsByVehicle(vehicle.id)
          .then((res) => {
            if (vehicle.id === undefined) return;
            vehicle2Position.value.set(vehicle.id, res.data);
          });
      });
      return Promise.all(positionPromises);
    })
    .then(() => {
      console.log(vehicleList.value);
    })
    .catch((err) => {
      console.log(err);
    });
};
const fetchOrders = async () => {
  orderResourceApi
    .getOrdersAssignToEmployee(currentEmployee.id)
    .then((res) => {
      orderList.value = res.data;
      originalOrderList.value = res.data;
    })
    .catch((err) => {
      console.log(err);
    });
};
const validateInput = () => {
  if (state.selectedVehicleList.length === 0) {
    message.error("Chưa chọn xe");
    isLoading.value = false;
    return false;
  }
  if (state.selectedOrderList.length === 0) {
    message.error("Chưa chọn đơn hàng");
    isLoading.value = false;
    return false;
  }
  if (!solverConfig.value.startTime || !solverConfig.value.endTime || !solverConfig.value.strategy) {
    message.error("Vui lòng điền đầy đủ thông tin config thuật toán");
    isLoading.value = false;
    return false;
  }
  if (solverConfig.value.startTime >= solverConfig.value.endTime) {
    message.error("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc");
    isLoading.value = false;
    return false;
  }
  return true;
};

const createSchedule = async () => {
  try {
    const response = await scheduleResourceApi.createSchedule({
      "name": "test",
      "coordinatorUserXId": currentEmployee.id,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const createScheduleInput = async (scheduleId: number) => {
  try {
    const response = await scheduleInputResourceApi.createScheduleInput({
      "status": "CREATED",
      "scheduleId": scheduleId,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const createScheduleInputOrders = async (scheduleInputId: number, scheduleId: number) => {
  try {
    const response = await Promise.all(state.selectedOrderList.map((order) => scheduleInputOrderResourceApi.createScheduleInputOrder({
      "orderId": order.id,
      "scheduleInputId": scheduleInputId,
      "scheduleId": scheduleId,
    })
    ));
    return response;
  } catch (error) {
    throw error;
  }
};

const createScheduleInputVehicles = async (scheduleInputId: number, scheduleId: number) => {
  try {
    const response = await Promise.all(state.selectedVehicleList.map((vehicle) => scheduleInputVehicleResourceApi.createScheduleInputVehicle({
      "vehicleId": vehicle.id,
      "scheduleInputId": scheduleInputId,
      "scheduleId": scheduleId,
    })
    ));
    return response;
  } catch (error) {
    throw error;
  }
};

const createSolverConfig = async (scheduleInputId: number, scheduleId: number) => {
  try {
    const response = await solverConfigResourceApi.createSolverConfig({
      "scheduleInputId": scheduleInputId,
      "startTime": solverConfig.value.startTime,
      "endTime": solverConfig.value.endTime,
      "solveTimeLimitSec": (solverConfig.value.solveTimeLimitSec || 0) * 3600,
      "strategy": solverConfig.value.strategy,
      "scheduleId": scheduleId,
    });
    return response;
  } catch (error) {
    throw error;
  }
};
const scheduleHandle = async () => {
  try {
    if (!validateInput()) {
      return;
    }
    isLoading.value = true;

    const schedule = await createSchedule();
    const scheduleId = schedule.data.id;
    if (scheduleId === undefined) throw new Error("Schedule id is undefined");
    const scheduleInput = await createScheduleInput(scheduleId);
    const scheduleInputId = scheduleInput.data.id;
    if (scheduleInputId === undefined) throw new Error("Schedule input id is undefined");
    await createScheduleInputOrders(scheduleInputId, scheduleId);
    await createScheduleInputVehicles(scheduleInputId, scheduleId);
    await createSolverConfig(scheduleInputId, scheduleId);


    message.success("Tạo lịch thành công");
    isLoading.value = false;
    changePage();
  } catch (err) {
    console.log(err);
    message.error("Tạo lịch thất bại");
    isLoading.value = false;
  }
};
const changePage = () => {
  return new Promise<void>((resolve, reject) => {
    router.push("/employee/solution")
      .then(() => {
        console.log("Navigation successful!");
        resolve();
      })
      .catch((error) => {
        console.error("Navigation failed!", error);
        reject(error);
      });
  });
};
const clickSetup = async () => {
  isModalVisible.value = true;
  // check if vehicle list is not empty
  if (vehicleList.value.length === 0) {
    await fetchVehicles();
  }
  // check if order list is not empty
  if (orderList.value.length === 0) {
    await fetchOrders();
  }

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
    isLoading.value = true;
    handleComplete();

    return;
  }
  setupStep.value += 1;
};
const handleComplete = () => {
  scheduleHandle();
};

const state = reactive<{
  selectedRowKeys: (string | number)[];
  selectedOrderKeys: (string | number)[];
  selectedVehicleCount: number;
  selectedOrderCount: number;
  selectedVehicleList: VehicleDTO[];
  selectedOrderList: OrderDTO[];
}>({
  selectedRowKeys: [],
  selectedOrderKeys: [],
  selectedVehicleCount: 0,
  selectedOrderCount: 0,
  selectedVehicleList: [],
  selectedOrderList: [],
});
const onVehicleSelectChange = (selectedRowKeys: (string | number)[]) => {
  state.selectedRowKeys = selectedRowKeys;
  positionList.value = selectedRowKeys.map((key) => vehicle2Position.value.get(Number(key))).filter(Boolean) as PositionDTO[];
  state.selectedVehicleCount = selectedRowKeys.length;
  state.selectedVehicleList = vehicleList.value.filter((vehicle) => vehicle.id !== undefined && selectedRowKeys.includes(vehicle.id));
};

const onOrderSelectChange = (selectedRowKeys: (string | number)[]) => {
  state.selectedOrderKeys = selectedRowKeys;
  state.selectedOrderCount = selectedRowKeys.length;
  state.selectedOrderList = orderList.value.filter((order) => order.id != undefined && selectedRowKeys.includes(order.id));
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

.solver-config-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.solver-config-form .ant-form-item {
  margin-bottom: 20px;
}
</style>async const res = await positionResourceApi
          .getAllPositionsByVehicle(vehicle.id);
        if (vehicle.id === undefined) return;
        vehicle2Position.value.set(vehicle.id, res.data);async try {
    const response = await Promise.all(state.selectedOrderList.map((order) => scheduleInputOrderResourceApi.createScheduleInputOrder({
      "orderId": order.id,
      "scheduleInputId": scheduleInputId,
      "scheduleId": scheduleId,
    })
    ));
    return response;
  } catch (error) {
    throw error;
  }async try {
    const response = await Promise.all(state.selectedVehicleList.map((vehicle) => scheduleInputVehicleResourceApi.createScheduleInputVehicle({
      "vehicleId": vehicle.id,
      "scheduleInputId": scheduleInputId,
      "scheduleId": scheduleId,
    })
    ));
    return response;
  } catch (error) {
    throw error;
  }async try {
    const response = await solverConfigResourceApi.createSolverConfig({
      "scheduleInputId": scheduleInputId,
      "startTime": solverConfig.value.startTime,
      "endTime": solverConfig.value.endTime,
      "solveTimeLimitSec": (solverConfig.value.solveTimeLimitSec || 0) * 3600,
      "strategy": solverConfig.value.strategy,
      "scheduleId": scheduleId,
    });
    return response;
  } catch (error) {
    throw error;
  }
