<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons-vue";
import store from "@/store";
import { Configuration } from "@/configuration";
import { ProvinceDTO, DistrictDTO, CommuneDTO } from "@/api";
import { ProvinceResourceApi, DistrictResourceApi } from "@/api";
import { CommuneResourceApi } from "../../api";
const numberOfProvince = 64;
const config = new Configuration({
  accessToken: () => store.getters.jwt,
});
const provinceApi = new ProvinceResourceApi(config);
const districtApi = new DistrictResourceApi(config);
const communeResourceApi = new CommuneResourceApi(config);
const provinces = ref<ProvinceDTO[]>([]);
const districts = ref<DistrictDTO[]>([]);
const communes = ref<CommuneDTO[]>([]);

const selectedProvince = ref(null);
const selectedDistrict = ref(null);
const selectedCommune = ref(null);

watch(selectedProvince, async (newProvince) => {
  if (!newProvince) return;
  districtApi
    .getDistrictsByProvince(newProvince)
    .then((res) => {
      districts.value = res.data;
    })
    .catch((e) => {
      console.error(e);
    });
});

watch(selectedDistrict, async (newDistrict) => {
  if (!newDistrict) return;
  communeResourceApi
    .getCommunesByDistrict(newDistrict)
    .then((res) => {
      communes.value = res.data;
    })
    .catch((e) => {
      console.error(e);
    });
});

onMounted(() => {
  provinceApi.getAllProvinces(0, numberOfProvince).then((res) => {
    provinces.value = res.data;
  }).catch((e) => {
    console.error(e);
  });
});
defineExpose({
  EditOutlined,
  DeleteOutlined,
  provinces,
  districts,
  communes,
  selectedProvince,
  selectedDistrict,
  selectedCommune,
});
</script>
<template>
  <a-breadcrumb style="margin: 16px 0">
    <a-breadcrumb-item>Quản lý điểm</a-breadcrumb-item>
    <a-breadcrumb-item>Danh sách Quận/Huyện/Tỉnh</a-breadcrumb-item>
  </a-breadcrumb>
  <a-select v-model:value="selectedProvince" placeholder="Select a province">
    <a-select-option
      v-for="province in provinces"
      :key="province.id"
      :value="province.id"
    >
      {{ province.name }}
    </a-select-option>
  </a-select>

  <a-select v-model:value="selectedDistrict" placeholder="Select a district">
    <a-select-option
      v-for="district in districts"
      :key="district.id"
      :value="district.id"
    >
      {{ district.name }}
    </a-select-option>
  </a-select>

  <a-select v-model:value="selectedCommune" placeholder="Select a commune">
    <a-select-option
      v-for="commune in communes"
      :key="commune.id"
      :value="commune.id"
    >
      {{ commune.name }}
    </a-select-option>
  </a-select>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
}

th {
  background-color: #f2f2f2;
}
</style>
