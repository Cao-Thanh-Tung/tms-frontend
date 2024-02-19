<template>
  <div>
    <a-breadcrumb style="margin: 16px 0">
      <a-breadcrumb-item>Nhà thầu</a-breadcrumb-item>
      <a-breadcrumb-item>Danh sách nhà thầu</a-breadcrumb-item>
    </a-breadcrumb>
    <a-layout-content
      :style="{
        background: '#fff',
        padding: '24px',
        margin: 0,
        minHeight: '280px',
      }"
    >
      Danh sách nhà thầu
      <a-button type="primary" @click="showModal">Add new Contractor</a-button>
      <!-- Add New Contractor Modal -->
      <a-modal
        v-model:visible="visible"
        title="Add New Contractor"
        @ok="handleAddContractor"
      >
        <!-- Form for adding a new contractor -->
        <form>
          <a-form-item label="Name">
            <a-input v-model:value="newContractor.name" />
          </a-form-item>
          <a-form-item label="Signing Date">
            <a-date-picker v-model:value="newContractor.signingDate" />
          </a-form-item>
          <a-form-item label="Expiration Date">
            <a-date-picker v-model:value="newContractor.expirationDate" />
          </a-form-item>
          <a-form-item label="Address">
            <a-input v-model:value="newContractor.address" />
          </a-form-item>
        </form>
      </a-modal>

      <!-- Table to display contractors -->
      <a-table :columns="state.columns" :data-source="state.dataSource">
        <template #headerCell="{ column }">
          <template v-if="column.key === 'name'">
            <span> Name </span>
          </template>
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a>
              {{ record.name }}
            </a>
          </template>
          <template v-else-if="column.key === 'action'">
            <span>
              <a>Update</a>
              <a-divider type="vertical" />
              <a-popconfirm
                v-if="state.dataSource.length"
                title="Sure to delete?"
                @confirm="onDelete(record.key)"
              >
                <a>Delete</a>
              </a-popconfirm>
              <a-divider type="vertical" />
            </span>
          </template>
        </template>
      </a-table>
    </a-layout-content>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from "vue";
import axios from "axios";
import moment from "moment";
import { ContractorDTO } from '../../api';

const state = reactive({
  dataSource: <ContractorDTO>[],
  columns: [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Signing Date",
      dataIndex: "signingDate",
      key: "signingDate",
      customCell: (object: ContractorDTO) => {
        console.log(object);
        const formattedDate = moment(object.signingDate).format("DD/MM/YYYY");
        return formattedDate;
      },
    },
    {
      title: "Expiration Date",
      dataIndex: "expirationDate",
      key: "expirationDate",
      // customRender: (text: string) => moment(text).format("DD/MM/YYYY"),
    },
    { title: "Address", dataIndex: "address", key: "address" },
    {
      title: "Action",
      key: "action",
    },
  ],
});

// Modal visibility state
const visible = ref<boolean>(false);

const showModal = () => {
  visible.value = !visible.value;
};

// Data for adding a new contractor
const newContractor = reactive({
  name: "",
  signingDate: null,
  expirationDate: null,
  address: "",
});

// Function to handle adding a new contractor
const handleAddContractor = async () => {
  try {
    // Make HTTP POST request to add a new contractor
    const response = await axios.post("/contractors", newContractor);
    console.log("New contractor added:", response.data);
    // Reset the form after successful addition
    Object.assign(newContractor, {
      name: "",
      signingDate: null,
      expirationDate: null,
      address: "",
    });
    // Hide the modal after adding the contractor
    showModal();
    await fetchData();
  } catch (error) {
    console.error("Error adding new contractor:", error);
  }
};

// Fetch data from the API endpoint when the component is mounted
const fetchData = async () => {
  try {
    const response = await axios.get("/contractors?page=0&size=20");
    state.dataSource = response.data;
  } catch (error) {
    console.error("Error fetching contractors:", error);
  }
};

// Fetch data from the API endpoint when the component is mounted
onMounted(async () => {
  await fetchData();
});
</script>
