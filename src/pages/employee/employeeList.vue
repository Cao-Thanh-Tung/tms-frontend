<script setup lang="ts">
import { EditOutlined, DeleteFilled, UserOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { reactive, ref, UnwrapRef, onBeforeMount } from 'vue';
import { message } from 'ant-design-vue';
import { UserXDTO, UserDTO, AddressDTO } from '@/api';
import { UserXResourceApi, UserResourceApi, AddressResourceApi } from '@/api';
import store from '@/store';
import { Configuration } from '@/configuration';
import { AdminUserDTO } from '../../api';
// config request object
const config = new Configuration({
    accessToken: () => store.getters.jwt,
    baseOptions: {
        headers: { 'Content-Type': 'application/json' }
    }
})
const userxApi = new UserXResourceApi(config);

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

function createDefaultAddressDTO(): AddressDTO {
    return {
        fullName: '',
    };
}

function createDefaultUserXDTO() {
    return {
        id: 0, // Hoặc giá trị mặc định của id tùy thuộc vào yêu cầu của bạn
        phoneNumber: '',
        role: 'none',
        user: createDefaultUserDTO(),
        address: createDefaultAddressDTO() // Đây là một cách để tạo một đối tượng rỗng của AddressDTO
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
        title: 'Địa chỉ',
        dataIndex: ['address', 'fullName'],
        key: 'address',
        width: '6%',
        customFilterDropdown: true,
        onFilter: (value: string, record: UserXDTO) =>
            record.address!.fullName!.toLowerCase().includes(value.toLowerCase()),
    }, {
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

const users = reactive<UserXDTO[]>([]);
// Get users from server to push in table content
onBeforeMount(() => {
    userxApi.getAllUserXES().then((res) => {
        const employees = res.data.filter((userx: UserXDTO) => {
            return userx.role === "employee" || userx.role === "driver" || userx.role === "none"
        })
        users.push(...employees.reverse());
    }).catch((err) => {
        console.log("Get All Employee." + err);
    })
})

// Delete user and update to table content
const deleteEmployee = async (employee?: UserXDTO) => {
    try {
        let employeeParams : any = employee!.id
        await userxApi.deleteUserX(employeeParams)
        await userApi.deleteUser(employee!.user!.login!);
        await addressApi.deleteAddress(employee!.address!.id!);
        const index = users.indexOf(<UserXDTO>employee);
        console.log(index);
        message.success('Đã xóa thông tin nhân viên thành công!');
        users.splice(index, 1);
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
    openEditForm.value = true;
};

const editLoading = ref<boolean>(false);
const edit = () => {
    editLoading.value = true;
    console.log(JSON.parse(JSON.stringify(formEditState)));
    console.log(formEditState.id);
    let formEditStateParmams : any= formEditState.id
    userxApi.partialUpdateUserX(formEditStateParmams, formEditState).then((res) => {
        console.log(res);
        const index = users.findIndex((user: UserXDTO) => { return user.id === formEditState.id });
        console.log(index);
        console.log(users[index]);
        Object.assign(users[index], JSON.parse(JSON.stringify(formEditState)));
        message.success("Đã thay đổi thông tin nhân viên thành công!");
    }).catch((err) => {
        console.log(err);
        message.success("Thay đổi thông tin nhân viên thất bại!");
    }).finally(() => {
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
    address: {
        id: -1,
        fullName: "",
    },
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
        let addressId = (await addressApi.createAddress(<AddressDTO>{
            fullName: formAddState.address.fullName,
        })).data.id;
        let userXId = (await userxApi.createUserX(<UserXDTO>{
            phoneNumber: formAddState.phone,
            role: formAddState.role,
            user: {
                id: userId,
            },
            address: {
                id: addressId
            }
        })).data.id;
        users.unshift(<UserXDTO>{
            id: userXId,
            phoneNumber: formAddState.phone,
            role: formAddState.role,
            user: {
                id: userId,
                login: formAddState.login,
                email: formAddState.email,
                firstName: formAddState.firstName,
                lastName: formAddState.lastName,
                imageUrl: formAddState.imageUrl,
                activated: true,
            },
            address: {
                id: addressId,
                fullName: formAddState.address.fullName,
            }
        });
        message.success("Tạo tài khoản nhân viên thành công!");
    } catch (err) {
        message.error("Tạo tài khoản nhân viên thất bại!");
    } finally {
        addLoading.value = false;
        openAddForm.value = false;
        reset();
    }
}

const pagination = {
    pageSize: 6,
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
</script>
<template>
    <!-- -->
    <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item>Nhân viên</a-breadcrumb-item>
        <a-breadcrumb-item>Danh sách nhân viên</a-breadcrumb-item>
    </a-breadcrumb>

    <!-- Employee list table -->
    <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
        <a-table :dataSource="users" :columns="columns" :scroll="{ x: 1300 }" :pagination="pagination">
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
    <a-modal v-model:open="openEditForm" title="Chỉnh sửa thông tin nhân viên" :confirm-loading="editLoading" @ok="edit">
        <a-form :model="formEditState">
            <a-form-item ref="firstName" label="Họ" name="firstName">
                <a-input v-model:value="formEditState.user!.firstName" />
            </a-form-item>
            <a-form-item ref="lastName" label="Tên" name="lastName">
                <a-input v-model:value="formEditState.user!.lastName" />
            </a-form-item>
            <a-form-item ref="phoneNumber" label="Phone" name="phoneNumber">
                <a-input v-model:value="formEditState.phoneNumber" />
            </a-form-item>
            <a-form-item ref="email" label="Email" name="email">
                <a-input v-model:value="formEditState.user!.email" />
            </a-form-item>
            <a-form-item ref="address" label="Địa chỉ" name="address">
                <a-input v-model:value="formEditState.address!.fullName" />
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
    <a-modal v-model:open="openAddForm" title="Tạo mới nhân viên" :confirm-loading="addLoading" @ok="add" @cancel="reset">
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
            <a-form-item ref="phoneNumber" label="Phone" name="phoneNumber">
                <a-input v-model:value="formAddState.phone" />
            </a-form-item>
            <a-form-item label="Email" name="email">
                <a-input v-model:value="formAddState.email" />
            </a-form-item>
            <a-form-item label="Địa chỉ" name="address">
                <a-input v-model:value="formAddState.address.fullName" />
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
  