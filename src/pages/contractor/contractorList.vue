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
      <!-- Add New Contractor Modal -->
      <a-modal open="Add New" title="Add New Contractor" @ok="handleOk">
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
          <!-- <a-button type="primary" html-type="submit">Submit</a-button> -->
        </form>
      </a-modal>
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

<script lang="ts" setup>
import { reactive, onMounted } from "vue";
import axios from "axios";
import moment from "moment";

const state = reactive({
  dataSource: [],
  columns: [
    // Define your columns here based on the structure of ContractorDTO
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Signing Date",
      dataIndex: "signingDate",
      key: "signingDate",
      customRender: (text: string) => moment(text).format("DD/MM/YYYY"),
    },
    {
      title: "Expiration Date",
      dataIndex: "expirationDate",
      key: "expirationDate",
      customRender: (text: string) => moment(text).format("DD/MM/YYYY"),
    },
    { title: "Address", dataIndex: "address", key: "address" },
    { title: "Action", key: "action" },
    // Add more columns as needed
  ],
});

// Function to fetch data from the API endpoint when the component is mounted
onMounted(async () => {
  try {
    const response = await axios.get("/contractors?page=0&size=20");
    state.dataSource = response.data;
  } catch (error) {
    console.error("Error fetching contractors:", error);
  }
});

// Data for adding a new contractor
const newContractor = reactive({
  name: '',
  signingDate: null,
  expirationDate: null,
  address: ''
});

// Function to handle adding a new contractor
const handleOk = async () => {
  try {
    // Make HTTP POST request to add a new contractor
    const response = await axios.post("/contractors", newContractor);
    console.log('New contractor added:', response.data);
    // Reset the form after successful addition
    Object.assign(newContractor, {
      name: '',
      signingDate: null,
      expirationDate: null,
      address: ''
    });
  } catch (error) {
    console.error("Error adding new contractor:", error);
  }
};
</script>
