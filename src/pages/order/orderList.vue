<script setup lang="ts">
import { EditOutlined, DeleteFilled } from '@ant-design/icons-vue';
// import { OrderResourceApi } from '@/api';
const columns = [
    { title: 'Mã', dataIndex: 'code', key: 'code' },
    { title: 'Chi phí', dataIndex: 'cost', key: 'cost' },
    { title: 'Loại hàng', dataIndex: 'goodType', key: 'goodType' },
    { title: 'Trọng lượng', dataIndex: 'weight', key: 'weight' },
    { title: 'Người đặt', dataIndex: 'owner', key: 'owner' },
    { title: 'Thao tác', key: 'operation' },
];


interface DataItem {
    key: number;
    code: string;
    cost: number;
    goodType: string;
    immediateDelivery: boolean;
    weight: number;
    volume: number;
    owner: string;
    createdAt: string;
}

const data: DataItem[] = [];
for (let i = 0; i < 3; ++i) {
    data.push({
        key: i,
        code: "037ALPHA",
        cost: 10000,
        goodType: "Đông lạnh",
        immediateDelivery: true,
        weight: 10,
        volume: 100,
        owner: "ABC plate",
        createdAt: '2014-12-24 23:12:00',
    });
}

const innerColumns = [
    {
        title: 'Tên',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Loại hàng',
        dataIndex: 'goodType',
        key: 'goodType',
    },
    {
        title: 'Khối lượng',
        dataIndex: 'weight',
        key: 'weight',
    },
    {
        title: 'Số lượng',
        dataIndex: 'volume',
        key: 'name',
    },
    {
        title: 'Số pallet',
        dataIndex: 'numPallets',
        key: 'numPallets',
    },
    {
        title: 'Rộng',
        dataIndex: 'width',
        key: 'width',
    },
    {
        title: 'Dài',
        dataIndex: 'length',
        key: 'length',
    },
    {
        title: 'Cao',
        dataIndex: 'height',
        key: 'height',
    },
    {
        title: 'Bắt đầu',
        dataIndex: 'earliest_time',
        key: 'earliest_time',
    },
    {
        title: 'Kết thúc',
        dataIndex: 'latest_time',
        key: 'latest_time',
    },
    {
        title: 'Địa chỉ nhận',
        dataIndex: 'address',
        key: 'name',
    },
    {
        title: 'Địa chỉ giao',
        dataIndex: 'address',
        key: 'name',
    },
];

interface innerDataItem {
    key: string;
    type: string;
    goodType: string;
    weight: number;
    volume: number;
    numPallets: number;
    width: number;
    height: number;
    length: number;
    earliest_time: number;
    latest_time: number;
    note: string;
    status: string;
    name: string;
    address: string;
}

const innerData: innerDataItem[] = [];
for (let i = 0; i < 3; ++i) {
    innerData.push({
        key: i.toString(),
        type: "Đông lạnh",
        goodType: "Đông lạnh",
        weight: 12,
        volume: 15,
        numPallets: 3,
        width: 19,
        height: 20,
        length: 30,
        earliest_time: 12,
        latest_time: 15,
        note: "",
        status: "Đang vận chuyển",
        name: "Thịt cừu",
        address: `London Park no. ${i}`,
    });
}
import { ref } from 'vue';
const open = ref<boolean>(false);

const showModal = () => {
    open.value = true;
};

const handleOk = (e: MouseEvent) => {
    console.log(e);
    open.value = false;
};
import { message } from 'ant-design-vue';
const confirm = (e: MouseEvent) => {
    console.log(e);
    message.success('Click on Yes');
};

const cancel = (e: MouseEvent) => {
    console.log(e);
    message.error('Click on No');
};
</script>
<template>
    <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item>Đơn vận chuyển</a-breadcrumb-item>
        <a-breadcrumb-item>Danh sách đơn</a-breadcrumb-item>
    </a-breadcrumb>
    <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
        <a-table :columns="columns" :data-source="data" class="components-table-demo-nested">
            <template #bodyCell="{ column }">
                <template v-if="column.key === 'operation'">
                    <a href="#" @click="showModal">
                        <EditOutlined />
                    </a>

                    <a-modal v-model:open="open" title="Chi tiết đơn hàng" @ok="handleOk">
                        <!-- Ngày bắt đầu phục vụ, Mã KH, mã đơn hàng, mã vận đơn -->
                        <!--<cost, goodtype, weight, volume>, (immediate_delivery, status)-->
                        <!-- type, goodtype, weight, volume, num_pallets, width, height, length, earliest_time, latest_time,carry_in_time_sec, carry_out_time_sec, note, address(cho chọn địa điểm thoải mái ha, đây là điểm đến), (status), <waiting_time_sec> -->
                    </a-modal>
                    <a-popconfirm title="Are you sure delete this task?" ok-text="Yes" cancel-text="No" @confirm="confirm"
                        @cancel="cancel">
                        <a href="#">
                            <DeleteFilled style="margin-left: 12px" />
                        </a>
                    </a-popconfirm>
                </template>
            </template>
            <template #expandedRowRender>
                <a-table :columns="innerColumns" :data-source="innerData" :pagination="false">
                </a-table>
            </template>
        </a-table>
    </a-layout-content>
</template>
<style scoped>
.editable-row-operations a {
    margin-right: 8px;
}
</style>

  