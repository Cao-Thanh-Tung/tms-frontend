<script setup lang="ts">
import { EditOutlined, DeleteFilled, UserOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { onMounted, reactive, ref, UnwrapRef } from 'vue';
import { message } from 'ant-design-vue';
import { UserXDTO, UserDTO } from '@/api';
import { UserXResourceApi, UserResourceApi, AddressResourceApi } from '@/api';
import store from '@/store';
import { Configuration } from '@/configuration';
import { AdminUserDTO } from '../../api';
import AddressForm from '@/components/AddressForm.vue';
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
const numOfUserX = ref(0);
async function getNumberOfUsers() {
    let num = 0;
    try {
        num += (await userxApi.getNumberOfUserXByRole("none")).data!;
        num += (await userxApi.getNumberOfUserXByRole("employee")).data!;
        num += (await userxApi.getNumberOfUserXByRole("driver")).data!;
    } catch (e: any) {
        console.log(e);
    }
    console.log(num);
    numOfUserX.value = num;
}

// helper function
function createDefaultUserDTO(): UserDTO {
    return {
        id: 0,
        login: '',
        firstName: '',
        lastName: '',
        email: '',
        imageUrl: '',
        activated: false
    };
}


function createDefaultUserXDTO() {
    return {
        id: 0,
        phoneNumber: '',
        role: 'none',
        user: createDefaultUserDTO(),
        address: {
            id: -1,
            fullName: '',
        }
    };
}

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
    },
    {
        title: 'Chức vụ',
        dataIndex: 'role',
        key: 'role',
        width: '4%',
        filters: [
            {
                text: 'Nhân viên điều phối',
                value: 'employee',
            },
            {
                text: 'Tài xế',
                value: 'driver',
            },
            {
                text: 'Chờ phân công',
                value: 'none'
            }
        ],
        onFilter: (value: string, record: UserXDTO) => record.role === value,
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
    return (await userxApi.getAllUserXES(params.page! - 1, 6)).data.filter((userx: UserXDTO) => {
        return userx.role === "employee" || userx.role === "driver" || userx.role === "none"
    });
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
// Delete user and update to table content
const deleteEmployee = async (employee?: UserXDTO) => {
    try {
        await userxApi.deleteUserX(employee?.id!)
        await userApi.deleteUser(employee!.user!.login!);
        await addressApi.deleteAddress(employee!.addressId!);
        message.success('Đã xóa thông tin nhân viên thành công!');
        updateTable(tableCondition.pag, tableCondition.filters, tableCondition.sorter);
    } catch (err) {
        console.log(err);
        message.error('Xóa thông tin nhân viên thất bại!');
    }
};

// Logic editForm
const openEditForm = ref<boolean>(false);

const formEditState: UnwrapRef<UserXDTO> = reactive<UserXDTO>(createDefaultUserXDTO());
const showEditForm = (v: UserXDTO) => {
    Object.assign(formEditState, JSON.parse(JSON.stringify(v)));
    formEditState.address!.id = v.addressId;
    console.log(v);
    openEditForm.value = true;
};

const editLoading = ref<boolean>(false);
const edit = () => {
    editLoading.value = true;
    console.log(formEditState);
    userxApi.partialUpdateUserX(formEditState.id!, formEditState).then((res) => {
        console.log(res);
        message.success("Đã thay đổi thông tin nhân viên thành công!");
    }).catch((err) => {
        console.log(err);
        message.success("Thay đổi thông tin nhân viên thất bại!");
    }).finally(() => {
        updateTable(tableCondition.pag, tableCondition.filters, tableCondition.sorter);
        editLoading.value = false;
        openEditForm.value = false;
    })
};

// Logic addForm
const openAddForm = ref<boolean>(false);
const addLoading = ref<boolean>(false);
const addressApi = new AddressResourceApi(config);
const userApi = new UserResourceApi(config);
const formAddState = reactive({
    login: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    imageUrl: "",
    address: { id: -1, fullName: '' },
    role: "none",
})
function reset() {
    formAddState.login = "";
    formAddState.password = "";
    formAddState.firstName = "";
    formAddState.lastName = "";
    formAddState.phone = "";
    formAddState.email = "";
    formAddState.imageUrl = "";
    formAddState.address.id = -1;
    formAddState.address.fullName = "";
    formAddState.role = "none";
}

const showAddForm = () => {
    openAddForm.value = true;
};

const add = async () => {
    addLoading.value = true;
    try {
        let userId = (await userApi.createUser(<AdminUserDTO>{
            login: formAddState.login,
            email: formAddState.email,
            firstName: formAddState.firstName,
            lastName: formAddState.lastName,
            imageUrl: formAddState.imageUrl,
        })).data.id;
        await userxApi.createUserX(<UserXDTO>{
            phoneNumber: formAddState.phone,
            role: formAddState.role,
            user: {
                id: userId,
            },
            address: {
                id: formAddState.address.id,
                fullName: formAddState.address.fullName,
            }
        });
        message.success("Tạo tài khoản nhân viên thành công!");
    } catch (err) {
        message.error("Tạo tài khoản nhân viên thất bại!");
    } finally {
        updateTable(tableCondition.pag, tableCondition.filters, tableCondition.sorter);
        addLoading.value = false;
        openAddForm.value = false;
        reset();
    }
}

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
const chooseAddressAddForm = (addressId: number) => {
    formAddState.address.id = addressId;
}
const chooseAddressEditForm = (addressId: number) => {
    formEditState.address!.id = addressId;
    console.log(addressId);
}



</script>

<template>
    <!-- -->
    <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item>Nhân viên</a-breadcrumb-item>
        <a-breadcrumb-item>Danh sách nhân viên</a-breadcrumb-item>
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

                <template v-if="column.key === 'role'">
                    {{ record.role === "employee" ? "Điều phối viên" : "" }}
                    {{ record.role === "driver" ? "Tài xế" : "" }}
                    {{ record.role === "none" ? "Chờ phân công" : "" }}
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
    <a-modal v-if="openEditForm" v-model:open="openEditForm" title="Chỉnh sửa thông tin nhân viên"
        :confirm-loading="editLoading" @ok="edit">
        <a-form :model="formEditState">
            <a-form-item ref="firstName" label="Họ" name="firstName">
                <a-input v-model:value="formEditState.user!.firstName" />
            </a-form-item>
            <a-form-item ref="lastName" label="Tên" name="lastName">
                <a-input v-model:value="formEditState.user!.lastName" />
            </a-form-item>
            <a-form-item ref="address" label="Địa chỉ" name="address">
                <address-form :initial-address-id="formEditState.addressId"
                    @save="chooseAddressEditForm"></address-form>
            </a-form-item>
            <a-form-item ref="phoneNumber" label="Phone" name="phoneNumber">
                <a-input v-model:value="formEditState.phoneNumber" />
            </a-form-item>
            <a-form-item ref="email" label="Email" name="email">
                <a-input v-model:value="formEditState.user!.email" />
            </a-form-item>
            <a-form-item label="Kích hoạt tài khoản" name="activated">
                <a-switch v-model:checked="formEditState.user!.activated" />
            </a-form-item>
            <a-form-item label="Đường dẫn ảnh" name="imageUrl">
                <a-input v-model:value="formEditState.user!.imageUrl" />
            </a-form-item>

            <a-form-item label="Chức vụ" name="resource">
                <a-radio-group v-model:value="formEditState.role">
                    <a-radio value="employee">Nhân viên điều phối</a-radio>
                    <a-radio value="driver">Tài xế</a-radio>
                    <a-radio value="none">Chờ phân công</a-radio>
                </a-radio-group>
            </a-form-item>
        </a-form>
    </a-modal>

    <!-- Popup create employee form -->
    <a-modal v-if="openAddForm" v-model:open="openAddForm" title="Tạo mới nhân viên" :confirm-loading="addLoading"
        @ok="add" @cancel="reset">
        <a-form>
            <a-form-item label="Tài khoản" name="username">
                <a-input v-model:value="formAddState.login" />
            </a-form-item>
            <a-form-item label="Họ" name="firstName">
                <a-input v-model:value="formAddState.firstName" />
            </a-form-item>
            <a-form-item label="Tên" name="lastName">
                <a-input v-model:value="formAddState.lastName" />
            </a-form-item>
            <a-form-item label="Địa chỉ" name="address">
                <address-form @save="chooseAddressAddForm"></address-form>
            </a-form-item>
            <a-form-item ref="phoneNumber" label="Phone" name="phoneNumber">
                <a-input v-model:value="formAddState.phone" />
            </a-form-item>
            <a-form-item label="Email" name="email">
                <a-input v-model:value="formAddState.email" />
            </a-form-item>
            <a-form-item label="Ảnh" name="imageUrl">
                <a-input v-model:value="formAddState.imageUrl" />
            </a-form-item>
            <a-form-item label="Chức vụ" name="resource">
                <a-radio-group v-model:value="formAddState.role">
                    <a-radio value="employee">Nhân viên điều phối</a-radio>
                    <a-radio value="driver">Tài xế</a-radio>
                    <a-radio value="none">Chờ phân công</a-radio>
                </a-radio-group>
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<style scoped></style>