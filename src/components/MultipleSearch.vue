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
import { ref } from 'vue';

interface Field {
  name: string;
  label: string;
}

const props = defineProps({
  searchFields: Array as () => Field[],
})

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

const search = () => {  
  // Emit the search event with the current search criteria
  if (!selectedField.value && searchValue.value) {
    emits('search', { keyword: searchValue.value });
  } else {
    emits('search', searchCriteria.value.reduce((obj, item) => Object.assign(obj, { [item.name]: item.value }), {}));
  }
};
</script>

<style scoped>
.input-container input {
  width: auto !important;
}
</style>