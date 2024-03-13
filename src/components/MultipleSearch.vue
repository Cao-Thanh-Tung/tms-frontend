<template>
  <div>
    <a-form :form="form">
      <a-form-item v-for="field in searchFields" :key="field.name" :label="field.label" :name="field.name">
        <a-input v-model:value="formValues[field.name]" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" @click="search">Search</a-button>
        <a-button @click="resetForm">Reset</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref } from 'vue';
const { searchFields } = defineProps<{
  searchFields: { name: string, label: string }[];
}>();

const emit = defineEmits(['search']);

const form = ref<any>(null);
const formValues = ref<{ [key: string]: any }>({});

function search() { 
  // Emit search event with form values
  emit('search', formValues.value);
}

function resetForm() {
  // form.value.resetFields();
  formValues.value = {};
}
</script>
