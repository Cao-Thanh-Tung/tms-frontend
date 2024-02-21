<script setup lang="ts">
import { EditOutlined, DeleteFilled, UserOutlined, PlusOutlined } from '@ant-design/icons-vue';
import axios from 'axios';
import { reactive, ref, UnwrapRef } from 'vue';
import { message } from 'ant-design-vue';
import { UserXDTO, User } from '@/api';
interface EmployeeInfo {
    key: number;
    id?: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: String;
    addressFullName?: String;
    role?: string;
    activated?: boolean;
    imageUrl?: String;
};

const columns = [
    {
        title: '',
        dataIndex: 'imageUrl',
        key: 'imageUrl',
        width: '1.5%',
        fixed: 'left',
    },
    {
        title: 'Tên',
        key: 'name',
        width: '4%',
        fixed: 'left',
    },
    {
        title: 'Số điện thoại',
        dataIndex: 'phoneNumber',
        key: 'phone',
        width: '3%',
    },
    {
        title: 'Địa chỉ',
        dataIndex: 'addressFullName',
        key: 'address',
        width: '6%',
    }, {
        title: 'Chức vụ',
        dataIndex: 'role',
        key: 'role',
        width: '3%',
    }, {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        width: '6%',
    }, {
        title: 'Kích hoạt',
        dataIndex: 'activated',
        key: 'activated',
        width: '2.5%',
    },
    {
        title: 'Tài khoản',
        dataIndex: 'username',
        key: 'username',
        width: '3%',
    },
    {
        title: 'Thao tác',
        key: 'operation',
        width: '2%',
        fixed: 'right',
    },
];
const employeeList: EmployeeInfo[] = [];
const dataSource = reactive(employeeList);
axios.get("/user-xes").then((res) => {
    const employees = res.data.map((em: UserXDTO, index: number): EmployeeInfo => {
        const user = <User>em.user;
        return {
            key: index,
            id: em.id,
            username: user.login,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: em.phoneNumber,
            role: em.role,
            email: user.email,
            activated: user.activated,
            imageUrl: user.imageUrl,
            addressFullName: em.address?.fullName,
        }
    });
    dataSource.push(...employees);
}).catch((err) => {
    console.log("Get All Employee." + err);
})

const openEditForm = ref<boolean>(false);
const openAddForm = ref<boolean>(false);

const formState: UnwrapRef<EmployeeInfo> = reactive(
    {
        key: 0,
        id: 0,
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        addressFullName: "",
        activated: false,
        role: "",
        imageUrl: "",
    }
)
const formEditRef = ref();
const formAddRef = ref();
const showEditForm = (v: EmployeeInfo) => {
    Object.assign(formState, v);
    openEditForm.value = true;
};
const showAddForm = () => {
    openAddForm.value = true;
};
const editLoading = ref<boolean>(false);
const addLoading = ref<boolean>(false);
const edit = () => {
    editLoading.value = true;
    axios.patch(`/user-xes/${formState.id}`,
        {
            id: formState.id,
            phoneNumber: formState.phoneNumber,
            role: formState.role,
            address: {
                fullName: formState.addressFullName,
            },
            user: {
                activated: formState.activated,
                email: formState.email,
                firstName: formState.firstName,
                lastName: formState.lastName,
                imageUrl: formState.imageUrl,
            },
        }
    ).then((res) => {
        console.log(res);
        Object.assign(dataSource[formState.key], formState);
        message.success("Đã thay đổi thông tin nhân viên thành công!");
    }).catch(err => {
        console.log(err);
        message.success("Thay đổi thông tin nhân viên thất bại!");
    }).finally(() => {
        editLoading.value = false;
        openEditForm.value = false;
    });
};
const deleteEmployee = (i: number, id?: number) => {
    axios.delete(`/user-xes/${id}`).then((res) => {
        console.log(res);
        message.success('Đã xóa thông tin nhân viên thành công!');
        dataSource.splice(i, 1);
    }).catch((err) => {
        console.log(err);
        message.error('Xóa thông tin nhân viên thất bại!');
    })
};

interface EmployeeAccount {
    username?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: String;
    addressId?: number;
    role?: string;
    activated?: boolean;
    imageUrl?: String;
}
const formStateAdd: UnwrapRef<EmployeeAccount> = reactive({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    role: "none",
    activated: false,
    imageUrl: "",
})
const add = () => {
    addLoading.value = true;
    axios.patch(`/user-xes/${formState.id}`,
        {
            id: formState.id,
            phoneNumber: formState.phoneNumber,
            role: formState.role,
            address: {
                fullName: formState.addressFullName,
            },
            user: {
                activated: formState.activated,
                email: formState.email,
                firstName: formState.firstName,
                lastName: formState.lastName,
                imageUrl: formState.imageUrl,
            },
        }
    ).then((res) => {
        console.log(res);
        Object.assign(dataSource[formState.key], formState);
        message.success("Đã thay đổi thông tin nhân viên thành công!");
    }).catch(err => {
        console.log(err);
        message.success("Tạo thông tin nhân viên thất bại!");
    }).finally(() => {
        addLoading.value = false;
        openAddForm.value = false;
    });
}
</script>
<template>
    <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item>Nhân viên</a-breadcrumb-item>
        <a-breadcrumb-item>Danh sách nhân viên</a-breadcrumb-item>
    </a-breadcrumb>
    <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
        <a-table :dataSource="dataSource" :columns="columns" :scroll="{ x: 1300 }">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                    {{ `${(<EmployeeInfo>record).firstName} ${(<EmployeeInfo>record).lastName}` }}
                </template>
                <template v-if="column.key === 'imageUrl'">
                    <a-avatar :src="record.imageUrl">
                        <template #icon><user-outlined /></template>
                    </a-avatar>
                </template>
                <template v-if="column.key === 'role'">
                    {{ record.role === "employee" ? "Điều phối viên" : "" }}
                    {{ record.role === "driver" ? "Tài xế" : "" }}
                    {{ record.role === "none" ? "Chờ phân công" : "" }}
                </template>
                <template v-if="column.key === 'operation'">
                    <a href="#" @click="() => showEditForm(<EmployeeInfo>record)">
                        <EditOutlined />
                    </a>

                    <a-modal v-model:open="openEditForm" title="Chỉnh sửa thông tin nhân viên"
                        :confirm-loading="editLoading" @ok="edit">
                        <a-form ref="formEditRef" :model="formState">
                            <a-form-item ref="firstName" label="Họ" name="firstName">
                                <a-input v-model:value="formState.firstName" />
                            </a-form-item>
                            <a-form-item ref="lastName" label="Tên" name="lastName">
                                <a-input v-model:value="formState.lastName" />
                            </a-form-item>
                            <a-form-item ref="phoneNumber" label="Phone" name="phoneNumber">
                                <a-input v-model:value="formState.phoneNumber" />
                            </a-form-item>
                            <a-form-item ref="email" label="Email" name="email">
                                <a-input v-model:value="formState.email" />
                            </a-form-item>
                            <a-form-item ref="address" label="Địa chỉ" name="address">
                                <a-input v-model:value="formState.addressFullName" />
                            </a-form-item>
                            <a-form-item label="Kích hoạt tài khoản" name="activated">
                                <a-switch v-model:checked="formState.activated" />
                            </a-form-item>
                            <a-form-item ref="imageUrl" label="Đường dẫn ảnh" name="imageUrl">
                                <a-input v-model:value="formState.imageUrl" />
                            </a-form-item>

                            <a-form-item label="Chức vụ" name="resource">
                                <a-radio-group v-model:value="formState.role">
                                    <a-radio value="employee">Nhân viên điều phối</a-radio>
                                    <a-radio value="driver">Tài xế</a-radio>
                                    <a-radio value="none">Chờ phân công</a-radio>
                                </a-radio-group>
                            </a-form-item>
                        </a-form>
                    </a-modal>
                    <a-popconfirm title="Xóa nhân viên?" ok-text="Yes" cancel-text="No"
                        @confirm="() => deleteEmployee((<EmployeeInfo>record).key, (<EmployeeInfo>record).id)">
                        <a href="#">
                            <DeleteFilled style="margin-left: 12px" />
                        </a>
                    </a-popconfirm>
                </template>
                <template v-if="column.key === 'activated'">
                    <a-checkbox checked v-if="record.activated"></a-checkbox>
                    <a-checkbox v-else></a-checkbox>
                </template>
            </template>
        </a-table>

    </a-layout-content>

    <!-- Popup create employee form -->
    <a-float-button type="primary" @click="showAddForm" tooltip="Tạo nhân viên mới">
        <template #icon>
            <plus-outlined />
        </template>
    </a-float-button>
    <a-modal v-model:open="openAddForm" title="Tạo mới nhân viên" :confirm-loading="addLoading" @ok="add">
        <a-form ref="formAddRef" :model="formStateAdd">
            <a-form-item ref="username" label="Tài khoản" name="username">
                <a-input v-model:value="formStateAdd.username" />
            </a-form-item>
            <a-form-item ref="password" label="Mật khẩu" name="password">
                <a-input v-model:value="formStateAdd.password" />
            </a-form-item>
            <a-form-item ref="firstName" label="Họ" name="firstName">
                <a-input v-model:value="formStateAdd.firstName" />
            </a-form-item>
            <a-form-item ref="lastName" label="Tên" name="lastName">
                <a-input v-model:value="formStateAdd.lastName" />
            </a-form-item>
            <a-form-item ref="phoneNumber" label="Phone" name="phoneNumber">
                <a-input v-model:value="formStateAdd.phoneNumber" />
            </a-form-item>
            <a-form-item ref="email" label="Email" name="email">
                <a-input v-model:value="formStateAdd.email" />
            </a-form-item>
            <a-form-item ref="address" label="Địa chỉ" name="address">
                <a-input v-model:value="formStateAdd.addressId" />
            </a-form-item>
            <a-form-item ref="imageUrl" label="Đường dẫn ảnh" name="imageUrl">
                <a-input v-model:value="formStateAdd.imageUrl" />
            </a-form-item>
            <a-form-item label="Chức vụ" name="resource">
                <a-radio-group v-model:value="formStateAdd.role">
                    <a-radio value="employee">Nhân viên điều phối</a-radio>
                    <a-radio value="driver">Tài xế</a-radio>
                    <a-radio value="none">Chờ phân công</a-radio>
                </a-radio-group>
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<style scoped></style>
  