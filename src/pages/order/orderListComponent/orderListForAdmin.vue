<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { PlusOutlined, EditOutlined, DeleteFilled } from '@ant-design/icons-vue';
import AddressForm from '@/components/AddressForm.vue';
import { OrderResourceApi, OrderItemResourceApi, OrderDTO, UserXResourceApi } from '@/api';
import { usePagination } from 'vue-request';
import { Configuration } from '@/configuration';
import { message } from 'ant-design-vue';
import store from '@/store';
import moment from 'moment';

// API config
const config = new Configuration({
    accessToken: () => store.getters.jwt,
    baseOptions: {
        headers: { 'Content-Type': 'application/json' }
    }
});
const orderApi = new OrderResourceApi(config);
const orderItemApi = new OrderItemResourceApi(config);
const userxApi = new UserXResourceApi(config);

//Table Logic
type APIParams = {
    page?: number;
    pageSize?: number;
};
const numOfOrder = ref(0);
async function getNumberOfOrder() {
    let num = 0;
    try {
        num += (await orderApi.getNumberOfOrder()).data!;
    } catch (e: any) {
        console.log(e);
    }
    numOfOrder.value = num;
}
const queryData = async (params: APIParams) => {
    try {
        await getNumberOfOrder();
        return (await orderApi.getAllOrders(params.page! - 1, 6)).data;
    } catch (e) {
        console.log(e);
    }
    return null;
};
const pagination = computed(() => ({
    total: numOfOrder.value,
    current: current.value,
    pageSize: 6,
}));
const {
    data: users,
    run,
    loading,
    current,
} = usePagination(queryData, {
    pagination: {
        currentKey: 'page',
    },
});

const tableStatus = reactive<{
    pagination: any;
    filters: any;
    sorter: any;
}>({
    pagination: {},
    filters: {},
    sorter: {},
})
const updateTable = () => {
    run({
        page: tableStatus.pagination.current,
        pageSize: tableStatus.pagination.pageSize,
        sortField: tableStatus.sorter.field,
        ...tableStatus.filters,
    });
}
const columns = [
    {
        title: 'Mã đơn hàng',
        key: 'code',
        dataIndex: 'code',
    },
    {
        title: 'Khách hàng',
        key: 'customer',
    },
    {
        title: 'Giá (đồng)',
        key: 'cost',
        dataIndex: 'cost',
    },
    {
        title: 'Khối lượng',
        key: 'weight',
        dataIndex: 'weight',
    },
    {
        title: 'Kích thước',
        key: 'volume',
        dataIndex: 'volume',
    },
    {
        title: 'Trạng thái',
        key: 'status',
    },
    {
        title: 'Thao tác',
        key: 'operation',
        width: '100px',
        fixed: 'right',
    },


]
const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    tableStatus.pagination = pagination;
    tableStatus.filters = filters;
    tableStatus.sorter = sorter;
    run({
        page: pagination.current,
        pageSize: pagination.pageSize,
        sortField: sorter.field,
        ...filters,
    });
};
const status = (status: string) => {
    if (status === '0') return 'Chờ xác nhận';
    if (status === '1') return 'Đã xác nhận';
    if (status === '2') return 'Đang vận chuyển';
    if (status === '3') return 'Đã hoàn thành';
    if (status === '4') return 'Đã hủy';
    return '';
};

//Chờ xác nhận
//Chờ phân tuyến | Từ chối | Chuyển nhà thầu 
//Đã phân tuyến 
//Đang vận chuyển
//Đã hoanf thành | đã hủy (tài xế)

//Trip
//Chưa chốt
//Chốt

//Xe
//

// Delete Order Logic
const deleteOrder = async (order: OrderDTO) => {
    try {
        const orderItems = (await orderItemApi.getOrderItemsByOrderId(order.id!)).data;
        for (let item of orderItems) {
            await orderItemApi.deleteOrderItem(item.id!);
        }
        await orderApi.deleteOrder(order.id!);
        message.success('Xóa đơn hàng thành công');
        updateTable();
    } catch (e) {
        console.log(e);
        message.error('Xóa đơn hàng thất bại');
    }
};

import { debounce } from 'lodash-es';


const state = reactive<{
    data: { label: string; value: number }[];
    fetching: boolean;
}>({
    data: [],
    fetching: false,
});
onMounted(() => {
    userxApi.getUserXByRole("customer", 0, 5).then((res) => {
        state.data = res.data.map(user => ({
            label: `${user.user?.firstName} ${user.user?.lastName}`,
            value: user.id!,
        }));
    });
});

const fetchUser = debounce(value => {
    state.data = [];
    state.fetching = true;
    userxApi.searchUserXByFullNameAndRole("customer", value, 0, 5).then((res) => {
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

//Add From Logic
const addFormOpen = ref(false);
const addOrderLoading = ref(false);
const createAddFormModel = () => {
    return {
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
        waitingTimeSec: undefined,
        carryTimeSec: undefined,
        rangeFrom: undefined,
        rangeTo: undefined,
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
    waitingTimeSec: number | undefined;
    carryTimeSec: number | undefined;
    rangeFrom: [moment.Moment, moment.Moment] | any;
    rangeTo: [moment.Moment, moment.Moment] | any;

}
let addFormContent = reactive<addFormType>(createAddFormModel());
const showAddForm = () => {
    addFormContent = reactive<addFormType>(createAddFormModel());
    addFormOpen.value = true;
};
const validateAddform = () => {
    if (!addFormContent.code) {
        message.error('Mã đơn hàng không được để trống');
        return false;
    }
    if (!addFormContent.customerId) {
        message.error('Khách hàng không được để trống');
        return false;
    }
    if (!addFormContent.cost) {
        message.error('Giá không được để trống');
        return false;
    }
    if (!addFormContent.weight) {
        message.error('Khối lượng không được để trống');
        return false;
    }
    if (!addFormContent.waitingTimeSec) {
        message.error('Thời gian bốc dỡ không được để trống');
        return false;
    }
    if (!addFormContent.goodType) {
        message.error('Loai hàng không được để trống');
        return false;
    }
    if (!addFormContent.carryTimeSec) {
        message.error('Thời gian chờ không được để trống');
        return false;
    }
    if (addFormContent.goodType === 'pallet' && !addFormContent.numPallets) {
        if (!addFormContent.numPallets) {
            message.error('Số pallet không được để trống');
            return false;
        } else if (addFormContent.numPallets <= 0) {
            message.error('Số pallet không hợp lệ');
            return false;
        }
        return false;
    }
    if (addFormContent.goodType === 'box') {
        if (!addFormContent.length || !addFormContent.width || !addFormContent.height) {
            message.error('Kích thước không được để trống');
            return false;
        } else if (addFormContent.length <= 0 || addFormContent.width <= 0 || addFormContent.height <= 0) {
            message.error('Kích thước không hợp lệ');
            return false;
        }
    }

    if (addFormContent.goodType === 'masterbill' && !addFormContent.volume) {
        if (!addFormContent.volume) {
            message.error('Thể tích không được để trống');
            return false;
        }
        else if (addFormContent.volume <= 0) {
            message.error('Thể tích không hợp lệ');
            return false;
        }
    }
    if (!addFormContent.rangeFrom || !addFormContent.rangeTo) {
        message.error('Khung thời gian không được để trống');
        return false;
    }
    if (!addFormContent.rangeFrom[0].isBefore(addFormContent.rangeFrom[1])) {
        message.error('Khung thời gian lấy hàng không hợp lệ');
        return false;
    }
    if (!addFormContent.rangeTo[0].isBefore(addFormContent.rangeTo[1])) {
        message.error('Khung thời gian trả hàng không hợp lệ');
        return false;
    }
    if (addFormContent.rangeTo[1].isBefore(addFormContent.rangeFrom[0])) {
        message.error('Khung thời gian lấy hàng phải trước khung thời gian trả hàng');
        return false;
    }
    if (!addFormContent.pickupAddressId) {
        message.error('Địa chỉ lấy hàng không được để trống');
        return false;
    }
    if (!addFormContent.deliveryAddressId) {
        message.error('Địa chỉ trả hàng không được để trống');
        return false;
    }

    return true;
}
const addOrder = async () => {
    console.log(addFormContent);
    addOrderLoading.value = true;
    if (!validateAddform()) {
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
            waitingTimeSec: addFormContent.waitingTimeSec!,
            carryTimeSec: addFormContent.carryTimeSec!,
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
            waitingTimeSec: addFormContent.waitingTimeSec!,
            carryTimeSec: addFormContent.carryTimeSec!,
        });
        message.success('Tạo đơn hàng thành công');
        addFormOpen.value = false;
        addOrderLoading.value = false;
        updateTable();
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
};

//Edit Order Logic

const editFormOpen = ref(false);
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
        waitingTimeSec: number | undefined;
        carryTimeSec: number | undefined;
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
    waitingTimeSec: undefined,
    carryTimeSec: undefined,
    rangeFrom: [moment(), moment()],
    rangeTo: [moment(), moment()],
});

const loadEditForm = ref(false);
const showEditOrder = async (orderId: number) => {
    editFormOpen.value = true;
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
            editFormContent.waitingTimeSec = items[0].waitingTimeSec;
            editFormContent.carryTimeSec = items[0].carryTimeSec;
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
                editFormContent.rangeFrom = [a, b];
                editFormContent.rangeTo = [c, d];
            } else {
                editFormContent.fromOrderItemId = items[1].id;
                editFormContent.toOrderItemId = items[0].id;
                editFormContent.rangeFrom = [c, d];
                editFormContent.rangeTo = [a, b];
            }
        });
        loadEditForm.value = false;

    } catch (e) {
        console.log(e);

    }


};

const validateEditForm = () => {
    if (!editFormContent.code) {
        message.error('Mã đơn hàng không được để trống');
        return false;
    }
    if (!editFormContent.customerId) {
        message.error('Khách hàng không được để trống');
        return false;
    }
    if (!editFormContent.cost) {
        message.error('Giá không được để trống');
        return false;
    }
    if (!editFormContent.weight) {
        message.error('Khối lượng không được để trống');
        return false;
    }
    if (!editFormContent.waitingTimeSec) {
        message.error('Thời gian bốc dỡ không được để trống');
        return false;
    }
    if (!editFormContent.goodType) {
        message.error('Loai hàng không được để trống');
        return false;
    }
    if (editFormContent.goodType === 'pallet' && !editFormContent.numPallets) {
        if (!editFormContent.numPallets) {
            message.error('Số pallet không được để trống');
            return false;
        } else if (editFormContent.numPallets <= 0) {
            message.error('Số pallet không hợp lệ');
            return false;
        }
        return false;
    }
    if (editFormContent.goodType === 'box') {
        if (!editFormContent.length || !editFormContent.width || !editFormContent.height) {
            message.error('Kích thước không được để trống');
            return false;
        } else if (editFormContent.length <= 0 || editFormContent.width <= 0 || editFormContent.height <= 0) {
            message.error('Kích thước không hợp lệ');
            return false;
        }
    }

    if (editFormContent.goodType === 'masterbill' && !editFormContent.volume) {
        if (!editFormContent.volume) {
            message.error('Thể tích không được để trống');
            return false;
        }
        else if (editFormContent.volume <= 0) {
            message.error('Thể tích không hợp lệ');
            return false;
        }
    }
    if (!editFormContent.rangeFrom || !editFormContent.rangeTo) {
        message.error('Khung thời gian không được để trống');
        return false;
    }
    if (!editFormContent.rangeFrom[0].isBefore(editFormContent.rangeFrom[1])) {
        message.error('Khung thời gian lấy hàng không hợp lệ');
        return false;
    }
    if (!editFormContent.rangeTo[0].isBefore(editFormContent.rangeTo[1])) {
        message.error('Khung thời gian trả hàng không hợp lệ');
        return false;
    }
    if (editFormContent.rangeTo[1].isBefore(editFormContent.rangeFrom[0])) {
        message.error('Khung thời gian lấy hàng phải trước khung thời gian trả hàng');
        return false;
    }
    if (!editFormContent.pickupAddressId) {
        message.error('Địa chỉ lấy hàng không được để trống');
        return false;
    }
    if (!editFormContent.deliveryAddressId) {
        message.error('Địa chỉ trả hàng không được để trống');
        return false;
    }
    return true;
}
const editOrder = async () => {
    if (!validateEditForm()) {
        editOrderLoading.value = false;
        return;
    }
    editOrderLoading.value = true;
    console.log(editFormContent);
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
            waitingTimeSec: editFormContent.waitingTimeSec!,
            carryTimeSec: editFormContent.carryTimeSec!,
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
            waitingTimeSec: editFormContent.waitingTimeSec!,
            carryTimeSec: editFormContent.carryTimeSec!,
        });
        message.success('Chỉnh sửa đơn hàng thành công');
        editFormOpen.value = false;
        editOrderLoading.value = false;
        updateTable();
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

</script>


<template>

    <!-- Order list table -->
    <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
        <a-table :dataSource="users" :columns="columns" :pagination="pagination" :loading="loading"
            @change="handleTableChange">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'customer'">
                    {{ `${(<OrderDTO>record).customer?.user?.firstName} ${(<OrderDTO>record).customer?.user?.lastName} `
                            }}
                </template>
                <template v-if="column.key === 'weight'">
                    {{ `${(<OrderDTO>record).weight} kg` }}
                </template>
                <template v-if="column.key === 'volume'">
                    {{ `${(<OrderDTO>record).volume} m` }}<sup style="font-size: 12px;">3</sup>
                </template>
                <template v-if="column.key === 'status'">
                    {{ status((<OrderDTO>record).status!) }}
                </template>
                <template v-if="column.key === 'operation'">
                    <a href="#" @click="() => showEditOrder((<OrderDTO>record).id!)">
                        <EditOutlined />
                    </a>
                    <a-popconfirm title="Xóa đơn hàng?" ok-text="Yes" cancel-text="No"
                        @confirm="() => deleteOrder((<OrderDTO>record))">
                        <a href="#">
                            <DeleteFilled style="margin-left: 12px" />
                        </a>
                    </a-popconfirm>
                </template>
            </template>
        </a-table>
    </a-layout-content>

    <a-float-button type="primary" @click="showAddForm" tooltip="Tạo đơn hàng mới">
        <template #icon>
            <plus-outlined />
        </template>
    </a-float-button>
    <!-- Order Add Form modal -->
    <a-modal width="900px" v-if="addFormOpen" v-model:open="addFormOpen" title="Thêm đơn hàng"
        :confirm-loading="addOrderLoading" @ok="addOrder" wrap-class-name="order-detail" okText="Lưu" cancelText="Hủy">
        <a-form>
            <a-row :gutter="16">
                <a-col :span="8">
                    <a-form-item label="Mã đơn hàng">
                        <a-input v-model:value="addFormContent.code" />
                    </a-form-item>
                </a-col>
                <a-col :span="10">
                    <a-form-item label="Khách hàng">
                        <a-select v-model:value="addFormContent.customerId" placeholder=" Chọn khách hàng" show-search
                            style="width: 100%" :options="state.data" @search="fetchUser" :filter-option="false">
                            <template v-if="state.fetching" #notFoundContent>
                                <a-spin size="small" />
                            </template>
                        </a-select>
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Giá">
                        <a-input type="number" v-model:value="addFormContent.cost" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-form-item label="Khung thời gian lấy hàng">
                <a-range-picker :show-time="{ format: 'HH:mm' }" format="YYYY-MM-DD HH:mm"
                    :placeholder="['Start Time', 'End Time']" v-model:value="addFormContent.rangeFrom" />
            </a-form-item>
            <a-form-item label="Địa chỉ lấy hàng">
                <address-form @save="(addressId: any) => addFormContent.pickupAddressId = addressId" />
            </a-form-item>
            <a-form-item label="Khung thời gian trả hàng">
                <a-range-picker :show-time="{ format: 'HH:mm' }" format="YYYY-MM-DD HH:mm"
                    :placeholder="['Start Time', 'End Time']" v-model:value="addFormContent.rangeTo" />
            </a-form-item>
            <a-form-item label="Địa chỉ trả hàng">
                <address-form @save="(addressId: any) => addFormContent.deliveryAddressId = addressId" />
            </a-form-item>
            <a-row :gutter="16">
                <a-col :span="8">
                    <a-form-item label="Khối lượng">
                        <a-input v-model:value="addFormContent.weight" type="number" placeholder="Kg" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="Thời gian bốc dỡ">
                        <a-input v-model:value="addFormContent.carryTimeSec" type="number" placeholder="giây" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="Loại hàng">
                        <a-select v-model:value="addFormContent.goodType">
                            <a-select-option key="masterbill" value="masterbill" default></a-select-option>
                            <a-select-option key="pallet" value="pallet"></a-select-option>
                            <a-select-option key="box" value="box"></a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16" v-show="addFormContent.goodType == 'pallet'">
                <a-col :span="6">
                    <a-form-item label="Số pallet">
                        <a-input v-model:value="addFormContent.numPallets" type="number" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16" v-show="addFormContent.goodType == 'masterbill'">
                <a-col :span="8">
                    <a-form-item label="Thể tích">
                        <a-input v-model:value="addFormContent.volume" type="number" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    m<sup style="font-size: 12px;">3</sup>
                </a-col>
            </a-row>
            <a-row :gutter="16" v-show="addFormContent.goodType == 'box'">
                <a-col :span="6">
                    <a-form-item label="Chiều dài">
                        <a-input v-model:value="addFormContent.length" type="number" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Chiều rộng">
                        <a-input v-model:value="addFormContent.width" type="number" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Chiều cao">
                        <a-input v-model:value="addFormContent.height" type="number" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16">
                <a-col :span="18">
                    <a-form-item label="Ghi chú">
                        <a-input v-model:value="addFormContent.note" placeholder="Không ghi cũng được" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Thời gian chờ">
                        <a-input v-model:value="addFormContent.waitingTimeSec" placeholder="giây" />
                    </a-form-item>
                </a-col>
            </a-row>
        </a-form>
    </a-modal>

    <!-- Order Edit Form modal -->
    <a-modal width="900px" v-if="editFormOpen" v-model:open="editFormOpen" title="Chỉnh sửa đơn hàng"
        :confirm-loading="editOrderLoading" @ok="editOrder" wrap-class-name="order-detail" okText="Lưu"
        cancelText="Hủy">
        <a-spin v-if="loadEditForm" />

        <a-form v-else>
            <a-row :gutter="16">
                <a-col :span="8">
                    <a-form-item label="Mã đơn hàng">
                        <a-input v-model:value="editFormContent.code" />
                    </a-form-item>
                </a-col>
                <a-col :span="10">
                    <a-form-item label="Khách hàng">
                        <a-select v-model:value="editFormContent.customerId" placeholder=" Chọn khách hàng" show-search
                            style="width: 100%" :options="state.data" @search="fetchUser" :filter-option="false">
                            <template v-if="state.fetching" #notFoundContent>
                                <a-spin size="small" />
                            </template>
                        </a-select>
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Giá">
                        <a-input type="number" v-model:value="editFormContent.cost" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-form-item label="Khung thời gian lấy hàng">
                <a-range-picker :show-time="{ format: 'HH:mm' }" format="YYYY-MM-DD HH:mm"
                    :placeholder="['Start Time', 'End Time']" v-model:value="editFormContent.rangeFrom" />
            </a-form-item>
            <a-form-item label="Địa chỉ lấy hàng">
                <address-form :initial-address-id="editFormContent.pickupAddressId!"
                    @save="(addressId: any) => editFormContent.pickupAddressId = addressId" />
            </a-form-item>
            <a-form-item label="Khung thời gian trả hàng">
                <a-range-picker :show-time="{ format: 'HH:mm' }" format="YYYY-MM-DD HH:mm"
                    :placeholder="['Start Time', 'End Time']" v-model:value="editFormContent.rangeTo" />
            </a-form-item>
            <a-form-item label="Địa chỉ trả hàng">
                <address-form :initial-address-id="editFormContent.pickupAddressId!"
                    @save="(addressId: any) => editFormContent.deliveryAddressId = addressId" />
            </a-form-item>
            <a-row :gutter="16">
                <a-col :span="8">
                    <a-form-item label="Khối lượng">
                        <a-input v-model:value="editFormContent.weight" type="number" placeholder="Kg" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="Thời gian bốc dỡ">
                        <a-input v-model:value="editFormContent.carryTimeSec" type="number" placeholder="giây" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="Loại hàng">
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
                    <a-form-item label="Số pallet">
                        <a-input v-model:value="editFormContent.numPallets" type="number" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16" v-show="editFormContent.goodType == 'masterbill'">
                <a-col :span="8">
                    <a-form-item label="Thể tích">
                        <a-input v-model:value="editFormContent.volume" type="number" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    m<sup style="font-size: 12px;">3</sup>
                </a-col>
            </a-row>
            <a-row :gutter="16" v-show="editFormContent.goodType == 'box'">
                <a-col :span="6">
                    <a-form-item label="Chiều dài">
                        <a-input v-model:value="editFormContent.length" type="number" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Chiều rộng">
                        <a-input v-model:value="editFormContent.width" type="number" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Chiều cao">
                        <a-input v-model:value="editFormContent.height" type="number" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16">
                <a-col :span="18">
                    <a-form-item label="Ghi chú">
                        <a-input v-model:value="editFormContent.note" placeholder="Không ghi cũng được" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Thời gian chờ">
                        <a-input v-model:value="editFormContent.waitingTimeSec" placeholder="giây" />
                    </a-form-item>
                </a-col>
            </a-row>
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