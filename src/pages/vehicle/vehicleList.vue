<script setup lang="ts">
import {
  EditOutlined,
  DeleteFilled,
  PlusOutlined,
  SearchOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons-vue";
import { reactive, ref, UnwrapRef, onMounted } from "vue";
import { message } from "ant-design-vue";
import { AddressDTO } from "@/api";
import { AddressResourceApi } from "@/api";
import store from "@/store";
import { Configuration } from "@/configuration";
import { VehicleDTO, VehicleResourceApi, UserXResourceApi, UserResourceApi } from '../../api';
import MultipleSearch from "@/components/MultipleSearch.vue";
import { Entity } from "@/search.types";
import AddressForm from "@/components/AddressForm.vue";
// config request object
const config = new Configuration({
  accessToken: () => store.getters.jwt,
  baseOptions: {
    headers: { "Content-Type": "application/json" },
  },
});
const vehicleApi = new VehicleResourceApi(config);

// helper function

function createDefaultAddressDTO(): AddressDTO {
  return {
    fullName: "",
  };
}

function createDefaultVehicleDTO() {
  return {
    id: 0, // Hoặc giá trị mặc định của id tùy thuộc vào yêu cầu của bạn
    type: "",
    licensePlatesNumber: "",
    maxLoadKg: 0,
    minLoadKg: 0,
    height: 0,
    width: 0,
    length: 0,
    minPallets: 0,
    maxPallets: 0,
    registrationDate: "",
    registrationExpireDate: "",
    fuelType: "",
    averageVelocity: 0,
    maxStopPoints: 0,

    // ownerUserX: createDefaultUserXDTO(),
    currentAddress: createDefaultAddressDTO(), // Đây là một cách để tạo một đối tượng rỗng của AddressDTO
  };
}

// table config

const columns = [
  {
    title: "Kiểu xe",
    key: "type",
    dataIndex: "type",
    customFilterDropdown: true,
    onFilter: (value: string, record: VehicleDTO) =>
      record.type!.toLowerCase().includes(value.toLowerCase()),
    width: '3%',

  },
  {
    title: "Biển số xe",
    key: "licensePlatesNumber",
    dataIndex: "licensePlatesNumber",
    width: '6%',
  },
  {
    title: "Chiều cao",
    dataIndex: "height",
    key: "height",
    width: '2%',
  },
  {
    title: "Chiều rộng",
    dataIndex: "width",
    key: "width",
    width: '2%',
  },
  {
    title: "Chiều dài",
    dataIndex: "length",
    key: "length",
    width: '2%',
  },
  {
    title: "Kiểu dầu",
    dataIndex: "fuelType",
    key: "fuelType",
    width: '2%',
  },
  {
    title: "Điều phối viên",
    dataIndex: ["ownerUserX", "user", "lastName"],
    key: "userX",
    width: '6%',
  },
  {
    title: "Tài xế",
    dataIndex: ["driver", "user", "lastName"],
    key: "driver",
    width: '6%',
  },
  {
    title: "Địa chỉ",
    dataIndex: ["currentAddress", "fullName"],
    key: "currentAddress",
    customFilterDropdown: true,
    onFilter: (value: string, record: VehicleDTO) =>
      record.currentAddress!.fullName!.toLowerCase().includes(value.toLowerCase()),
    width: '12%',

  },
  {
    title: "Thao tác",
    key: "operation",
    fixed: "right",
    width: '2%',
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

// Delete user and update to table content
const deleteVehicle = async (vehicle?: VehicleDTO) => {
  try {
    await vehicleApi.deleteVehicle(vehicle!.id ?? 0);
    message.success("Đã xóa thông tin xe thành công!");
    fetchData();
  } catch (err) {
    console.log(err);
    message.error("Xóa thông tin xe thất bại!");
  }
};

// Logic editForm
const openEditForm = ref<boolean>(false);
const infoModalVisible = ref<boolean>(false);

let formEditState: UnwrapRef<VehicleDTO> = reactive<VehicleDTO>(
  createDefaultVehicleDTO()
);
const showEditForm = (v: VehicleDTO) => {
  const copy = JSON.parse(JSON.stringify(v));
  copy.registrationDate = "";
  copy.registrationExpireDate = "";

  // Assign the modified object to formEditState
  Object.assign(formEditState, copy);
  openEditForm.value = true;
};

const showMoreInfo = (v: VehicleDTO) => {
  // Fetch detailed information of the selected vehicle
  vehicleApi.getVehicle(v.id!)
    .then((res) => {
      formEditState = res.data; // Assign detailed information to reactive variable
      infoModalVisible.value = true; // Show modal dialog
    })
    .catch((err) => {
      console.error("Error fetching vehicle details:", err);
      message.error("Failed to fetch vehicle details.");
    });
};

const editLoading = ref<boolean>(false);
const edit = () => {
  editLoading.value = true;
  console.log(JSON.parse(JSON.stringify(formEditState)));
  console.log(formEditState.id);
  let formEditStateParmams: any = formEditState.id
  vehicleApi
    .partialUpdateVehicle(formEditStateParmams, formEditState)
    .then((res) => {
      console.log(res);
      const index = vehicles.findIndex((user: VehicleDTO) => {
        return user.id === formEditState.id;
      });
      console.log(index);
      console.log(vehicles[index]);
      Object.assign(
        vehicles[index],
        JSON.parse(JSON.stringify(formEditState))
      );
      message.success("Đã thay đổi thông tin xe thành công!");
    })
    .catch((err) => {
      console.log(err);
      message.success("Thay đổi thông tin xe thất bại!");
    })
    .finally(() => {
      editLoading.value = false;
      openEditForm.value = false;
    });
};

// Logic addForm
const openAddForm = ref<boolean>(false);
const addLoading = ref<boolean>(false);
const addressApi = new AddressResourceApi(config);
// const userxApi = new UserXResourceApi(config);
// const userApi = new UserResourceApi(config);
const formAddState = reactive({
  type: "",
  licensePlatesNumber: "",
  maxLoadKg: 0,
  minLoadKg: 0,
  height: 0,
  width: 0,
  length: 0,
  minPallets: 0,
  maxPallets: 0,
  registrationDate: "",
  registrationExpireDate: "",
  fuelType: "",
  averageVelocity: 0,
  maxStopPoints: 0,
  ownerUserX: {
    id: null,
  },
  driver: {
    id: null,
  },
  currentAddress: {
    id: -1,
    fullName: "",
  },
});

function reset() {
  formAddState.type = "";
  formAddState.licensePlatesNumber = "";
  formAddState.maxLoadKg = 0;
  formAddState.minLoadKg = 0;
  formAddState.height = 0;
  formAddState.width = 0;
  formAddState.length = 0;
  formAddState.minPallets = 0;
  formAddState.maxPallets = 0;
  formAddState.registrationDate = "";
  formAddState.registrationExpireDate = "";
  formAddState.fuelType = "";
  formAddState.averageVelocity = 0;
  formAddState.maxStopPoints = 0;
  formAddState.ownerUserX.id = null;
  formAddState.driver.id = null;
  formAddState.currentAddress.id = -1;
  formAddState.currentAddress.fullName = "";
}

const userxApi = new UserXResourceApi(config);
const showAddForm = () => {
  openAddForm.value = true;
  userxApi.getUserXByRole("employee").then((res) => {
    dpvRawList.value = res.data.map((item: any) => ({
      value: item.id,
      label: item.user.firstName + " " + item.user.lastName,
    }));
    dpvList.value = dpvRawList.value;
  });
  userxApi.getUserXByRole("driver").then((res) => {
    txRawList.value = res.data.map((item: any) => ({
      value: item.id,
      label: item.user.firstName + " " + item.user.lastName,
    }));
    txList.value = txRawList.value;
  });
};

const add = async () => {
  addLoading.value = true;
  console.log(formAddState);
  try {
    // let userXId = (await userxApi.getUserX())
    await vehicleApi.createVehicle(<VehicleDTO>{
      type: formAddState.type,
      licensePlatesNumber: formAddState.licensePlatesNumber,
      maxLoadKg: formAddState.maxLoadKg,
      minLoadKg: formAddState.minLoadKg,
      height: formAddState.height,
      width: formAddState.width,
      length: formAddState.length,
      minPallets: formAddState.minPallets,
      maxPallets: formAddState.maxPallets,
      registrationDate: formAddState.registrationDate,
      registrationExpireDate: formAddState.registrationExpireDate,
      fuelType: formAddState.fuelType,
      averageVelocity: formAddState.averageVelocity,
      maxStopPoints: formAddState.maxStopPoints,
      ownerUserX: {
        id: Number(formAddState.ownerUserX.id),
      },
      driver: {
        id: Number(formAddState.driver.id),
      },
      currentAddress: {
        id: formAddState.currentAddress.id,
      },
    })
    console.log(formAddState)
    message.success("Tạo tài khoản xe thành công!");
  } catch (err) {
    message.error("Tạo tài khoản xe thất bại!");
  } finally {
    addLoading.value = false;
    openAddForm.value = false;
    reset();
    fetchData();
  }
};

const pagination = {
  pageSize: 6,
};
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

const searchFields = ref(Object.keys(formAddState).map(key => ({ name: key, label: key })));

async function handleSearchResults(results: Entity[]) {
  try {
    vehicles.splice(0, vehicles.length, ...results);
  } catch (error) {
    console.error('Error handling search results:', error);
  }
}

const dpvRawList = ref<any[]>([]);
const dpvList = ref<any[]>([]);
const searchDPV = (text: string) => {
  dpvList.value = dpvRawList.value.filter((item: any) => {
    return item.label.toLowerCase().includes(text.toLowerCase());
  });
};

const txRawList = ref<any[]>([]);
const txList = ref<any[]>([]);
const searchTX = (text: string) => {
  txList.value = txRawList.value.filter((item: any) => {
    return item.label.toLowerCase().includes(text.toLowerCase());
  });
};

</script>
<template>
  <!-- -->
  <a-breadcrumb style="margin: 16px 0">
    <a-breadcrumb-item>Xe</a-breadcrumb-item>
    <a-breadcrumb-item>Danh sách xe</a-breadcrumb-item>
  </a-breadcrumb>
  <MultipleSearch :searchFields="searchFields" :entityName="'Vehicle'" @search="handleSearchResults" />
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
        <template v-if="column.key === 'operation'">
          <a href="#" @click="() => showEditForm(record)">
            <EditOutlined />
          </a>
          <a-popconfirm title="Xóa Xe?" ok-text="Yes" cancel-text="No"
            @confirm="() => deleteVehicle((<VehicleDTO>record))">
            <a href="#">
              <DeleteFilled style="margin-left: 6px" />
            </a>
          </a-popconfirm>
          <a href="#" @click="() => showMoreInfo(record)">
            <InfoCircleOutlined style="margin-left: 6px;" />
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

  <!-- Float button create new vehicle-->
  <a-float-button type="primary" @click="showAddForm" tooltip="Tạo Xe mới">
    <template #icon>
      <plus-outlined />
    </template>
  </a-float-button>
  <a-modal v-model:visible="infoModalVisible" title="Thông tin chi tiết xe" :footer="null"
    @cancel="infoModalVisible = false">
    <a-descriptions :column="1">
      <a-descriptions-item label="Kiểu xe">{{ formEditState?.type }}</a-descriptions-item>
      <a-descriptions-item label="Biển số xe">{{ formEditState?.licensePlatesNumber }}</a-descriptions-item>
      <a-descriptions-item label="Tải trọng tối đa">{{ formEditState?.maxLoadKg }}</a-descriptions-item>
      <a-descriptions-item label="Tải trọng tối thiểu">{{ formEditState?.minLoadKg }}</a-descriptions-item>
      <a-descriptions-item label="Chiều cao">{{ formEditState?.height }}</a-descriptions-item>
      <a-descriptions-item label="Chiều rộng">{{ formEditState?.width }}</a-descriptions-item>
      <a-descriptions-item label="Chiều dài">{{ formEditState?.length }}</a-descriptions-item>
      <a-descriptions-item label="Số pallet tối thiểu">{{ formEditState?.minPallets }}</a-descriptions-item>
      <a-descriptions-item label="Số pallet tối đa">{{ formEditState?.maxPallets }}</a-descriptions-item>
      <a-descriptions-item label="Ngày đăng ký">{{ formEditState?.registrationDate }}</a-descriptions-item>
      <a-descriptions-item label="Ngày hết hạn">{{ formEditState?.registrationExpireDate }}</a-descriptions-item>
      <a-descriptions-item label="Vận tốc trung bình">{{ formEditState?.averageVelocity }}</a-descriptions-item>
      <a-descriptions-item label="Số điểm dừng tối đa">{{ formEditState?.maxStopPoints }}</a-descriptions-item>
      <a-descriptions-item label="Kiểu dầu">{{ formEditState?.fuelType }}</a-descriptions-item>
      <a-descriptions-item label="Tên người sở hữu">{{ formEditState?.ownerUserX?.user?.lastName
        }}</a-descriptions-item>
      <a-descriptions-item label="Địa chỉ">{{ formEditState?.currentAddress?.fullName }}</a-descriptions-item>
    </a-descriptions>
  </a-modal>
  <!-- Popup edit vehicle form  -->
  <a-modal width="900px" v-model:open="openEditForm" title="Chỉnh sửa thông tin Xe" :confirm-loading="editLoading"
    @ok="edit">
    <a-form :model="formEditState" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-form-item ref="type" label="Kiểu xe" name="type">
            <a-input v-model:value="formEditState.type" />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item ref="licensePlatesNumber" label="Biển số xe" name="licensePlatesNumber">
            <a-input v-model:value="formEditState.licensePlatesNumber" />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item ref="fuelType" label="Kiểu dầu" name="fuelType">
            <a-input v-model:value="formEditState.fuelType" />
          </a-form-item>

        </a-col>
        <a-col :span="6">
          <a-form-item ref="maxStopPoints" label="Số điểm dừng tối đa" name="maxStopPoints">
            <a-input type="number" v-model:value="formEditState.maxStopPoints" />
          </a-form-item>

        </a-col>

      </a-row>
      <a-row :gutter="16">
        <a-col :span="4">
          <a-form-item ref="maxLoadKg" label="Tải trọng tối đa" name="maxLoadKg">
            <a-input type="number" v-model:value="formEditState.maxLoadKg" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item ref="minLoadKg" label="Tải trọng tối thiểu" name="minLoadKg">
            <a-input type="number" v-model:value="formEditState.minLoadKg" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item ref="height" label="Chiều cao" name="height">
            <a-input type="number" v-model:value="formEditState.height" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item ref="width" label="Chiều rộng" name="width">
            <a-input type="number" v-model:value="formEditState.width" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item ref="length" label="Chiều dài" name="length">
            <a-input type="number" v-model:value="formEditState.length" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item ref="averageVelocity" label="Vận tốc trung bình" name="averageVelocity">
            <a-input type="number" v-model:value="formEditState.averageVelocity" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="4">
          <a-form-item ref="minPallets" label="Số pallet tối thiểu" name="minPallets">
            <a-input type="number" v-model:value="formEditState.minPallets" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item ref="maxPallets" label="Số pallet tối đa" name="maxPallets">
            <a-input type="number" v-model:value="formEditState.maxPallets" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item ref="registrationDate" label="Ngày đăng ký" name="registrationDate">
            <a-date-picker v-model:value="formEditState.registrationDate" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item ref="registrationExpireDate" label="Ngày hết hạn" name="registrationExpireDate">
            <a-date-picker v-model:value="formEditState.registrationExpireDate" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item label="Điều phối viên">
            <a-select>
              <a-select-option key="" value=""></a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item label="Tài xế">
            <a-select>
              <a-select-option key="" value=""></a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item ref="currentAddress" label="Địa chỉ" name="currentAddress">
        <a-input v-model:value="formEditState.currentAddress!.fullName" />
      </a-form-item>
      <!-- <a-form-item
        ref="ownerUserX"
        label="Tên người sở hữu"
        name="ownerUserX"
      > -->

    </a-form>
  </a-modal>

  <!-- Popup create vehicle form -->
  <a-modal width="900px" v-model:open="openAddForm" title="Tạo mới Xe" :confirm-loading="addLoading" @ok="add"
    @cancel="reset">
    <a-form layout="vertical">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-form-item ref="type" label="Kiểu xe" name="type">
            <a-input v-model:value="formAddState.type" />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item ref="licensePlatesNumber" label="Biển số xe" name="licensePlatesNumber">
            <a-input v-model:value="formAddState.licensePlatesNumber" />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item ref="fuelType" label="Kiểu dầu" name="fuelType">
            <a-input v-model:value="formAddState.fuelType" />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item ref="maxStopPoints" label="Số điểm dừng tối đa" name="maxStopPoints">
            <a-input type="number" v-model:value="formAddState.maxStopPoints" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="8">
        <a-col :span="4">
          <a-form-item ref="minLoadKg" label="Tải trọng tối thiểu" name="minLoadKg">
            <a-input type="number" v-model:value="formAddState.minLoadKg" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item ref="maxLoadKg" label="Tải trọng tối đa" name="maxLoadKg">
            <a-input type="number" v-model:value="formAddState.maxLoadKg" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item ref="height" label="Chiều cao" name="height">
            <a-input type="number" v-model:value="formAddState.height" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item ref="width" label="Chiều rộng" name="width">
            <a-input type="number" v-model:value="formAddState.width" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item ref="length" label="Chiều dài" name="length">
            <a-input type="number" v-model:value="formAddState.length" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item ref="averageVelocity" label="Vận tốc trung bình" name="averageVelocity">
            <a-input type="number" v-model:value="formAddState.averageVelocity" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="4">
          <a-form-item ref="minPallets" label="Số pallet tối thiểu" name="minPallets">
            <a-input type="number" v-model:value="formAddState.minPallets" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item ref="maxPallets" label="Số pallet tối đa" name="maxPallets">
            <a-input type="number" v-model:value="formAddState.maxPallets" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item ref="registrationDate" label="Ngày đăng ký" name="registrationDate">
            <a-date-picker v-model:value="formAddState.registrationDate" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item ref="registrationExpireDate" label="Ngày hết hạn" name="registrationExpireDate">
            <a-date-picker v-model:value="formAddState.registrationExpireDate" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item label="Người điều phối">
            <a-select v-model:value="formAddState.ownerUserX.id" placeholder=" Chọn" show-search style="width: 100%"
              :options="dpvList" @search="searchDPV" :filter-option="false">
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item label="Tài xế">
            <a-select v-model:value="formAddState.driver.id" placeholder=" Chọn" show-search style="width: 100%"
              :options="txList" @search="searchTX" :filter-option="false">
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item ref="currentAddress" label="Địa chỉ" name="currentAddress">
        <!-- <a-input v-model:value="formAddState.currentAddress!.fullName" /> -->
        <AddressForm v-if="openAddForm" @save="(addressId: any) => formAddState.currentAddress.id = addressId" />
      </a-form-item>
    </a-form>
  </a-modal>

</template>
