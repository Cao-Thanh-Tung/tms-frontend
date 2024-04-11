<script setup lang="ts">
import { UserOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { reactive, ref } from 'vue';
import { UserXDTO } from '@/api';
import { UserXResourceApi } from '@/api';
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
const userxApi = new UserXResourceApi(config);


// table config
const columns = [
    {
        title: '',
        key: 'imageUrl',
        width: '1.5%',
        fixed: 'left',
    },
    {
        title: 'Tên',
        key: 'name',
        width: '6%',
        fixed: 'left',
        customFilterDropdown: true,
        onFilter: (value: string, record: UserXDTO) =>
            (record.user!.firstName! + record.user!.lastName!).toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: 'Số điện thoại',
        dataIndex: 'phoneNumber',
        key: 'phone',
        width: '4%',
        customFilterDropdown: true,
        onFilter: (value: string, record: UserXDTO) =>
            record.phoneNumber!.toLowerCase().includes(value.toLowerCase()),
    }, {
        title: 'Email',
        dataIndex: ['user', 'email'],
        key: 'email',
        width: '6%',
        customFilterDropdown: true,
        onFilter: (value: string, record: UserXDTO) =>
            record.user!.email!.toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: 'Tài khoản',
        dataIndex: ['user', 'login'],
        key: 'username',
        width: '4%',
        customFilterDropdown: true,
        onFilter: (value: string, record: UserXDTO) =>
            record.user!.login!.toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: 'Địa chỉ',
        dataIndex: ['address', 'fullName'],
        key: 'address',
        width: '4%',
        customFilterDropdown: true,
        onFilter: (value: string, record: UserXDTO) =>
            record.user!.login!.toLowerCase().includes(value.toLowerCase()),
    }
];
type APIParams = {
    page?: number;
    pageSize?: number;
};
const numOfCustomer = ref(0);
async function getNumberOfCustomer() {
    let num = 0;
    try {
        num += (await userxApi.getNumberOfCustomerForEmployee(store.getters.user.id)).data!;
    } catch (e: any) {
        console.log(e);
    }
    numOfCustomer.value = num;
}
const queryData = async (params: APIParams) => {
    getNumberOfCustomer();
    const a = (await userxApi.getCustomerForEmployee(store.getters.user.id, params.page! - 1, 6)).data;
    console.log(a);
    return a;
}
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

const pagination = computed(() => ({
    total: numOfCustomer.value,
    current: current.value,
    pageSize: 6,
}));
const tableCondition = reactive<{
    pag: { pageSize: number; current: number },
    filters: any,
    sorter: any,
}>({
    pag: { pageSize: 6, current: 1 },
    filters: null,
    sorter: null,
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

const state = reactive({
    searchText: '',
    searchedColumn: '',
});

const searchInput = ref();

const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm();
    state.searchText = selectedKeys[0];
    state.searchedColumn = dataIndex;
};

const handleReset = (clearFilters: any) => {
    clearFilters({ confirm: true });
    state.searchText = '';
};




</script>

<template>

    <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item>Khách hàng</a-breadcrumb-item>
        <a-breadcrumb-item>Danh sách khách hàng</a-breadcrumb-item>
    </a-breadcrumb>

    <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
        <a-table :dataSource="users" :columns="columns" :scroll="{ x: 1300 }" :pagination="pagination"
            :loading="loading" @change="handleTableChange">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                    {{ `${(<UserXDTO>record).user?.firstName} ${(<UserXDTO>record).user?.lastName} ` }}
                </template>

                <template v-if="column.key === 'imageUrl'">
                    <a-avatar :src="(<UserXDTO>record).user?.imageUrl">
                        <template #icon><user-outlined /></template>
                    </a-avatar>
                </template>
            </template>
            <!-- Filter-->

            <template #customFilterIcon="{ filtered }">
                <search-outlined :style="{ color: filtered ? '#108ee9' : undefined }" />
            </template>

            <template #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
                <div style="padding: 8px">
                    <a-input ref="searchInput" :placeholder="`Search`" :value="selectedKeys[0]"
                        style="width: 188px; margin-bottom: 8px; display: block"
                        @change="(e: any) => setSelectedKeys(e.target.value ? [e.target.value] : [])"
                        @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)" />
                    <a-button type="primary" size="small" style="width: 90px; margin-right: 8px"
                        @click="handleSearch(selectedKeys, confirm, column.dataIndex)">
                        <template #icon>
                            <SearchOutlined />
                        </template>
                        Search
                    </a-button>
                    <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
                        Reset
                    </a-button>
                </div>
            </template>
            <!-- Filter end -->
        </a-table>

    </a-layout-content>
</template>

<style scoped></style>