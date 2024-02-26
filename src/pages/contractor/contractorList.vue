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
        v-model:open="openCreate"
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
          <!-- <a-form-item label="Address">
            <a-input v-model:value="newContractor.address" />
          </a-form-item> -->
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
              <a @click="showUpdate(record)">Update</a>
              <a-modal
                v-model:open="openUpdate"
                title="Update Contractor"
                @ok="handleUpdateContractor()"
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
                    <a-date-picker
                      v-model:value="newContractor.expirationDate"
                    />
                  </a-form-item>
                  <!-- <a-form-item label="Address">
                    <a-input v-model:value="newContractor.address" />
                  </a-form-item> -->
                </form>
              </a-modal>
              <a-divider type="vertical" />
              <a-popconfirm
                v-if="state.dataSource"
                title="Sure to delete?"
                @confirm="onDelete(record.id)"
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
import { ContractorDTO } from '../../api';

const state = reactive({
  dataSource: <ContractorDTO>[],
  columns: [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Signing Date", dataIndex: "signingDate", key: "signingDate" },
    { title: "Expiration Date", dataIndex: "expirationDate", key: "expirationDate" },
    { title: "Address", dataIndex: "address", key: "address" },
    { title: "Action", key: "action" },
  ],
});

const openCreate = ref<boolean>(false);
const openUpdate = ref<boolean>(false);
const selectedContractor = ref<ContractorDTO | null>(null);

const showModal = () => {
  openCreate.value = !openCreate.value;
};

const showUpdate = (record: ContractorDTO) => {
  selectedContractor.value = record; // Store the selected contractor
  openUpdate.value = true;
};

const newContractor = reactive<ContractorDTO>({
  name: "",
  signingDate: "",
  expirationDate: "",
  addressId: undefined,
});

const handleAddContractor = async () => {
  try {
    const response = await axios.post("/contractors", newContractor);
    console.log("New contractor added:", response.data);
    Object.assign(newContractor, {
      name: "",
      signingDate: null,
      expirationDate: null,
      address: "",
    });
    showModal();
    await fetchData();
  } catch (error) {
    console.error("Error adding new contractor:", error);
  }
};

const fetchData = async () => {
  try {
    const response = await axios.get("/contractors?page=0&size=20");
    state.dataSource = response.data;
  } catch (error) {
    console.error("Error fetching contractors:", error);
  }
};

onMounted(async () => {
  await fetchData();
});

const onDelete = async (id: number) => {
  try {
    console.log(id);
    await axios.delete(`/contractors/${id}`);
    await fetchData();
  } catch (error) {
    console.error("Error deleting contractor:", error);
  }
};

const handleUpdateContractor = async () => {
  try {
    if (!selectedContractor.value) return; // Exit if no contractor is selected for update
    const response = await axios.put(`/contractors/${selectedContractor.value.id}`, selectedContractor.value);
    console.log("Contractor updated:", response.data);
    Object.assign(newContractor, {
      name: "",
      signingDate: null,
      expirationDate: null,
      address: "",
    });
    openUpdate.value = false;
    selectedContractor.value = null; // Clear the selected contractor after update
    await fetchData();
  } catch (error) {
    console.error("Error updating contractor:", error);
  }
};
</script>