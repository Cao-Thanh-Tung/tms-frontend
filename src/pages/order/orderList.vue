<script setup lang="ts">
import { EyeOutlined, PlusOutlined, DeleteFilled } from '@ant-design/icons-vue';
import { reactive, ref } from 'vue';
import OrderDetail from '@/components/OrderDetail.vue';
import { OrderDTO, OrderResourceApi } from '@/api';
import store from '@/store';
import { Configuration } from '@/configuration';
import { computed } from 'vue';
import { usePagination } from 'vue-request';
// config request object
const config = new Configuration({
    accessToken: () => store.getters.jwt,
    baseOptions: {
        headers: { 'Content-Type': 'application/json' }
    }
})
const orderApi = new OrderResourceApi(config);
const numOfOrder = ref(0);
async function getNumberOfOrders() {
    let num = 0;
    try {
        num = (await orderApi.getNumberOfOrder()).data!;
    } catch (e: any) {
        console.log(e);
    }
    numOfOrder.value = num;
}

// table config
const columns = [
    {
        title: 'Mã đơn hàng',
        dataIndex: 'code',
        key: 'Code',
        width: '6%',
    },
    {
        title: 'Giá trị',
        key: 'cost',
        dataIndex: 'cost',
        width: '6%',
    },
    {
        title: 'Phân loại',
        key: 'goodType',
        dataIndex: 'goodType',
        width: '6%',
    },
    {
        title: 'Phân tuyến',
        key: 'immediate-delivery',
        width: '6%',
    },
    {
        title: 'Trạng thái',
        key: 'status',
        dataIndex: 'status',
        width: '6%',
    },
    {
        title: 'Khối lượng',
        key: 'weight',
        dataIndex: 'weight',
        width: '6%',
    },
    {
        title: 'Số lượng',
        key: 'volume',
        dataIndex: 'volume',
        width: '6%',
    },
    {
        title: 'Khách hàng',
        key: 'customer',
        width: '6%',
    },
    {
        title: '',
        key: 'operation',
        width: '3%',
        fixed: 'right',
    },
];
type APIParams = {
    page?: number;
    pageSize?: number;
};
const queryData = async (params: APIParams) => {
    await getNumberOfOrders();
    return (await orderApi.getAllOrders(params.page! - 1, 8)).data;
};

const {
    data: orders,
    run,
    loading,
    current,
} = usePagination(queryData, {
    pagination: {
        currentKey: 'page',
    },
});

const pagination = computed(() => ({
    total: numOfOrder.value,
    current: current.value,
    pageSize: 6,
}));
const tableCondition = reactive<{
    pag: { pageSize: number; current: number },
    filters: any,
    sorter: any,
}>({
    pag: { pageSize: 8, current: 1 },
    filters: {},
    sorter: {},
})
const updateTable = (
    pag: { pageSize: number; current: number },
    filters: any,
    sorter: any
) => {
    run({
        results: pag.pageSize,
        page: pag?.current,
        sortField: sorter.field,
        sortOrder: sorter.order,
        ...filters,
    });
}
const handleTableChange = (
    pag: { pageSize: number; current: number },
    filters: any,
    sorter: any,
) => {
    tableCondition.pag = pag;
    tableCondition.filters = filters;
    tableCondition.sorter = sorter;
    updateTable(pag, filters, sorter);

};

// Detail modal logic
const openDetail = ref(false);
const orderId = ref<number | null>(null);
const openDetailModal = (id: number) => {
    orderId.value = id;
    console.log(id);
    openDetail.value = true;

}
const closeDetailModal = () => {
    openDetail.value = false;
}

const deleteOrder = (orderId) => {
    orderApi.deleteOrder(orderId!).then((res) => {
        console.log("Delete Order: {} ", res.data);
    }).catch((err) => {
        console.log("Delete Order: ", err);
    }).finally(() => {
        updateTable(tableCondition.pag, tableCondition.filters, tableCondition.sorter);
    })
    openDetail.value = false;
}

const openAddForm = ref(false);
const addOrderLoading = ref(false);
const showAddForm = () => {
    openAddForm.value = true;
}

const createOrder = () => {
    addOrderLoading.value = true;
    orderApi.createOrder({
        code: orderAddContent.value.code,
        cost: orderAddContent.value.cost,
        immediateDelivery: false,
        status: "no-trans",
        goodType: orderAddContent.value.goodType,
        customer: {
            id: orderAddContent.value.customerId!
        }
    }).then((res) => {
        console.log("Create Order: {} ", res.data);
        openAddForm.value = false;
        openDetailModal(res.data.id!);
    }).catch((err) => {
        console.log("Create Order: ", err);
        openAddForm.value = false;
    }).finally(() => {
        updateTable(tableCondition.pag, tableCondition.filters, tableCondition.sorter);
    })
}

// Select customer
import type { SelectProps } from 'ant-design-vue';
import { onMounted } from 'vue';
import { UserXResourceApi } from '@/api';
const options = ref<SelectProps['options']>([]);
const optionGoodTypes = ref<SelectProps['options']>([
    { value: 'normal', label: 'Thường' },
    { value: 'cold', label: 'Đông lạnh' },
]);
const userXApi = new UserXResourceApi(config);
onMounted(() => {
    userXApi.getUserXByRole("customer", 0, 1000).then((res) => {
        options.value = res.data.map((customer) => {
            return {
                value: customer.id,
                label: customer.user?.firstName + " " + customer.user?.lastName!
            }
        })
    }).catch((err) => {
        console.log(err);
    })
});

const handleChangeCustomer = (value: string) => {
    orderAddContent.value.customerId = parseInt(value);
};

const filterOption = (input: string, option: any) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};
const handleChangeGoodType = (value: string) => {
    orderAddContent.value.goodType = value;
};

// Create Order Form
const orderAddContent = ref({
    code: "",
    cost: 0,
    goodType: "normal",
    customerId: 1,
})

</script>

<template>
    <!-- -->
    <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item>Đơn vận chuyển</a-breadcrumb-item>
        <a-breadcrumb-item>Danh sách đơn</a-breadcrumb-item>
    </a-breadcrumb>

    <!-- Order list table -->
    <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
        <a-table :dataSource="orders" :columns="columns" :scroll="{ x: 1300 }" :pagination="pagination"
            :loading="loading" @change="handleTableChange">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'customer'">
                    {{ `${(<OrderDTO>record).customer?.user?.firstName} ${(<OrderDTO>record).customer?.user?.lastName} `
                            }}
                </template>
                <template v-if="column.key === 'operation'">
                    <a href="#" @click="() => { openDetailModal((<OrderDTO>record).id!) }">
                        <EyeOutlined />
                    </a>
                </template>
                <template v-if="column.key === 'immediate-delivery'">
                    {{ (<OrderDTO>record).immediateDelivery ? "Đã định tuyến" : "Chưa định tuyến" }}
                </template>
                <template v-if="column.key === 'status'">
                    {{ (<OrderDTO>record).status == 'no-trans' ? "Chưa vận chuyển" : "" }}
                        {{ (<OrderDTO>record).status == 'transing' ? "Đang vận chuyển" : "" }}
                            {{ (<OrderDTO>record).status == 'stopping' ? "Đã hủy" : "" }}
                                {{ (<OrderDTO>record).status == 'success' ? "Đã chuyển thành công" : "" }}

                </template>
                <template v-if="column.key === 'goodType'">
                    {{ (<OrderDTO>record).goodType == 'cold' ? "Đông lạnh" : "" }}
                        {{ (<OrderDTO>record).goodType == 'normal' ? "Thường" : "" }}
                </template>
            </template>
        </a-table>
    </a-layout-content>

    <!-- Popup  order detail -->
    <a-modal wrap-class-name="order-detail" width="100%" v-if="openDetail" v-model:open="openDetail"
        title="Yêu cầu vận chuyển - Thông tin chi tiết">
        <OrderDetail :order-id="orderId" />
        <template #footer>
            <a-popconfirm title="Xóa?" ok-text="Yes" cancel-text="No" @confirm="() => deleteOrder(orderId)">
                <a-button danger>
                    Xóa
                </a-button>
            </a-popconfirm>
            <a-button type="primary" @click="closeDetailModal">Đóng</a-button>
        </template>
    </a-modal>

    <!-- Float button create new employee -->
    <a-float-button type="primary" @click="showAddForm" tooltip="Tạo yêu cầu vận chuyển mới">

        <template #icon>
            <plus-outlined />
        </template>
    </a-float-button>

    <!-- Popup add Order form -->
    <a-modal title="Tạo yêu cầu vận chuyển" v-if="openAddForm" v-model:open="openAddForm">
        <a-form>
            <a-form-item label="Khách hàng">
                <a-select show-search placeholder="Chọn khách hàng" :options="options" :filter-option="filterOption"
                    @change="handleChangeCustomer">
                </a-select>
            </a-form-item>
            <a-form-item label="Loại hàng">
                <a-select @change="handleChangeGoodType" :options="optionGoodTypes">
                </a-select>
            </a-form-item>
            <a-form-item label="Mã">
                <a-input v-model:value="orderAddContent.code" />
            </a-form-item>
            <a-form-item label="Giá">
                <a-input v-model:value="orderAddContent.cost" type="number" />
            </a-form-item>
        </a-form>
        <template #footer>
            <a-button type="primary" @click="createOrder">Tạo</a-button>
        </template>
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