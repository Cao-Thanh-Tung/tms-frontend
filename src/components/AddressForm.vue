<script setup lang="ts">
import { Configuration } from '@/configuration';
import store from '@/store';
// import mapApp from '@/pages/map/map.vue';
import { CommuneResourceApi, DistrictResourceApi, ProvinceResourceApi } from '@/api';
import { ref, onBeforeMount } from 'vue';
import type { SelectProps } from 'ant-design-vue';
import axios from 'axios';

const config = new Configuration({
    accessToken: () => store.getters.jwt,
    baseOptions: {
        headers: { 'Content-Type': 'application/json' }
    }
})
const communeApi = new CommuneResourceApi(config);
const districtApi = new DistrictResourceApi(config);
const provinceApi = new ProvinceResourceApi(config);
const province = ref('');
const district = ref('');
const commune = ref('');
const addressDetail = ref('');
const provinceOptions = ref<SelectProps['options']>([]);
const districtOptions = ref<SelectProps['options']>([]);
const communeOptions = ref<SelectProps['options']>([]);
const focus = () => {
    console.log('focus');
};

const changeCommune = (value: number) => {
    console.log(value);
};
const changeDistrict = (value: number) => {
    communeApi.getCommunesByDistrict(value).then((res) => {
        communeOptions.value = res.data.map((commune) => {
            return {
                value: commune.id,
                label: commune.name,
            }
        });
    })
};
const changeProvince = (value: number) => {
    districtApi.getDistrictsByProvince(value).then((res) => {
        districtOptions.value = res.data.map((district) => {
            return {
                value: district.id,
                label: district.name,
            }
        });
    });
};
function save() {
    const a = provinceOptions.value?.find((item) => { return item.value = province.value })
    const b = districtOptions.value?.find((item) => { return item.value = district.value })
    const c = communeOptions.value?.find((item) => { return item.value = commune.value })
    const p = `${addressDetail.value}, ${c?.label}, ${b?.label}, ${a?.label}`;
    axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
            q: p,
        }
    }).then((res) => {
        console.log(res);
    }).catch((err) => {
        console.log(err);
    })
}
onBeforeMount(() => {
    provinceApi.getAllProvinces(0, 100).then((res) => {
        provinceOptions.value = res.data.map((province) => {
            return {
                value: province.id,
                label: province.name,
            }
        });
    });
})
</script>
<template>
    <a-form style="width: 400px;">
        <h2 style="margin-top: 10px">Địa chỉ</h2>
        <a-form-item label="Tỉnh/Thành phố">
            <a-select ref="select" v-model:value="province" :options="provinceOptions" @focus="focus"
                @change="changeProvince"></a-select>
        </a-form-item>
        <a-form-item label="Quận/Huyện">
            <a-select v-model:value="district" :options="districtOptions" @change="changeDistrict"></a-select>
        </a-form-item>
        <a-form-item label="Phường/Xã">
            <a-select defaultValue="null" v-model:value="commune" :options="communeOptions"
                @change="changeCommune"></a-select>
        </a-form-item>
        <a-form-item label="Địa chỉ cụ thể">
            <a-input v-model:value="addressDetail"></a-input>
        </a-form-item>
        <!-- <map-app style="width:400px; height:300px"></map-app> -->
        <button :onClick="save"> Save</button>
    </a-form>
</template>
  
<style scoped></style>