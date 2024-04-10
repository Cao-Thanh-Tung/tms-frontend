<template>
  <div class="date-search">
    <a-select v-model:value="selectedAttribute" placeholder="Search with">
      <a-select-option v-for="attribute in props.attributes" :key="attribute">{{
        attribute
      }}</a-select-option>
    </a-select>
    <a-date-picker @change="startDate = $event" placeholder="Start Date" />
    <a-date-picker @change="endDate = $event" placeholder="End Date" />
    <button @click="search">Search</button>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";
import store from "@/store";
import { SearchResourceApi, Pageable } from "@/api";
import { Configuration } from "@/configuration";
import dayjs from "dayjs";
import { message } from "ant-design-vue";

// Define the props object
const props = defineProps({
  entityName: {
    type: String,
    required: true,
  },
  attributes: {
    type: Array as () => string[],
    required: true,
  },
});

const config = new Configuration({
  accessToken: () => store.getters.jwt,
  baseOptions: {
    headers: { "Content-Type": "application/json" },
  },
});

const searchResourceApi = new SearchResourceApi(config);

const selectedAttribute = ref<string | null>(null);
const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);
const emits = defineEmits(["search"]);

const search = async () => {
  if (!selectedAttribute.value) {
    message.error("Please select an attribute.");
    return;
  }
  if (startDate.value && endDate.value && dayjs(startDate.value).isAfter(dayjs(endDate.value))) {
    message.error('End date must be after start Date.');
    return;
  }
  if (!startDate.value && !endDate.value) {
    const pageable: Pageable = { page: 0, size: 10 };
    const response = await searchResourceApi.getAllEntities(props.entityName, pageable);
    emits('search', response.data);
  } else if (startDate.value && endDate.value) {
    const pageable: Pageable = { page: 0, size: 10 };
    const formattedStartDate = dayjs(startDate.value).format();
    const formattedEndDate = dayjs(endDate.value).format();
    const response = await searchResourceApi.searchByDate(
      props.entityName,
      selectedAttribute.value,
      formattedStartDate,
      formattedEndDate,
      pageable
    );
    emits("search", response.data);
  } else {
    message.error("Please fill in both fields.");
  }
};
</script>

<style scoped>
.date-search {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: auto;
  margin-bottom: 20px;
}

.date-search button {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

.date-search button:hover {
  background-color: #40a9ff;
}
</style>
