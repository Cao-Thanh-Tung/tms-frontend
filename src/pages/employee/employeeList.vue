<script setup lang="ts">
import { EditOutlined, DeleteFilled, UserOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { onUpdated, reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import { UserXDTO, UserDTO } from '@/api';
import { UserXResourceApi, UserResourceApi, ScheduleResourceApi, CustomerAssignmentResourceApi, VehicleResourceApi } from '@/api';
import store from '@/store';
import { Configuration } from '@/configuration';
import { computed } from 'vue';
import { usePagination } from 'vue-request';
import addEmployeeForm from './form/addEmployeeForm.vue';
import editEmployeeForm from './form/editEmployeeForm.vue';
// config request object
const config = new Configuration({
    accessToken: () => store.getters.jwt,
    baseOptions: {
        headers: { 'Content-Type': 'application/json' }
    }
})
const userxApi = new UserXResourceApi(config);
const userApi = new UserResourceApi(config);
const numOfUserX = ref(0);
async function getNumberOfUsers() {
    let num = 0;
    try {
        num += (await userxApi.getNumberOfUserXByRole("none")).data!;
        num += (await userxApi.getNumberOfUserXByRole("employee")).data!;
    } catch (e: any) {
        console.log(e);
    }
    console.log(num);
    numOfUserX.value = num;
}

// helper function


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
    }, {
        title: 'Địa chỉ',
        dataIndex: ['address', 'fullName'],
        key: 'fullName',
        width: '6%',
        customFilterDropdown: true,
        onFilter: (value: string, record: UserXDTO) => record.address?.fullName?.toLocaleLowerCase().includes(value.toLowerCase()),
    }, {
        title: 'Kích hoạt',
        key: 'activated',
        width: '4%',
        filters: [
            {
                text: 'Đã Kích hoạt',
                value: true,
            },
            {
                text: 'Chưa kích hoạt',
                value: false,
            },
        ],
        onFilter: (value: boolean, record: UserXDTO) => record.user?.activated === value,
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
        title: 'Thao tác',
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
    await getNumberOfUsers();
    const a = (await userxApi.getUserXByRole('employee', params.page! - 1, 6)).data;
    console.log(a);
    return a;
};

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
    total: numOfUserX.value,
    current: current.value,
    pageSize: 6,
}));
const tableCondition = reactive<{
    pag: { pageSize: number; current: number },
    filters: any,
    sorter: any,
}>({
    pag: { pageSize: 6, current: 1 },
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
const defaultUpdate = () => {
    updateTable(tableCondition.pag, tableCondition.filters, tableCondition.sorter);
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

const scheduleApi = new ScheduleResourceApi(config);
const customerAssignmentApi = new CustomerAssignmentResourceApi(config);
const vehicleApi = new VehicleResourceApi(config);
// Delete user and update to table content
const deleteEmployee = async (employee?: UserXDTO) => {
    try {
        // await vehicleApi.updateOwnerUserXIdToNull(employee?.id!);
        await customerAssignmentApi.deleteCustomerAssignmentByEmployeeUserXId(employee?.id!);
        await scheduleApi.updateScheduleCoordinateToNull(employee?.id!);
        await userxApi.deleteUserX(employee?.id!)
        await userApi.deleteUser(employee!.user!.login!);
        // await addressApi.deleteAddress(employee!.addressId!);
        message.success('Đã xóa thông tin nhân viên thành công!');
        updateTable(tableCondition.pag, tableCondition.filters, tableCondition.sorter);
    } catch (err) {
        console.log(err);
        message.error('Xóa thông tin nhân viên thất bại!');
    }
};

// Logic editForm

// Logic addForm

const openAddForm = ref<boolean>(false);
const openEditForm = ref<boolean>(false);
const userxEdit = ref<UserXDTO>();
const showAddForm = () => {
    openAddForm.value = true;
};
const showEditForm = (record: UserXDTO) => {
    userxEdit.value = record;
    openEditForm.value = true;
};

onUpdated(() => {
    console.log("hello");
});

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

const addSuccess = () => {
    openAddForm.value = false;
    defaultUpdate();
}
const editSuccess = () => {
    openEditForm.value = false;
    defaultUpdate();
};


</script>

<template>
    <!-- -->
    <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item>Nhân viên</a-breadcrumb-item>
        <a-breadcrumb-item>Nhân viên điều phối</a-breadcrumb-item>
    </a-breadcrumb>

    <!-- Employee list table -->
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

                <template v-if="column.key === 'operation'">
                    <a href="#" @click="() => showEditForm(record)">
                        <EditOutlined />
                    </a>
                    <a-popconfirm title="Xóa nhân viên?" ok-text="Yes" cancel-text="No"
                        @confirm="() => deleteEmployee((<UserXDTO>record))">
                        <a href="#">
                            <DeleteFilled style="margin-left: 12px" />
                        </a>
                    </a-popconfirm>
                </template>

                <template v-if="column.key === 'activated'">
                    <a-checkbox checked v-if="(<UserXDTO>record).user?.activated"></a-checkbox>
                    <a-checkbox v-else disabled></a-checkbox>
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

    <!-- Float button create new employee-->
    <a-float-button type="primary" @click="showAddForm" tooltip="Tạo nhân viên mới">

        <template #icon>
            <plus-outlined />
        </template>
    </a-float-button>

    <!-- Popup edit employee form -->
    <editEmployeeForm v-if="openEditForm" v-model:open="openEditForm" @edit-employee-success="editSuccess"
        :user="userxEdit?.id!" />

    <!-- Popup create employee form -->
    <addEmployeeForm v-if="openAddForm" v-model:open="openAddForm" @create-employee-success="addSuccess" />
</template>
