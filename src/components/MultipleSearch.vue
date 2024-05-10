<template>
  <div>
    <div v-for="(criterion, index) in searchCriteria" :key="index" class="criterion">
      <a-select v-model:value="criterion.attributeName" class="criterion-select column" :disabled="true">
        <a-select-option v-for="field in searchFields" :key="field.name" :value="field.name">{{ field.displayName
          }}</a-select-option>
      </a-select>

      <a-select v-model:value="criterion.operator" class="criterion-select">
        <a-select-option value="EQUAL">Bằng</a-select-option>
        <a-select-option v-if="
          getSelectedFieldType(criterion.attributeName || 'unknown') !==
          'string'
        " value="GREATER_THAN">Lớn hơn</a-select-option>
        <a-select-option v-if="
          getSelectedFieldType(criterion.attributeName || 'unknown') !==
          'string'
        " value="LESS_THAN">Nhỏ hơn</a-select-option>
      </a-select>

      <a-input v-if="
        getSelectedFieldType(criterion.attributeName || 'unknown') ===
        'string'
      " v-model:value="criterion.value" placeholder="Nhập giá trị" class="criterion-input" />
      <a-input-number v-else-if="
        getSelectedFieldType(criterion.attributeName || 'unknown') ===
        'number'
      " v-model:value="criterion.value" placeholder="Nhập giá trị" class="criterion-input" />
      <a-date-picker v-else-if="
        getSelectedFieldType(criterion.attributeName || 'unknown') === 'date'
      " v-model:value="criterion.value" class="criterion-input" />

      <a-button @click="removeCriterion(index)" class="remove-button">Xóa</a-button>
    </div>
    <div v-if="showCriterion" class="criterion">
      <div class="criterion-content">
        <a-select v-model:value="selectedField" class="criterion-select">
          <a-select-option v-for="field in searchFields" :key="field.name" :value="field.name">
            {{ field.displayName }}
          </a-select-option>
        </a-select>

        <a-select v-model:value="selectedOperator" class="criterion-select">
          <a-select-option value="EQUAL">Bằng</a-select-option>
          <a-select-option v-if="getSelectedFieldType(selectedField || 'unknown') !== 'string'" value="GREATER_THAN">Lớn
            hơn</a-select-option>
          <a-select-option v-if="getSelectedFieldType(selectedField || 'unknown') !== 'string'" value="LESS_THAN">Nhỏ
            hơn</a-select-option>
        </a-select>

        <a-input v-if="getSelectedFieldType(selectedField || 'unknown') === 'string'" v-model:value="searchValue"
          placeholder="Nhập giá trị" class="criterion-input" />
        <a-input-number v-else-if="
          getSelectedFieldType(selectedField || 'unknown') === 'number'
        " v-model:value="searchValue" placeholder="Nhập giá trị" class="criterion-input" />
        <a-date-picker v-else-if="
          getSelectedFieldType(selectedField || 'unknown') === 'date'
        " v-model:value="searchValue" class="criterion-input" />
      </div>
      <div class="button-group">
        <a-button @click="showCriterion = false" class="cancel-button">Hủy</a-button>
        <a-button @click="addAndHideCriterion" class="add-button">Thêm</a-button>
      </div>
    </div>
    <a-input v-model:value="keyword" placeholder="Search by keyword" class="keyword-input" />
    <a-button @click="showCriterion = true" class="add-criterion-button">Thêm trường tìm kiếm</a-button>
    <a-button @click="search" class="search-button">Search</a-button>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from "vue";
import store from "@/store";
import { SearchResourceApi, Pageable, SearchCriteria } from "@/api";
import { Configuration } from "@/configuration";
import { notification } from "ant-design-vue";

interface Field {
  type: string;
  name: string;
  displayName: string;
}

// Define the props object
const props = defineProps({
  searchFields: {
    type: Array as () => Field[],
    default: () => [],
  },
  entityName: {
    type: String,
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

const emits = defineEmits(["search"]);
const searchCriteria = ref<Array<SearchCriteria>>([]);
const selectedOperator = ref("EQUAL");
const selectedField = ref<string>("Trường tìm kiếm");
const searchValue = ref<string | number | Date>("");
const keyword = ref<string>("");
const showCriterion = ref(false);

const getSelectedFieldType = (fieldName: string) => {
  const field = props.searchFields.find((f) => f.name === fieldName);
  return field ? field.type : "unknown";
};

const addCriterion = () => {
  let value = searchValue.value;
  if (
    selectedField.value &&
    selectedOperator.value &&
    (typeof value === "string" ? value.trim() !== "" : value !== null)
  ) {
    if (searchCriteria.value.some(criterion => criterion.attributeName === selectedField.value)) {
      notification.warning({
        message: 'Warning',
        description: 'Trường đã được chọn. Vui lòng chọn trường khác.',
      });
      return false;
    }
    // Check if the value is a number
    if (typeof value === "string" && !isNaN(Number(value))) {
      value = Number(value);
    }
    // Check if the value is a date
    else if (typeof value === "string" && !isNaN(Date.parse(value))) {
      value = new Date(value);
    }
    searchCriteria.value.push({
      attributeName: selectedField.value,
      operator: selectedOperator.value,
      value: value,
    });
    console.log(
      selectedField.value + " " + selectedOperator.value + " " + value
    );
    selectedField.value = "Trường tìm kiếm";
    selectedOperator.value = "EQUAL";
    searchValue.value = "";
    return true;
  } else {
    notification.warning({
      message: 'Warning',
      description: 'Hãy nhập tất cả các trường !!',
    });
    return false;
  }
};

const addAndHideCriterion = () => {
  if (addCriterion()) {
    showCriterion.value = false;
  }
};

const removeCriterion = (index: number) => {
  searchCriteria.value.splice(index, 1);
};

const search = async () => {
  // Emit the search event with the current search criteria and keyword
  const criteria = searchCriteria.value.map((criterion) => ({
    attributeName: criterion.attributeName,
    operator: criterion.operator,
    value: criterion.value,
  }));

  const response = await searchEntities(
    criteria,
    keyword.value,
    props.entityName
  );
  emits("search", response);
};

async function searchEntities(
  criteria: SearchCriteria[],
  keyword: string | undefined,
  entityName: string
) {
  try {
    const pageable: Pageable = { page: 0, size: 10 };
    const response = await searchResourceApi.searchByAttributesAndKeyword(
      entityName,
      pageable,
      keyword,
      criteria
    );
    return response?.data;
  } catch (error) {
    console.error("Error searching entities:", error);
  }
}
</script>

<style scoped>
.criterion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.criterion-select {
  width: 200px;
  margin-right: 10px;
}

.criterion-input {
  flex-grow: 1;
  margin-right: 10px;
}

.remove-button {
  background-color: #f44336;
  color: white;
  border: none;
  cursor: pointer;
}

.add-button,
.add-criterion-button,
.search-button {
  background-color: #1890ff;
  color: white;
  border: none;
  cursor: pointer;
}

.add-button {
  margin-left: auto;
}

.search-button {
  margin: 10px;
}

.column {
  width: 25%;
}

.criterion-content {
  display: flex;
  width: 100%;
}

.button-group {
  gap: 10px;
  display: flex;
}
</style>
