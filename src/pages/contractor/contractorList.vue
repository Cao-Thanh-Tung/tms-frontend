<script setup lang="ts">
import {
  EditOutlined,
  DeleteFilled,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons-vue";
import { reactive, ref, UnwrapRef, onMounted } from "vue";
import { message } from "ant-design-vue";
import { AddressDTO } from "@/api";
import { AddressResourceApi } from "@/api";
import store from "@/store";
import { Configuration } from "@/configuration";
import { ContractorResourceApi, ContractorDTO } from "../../api";
import moment from "moment";
import { Entity } from "@/search.types";
import AddressForm from "@/components/AddressForm.vue";
import MultipleSearch from "@/components/MultipleSearch.vue";
import { Form } from 'ant-design-vue';
const useForm = Form.useForm;

// config request object
const config = new Configuration({
  accessToken: () => store.getters.jwt,
  baseOptions: {
    headers: { "Content-Type": "application/json" },
  },
});
const contractorApi = new ContractorResourceApi(config);

// helper function

function createDefaultAddressDTO(): AddressDTO {
  return {
    fullName: "",
  };
}

function createDefaultContractorDTO() {
  return {
    id: 0, // Hoặc giá trị mặc định của id tùy thuộc vào yêu cầu của bạn
    name: "",
    signingDate: "",
    expirationDate: "",
    address: createDefaultAddressDTO(), // Đây là một cách để tạo một đối tượng rỗng của AddressDTO
  };
}

// table config

const columns = [
  {
    title: "Tên nhà thầu",
    key: "name",
    dataIndex: "name",
    customFilterDropdown: true,
    onFilter: (value: string, record: ContractorDTO) =>
      record.name!.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: "Ngày đăng kí",
    key: "signingDate",
    dataIndex: "signingDate",


  },
  {
    title: "Ngày hết hạn",
    dataIndex: "expirationDate",
    key: "expirationDate",
  },
  {
    title: "Địa chỉ",
    dataIndex: ["address", "fullName"],
    key: "address",
    customFilterDropdown: true,
    onFilter: (value: string, record: ContractorDTO) => true
    // record.address!.fullName!.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: "Thao tác",
    key: "operation",
    fixed: "right",
  },
];

const contractors = reactive<ContractorDTO[]>([]);

// Get contractors from server to push in table content
const fetchData = () => {
  contractorApi
    .getAllContractors()
    .then((res) => {
      contractors.splice(0, contractors.length, ...res.data.reverse());
    })
    .catch((err) => {
      console.log("Get All Contractor." + err);
    });
};
onMounted(fetchData);

// Delete user and update to table content
const deleteContractor = async (Contractor?: any) => {
  try {
    await contractorApi.deleteContractor(Contractor?.id ?? 0);
    const index = contractors.indexOf(<ContractorDTO>Contractor);
    console.log(index);
    message.success("Đã xóa thông tin Nhà thầu thành công!");
    contractors.splice(index, 1);
  } catch (err) {
    console.log(err);
    message.error("Xóa thông tin Nhà thầu thất bại!");
  }
};

// Logic editForm
const openEditForm = ref<boolean>(false);

const formEditState: UnwrapRef<ContractorDTO> = reactive<ContractorDTO>(
  createDefaultContractorDTO()
);
const showEditForm = (v: ContractorDTO) => {
  resetFieldsEditForm();
  // Deep copy the object
  const copy = JSON.parse(JSON.stringify(v));

  // Convert string dates to Date objects
  if (copy.signingDate) {
    copy.signingDate = moment(new Date(copy.signingDate));
    copy.signingDate = moment(new Date(copy.signingDate));
  }
  if (copy.expirationDate) {
    copy.expirationDate = moment(new Date(copy.expirationDate));
    copy.expirationDate = moment(new Date(copy.expirationDate));
  }

  // Assign the modified object to formEditState
  Object.assign(formEditState, copy);
  console.log(formEditState);
  openEditForm.value = true;
};


const editLoading = ref<boolean>(false);
const editRequest = () => {
  editLoading.value = true;
  console.log(formEditState);
  contractorApi
    .updateContractor(formEditState.id!, {
      id: formEditState.id,
      name: formEditState.name,
      signingDate: formEditState.signingDate,
      expirationDate: formEditState.expirationDate,
      address: {
        id: formEditState.address!.id,
      },
    })
    .then((res) => {
      message.success("Đã thay đổi thông tin Nhà thầu thành công!");
      resetFieldAddForm();
    })
    .catch((err) => {
      console.log(err);
      message.success("Thay đổi thông tin Nhà thầu thất bại!");
    })
    .finally(() => {
      editLoading.value = false;
      openEditForm.value = false;
      resetFieldsEditForm();
      fetchData();
    });
};

// Logic addForm
const openAddForm = ref<boolean>(false);
const addLoading = ref<boolean>(false);
const formAddState = reactive({
  name: "",
  signingDate: "",
  expirationDate: "",
  address: {
    id: -1,
    fullName: "",
  },
});
function reset() {
  formAddState.name = "";
  formAddState.signingDate = "";
  formAddState.expirationDate = "";
  formAddState.address.id = -1;
  formAddState.address.fullName = "";
  resetFieldAddForm();
}

const showAddForm = () => {
  openAddForm.value = true;
};

const addRequest = async () => {

  addLoading.value = true;
  try {
    await contractorApi.createContractor(<ContractorDTO>{
      name: formAddState.name,
      signingDate: formAddState.signingDate,
      expirationDate: formAddState.expirationDate,
      address: {
        id: formAddState.address.id,
      },
    })

    // console.log(contractors);
    message.success("Tạo tài khoản Nhà thầu thành công!");
  } catch (err) {
    message.error("Tạo tài khoản Nhà thầu thất bại!");
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


const rules = {
  name: [
    {
      required: true,
      message: 'Không để trống',
    },
  ],
  signingDate: [
    {
      required: true,
      message: 'Không để trống',
    },
  ],
  expirationDate: [
    {
      required: true,
      message: 'Không để trống',
    },
  ],
};


const rulesRefAddForm = reactive(rules)
const rulesRefEditForm = reactive(rules);

const { resetFields: resetFieldAddForm, validate: validateAddForm, validateInfos: validateInfosAddForm } = useForm(formAddState, rulesRefAddForm);
const { resetFields: resetFieldsEditForm, validate: validateEditForm, validateInfos: validateInfosEditForm } = useForm(formEditState, rulesRefEditForm);

const add = () => {
  validateAddForm().then(() => {
    addRequest();
  }).catch((e: any) => {
    console.log(e);
  });
}

const edit = () => {
  validateEditForm().then(() => {
    editRequest();
  }).catch((e: any) => {
    console.log(e);
  });
}

const contractorDummy = [
  {
    name: "name",
    type: "string",
    displayName: "Tên nhà thầu",
  },
  {
    name: "signingDate",
    type: "date",
    displayName: "Ngày ký hợp đồng",
  },
  {
    name: "expirationDate",
    type: "date",
    displayName: "Ngày hết hạn hợp đồng",
  }
];
const searchFields = ref(contractorDummy);
async function handleSearchResults(results: Entity[]) {
  try {
    contractors.splice(0, contractors.length, ...results);
  } catch (error) {
    console.error('Error handling search results:', error);
  }
}


</script>
<template>
  <!-- -->
  <a-breadcrumb style="margin: 16px 0">
    <a-breadcrumb-item>Nhà thầu</a-breadcrumb-item>
    <a-breadcrumb-item>Danh sách Nhà thầu</a-breadcrumb-item>
  </a-breadcrumb>
  <MultipleSearch :searchFields="searchFields" :entityName="'Contractor'" @search="handleSearchResults" />
  <!-- Contractor list table -->
  <a-layout-content :style="{
    background: '#fff',
    padding: '24px',
    margin: 0,
    minHeight: '280px',
  }">
    <a-table :dataSource="contractors" :columns="columns" :scroll="{ x: 1300 }" :pagination="pagination">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <a>
            {{ record.name }}
          </a>
        </template>
        <template v-if="column.key === 'expirationDate'">
          <span>
            {{ moment(record.expirationDate).format("DD/MM/YYYY") }}
          </span>
        </template>
        <template v-if="column.key === 'signingDate'">
          <span>
            {{ moment(record.signingDate).format("DD/MM/YYYY") }}
          </span>
        </template>
        <template v-if="column.key === 'operation'">
          <a href="#" @click="() => showEditForm(record)">
            <EditOutlined />
          </a>
          <a-popconfirm title="Xóa Nhà thầu?" ok-text="Yes" cancel-text="No"
            @confirm="() => deleteContractor((<ContractorDTO>record))">
            <a href="#">
              <DeleteFilled style="margin-left: 12px" />
            </a>
          </a-popconfirm>
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
  <!-- Float button create new Contractor-->
  <a-float-button type="primary" @click="showAddForm" tooltip="Tạo Nhà thầu mới">
    <template #icon>
      <plus-outlined />
    </template>
  </a-float-button>

  <!-- Popup edit Contractor form -->
  <a-modal v-if="openEditForm" v-model:open="openEditForm" title="Chỉnh sửa thông tin Nhà thầu"
    :confirm-loading="editLoading" @ok="edit">
    <a-form :model="formEditState" layout="vertical">
      <a-form-item ref="firstName" label="Tên nhà thầu" name="name" required v-bind="validateInfosEditForm.name">
        <a-input v-model:value="formEditState.name" />
      </a-form-item>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item ref="signingDate" label="Ngày ký hợp đồng" name="signingDate" required
            v-bind="validateInfosEditForm.signingDate">
            <a-date-picker v-model:value="formEditState.signingDate" style="width:100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item ref="expirationDate" label="Ngày hết hạn hợp đồng" name="expirationDate" required
            v-bind="validateInfosEditForm.expirationDate">
            <a-date-picker v-model:value="formEditState.expirationDate" style="width:100%" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item ref="address" label="Địa chỉ" name="address">
        <!-- <a-input v-model:value="formEditState.address!.fullName" /> -->
        <AddressForm v-if="openEditForm" :initial-address-id="formEditState.address?.id"
          @save="(addressId: any) => formEditState.address!.id = addressId" />
      </a-form-item>
    </a-form>
  </a-modal>

  <!-- Popup create Contractor form -->
  <a-modal v-if="openAddForm" v-model:open="openAddForm" title="Tạo mới Nhà thầu" :confirm-loading="addLoading"
    @ok="add" @cancel="reset">
    <a-form layout="vertical">
      <a-form-item ref="name" label="Tên nhà thầu" name="name" required v-bind="validateInfosAddForm.name">
        <a-input v-model:value="formAddState.name" />
      </a-form-item>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item ref="signingDate" label="Ngày ký hợp đồng" name="signingDate" required
            v-bind="validateInfosAddForm.signingDate">
            <a-date-picker v-model:value="formAddState.signingDate" style="width:100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item ref="expirationDate" label="Ngày hết hạn hợp đồng" name="expirationDate" required
            v-bind="validateInfosAddForm.expirationDate">
            <a-date-picker v-model:value="formAddState.expirationDate" style="width:100%" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item ref="address" label="Địa chỉ" name="address">
        <!-- <a-input v-model:value="formAddState.address!.fullName" /> -->
        <AddressForm @save="(addressId: any) => formAddState.address.id = addressId" />
      </a-form-item>
    </a-form>
  </a-modal>

</template>

<style scoped></style>
