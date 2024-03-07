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
import { AddressDTO, UserDTO, UserXDTO } from "@/api";
import { AddressResourceApi } from "@/api";
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

// helper function

function createDefaultAddressDTO(): AddressDTO {
  return {
    fullName: "",
  };
}

// function createDefaultUserDTO(): UserDTO {
//   return {
//     id: 0,
//     firstName: "",
//     lastName: "",
//   }
// }

// function createDefaultUserXDTO(): UserXDTO {
//   return {
//     id: 0,
//     user: createDefaultUserDTO(),
//   };
// }
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
    title: "Tên người sở hữu",
    dataIndex: ["ownerUserX", "user", "lastName"],
    key: "userX",
  },
  {
    title: "Địa chỉ",
    dataIndex: ["currentAddress", "fullName"],
    key: "currentAddress",
    customFilterDropdown: true,
    onFilter: (value: string, record: VehicleDTO) =>
      record.currentAddress!.fullName!.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: "Thao tác",
    key: "operation",
    fixed: "right",
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
    // await userxApi.deleteUserX(vehicle!.ownerUserX!.id!);
    // await userApi.deleteUser(vehicle!.ownerUserX!.user!.login!)
    await addressApi.deleteAddress(vehicle!.currentAddress!.id!);
    const index = vehicles.indexOf(<VehicleDTO>vehicle);
    console.log(index);
    message.success("Đã xóa thông tin xe thành công!");
    vehicles.splice(index, 1);
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
  vehicleApi
    .partialUpdateVehicle(formEditState.id, formEditState)
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
  // ownerUserX: {
  //   id: -1,
  //   user: {
  //     id: -1,
  //     firstName: "",
  //     lastName: "",
  //   },
  // },
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
  // formAddState.ownerUserX.id = -1;
  // formAddState.ownerUserX.user.id = -1;
  // formAddState.ownerUserX.user.firstName = "";
  // formAddState.ownerUserX.user.lastName = "";
  formAddState.currentAddress.id = -1;
  formAddState.currentAddress.fullName = "";
}

const showAddForm = () => {
  openAddForm.value = true;
};

const add = async () => {
  addLoading.value = true;
  try {
    // let userXId = (await userxApi.getUserX())
    let addressId = (
      await addressApi.createAddress(<AddressDTO>{
        fullName: formAddState.currentAddress.fullName,
      })
    ).data.id;
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
        // ownerUserX: {
        //   id: ,
        //   user: {
        //     id: -1,
        //     firstName: "",
        //     lastName: "",
        //   },
        // },
        currentAddress: {
          id: addressId,
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
</script>
<template>
  <!-- -->
  <a-breadcrumb style="margin: 16px 0">
    <a-breadcrumb-item>Xe</a-breadcrumb-item>
    <a-breadcrumb-item>Danh sách xe</a-breadcrumb-item>
  </a-breadcrumb>

  <!-- vehicle list table -->
  <a-layout-content
    :style="{
      background: '#fff',
      padding: '24px',
      margin: 0,
      minHeight: '280px',
    }"
  >
    <a-table
      :dataSource="vehicles"
      :columns="columns"
      :scroll="{ x: 1300 }"
      :pagination="pagination"
    >
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
          <a-popconfirm
            title="Xóa Xe?"
            ok-text="Yes"
            cancel-text="No"
            @confirm="() => deleteVehicle((<VehicleDTO>record))"
          >
            <a href="#">
              <DeleteFilled style="margin-left: 6px" />
            </a>
          </a-popconfirm>
          <a href="#" @click="() => showMoreInfo(record)">
            <InfoCircleOutlined style="margin-left: 6px;"/>
          </a>
        </template>
      </template>
      <!-- Filter-->
      <template #customFilterIcon="{ filtered }">
        <search-outlined :style="{ color: filtered ? '#108ee9' : undefined }" />
      </template>
      <template
        #customFilterDropdown="{
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
          column,
        }"
      >
        <div style="padding: 8px">
          <a-input
            ref="searchInput"
            :placeholder="`Search`"
            :value="selectedKeys[0]"
            style="width: 188px; margin-bottom: 8px; display: block"
            @change="(e: any) => setSelectedKeys(e.target.value ? [e.target.value] : [])"
            @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
          />
          <a-button
            type="primary"
            size="small"
            style="width: 90px; margin-right: 8px"
            @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
          >
            <template #icon>
              <SearchOutlined />
            </template>
            Search
          </a-button>
          <a-button
            size="small"
            style="width: 90px"
            @click="handleReset(clearFilters)"
          >
            Reset
          </a-button>
        </div>
      </template>
      <!-- Filter end -->
    </a-table>
  </a-layout-content>

  <!-- Float button create new vehicle-->
  <a-float-button
    type="primary"
    @click="showAddForm"
    tooltip="Tạo Xe mới"
  >
    <template #icon>
      <plus-outlined />
    </template>
  </a-float-button>
  <a-modal
    v-model:visible="infoModalVisible"
    title="Thông tin chi tiết xe"
    :footer="null"
    @cancel="infoModalVisible = false"
  >
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
      <a-descriptions-item label="Tên người sở hữu">{{ formEditState?.ownerUserX?.user?.lastName }}</a-descriptions-item>
      <a-descriptions-item label="Địa chỉ">{{ formEditState?.currentAddress?.fullName }}</a-descriptions-item>
    </a-descriptions>
  </a-modal>
  <!-- Popup edit vehicle form  -->
  <a-modal
    v-model:open="openEditForm"
    title="Chỉnh sửa thông tin Xe"
    :confirm-loading="editLoading"
    @ok="edit"
  >
    <a-form :model="formEditState">
      <a-form-item ref="type" label="Kiểu xe" name="type">
        <a-input v-model:value="formEditState.type" />
      </a-form-item>
      <a-form-item
        ref="licensePlatesNumber"
        label="Biển số xe"
        name="licensePlatesNumber"
      >
        <a-input v-model:value="formEditState.licensePlatesNumber" />
      </a-form-item>
      <a-form-item ref="maxLoadKg" label="Tải trọng tối đa" name="maxLoadKg">
        <a-input-number v-model:value="formEditState.maxLoadKg" />
      </a-form-item>
      <a-form-item ref="minLoadKg" label="Tải trọng tối thiểu" name="minLoadKg">
        <a-input-number v-model:value="formEditState.minLoadKg" />
      </a-form-item>
      <a-form-item ref="height" label="Chiều cao" name="height">
        <a-input-number v-model:value="formEditState.height" />
      </a-form-item>
      <a-form-item ref="width" label="Chiều rộng" name="width">
        <a-input-number v-model:value="formEditState.width" />
      </a-form-item>
      <a-form-item ref="length" label="Chiều dài" name="length">
        <a-input-number v-model:value="formEditState.length" />
      </a-form-item>
      <a-form-item ref="minPallets" label="Số pallet tối thiểu" name="minPallets">
        <a-input-number v-model:value="formEditState.minPallets" />
      </a-form-item>
      <a-form-item ref="maxPallets" label="Số pallet tối đa" name="maxPallets">
        <a-input-number v-model:value="formEditState.maxPallets" />
      </a-form-item>
      <a-form-item
        ref="registrationDate"
        label="Ngày đăng ký"
        name="registrationDate"
      >
        <a-date-picker v-model:value="formEditState.registrationDate" />
      </a-form-item>
      <a-form-item
        ref="registrationExpireDate"
        label="Ngày hết hạn"
        name="registrationExpireDate"
      >
        <a-date-picker v-model:value="formEditState.registrationExpireDate" />
      </a-form-item>
      <a-form-item ref="averageVelocity" label="Vận tốc trung bình" name="averageVelocity">
        <a-input-number v-model:value="formEditState.averageVelocity" />
      </a-form-item>
      <a-form-item ref="maxStopPoints" label="Số điểm dừng tối đa" name="maxStopPoints">
        <a-input-number v-model:value="formEditState.maxStopPoints" />
      </a-form-item>     
      <a-form-item ref="fuelType" label="Kiểu dầu" name="fuelType">
        <a-input v-model:value="formEditState.fuelType" />
      </a-form-item>

      <!-- <a-form-item
        ref="ownerUserX"
        label="Tên người sở hữu"
        name="ownerUserX"
      > -->

      <a-form-item ref="currentAddress" label="Địa chỉ" name="currentAddress">
        <a-input v-model:value="formEditState.currentAddress!.fullName" />
      </a-form-item>
    </a-form>
  </a-modal>

  <!-- Popup create vehicle form -->
  <a-modal
    v-model:open="openAddForm"
    title="Tạo mới Xe"
    :confirm-loading="addLoading"
    @ok="add"
    @cancel="reset"
  >
    <a-form>
      <a-form-item ref="type" label="Kiểu xe" name="type">
        <a-input v-model:value="formAddState.type" />
      </a-form-item>
      <a-form-item
        ref="licensePlatesNumber"
        label="Biển số xe"
        name="licensePlatesNumber"
      >
        <a-input v-model:value="formAddState.licensePlatesNumber" />
      </a-form-item>
      <a-form-item ref="maxLoadKg" label="Tải trọng tối đa" name="maxLoadKg">
        <a-input-number v-model:value="formAddState.maxLoadKg" />
      </a-form-item>
      <a-form-item ref="minLoadKg" label="Tải trọng tối thiểu" name="minLoadKg">
        <a-input-number v-model:value="formAddState.minLoadKg" />
      </a-form-item>
      <a-form-item ref="height" label="Chiều cao" name="height">
        <a-input-number v-model:value="formAddState.height" />
      </a-form-item>
      <a-form-item ref="width" label="Chiều rộng" name="width">
        <a-input-number v-model:value="formAddState.width" />
      </a-form-item>
      <a-form-item ref="length" label="Chiều dài" name="length">
        <a-input-number v-model:value="formAddState.length" />
      </a-form-item>
      <a-form-item ref="minPallets" label="Số pallet tối thiểu" name="minPallets">
        <a-input-number v-model:value="formAddState.minPallets" />
      </a-form-item>
      <a-form-item ref="maxPallets" label="Số pallet tối đa" name="maxPallets">
        <a-input-number v-model:value="formAddState.maxPallets" />
      </a-form-item>
      <a-form-item
        ref="registrationDate"
        label="Ngày đăng ký"
        name="registrationDate"
      >
        <a-date-picker v-model:value="formAddState.registrationDate" />
      </a-form-item>
      <a-form-item
        ref="registrationExpireDate"
        label="Ngày hết hạn"
        name="registrationExpireDate"
      >
        <a-date-picker v-model:value="formAddState.registrationExpireDate" />
      </a-form-item>
      <a-form-item ref="averageVelocity" label="Vận tốc trung bình" name="averageVelocity">
        <a-input-number v-model:value="formAddState.averageVelocity" />
      </a-form-item>
      <a-form-item ref="maxStopPoints" label="Số điểm dừng tối đa" name="maxStopPoints">
        <a-input-number v-model:value="formAddState.maxStopPoints" />
      </a-form-item>     
      <a-form-item ref="fuelType" label="Kiểu dầu" name="fuelType">
        <a-input v-model:value="formAddState.fuelType" />
      </a-form-item>

      <!-- <a-form-item
        ref="ownerUserX"
        label="Tên người sở hữu"
        name="ownerUserX"
      > -->

      <a-form-item ref="currentAddress" label="Địa chỉ" name="currentAddress">
        <a-input v-model:value="formAddState.currentAddress!.fullName" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<style scoped></style>
