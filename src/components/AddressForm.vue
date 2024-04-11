<script setup lang="ts">
import { Configuration } from '@/configuration';
import store from '@/store';
import MapChooseAddress from '@/components/MapChooseAddress.vue';
import { CommuneResourceApi, DistrictResourceApi, ProvinceResourceApi, AddressResourceApi } from '@/api';
import { onMounted, reactive, ref, computed } from 'vue';
import { Coord } from './MapChooseAddress.vue';
import axios from 'axios';
import { ProvinceDTO, DistrictDTO, CommuneDTO } from '../api';
const props = defineProps<{
    initialAddressId?: number,
}>();
const provinceOptions = ref<ProvinceDTO[]>([]);
const districtOptions = ref<DistrictDTO[]>([]);
const communeOptions = ref<CommuneDTO[]>([]);
const emit = defineEmits(['save']);
const address = reactive<{
    province: ProvinceDTO,
    district: DistrictDTO,
    commune: CommuneDTO,
    detail: string,
}>({
    province: {
        id: -1,
        name: "",
    },
    district: {
        id: -1,
        name: "",
    },
    commune: {
        id: -1,
        name: "",
    },
    detail: '',
});

onMounted(async () => {
    provinceApi.getAllProvinces(0, 100).then((res) => {
        provinceOptions.value = res.data;
    });
    if (props.initialAddressId) {
        try {
            const { provinceId, districtId, communeId, street } = (await addressApi.getAddress(props.initialAddressId)).data;
            address.detail = street || '';
            if (provinceId) {
                districtOptions.value = (await districtApi.getDistrictsByProvince(provinceId!)).data;
                address.province = provinceOptions.value.find((item) => item.id === provinceId)!;
            }
            if (districtId) {
                communeOptions.value = (await communeApi.getCommunesByDistrict(districtId!)).data;
                address.district = districtOptions.value.find((item) => item.id === districtId)!;
            }
            if (communeId) {
                address.commune = communeOptions.value.find((item) => item.id === communeId)!;
            }
        } catch (e) {
            console.log(e);
        }
    }
})
function getAddressFullName() {
    return `${address.province.name!}${address.district.name ? ", " + address.district.name : ""}${address.commune.name ? ", " + address.commune.name : ""}${address.detail ? ", " + address.detail : ""}`;
}
const addressFullName = computed(() => {
    return getAddressFullName();
})
const coord = reactive<Coord>({
    lat: 0,
    lng: 0,
});

const config = new Configuration({
    accessToken: () => store.getters.jwt,
    baseOptions: {
        headers: { 'Content-Type': 'application/json' }
    }
})

const communeApi = new CommuneResourceApi(config);
const districtApi = new DistrictResourceApi(config);
const provinceApi = new ProvinceResourceApi(config);
const addressApi = new AddressResourceApi(config);
function chooseProvince(province: ProvinceDTO) {
    console.log("ok");
    address.province = province;
    address.district = {
        id: -1,
        name: "",
    }
    address.commune = {
        id: -1,
        name: "",
    }
    address.detail = "";
    districtApi.getDistrictsByProvince(province.id!).then((res) => {
        districtOptions.value = res.data;
    }).catch((err) => console.log(err));
}
function chooseDistrict(district: DistrictDTO) {
    address.district = district;
    address.commune = {
        id: -1,
        name: "",
    }
    address.detail = "";
    communeApi.getCommunesByDistrict(district.id!).then((res) => {
        communeOptions.value = res.data;
    }).catch((err) => console.log(err));
}
function chooseCommune(commune: CommuneDTO) {
    address.commune = commune;
    address.detail = "";
}
function save() {
    // axios.get(`https://nominatim.openstreetmap.org/search`, {
    //     params: {
    //         q: p,
    //         format: "json",
    //     }
    // }).then((res) => {
    //     console.log(res.data);
    //     const { lat, lon } = res.data[0];
    //     coord.lat = lat;
    //     coord.lng = lon;
    // }).catch((err) => {
    //     console.log(err);
    // })
    emit('save',)
}
</script>

<template>
    <a-form style="width: 400px;">
        <h2 style="margin-top: 10px">Địa chỉ</h2>
        <a-select style="width: 100%" showSearch="true" :value="addressFullName">
            <template #dropdownRender>
                <a-tabs animated="">
                    <a-tab-pane key="province" tab="Tỉnh/Thành phố">
                        <a-list class="scroll" :data-source="provinceOptions">
                            <template #renderItem="{ item }">
                                <a-list-item :class="{ warm: item.id == address.province.id }"
                                    @click="() => chooseProvince(item)">{{ item.name }}</a-list-item>
                            </template>
                        </a-list>
                    </a-tab-pane>
                    <a-tab-pane key="district" tab="Quận/Huyện" :disabled="address.province.id == -1">
                        <a-list class="scroll" :data-source="districtOptions">

                            <template #renderItem="{ item }">
                                <a-list-item :class="{ warm: item.id == address.district.id }"
                                    @click="() => chooseDistrict(item)">{{ item.name }}</a-list-item>
                            </template>
                        </a-list>
                    </a-tab-pane>
                    <a-tab-pane key="commune" tab="Phường/Xã" :disabled="address.district.id == -1">
                        <a-list class="scroll" :data-source="communeOptions">

                            <template #renderItem="{ item }">
                                <a-list-item :class="{ warm: item.id == address.commune.id }"
                                    @click="() => chooseCommune(item)">{{ item.name }}</a-list-item>
                            </template>
                        </a-list>
                    </a-tab-pane>
                    <a-tab-pane key="detail" tab="Chi tiết"
                        :disabled="(address.commune.id == -1 && address.district.name != 'Huyện Côn Đảo')">
                        <a-select v-model:value="value" mode="tags" style="width: 100%" :token-separators="[',']"
                            placeholder="Automatic tokenization" :options="options" @change="handleChange"></a-select>
                        <a-list class="scroll" :data-source="communeOptions">

                            <template #renderItem="{ item }">
                                <a-list-item>{{ item.label }}</a-list-item>
                            </template>
                        </a-list>
                    </a-tab-pane>
                </a-tabs>
            </template>
        </a-select>
        <map-choose-address style="width:400px; height: 100px" :lat="coord?.lat" :lng="coord?.lng"></map-choose-address>
        <button :onClick="save">Save</button>
    </a-form>
</template>

<style scoped>
.scroll {
    overflow: auto;
    height: 200px;
}

.warm {
    color: red;
}
</style>