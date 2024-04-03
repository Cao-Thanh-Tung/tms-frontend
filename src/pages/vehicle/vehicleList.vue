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
import { AddressDTO, Pageable, UserDTO, UserXDTO, Vehicle } from "@/api";
import { AddressResourceApi } from "@/api";
import store from "@/store";
import { Configuration } from "@/configuration";
import { VehicleDTO, VehicleResourceApi, UserXResourceApi, UserResourceApi } from '../../api';
import MultipleSearch from "@/components/MultipleSearch.vue";
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

const searchFields = ref(Object.keys(formAddState).map(key => ({ name: key, label: key })));

async function searchVehicles(criteria: any) {
  try {
    const pageable: Pageable = { page: 0, size: 10 }; 
    const response = await vehicleApi.searchVehicles(criteria, pageable);
    vehicles.splice(0, vehicles.length, ...response.data);
  } catch (error) {
    console.error('Error searching vehicles:', error);
  }
}
</script>
<template>
  <!-- -->
  <a-breadcrumb style="margin: 16px 0">
    <a-breadcrumb-item>Xe</a-breadcrumb-item>
    <a-breadcrumb-item>Danh sách xe</a-breadcrumb-item>
  </a-breadcrumb>
  <MultipleSearch :searchFields="searchFields" @search="searchVehicles" />
  <!-- vehicle list table -->
  <a-layout-content :style="{
    background: '#fff',
    padding: '24px',
    margin: 0,
    minHeight: '280px',
  }">
    Comming soon
  </a-layout-content>
</template>

<style scoped></style>
