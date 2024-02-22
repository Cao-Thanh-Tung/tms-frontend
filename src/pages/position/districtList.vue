<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons-vue";
import store from "@/store";
import { Configuration } from "@/configuration";
import { ProvinceDTO, DistrictDTO, CommuneDTO } from "@/api";
const token = store.state.jwt;
import { ProvinceResourceApi, DistrictResourceApi } from "@/api";
import {
  ProvinceResourceApiFactory,
  DistrictResourceApiFactory,
} from "../../api";
const config = new Configuration({
  accessToken: () => token,
});
console.log(token);
const provinceApi = new ProvinceResourceApiFactory(config);
const districtResource = new DistrictResourceApiFactory(config);
console.log(provinceApi);
const provinces = ref<ProvinceDTO[]>([]);
const districts = ref<DistrictDTO[]>([]);
const communes = ref<CommuneDTO[]>([]);

const selectedProvince = ref(null);
const selectedDistrict = ref(null);
const selectedCommune = ref(null);

watch(selectedProvince, async (newProvince) => {
  try {
    if (newProvince) {
      //   dis
      //   districts.value = res.data;
      // } else {
      districts.value = [];
    }
    selectedDistrict.value = null;
  } catch (e) {
    console.error(e);
  }
});

watch(selectedDistrict, async (newDistrict) => {
  try {
    if (newDistrict) {
      const res = await axios.get(`/communes/district/${newDistrict}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      communes.value = res.data;
    } else {
      communes.value = [];
    }
    selectedCommune.value = null;
  } catch (e) {
    console.error(e);
  }
});

onMounted(() => {
  districtResource
    .getAllDistricts(0, 100)
    .then((response) => {
      provinces.value = response.data;
      console.log("Danh sách tỉnh/thành phố:", response.data);
    })
    .catch((error) => {
      console.error("Đã xảy ra lỗi khi lấy danh sách tỉnh/thành phố:", error);
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
