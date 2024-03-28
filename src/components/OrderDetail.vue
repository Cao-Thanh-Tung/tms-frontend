<template>
    <p class="order">
        <span class="code">
            Mã: {{ order?.code }}
        </span>
        <span class="cost">
            Chi phí: {{ order?.cost }}
        </span>
        <span class="cost">
            Loại hàng: {{ order?.goodType == 'normal' ? "Thường" : "" }}
            {{ order?.goodType == 'cold' ? "Đông lạnh" : "" }}
        </span>
        <span class="immediate-route no-route" v-if="!order?.immediateDelivery">
            Chưa định tuyến</span>
        <span class="immediate-route haven-route" v-else>
            Đã định tuyến</span>
        <span class="status no-trans" v-if="order?.status == 'no-trans'">
            Chưa vận chuyển
        </span>
        <span class="status transing" v-else-if="order?.status == 'transing'">
            Đang vận chuyển
        </span>
        <span class="status stopping" v-else-if="order?.status == 'stopping'">
            Đã hủy bỏ
        </span>
        <span class="status success" v-else-if="order?.status == 'success'">
            Thành công
        </span>
        <span class="customer-name">
            Khách hàng: {{ `${order?.customer?.user?.firstName} ${order?.customer?.user?.lastName!}` }}
        </span>
        <a href="#" @click="() => showEditInfoForm()" v-if="!order?.immediateDelivery">
            <EditOutlined />
        </a>
    </p>
    <a-table :dataSource="orderItems" :columns="columns" :scroll="{ x: 2000 }" :pagination="pagination"
        :loading="loading" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
            <template v-if="column.key == 'earliest-time'">
                <span>{{ moment((<OrderItemDTO>record).earliestTime?.toString()).format("DD-MM-YYYY \n HH:mm:ss")
                        }}</span>
            </template>
            <template v-if="column.key == 'last-time'">
                <span>{{ moment((<OrderItemDTO>record).latestTime?.toString()).format("DD-MM-YYYY \n HH:mm:ss")
                        }}</span>
            </template>
            <template v-if="column.key == 'carryTimeSec'">
                <span> {{ ((<OrderItemDTO>record).carryTimeSec! / 60).toFixed().toString() + " phút" }} </span>
            </template>
            <template v-if="column.key == 'goodType'">
                <span> {{ (<OrderItemDTO>record).goodType == 'normal' ? "Thường" : "" }} </span>
                <span> {{ (<OrderItemDTO>record).goodType == 'cold' ? "Đông lạnh" : "" }} </span>
            </template>
            <template v-if="column.key == 'type'">
                <span> {{ (<OrderItemDTO>record).type == 'from' ? "Điểm lấy" : "" }} </span>
                <span> {{ (<OrderItemDTO>record).type == 'to' ? "Điểm trả" : "" }} </span>
            </template>
            <template v-if="column.key === 'operation'">
                <a href="#" @click="() => showEditForm(record)" v-if="!order?.immediateDelivery">
                    <EditOutlined />
                </a>
                <a-popconfirm title="Xóa?" ok-text="Yes" cancel-text="No" v-if="!order?.immediateDelivery"
                    @confirm="() => deleteOrderItem((<OrderItemDTO>record))">
                    <a href="#">
                        <DeleteFilled style="margin-left: 12px" />
                    </a>
                </a-popconfirm>
            </template>
        </template>
    </a-table>
    <a-button type="primary" shape="round" size="large" @click="showAddForm"> Thêm điểm</a-button>

    <!-- Popup edit order item form -->
    <a-modal width="900px" v-if="openEditForm" v-model:open="openEditForm" title="Chỉnh sửa điểm"
        :confirm-loading="editLoading" @ok="edit" wrap-class-name="order-detail" okText="Lưu" cancelText="Hủy">
        <a-form>

            <a-form-item label="Khung thời gian">
                <a-range-picker :show-time="{ format: 'HH:mm' }" format="YYYY-MM-DD HH:mm"
                    :placeholder="['Start Time', 'End Time']" @change="onChange" @ok="onOk" />
            </a-form-item>
            <a-row :gutter="16">
                <a-col :span="6">
                    <a-form-item label="Loại hàng">
                        <a-input />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Số lượng">
                        <a-input type="number" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Số pallet">
                        <a-input type="number" />

                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Thời gian bốc dỡ">
                        <a-input type="number" />

                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16">
                <a-col :span="6">
                    <a-form-item label="Chiều dài">
                        <a-input type="number" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Chiều rộng">
                        <a-input type="number" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Chiều cao">
                        <a-input type="number" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Khối lượng">
                        <a-input type="number" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-form-item label="Địa chỉ">
                <address-form />
            </a-form-item>
            <a-form-item label="Ghi chú">
                <a-input />
            </a-form-item>
        </a-form>
    </a-modal>

    <!-- Popup add order item form -->
    <a-modal width="900px" v-if="openAddForm" v-model:open="openAddForm" title="Thêm mới thông tin đơn hàng"
        :confirm-loading="addLoading" @ok="add" wrap-class-name="order-detail" okText="Lưu" cancelText="Hủy">
        <a-form>
            <a-row :gutter="16">
                <a-col :span="18">
                    <a-form-item label="Khung thời gian">
                        <a-range-picker :show-time="{ format: 'HH:mm' }" format="YYYY-MM-DD HH:mm"
                            :placeholder="['Start Time', 'End Time']" @change="onChange" @ok="onOk" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Loại điểm">
                        <a-select>
                            <a-select-option value="from">Điểm lấy</a-select-option>
                            <a-select-option value="to">Điểm trả</a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16">
                <a-col :span="6">
                    <a-form-item label="Loại hàng">
                        <a-input />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Số lượng">
                        <a-input type="number" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Số pallet">
                        <a-input type="number" />

                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Thời gian bốc dỡ">
                        <a-input type="number" />

                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16">
                <a-col :span="6">
                    <a-form-item label="Chiều dài">
                        <a-input type="number" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Chiều rộng">
                        <a-input type="number" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Chiều cao">
                        <a-input type="number" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Khối lượng">
                        <a-input type="number" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-form-item label="Địa chỉ đích">
                <address-form />
            </a-form-item>
            <a-form-item label="Ghi chú">
                <a-input />
            </a-form-item>
        </a-form>
    </a-modal>

    <!-- Popup add order item form -->
    <a-modal width="500px" v-if="openEditInfoForm" v-model:open="openEditInfoForm"
        title="Chỉnh sửa thông tin yêu cầu vận chuyển" :confirm-loading="editBasicInfoLoading" @ok="editInfo"
        wrap-class-name="order-detail" okText="Lưu" cancelText="Hủy">
        <a-form>
            <a-form-item label="Mã">
                <a-input v-model:value="orderEdit.code" />
            </a-form-item>
            <a-form-item label="Chi phí">
                <a-input type="number" v-model:value="orderEdit.cost" />
            </a-form-item>
            <a-form-item label="Loại hàng">
                <a-select v-model:value="orderEdit.goodType">
                    <a-select-option value="normal">Thường</a-select-option>
                    <a-select-option value="cold">Đông lạnh</a-select-option>
                </a-select>
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script setup lang="ts">
import AddressForm from '@/components/AddressForm.vue';
import { EditOutlined, DeleteFilled } from '@ant-design/icons-vue';
import { reactive, ref, onMounted } from 'vue';
import { OrderItemResourceApi, OrderResourceApi } from '@/api';
import store from '@/store';
import { Configuration } from '@/configuration';
import { computed } from 'vue';
import { usePagination } from 'vue-request';
import { OrderDTO, OrderItemDTO } from '../api';
import moment from 'moment';
import { message } from 'ant-design-vue';

const openEditInfoForm = ref(false);
const editBasicInfoLoading = ref(false);
const editInfoLoading = ref(false);
const showEditInfoForm = () => {
    orderEdit.value.code = order.value?.code;
    orderEdit.value.cost = order.value?.cost!;
    orderEdit.value.goodType = order.value?.goodType!;
    openEditInfoForm.value = true;

}
const editInfo = () => {
    editBasicInfoLoading.value = true;
    console.log("Call update Order {}: ", props.orderId);
    orderApi.partialUpdateOrder(props.orderId!, orderEdit.value).then(() => {
        message.success('Cập nhật thông tin thành công');
        updateInfo();
        editBasicInfoLoading.value = false;
        openEditInfoForm.value = false;
    }).catch((e: any) => {
        console.log(e);
        message.error('Cập nhật thông tin thất bại');
        editBasicInfoLoading.value = false;
        openEditInfoForm.value = false;
    })
}

const openEditForm = ref(false);
const editLoading = ref(false);
const showEditForm = (record: OrderItemDTO) => {
    openEditForm.value = true;

}
const deleteOrderItem = (record: OrderItemDTO) => {

}
const edit = () => {

}

const addInfo = ref<OrderItemDTO>({
    earliestTime: new Date().toISOString(),
    latestTime: new Date().toISOString(),
    goodType: 'normal',
    type: 'from',
    length: 0,
    width: 0,
    height: 0,
    volume: 0,
    numPallets: 0,
    weight: 0,
    note: '',
    status: 'no-trans'
})


const openAddForm = ref(false);
const addLoading = ref(false);
const showAddForm = () => {
    openAddForm.value = true;
}
const add = () => {

}
const props = withDefaults(defineProps<{ orderId: number | null }>(), {
    orderId: null
});
// config request object
const config = new Configuration({
    accessToken: () => store.getters.jwt,
    baseOptions: {
        headers: { 'Content-Type': 'application/json' }
    }
})
const orderItemApi = new OrderItemResourceApi(config);
const orderApi = new OrderResourceApi(config);

const orderEdit = ref<OrderDTO>({
    id: props.orderId!,
    code: '',
    cost: 0,
    goodType: 'normal',
});
const order = ref<OrderDTO>();
onMounted(() => {
    orderApi.getOrder(props.orderId!).then((res) => {
        order.value = res.data;
    })
})

const updateInfo = () => {
    orderApi.getOrder(props.orderId!).then((res) => {
        order.value = res.data;
    })
}


const numOfOrderItem = ref(0);
async function getNumberOfOrders() {
    let num = 0;
    if (props.orderId) {
        try {
            num = (await orderItemApi.getNumOfOrderItem()).data!;
        } catch (e: any) {
            console.log(e);
        }
    }

    numOfOrderItem.value = num;
}

// table config
const columns = [
    {
        title: 'Loại điểm',
        dataIndex: 'type',
        key: 'type',
        width: '12%',
    },
    {
        title: 'Thời điểm làm việc',
        key: 'earliest-time',
        width: '20%',
    },
    {
        title: 'Thời điểm nghỉ',
        key: 'last-time',
        width: '20%',
    },
    {
        title: 'Dài',
        key: 'length',
        dataIndex: 'length',
        width: '10%',
    },
    {
        title: 'Rộng',
        key: 'width',
        dataIndex: 'width',
        width: '10%',
    },
    {
        title: 'Cao',
        key: 'height',
        dataIndex: 'height',
        width: '10%',
    },
    {
        title: 'Số lượng',
        key: 'volume',
        dataIndex: 'volume',
        width: '15%',
    },
    {
        title: 'Số Pallets',
        key: 'numPallets',
        dataIndex: 'numPallets',
        width: '15%',
    },
    {
        title: 'Trọng lượng',
        key: 'weight',
        dataIndex: 'weight',
        width: '15%',
    },
    {
        title: 'Ghi chú',
        key: 'note',
        dataIndex: 'note',
        width: '30%',
    },
    {
        title: 'Trạng thái',
        key: 'status',
        dataIndex: 'status',
        width: '15%',
    },
    {
        title: 'Thời gian bốc dỡ',
        key: 'carryTimeSec',
        width: '20%',
    },
    {
        title: 'Địa chỉ',
        key: 'address',
        dataIndex: ['address', 'fullName'],
        width: '20%',
    },
    {
        title: '',
        key: 'operation',
        width: '10%',
        fixed: 'right',
    },
]

type APIParams = {
    page?: number;
    pageSize?: number;
};
const queryData = async (params: APIParams) => {
    await getNumberOfOrders();
    return (await orderItemApi.getOrderItemsByOrderId(props.orderId!, params.page! - 1, 8)).data;
};

const {
    data: orderItems,
    run,
    loading,
    current,
} = usePagination(queryData, {
    pagination: {
        currentKey: 'page',
    },
});

const pagination = computed(() => ({
    total: numOfOrderItem.value,
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
</script>
<style scoped>
.ant-table-striped :deep(.table-striped) td {
    background-color: #fafafa;
}

.order {
    margin-bottom: 0;
    margin-top: 0;
    margin-left: 16px;
}

.order>span {
    margin-right: 24px;
}

.code {
    font-size: large;
}

.cost {
    font-size: large;
}

.immediate-route {
    padding: 4px;
    border-radius: 12px;
    font-weight: bolder;
}

.haven-route {
    background-color: blue;
    color: white;
}

.no-route {
    background-color: gray;
    color: white;
}

.status {
    padding: 4px;
    border-radius: 12px;
    font-weight: bolder;
}

.no-trans {
    background-color: gray;
    color: white;
}

.transing {
    background-color: orange;
    color: white;
}

.stopping {
    background-color: red;
    color: white;
}

.success {
    background-color: blue;
    color: white;
}

.customer-name {
    font-weight: bold;
}

.order-detail {
    .ant-modal {
        top: 10px;
    }
}
</style>