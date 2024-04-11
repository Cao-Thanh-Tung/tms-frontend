<script lang="ts" setup>
import { ref, reactive, onMounted, onUpdated } from 'vue';
import { message } from 'ant-design-vue';
import moment from 'moment';
import store from '@/store';
import { Configuration } from '@/configuration';
import { OrderItemResourceApi, OrderResourceApi, UserXDTO, UserXResourceApi } from '@/api';
import AddressForm from '@/components/AddressForm.vue';
import { debounce } from 'lodash-es';
import { Form } from 'ant-design-vue';
import { AxiosResponse } from 'axios';
const useForm = Form.useForm;

const props = defineProps<{
    open: boolean;
    orderId: number;
    firstApi: () => Promise<AxiosResponse<UserXDTO[], any>>;
    secondApi: (value: any) => Promise<AxiosResponse<UserXDTO[], any>>;
}>();
const emit = defineEmits(['edit-order-success', 'update:open']);

const config = new Configuration({
    accessToken: () => store.getters.jwt,
    baseOptions: {
        headers: { 'Content-Type': 'application/json' }
    }
});
const orderApi = new OrderResourceApi(config);
const orderItemApi = new OrderItemResourceApi(config);
const userxApi = new UserXResourceApi(config);

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
            validator: (rule: any, value: string) => {
                return new Promise((resolve, reject) => {
                    if (editFormContent.goodType === 'masterbill') {
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
            validator: (rule: any, value: string) => {
                return new Promise((resolve, reject) => {
                    let numPallets = parseFloat(value);
                    if (editFormContent.goodType === 'pallet') {
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
            validator: (rule: any, value: string) => {
                return new Promise((resolve, reject) => {
                    if (editFormContent.goodType === 'box') {
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
            validator: (rule: any, value: string) => {
                return new Promise((resolve, reject) => {
                    if (editFormContent.goodType === 'box') {
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
            validator: (rule: any, value: string) => {
                return new Promise((resolve, reject) => {
                    if (editFormContent.goodType === 'box') {
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

const editOrderLoading = ref(false);
const editFormContent = reactive<
    {
        id: number | undefined;
        fromOrderItemId: number | undefined;
        toOrderItemId: number | undefined;
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
        rangeFrom: [moment.Moment, moment.Moment];
        rangeTo: [moment.Moment, moment.Moment];
    }
>({
    id: undefined,
    fromOrderItemId: undefined,
    toOrderItemId: undefined,
    code: undefined,
    customerId: undefined,
    cost: undefined,
    goodType: undefined,
    weight: undefined,
    volume: undefined,
    note: undefined,
    pickupAddressId: undefined,
    deliveryAddressId: undefined,
    numPallets: undefined,
    length: undefined,
    width: undefined,
    height: undefined,
    waitingTimeSecIn: undefined,
    waitingTimeSecOut: undefined,
    carryTimeSecIn: undefined,
    carryTimeSecOut: undefined,
    rangeFrom: [moment(), moment()],
    rangeTo: [moment(), moment()],
});

const loadEditForm = ref(false);
onUpdated(() => {
    if (!props.open) {
        return;
    }
    showEditOrder(props.orderId!);
})

const showEditOrder = async (orderId: number) => {
    loadEditForm.value = true;
    editFormContent.id = orderId;
    try {
        const order = (await orderApi.getOrder(orderId)).data;
        editFormContent.code = order.code;
        editFormContent.customerId = order.customer?.id;
        editFormContent.cost = order.cost;
        editFormContent.goodType = order.goodType;
        editFormContent.weight = order.weight;
        editFormContent.volume = order.volume;

        const user = (await userxApi.getUserX(order.customer?.id!)).data;
        state.data = [{
            label: `${user.user?.firstName} ${user.user?.lastName}`,
            value: user.id!,
        }];

        await orderItemApi.getOrderItemsByOrderId(orderId).then((res) => {
            const items = res.data;
            editFormContent.note = items[0].note;
            editFormContent.pickupAddressId = items[0].addressId;
            editFormContent.deliveryAddressId = items[1].addressId;
            editFormContent.height = items[0].height;
            editFormContent.width = items[0].width;
            editFormContent.length = items[0].length;
            editFormContent.numPallets = items[0].numPallets;

            let a = moment(items[0].earliestTime);
            let b = moment(items[0].latestTime);
            let c = moment(items[1].earliestTime);
            let d = moment(items[1].latestTime);
            a.set({ month: a.get('month') - 1 });
            b.set({ month: b.get('month') + 1 });
            c.set({ month: c.get('month') - 1 });
            d.set({ month: d.get('month') + 1 });


            if (items[0].type === 'from') {
                editFormContent.fromOrderItemId = items[0].id;
                editFormContent.toOrderItemId = items[1].id;
                editFormContent.waitingTimeSecIn = items[0].waitingTimeSec;
                editFormContent.waitingTimeSecOut = items[1].waitingTimeSec;
                editFormContent.carryTimeSecIn = items[0].carryTimeSec;
                editFormContent.carryTimeSecOut = items[1].carryTimeSec;
                editFormContent.rangeFrom = [a, b];
                editFormContent.rangeTo = [c, d];
            } else {
                editFormContent.fromOrderItemId = items[1].id;
                editFormContent.toOrderItemId = items[0].id;
                editFormContent.waitingTimeSecIn = items[1].waitingTimeSec;
                editFormContent.waitingTimeSecOut = items[0].waitingTimeSec;
                editFormContent.carryTimeSecIn = items[1].carryTimeSec;
                editFormContent.carryTimeSecOut = items[0].carryTimeSec;
                editFormContent.rangeFrom = [c, d];
                editFormContent.rangeTo = [a, b];
            }
        });
        loadEditForm.value = false;

    } catch (e) {
        console.log(e);

    }


};
const { resetFields, validate, validateInfos } = useForm(editFormContent, rulesRef);

const requestToEditOrder = async () => {
    editOrderLoading.value = true;
    try {
        await orderApi.partialUpdateOrder(editFormContent.id!, {
            id: editFormContent.id!,
            code: editFormContent.code!,
            customer: { id: editFormContent.customerId! },
            cost: editFormContent.cost!,
            goodType: editFormContent.goodType!,
            weight: editFormContent.weight!,
            volume: editFormContent.volume!,
        });
        await orderItemApi.partialUpdateOrderItem(editFormContent.fromOrderItemId!, {
            id: editFormContent.fromOrderItemId!,
            goodType: editFormContent.goodType!,
            earliestTime: editFormContent.rangeFrom[0].format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            latestTime: editFormContent.rangeFrom[1]!.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            numPallets: editFormContent.goodType === 'pallet' ? editFormContent.numPallets! : undefined,
            length: editFormContent.goodType === 'box' ? editFormContent.length! : undefined,
            width: editFormContent.goodType === 'box' ? editFormContent.width! : undefined,
            height: editFormContent.goodType === 'box' ? editFormContent.height! : undefined,
            note: editFormContent.note!,
            orderId: editFormContent.id!,
            address: { id: editFormContent.pickupAddressId! },
            volume: editFormContent.goodType === 'masterbill' ? editFormContent.volume! : undefined,
            waitingTimeSec: editFormContent.waitingTimeSecIn!,
            carryTimeSec: editFormContent.carryTimeSecIn!,
        });
        await orderItemApi.partialUpdateOrderItem(editFormContent.toOrderItemId!, {
            id: editFormContent.toOrderItemId!,
            goodType: editFormContent.goodType!,
            earliestTime: editFormContent.rangeTo[0].format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            latestTime: editFormContent.rangeTo[1].format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            numPallets: editFormContent.goodType === 'pallet' ? editFormContent.numPallets! : undefined,
            length: editFormContent.goodType === 'box' ? editFormContent.length! : undefined,
            width: editFormContent.goodType === 'box' ? editFormContent.width! : undefined,
            height: editFormContent.goodType === 'box' ? editFormContent.height! : undefined,
            note: editFormContent.note!,
            orderId: editFormContent.id!,
            address: { id: editFormContent.deliveryAddressId! },
            volume: editFormContent.goodType === 'masterbill' ? editFormContent.volume! : undefined,
            weight: editFormContent.weight!,
            waitingTimeSec: editFormContent.waitingTimeSecOut!,
            carryTimeSec: editFormContent.carryTimeSecOut!,
        });
        message.success('Chỉnh sửa đơn hàng thành công');
        editOrderLoading.value = false;
        emit('edit-order-success');
    } catch (err: any) {
        console.log(err);
        if (err.code === "ERR_BAD_REQUEST") {
            if (err.response.data.errorKey === "ordercodeexists") {
                message.error("Mã đơn hàng đã tồn tại!");
            } else {
                message.error("Chỉnh sửa đơn hàng thất bại");
            }
        } else {
            message.error('Chỉnh sửa đơn hàng thất bại');
        }
        editOrderLoading.value = false;
        return;
    }
}

const editOrder = async () => {
    validate().then(() => {
        requestToEditOrder();
    }).catch((e) => {
        console.log(e);
    })
}
const state = reactive<{
    data: { label: string; value: number }[];
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
        }));

        state.fetching = false;
    }).catch((e) => {
        console.log(e);
        state.fetching = false;
    });
}, 300);

const cancelHandle = () => {
    emit('update:open', false);
}
</script>
<template>
    <a-modal width="900px" :open="$props.open" title="Chỉnh sửa đơn hàng" :confirm-loading="editOrderLoading"
        @ok="editOrder" wrap-class-name="order-detail" okText="Lưu" cancelText="Hủy" :onCancel="cancelHandle">
        <a-spin v-if="loadEditForm" />

        <a-form layout="vertical" v-else>
            <a-row :gutter="16">
                <a-col :span="5">
                    <a-form-item label="Mã đơn hàng" required v-bind="validateInfos.code">
                        <a-input v-model:value="editFormContent.code" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Khách hàng" required v-bind="validateInfos.customerId">
                        <a-select v-model:value="editFormContent.customerId" placeholder=" Chọn khách hàng" show-search
                            style="width: 100%" :options="state.data" @search="fetchUser" :filter-option="false">
                            <template v-if="state.fetching" #notFoundContent>
                                <a-spin size="small" />
                            </template>
                        </a-select>
                    </a-form-item>
                </a-col>
                <a-col :span="5">
                    <a-form-item label="Giá" required v-bind="validateInfos.cost">
                        <a-input type="number" v-model:value="editFormContent.cost" suffix="VND" />
                    </a-form-item>
                </a-col>
                <a-col :span="4">
                    <a-form-item label="Khối lượng" required v-bind="validateInfos.weight">
                        <a-input v-model:value="editFormContent.weight" type="number" placeholder="0" suffix="Kg" />
                    </a-form-item>
                </a-col>
                <a-col :span="4">
                    <a-form-item label="Loại hàng" required v-bind="validateInfos.goodType">
                        <a-select v-model:value="editFormContent.goodType">
                            <a-select-option key="masterbill" value="masterbill" default></a-select-option>
                            <a-select-option key="pallet" value="pallet"></a-select-option>
                            <a-select-option key="box" value="box"></a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16" v-show="editFormContent.goodType == 'pallet'">
                <a-col :span="6">
                    <a-form-item label="Số pallet" required v-bind="validateInfos.numPallets">
                        <a-input v-model:value="editFormContent.numPallets" type="number" placeholder="0"
                            suffix="pallet" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16" v-show="editFormContent.goodType == 'masterbill'">
                <a-col :span="8">
                    <a-form-item label="Thể tích" required v-bind="validateInfos.volume">
                        <a-input v-model:value="editFormContent.volume" type="number" placeholder="0">
                            <template #suffix>
                                m<sup style="font-size:12px">3</sup>
                            </template>
                        </a-input>
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16" v-show="editFormContent.goodType == 'box'">
                <a-col :span="6">
                    <a-form-item label="Chiều dài" required v-bind="validateInfos.length">
                        <a-input v-model:value="editFormContent.length" type="number" placeholder="0" suffix="m" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Chiều rộng" required v-bind="validateInfos.width">
                        <a-input v-model:value="editFormContent.width" type="number" placeholder="0" suffix="m" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Chiều cao" required v-bind="validateInfos.height">
                        <a-input v-model:value="editFormContent.height" type="number" placeholder="0" suffix="m" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="Khung thời gian lấy hàng" required v-bind="validateInfos.rangeFrom">
                        <a-range-picker :show-time="{ format: 'HH:mm' }" format="YYYY-MM-DD HH:mm"
                            :placeholder="['Start Time', 'End Time']" v-model:value="editFormContent.rangeFrom" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Khung thời gian trả hàng" required v-bind="validateInfos.rangeTo">
                        <a-range-picker :show-time="{ format: 'HH:mm' }" format="YYYY-MM-DD HH:mm"
                            :placeholder="['Start Time', 'End Time']" v-model:value="editFormContent.rangeTo" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16">
                <a-col :span="16">
                    <a-form-item label="Địa chỉ lấy hàng" required v-bind="validateInfos.pickupAddressId">
                        <address-form :initial-address-id="editFormContent.pickupAddressId!"
                            @save="(addressId: any) => editFormContent.pickupAddressId = addressId" />
                    </a-form-item>
                </a-col>
                <a-col :span="4">
                    <a-form-item label="Thời gian bốc" required v-bind="validateInfos.carryTimeSecIn">
                        <a-input v-model:value="editFormContent.carryTimeSecIn" type="number" placeholder="0"
                            suffix="phút" />
                    </a-form-item>
                </a-col>
                <a-col :span="4">
                    <a-form-item label="Thời gian chờ" required v-bind="validateInfos.waitingTimeSecIn">
                        <a-input v-model:value="editFormContent.waitingTimeSecIn" placeholder="0" suffix="phút" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16">
                <a-col :span="16">
                    <a-form-item label="Địa chỉ trả hàng" required v-bind="validateInfos.deliveryAddressId">
                        <address-form :initial-address-id="editFormContent.deliveryAddressId!"
                            @save="(addressId: any) => editFormContent.deliveryAddressId = addressId" />
                    </a-form-item>
                </a-col>
                <a-col :span="4">
                    <a-form-item label="Thời gian dỡ" required v-bind="validateInfos.carryTimeSecOut">
                        <a-input v-model:value="editFormContent.carryTimeSecOut" type="number" placeholder="0"
                            suffix="phút" />
                    </a-form-item>
                </a-col>
                <a-col :span="4">
                    <a-form-item label="Thời gian chờ" required v-bind="validateInfos.waitingTimeSecOut">
                        <a-input v-model:value="editFormContent.waitingTimeSecOut" placeholder="0" suffix="phút" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-form-item label="Ghi chú">
                <a-input v-model:value="editFormContent.note" placeholder="Không ghi cũng được" />
            </a-form-item>
        </a-form>
    </a-modal>
</template>
