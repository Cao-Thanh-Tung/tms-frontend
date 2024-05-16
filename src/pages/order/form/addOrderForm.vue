<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { Configuration } from '@/configuration';
import { OrderItemResourceApi, OrderResourceApi, UserXDTO } from '@/api';
import { debounce } from 'lodash-es';
import AddressForm from '@/components/AddressForm.vue';
import moment from 'moment';
import store from '@/store';
import { Form } from 'ant-design-vue';
import { AxiosResponse } from 'axios';
const useForm = Form.useForm;
const props = defineProps<{
    open: boolean;
    firstApi: () => Promise<AxiosResponse<UserXDTO[], any>>;
    secondApi: (value: any) => Promise<AxiosResponse<UserXDTO[], any>>;
}>();

const emit = defineEmits(['create-order-success', 'update:open']);
const config = new Configuration({
    accessToken: () => store.getters.jwt,
    baseOptions: {
        headers: { 'Content-Type': 'application/json' }
    }
});
const orderApi = new OrderResourceApi(config);
const orderItemApi = new OrderItemResourceApi(config);
// const userxApi = new UserXResourceApi(config);
const addOrderLoading = ref(false);

const rulesRef = reactive({
    code: [
        {
            required: true,
            message: 'Không để trống',
        },
    ],
    customerId: [
        {
            required: true,
            message: 'Không để trống',
        },
    ],
    cost: [
        {
            required: true,
            message: 'Không để trống',
        },
    ],
    goodType: [
        {
            required: true,
            message: 'Không để trống',
        },
    ],
    weight: [
        {
            required: true,
            message: 'Không để trống',
        },
    ],
    volume: [
        {
            validator: (_rule: any, value: string) => {
                return new Promise((resolve, reject) => {
                    if (addFormContent.goodType === 'masterbill') {
                        if (value == undefined || isNaN(parseFloat(value))) {
                            reject(new Error('Không để trống'));
                        } else if (parseFloat(value) <= 0) {
                            reject(new Error('Thể tích phải >= 0'));
                        } else {
                            resolve(undefined);
                        }
                    } else {
                        resolve(undefined);
                    }
                })
            },
        }
    ],

    numPallets: [
        {
            validator: (_rule: any, value: string) => {
                return new Promise((resolve, reject) => {
                    let numPallets = parseFloat(value);
                    if (addFormContent.goodType === 'pallet') {
                        if (value == undefined || isNaN(numPallets)) {
                            reject(new Error('Không để trống'));
                        } else if (numPallets <= 0) {
                            reject(new Error('Số pallet phải >= 0'));
                        } else if (numPallets % 1 != 0) {
                            reject(new Error('Số pallet phải là số nguyên'));
                        } else {
                            resolve(undefined);
                        }
                    } else {
                        resolve(undefined);
                    }
                })
            }
        }
    ],
    length: [
        {
            validator: (_rule: any, value: string) => {
                return new Promise((resolve, reject) => {
                    if (addFormContent.goodType === 'box') {
                        if (value == undefined || isNaN(parseFloat(value))) {
                            reject(new Error('Không để trống'));
                        } else if (parseFloat(value) <= 0) {
                            reject(new Error('Chiều dài phải >= 0'));
                        } else {
                            resolve(undefined);
                        }
                    } else {
                        resolve(undefined);
                    }
                })
            },
        },
    ],
    width: [
        {
            validator: (_rule: any, value: string) => {
                return new Promise((resolve, reject) => {
                    if (addFormContent.goodType === 'box') {
                        if (value == undefined || isNaN(parseFloat(value))) {
                            reject(new Error('Không để trống'));
                        } else if (parseFloat(value) <= 0) {
                            reject(new Error('Chiều rộng phải >= 0'));
                        } else {
                            resolve(undefined);
                        }
                    } else {
                        resolve(undefined);
                    }
                })
            },
        },
    ],
    height: [
        {
            validator: (_rule: any, value: string) => {
                return new Promise((resolve, reject) => {
                    if (addFormContent.goodType === 'box') {
                        if (value == undefined || isNaN(parseFloat(value))) {
                            reject(new Error('Không để trống'));
                        } else if (parseFloat(value) <= 0) {
                            reject(new Error('Chiều cao phải >= 0'));
                        } else {
                            resolve(undefined);
                        }
                    } else {
                        resolve(undefined);
                    }
                })
            },
        },
    ],
    waitingTimeSecIn: [
        {
            required: true,
            message: 'Không để trống',
        },
    ],
    waitingTimeSecOut: [
        {
            required: true,
            message: 'Không để trống',
        },
    ],
    carryTimeSecIn: [
        {
            required: true,
            message: 'Không để trống',
        },
    ],
    carryTimeSecOut: [
        {
            required: true,
            message: 'Không để trống',
        },
    ],
    rangeFrom: [
        {
            required: true,
            message: 'Khung thời gian không được để trống',
        },
    ],
    rangeTo: [
        {
            required: true,
            message: 'Khung thời gian không được để trống',
        },
    ],
    pickupAddressId: [
        {
            required: true,
            message: 'Địa chỉ lấy hàng không được để trống',
        },
    ],
    deliveryAddressId: [
        {
            required: true,
            message: 'Địa chỉ trả hàng không được để trống',
        },
    ],
});

const createAddFormModel = () => {
    return {
        code: undefined,
        customerId: undefined,
        cost: undefined,
        goodType: "masterbill",
        weight: undefined,
        volume: undefined,
        note: undefined,
        pickupAddressId: undefined,
        deliveryAddressId: undefined,
        numPallets: undefined,
        length: undefined,
        width: undefined,
        height: undefined,
        waitingTimeSecIn: 5,
        waitingTimeSecOut: 5,
        carryTimeSecIn: 5,
        carryTimeSecOut: 5,
        rangeFrom: [moment().startOf('day').subtract(1, 'months'), moment().endOf('day').add(1, 'months')],
        rangeTo: [moment().startOf('day').subtract(1, 'months'), moment().endOf('day').add(1, 'months')],
    }
};

type addFormType = {
    code: string | undefined;
    customerId: number | undefined;
    cost: number | undefined;
    goodType: string | undefined;
    weight: number | undefined;
    volume: number | undefined;
    note: string | undefined;
    pickupAddressId: number | undefined;
    deliveryAddressId: number | undefined;
    numPallets: number | undefined;
    length: number | undefined;
    width: number | undefined;
    height: number | undefined;
    waitingTimeSecIn: number | undefined;
    waitingTimeSecOut: number | undefined;
    carryTimeSecIn: number | undefined;
    carryTimeSecOut: number | undefined;
    rangeFrom: [moment.Moment, moment.Moment] | any;
    rangeTo: [moment.Moment, moment.Moment] | any;

}

let addFormContent = reactive<addFormType>(createAddFormModel());
const { resetFields, validate, validateInfos } = useForm(addFormContent, rulesRef);

const requestAddOrder = async () => {
    addOrderLoading.value = true;
    if (addFormContent.rangeFrom[0].isAfter(addFormContent.rangeTo[1])) {
        message.error('Thời gian lấy hàng phải trước thời gian trả hàng');
        addOrderLoading.value = false;
        return;
    }
    try {
        const orderId = (await orderApi.createOrder({
            code: addFormContent.code!,
            customer: { id: addFormContent.customerId! },
            cost: addFormContent.cost!,
            goodType: addFormContent.goodType!,
            weight: addFormContent.weight!,
            volume: addFormContent.volume!,
            status: '0',
        })).data.id;
        await orderItemApi.createOrderItem({
            type: 'from',
            goodType: addFormContent.goodType!,
            earliestTime: addFormContent.rangeFrom[0].format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            latestTime: addFormContent.rangeFrom[1]!.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            numPallets: addFormContent.goodType === 'pallet' ? addFormContent.numPallets! : undefined,
            length: addFormContent.goodType === 'box' ? addFormContent.length! : undefined,
            width: addFormContent.goodType === 'box' ? addFormContent.width! : undefined,
            height: addFormContent.goodType === 'box' ? addFormContent.height! : undefined,
            note: addFormContent.note!,
            orderId: orderId,
            address: { id: addFormContent.pickupAddressId! },
            volume: addFormContent.goodType === 'masterbill' ? addFormContent.volume! : undefined,
            waitingTimeSec: addFormContent.waitingTimeSecIn!,
            carryTimeSec: addFormContent.carryTimeSecIn!,
        });
        await orderItemApi.createOrderItem({
            type: 'to',
            goodType: addFormContent.goodType!,
            earliestTime: addFormContent.rangeTo[0].format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            latestTime: addFormContent.rangeTo[1].format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            numPallets: addFormContent.goodType === 'pallet' ? addFormContent.numPallets! : undefined,
            length: addFormContent.goodType === 'box' ? addFormContent.length! : undefined,
            width: addFormContent.goodType === 'box' ? addFormContent.width! : undefined,
            height: addFormContent.goodType === 'box' ? addFormContent.height! : undefined,
            note: addFormContent.note!,
            orderId: orderId,
            address: { id: addFormContent.deliveryAddressId! },
            volume: addFormContent.goodType === 'masterbill' ? addFormContent.volume! : undefined,
            weight: addFormContent.weight!,
            waitingTimeSec: addFormContent.waitingTimeSecOut!,
            carryTimeSec: addFormContent.carryTimeSecOut!,
        });
        message.success('Tạo đơn hàng thành công');
        addOrderLoading.value = false;
        emit('create-order-success');
    } catch (err: any) {
        console.log(err);
        if (err.code === "ERR_BAD_REQUEST") {
            if (err.response.data.errorKey === "ordercodeexists") {
                message.error("Mã đơn hàng đã tồn tại!");
            } else {
                message.error("Tạo đơn hàng thất bại");
            }
        } else {
            message.error('Tạo đơn hàng thất bại');
        }
        addOrderLoading.value = false;
    }
}

const addOrder = () => {
    validate().then(() => {
        requestAddOrder();
    }).catch((e) => {
        console.log(e);
    })
};

//user search
const state = reactive<{
    data: { label: string; value: number, img: string | null | undefined }[];
    fetching: boolean;
}>({
    data: [],
    fetching: false,
});
onMounted(() => {
    props.firstApi().then((res) => {
        state.data = res.data.map(user => ({
            label: `${user.user?.firstName} ${user.user?.lastName}`,
            value: user.id!,
            img: user.user?.imageUrl,
        }));
    });
});

const fetchUser = debounce(value => {
    state.data = [];
    state.fetching = true;
    props.secondApi(value).then((res) => {
        state.data = res.data.map(user => ({
            label: `${user.user?.firstName} ${user.user?.lastName}`,
            value: user.id!,
            img: user.user?.imageUrl,
        }));

        state.fetching = false;
    }).catch((e) => {
        console.log(e);
        state.fetching = false;
    });
}, 300);
const cancelHandle = () => {
    resetFields();
    emit('update:open', false);
}
</script>
<template>
    <a-modal width="900px" :open="$props.open" title="Thêm đơn hàng" :confirm-loading="addOrderLoading" @ok="addOrder"
        wrap-class-name="order-detail" okText="Lưu" cancelText="Hủy" :onCancel="cancelHandle">
        <a-form layout="vertical">
            <a-row :gutter="16">
                <a-col :span="5">
                    <a-form-item label="Mã đơn hàng" required v-bind="validateInfos.code">
                        <a-input v-model:value="addFormContent.code" placeholder="HTIT-MD-38I" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Khách hàng" required v-bind="validateInfos.customerId">
                        <a-select v-model:value="addFormContent.customerId" placeholder=" Chọn khách hàng" show-search
                            style="width: 100%" :options="state.data" @search="fetchUser" :filter-option="false">
                            <template v-if="state.fetching" #notFoundContent>
                                <a-spin size="small" />
                            </template>

                        </a-select>
                    </a-form-item>
                </a-col>
                <a-col :span="5">
                    <a-form-item label="Giá tiền" required v-bind="validateInfos.cost">
                        <a-input type="number" v-model:value="addFormContent.cost" placeholder="0" suffix="VND" />
                    </a-form-item>
                </a-col>
                <a-col :span="4">
                    <a-form-item label="Khối lượng" required v-bind="validateInfos.weight">
                        <a-input v-model:value="addFormContent.weight" type="number" placeholder="0" suffix="Kg" />
                    </a-form-item>
                </a-col>
                <a-col :span="4">
                    <a-form-item label="Loại hàng" required v-bind="validateInfos.goodType">
                        <a-select v-model:value="addFormContent.goodType">
                            <a-select-option key="masterbill" value="masterbill" default></a-select-option>
                            <a-select-option key="pallet" value="pallet"></a-select-option>
                            <a-select-option key="box" value="box"></a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16" v-if="addFormContent.goodType == 'pallet'">
                <a-col :span="6">
                    <a-form-item label="Số pallet" required v-bind="validateInfos.numPallets">
                        <a-input v-model:value="addFormContent.numPallets" type="number" suffix="pallet"
                            placeholder="0" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16" v-if="addFormContent.goodType == 'masterbill'">
                <a-col :span="8">
                    <a-form-item label="Thể tích" required v-bind="validateInfos.volume">
                        <a-input v-model:value="addFormContent.volume" type="number" placeholder="0">
                            <template #suffix>
                                m<sup style="font-size: 12px;">3</sup>
                            </template>
                        </a-input>
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16" v-if="addFormContent.goodType == 'box'">
                <a-col :span="6">
                    <a-form-item label="Chiều dài" required v-bind="validateInfos.length">
                        <a-input v-model:value="addFormContent.length" type="number" suffix="m" placeholder="0" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Chiều rộng" required v-bind="validateInfos.width">
                        <a-input v-model:value="addFormContent.width" type="number" suffix="m" placeholder="0" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Chiều cao" required v-bind="validateInfos.height">
                        <a-input v-model:value="addFormContent.height" type="number" suffix="m" placeholder="0" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="Khung thời gian lấy hàng" required v-bind="validateInfos.rangeFrom">
                        <a-range-picker :show-time="{ format: 'HH:mm' }" format="YYYY-MM-DD HH:mm"
                            :placeholder="['Start Time', 'End Time']" v-model:value="addFormContent.rangeFrom" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Khung thời gian trả hàng" required v-bind="validateInfos.rangeTo">
                        <a-range-picker :show-time="{ format: 'HH:mm' }" format="YYYY-MM-DD HH:mm"
                            :placeholder="['Start Time', 'End Time']" v-model:value="addFormContent.rangeTo" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16">
                <a-col :span="16">
                    <a-form-item label="Địa chỉ lấy hàng" required v-bind="validateInfos.pickupAddressId">
                        <address-form @save="(addressId: any) => addFormContent.pickupAddressId = addressId" />
                    </a-form-item>
                </a-col>
                <a-col :span="4">
                    <a-form-item label="Thời gian bốc" required v-bind="validateInfos.carryTimeSecIn">
                        <a-input v-model:value="addFormContent.carryTimeSecIn" type="number" placeholder="0"
                            suffix="phút" />
                    </a-form-item>
                </a-col>
                <a-col :span="4">
                    <a-form-item label="Thời gian chờ" required v-bind="validateInfos.waitingTimeSecIn">
                        <a-input v-model:value="addFormContent.waitingTimeSecIn" type="number" placeholder="0"
                            suffix="phút" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16">
                <a-col :span="16">
                    <a-form-item label="Địa chỉ trả hàng" required v-bind="validateInfos.deliveryAddressId">
                        <address-form @save="(addressId: any) => addFormContent.deliveryAddressId = addressId" />
                    </a-form-item>
                </a-col>
                <a-col :span="4">
                    <a-form-item label="Thời gian dỡ" required v-bind="validateInfos.carryTimeSecOut">
                        <a-input v-model:value="addFormContent.carryTimeSecOut" type="number" placeholder="0"
                            suffix="phút" />
                    </a-form-item>
                </a-col>
                <a-col :span="4">
                    <a-form-item label="Thời gian chờ" required v-bind="validateInfos.waitingTimeSecOut">
                        <a-input v-model:value="addFormContent.waitingTimeSecOut" type="number" placeholder="0"
                            suffix="phút" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-form-item label="Ghi chú">
                <a-input v-model:value="addFormContent.note" placeholder="Không ghi cũng được" />
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<style lang="less">
.order-detail {
    .ant-modal {
        top: 10px;
        max-width: 95%;
        margin: auto;
    }

    padding: 20px;


}
</style>
