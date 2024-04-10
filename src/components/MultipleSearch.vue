<template>
  <div style="padding: 20px;">
    <div v-for="(criterion, index) in searchCriteria" :key="index" style="display: flex; align-items: center; margin-bottom: 10px;">
      <span style="margin-right: 10px;">{{ criterion.name }}:</span>
      <div class="input-container">
        <a-input v-model:value="criterion.value" placeholder="Enter value for {{ criterion.name }}" />
      </div>
      <a-button @click="removeCriterion(index)" style="margin-left: 10px;">Remove</a-button>
    </div>
    <div style="display: flex; align-items: center; margin-bottom: 20px;">
      <a-input v-model:value="searchValue" placeholder="Enter value" style="margin-right: 10px;" />
      <a-select v-model:value="selectedField" style="width: 200px; margin-right: 10px;">
        <a-select-option v-for="field in searchFields" :key="field.name" :value="field.name">
          {{ field.label }}
        </a-select-option>
      </a-select>
      <a-button @click="addCriterion">Add</a-button>
    </div>
    <a-button type="primary" html-type="submit" @click="search">Search</a-button>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';
import store from "@/store";
import { Entity, SearchParams } from "@/search.types"
import { SearchResourceApi, Pageable } from "@/api";
import { Configuration } from "@/configuration";

interface Field {
  name: string;
  label: string;
}

// Define the props object
const props = defineProps({
  searchFields: {
    type: Array as () => Field[],
    default: () => [],
  },
  entityName: {
    type: String,
    required: true
  }
});

const config = new Configuration({
  accessToken: () => store.getters.jwt,
  baseOptions: {
    headers: { "Content-Type": "application/json" },
  },
});

const searchResourceApi = new SearchResourceApi(config);

const emits = defineEmits(['search']);
const searchCriteria = ref<Array<{name: string, value: string}>>([]);
const selectedField = ref<string>('');
const searchValue = ref<string>('');

const addCriterion = () => {
  if (selectedField.value && searchValue.value.trim() !== '') {
    searchCriteria.value.push({ name: selectedField.value, value: searchValue.value });
    selectedField.value = '';
    searchValue.value = '';
  }
};

const removeCriterion = (index: number) => {
  searchCriteria.value.splice(index, 1);
};

const search = async () => {  
  // Emit the search event with the current search criteria and keyword
  const criteria = searchCriteria.value.reduce((obj, item) => Object.assign(obj, { [item.name]: item.value }), {});
  const keyword = searchValue.value.trim() !== '' ? searchValue.value : undefined;
  const params: SearchParams<Entity> = { criteria, keyword };
  const response = await searchEntities(params, props.entityName);
  emits('search', response?.data);
};

async function searchEntities<T extends Entity>({ criteria, keyword }: SearchParams<T>, entityName: string) {
  try {
    const pageable: Pageable = { page: 0, size: 10 }; 
    let allParams = { ...criteria };
    if (keyword) {
      allParams = { ...allParams, keyword };
    }
    const stringParams = Object.fromEntries(Object.entries(allParams).map(([key, value]) => [key, String(value)]));
    return await searchResourceApi.searchEntities(entityName, stringParams, pageable);
  } catch (error) {
    console.error('Error searching entities:', error);
  }
}
</script>

<style scoped>
.input-container input {
  width: auto !important;
}
</style>