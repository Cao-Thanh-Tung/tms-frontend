<script setup lang="ts">
import { Configuration } from '@/configuration';
import store from '@/store';
import MapChooseAddress from '@/components/MapChooseAddress.vue';
import { CommuneResourceApi, DistrictResourceApi, ProvinceResourceApi, AddressResourceApi, AddressDTO, PositionResourceApi } from '@/api';
import { onMounted, reactive, ref, computed } from 'vue';
import { Coord } from './MapChooseAddress.vue';
import axios from 'axios';
import { ProvinceDTO, DistrictDTO, CommuneDTO } from '../api';
import type { SelectProps } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { defineComponent } from 'vue';

const props = defineProps<{
    initialAddressId?: number,
}>();
const openSelect1 = ref<boolean>(false);
const openSelect2 = ref<boolean>(false);
const provinceOptions = ref<ProvinceDTO[]>([]);
const districtOptions = ref<DistrictDTO[]>([]);
const communeOptions = ref<CommuneDTO[]>([]);
const emit = defineEmits(['save']);
const address = reactive<{
    province: ProvinceDTO,
    district: DistrictDTO,
    commune: CommuneDTO,
    detail: string,
    id: number,
    positionId: number,
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
    id: -1,
    positionId: -1,
});

const addressSuggestedList = ref<AddressDTO[]>([]);
const options = ref<SelectProps['options']>([]);
const value = ref();
const searchValue = ref('');
const addressLoading = ref(false);
const positionLoading = ref(false);

onMounted(async () => {
    provinceApi.getAllProvinces(0, 100).then((res) => {
        provinceOptions.value = res.data;
    });
    if (props.initialAddressId) {
        try {
            const { provinceId, districtId, communeId, street, positionId } = (await addressApi.getAddress(props.initialAddressId)).data;
            address.detail = street || '';
            searchValue.value = street || '';
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
            address.positionId = positionId!;
            let position = (await positionApi.getPosition(positionId!)).data;
            coord.lat = position.lat!;
            coord.lng = position.lng!;
        } catch (e) {
            console.log(e);
        }
    }
})
function getAddressFullName() {
    return `${address.province.name!}${address.district.name ? ", " + address.district.name : ""}${address.commune.name ? ", " + address.commune.name : ""}${searchValue.value != '' ? ", " + searchValue.value : ""}`;
}
function getAddressFullName2() {
    return `${address.province.name!}${address.district.name ? ", " + address.district.name : ""}${address.commune.name ? ", " + address.commune.name : ""}${address.detail != '' ? ", " + address.detail : ""}`;
}
const addressFullName = computed(() => {
    if (searchValue.value == '' || searchValue.value == null) {
        return getAddressFullName2();
    } else {
        return getAddressFullName();
    }
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
const positionApi = new PositionResourceApi(config);
function chooseProvince(province: ProvinceDTO) {
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
async function save() {
    if (address.positionId == -1) {
        addressLoading.value = true;
        try {
            address.positionId = (await positionApi.createPosition({
                lat: coord.lat,
                lng: coord.lng,
            })).data.id!;
            address.id = (await addressApi.createAddress(<AddressDTO>{
                street: address.detail,
                fullName: getAddressFullName2(),
                positionId: address.positionId,
                provinceId: address.province.id,
                districtId: address.district.id,
                communeId: address.commune.id,
            })).data.id!;
        } catch (error) {
            console.log(error);
        } finally {
            addressLoading.value = false;
        }
    }
    openSelect1.value = false;
    emit('save', address.id);

}

const handleChange = (value: string) => {
    let addressSelected = addressSuggestedList.value?.find((item) => {
        return item.id == Number(value);
    });
    address.detail = addressSelected?.street!;
    searchValue.value = addressSelected?.street!;
    address.positionId = addressSelected?.positionId!;
    address.id = Number(value);
    openSelect2.value = false;
    positionApi.getPosition(addressSelected?.positionId!).then((res) => {
        coord.lat = res.data.lat!;
        coord.lng = res.data.lng!;
    })
};

const filterOption = (input: string, option: any) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

const VNodes = defineComponent({
    props: {
        vnodes: {
            type: Object,
            required: true,
        },
    },
    render() {
        return this.vnodes;
    },
});


const addItem = (e: any) => {
    e.preventDefault();
    address.detail = searchValue.value;
    positionLoading.value = true;
    address.positionId = -1;
    axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
            q: getAddressFullName(),
            format: "json",
        }
    }).then((res) => {
        try {
            const { lat, lon } = res.data[0];
            coord.lat = lat;
            coord.lng = lon;
        } catch (e) {
            axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: {
                    q: `${address.province.name!}${address.district.name ? ", " + address.district.name : ""}${address.commune.name ? ", " + address.commune.name : ""}`,
                    format: "json",
                }
            }).then((res1) => {
                const { lat, lon } = res1.data[0];
                coord.lat = lat;
                coord.lng = lon;
            }).catch((err) => {
                console.log(err);
            })
        }

    }).catch((err) => {
        console.log(err);
    }).then(() => {
        positionLoading.value = false;
        openSelect2.value = false;
    })

};

function choosePosition(lat: number, lng: number) {
    address.id = -1;
    address.positionId = -1;
    coord.lat = lat;
    coord.lng = lng;
}

function search(detail: string) {
    address.positionId = -1;
    searchValue.value = detail;
    addressApi.getAllAddressesByCondition(address.commune.id!, address.district.id!, detail, 0).then((res) => {
        addressSuggestedList.value = res.data;
        options.value = res.data.map((item: AddressDTO) => {
            return {
                value: item.id,
                label: item.street,
            }
        })
    }).catch((err) => {
        console.log(err);
    })
}
</script>

<template>
    <a-select style="width: 100%" showSearch :value="addressFullName" :open="openSelect1"
        @click="() => { openSelect1 = !openSelect1 }" @blur="() => { openSelect1 = false }">
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
                    <a-select v-model:value="value" show-search placeholder="Địa chỉ chi tiết" style="width: 100%"
                        :options="options" :filter-option="filterOption" @change="handleChange" @search="search"
                        :open="openSelect2" @click="() => { openSelect2 = !openSelect2 }"
                        @blur="() => { openSelect2 = false }" ref="detailSelectRef">

                        <template #dropdownRender="{ menuNode: menu }">
                            <v-nodes :vnodes="menu" />
                            <a-divider style="margin: 4px 0" />
                            <a-space style="padding: 4px 8px">
                                <a-button type="text" @click="addItem" :loading="positionLoading">
                                    <template #icon>
                                        <plus-outlined />
                                    </template>
                                    Add item
                                </a-button>
                            </a-space>
                        </template>
                    </a-select>
                    <map-choose-address style="width:100%; height: 200px" :lat="coord.lat" :lng="coord.lng"
                        @choose="choosePosition"></map-choose-address>
                    <a-button :onClick="save" :loading="addressLoading">Lưu</a-button>
                </a-tab-pane>
            </a-tabs>
        </template>
    </a-select>
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