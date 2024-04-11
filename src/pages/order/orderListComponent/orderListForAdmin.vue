<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { PlusOutlined, EditOutlined, DeleteFilled } from '@ant-design/icons-vue';
import { OrderResourceApi, OrderItemResourceApi, OrderDTO, UserXResourceApi } from '@/api';
import { usePagination } from 'vue-request';
import { Configuration } from '@/configuration';
import { message } from 'ant-design-vue';
import store from '@/store';
import addOrderForm from '../form/addOrderForm.vue';
import editOrderForm from '../form/editOrderForm.vue';
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
const firstApi = () => {
    return userxApi.getUserXByRole("customer", 0, 5);
}
const secondApi = (value: any) => {
    return userxApi.searchUserXByFullNameAndRole("customer", value, 0, 5);
}
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
    if (status === '11') return 'Chờ phân tuyến';
    if (status === '12') return 'Từ chối';
    if (status === '13') return 'Chuyển nhà thầu';
    if (status === '21') return 'Đã phân tuyến';
    if (status === '31') return 'Đang vận chuyển';
    if (status === '41') return 'Đã hoàn thành';
    if (status === '42') return 'Đã hủy'; // driver cancel
    return '';
};

//Trip
//Chưa chốt
//Chốt

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

const isEditFormOpen = ref(false);
const isAddFormOpen = ref(false);
const orderEditId = ref<number | null>(null);

const openAddForm = () => {
    isAddFormOpen.value = true;
}
const openEditOrder = (orderId: number) => {
    orderEditId.value = orderId;
    isEditFormOpen.value = true;
}
const editSuccess = () => {
    isEditFormOpen.value = false;
    updateTable();
}
const addSuccess = () => {
    isAddFormOpen.value = false;
    updateTable();
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
                    <a href="#" @click="() => openEditOrder((<OrderDTO>record).id!)">
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

    <a-float-button type="primary" @click="openAddForm" tooltip="Tạo đơn hàng mới">
        <template #icon>
            <plus-outlined />
        </template>
    </a-float-button>
    <addOrderForm v-model:open="isAddFormOpen" :first-api="firstApi" :second-api="secondApi"
        :order-success="addSuccess" />
    <editOrderForm v-model:open="isEditFormOpen" :first-api="firstApi" :second-api="secondApi" :order-id="orderEditId!"
        @edit-order-success="editSuccess" />
</template>

<style lang="less"></style>