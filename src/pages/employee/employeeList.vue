<script setup lang="ts">
import { EditOutlined, DeleteFilled, UserOutlined } from '@ant-design/icons-vue';
import axios from 'axios';
import { reactive, ref, UnwrapRef } from 'vue';
import { message } from 'ant-design-vue';

interface EmployeeInfo {
    key: number;
    phoneNumber: string;
    role: string;
    id: number;
    userId: number;
    firstName: string;
    lastName: String;
    name: String;
    email: String;
    activated: boolean;
    imageUrl: String;
    addressId: number;
    addressFullName: String;
};

const columns = [
    {
        title: '',
        dataIndex: 'imageUrl',
        key: 'imageUrl',
        width: '0.1%',
    },
    {
        title: 'Tên',
        dataIndex: 'name',
        key: 'name',
        width: '3%',
    },
    {
        title: 'Số điện thoại',
        dataIndex: 'phoneNumber',
        key: 'phone',
        width: '2%',
    },
    {
        title: 'Địa chỉ',
        dataIndex: 'addressFullName',
        key: 'address',
        width: '7%',
    }, {
        title: 'Chức vụ',
        dataIndex: 'role',
        key: 'role',
        width: '3%',
    }, {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        width: '4%',
    }, {
        title: 'Kích hoạt',
        dataIndex: 'activated',
        key: 'activated',
        width: '2%',
    }, {
        title: 'Thao tác',
        key: 'operation',
        width: '2%',
        fixed: 'right',
    },
];
const employeeList: EmployeeInfo[] = [];
const dataSource = reactive(employeeList);
axios.get("/user-xes").then((res) => {
    const employees = res.data.map((employee: any) => {
        return {
            key: employee.id,
            id: employee.id,
            name: employee.user.firstName + employee.user.lastName,
            firstName: employee.user.firstName,
            lastName: employee.user.lastName,
            phoneNumber: employee.phoneNumber,
            role: employee.role,
            userId: employee.user.id,
            email: employee.user.email,
            activated: employee.user.activated,
            imageUrl: employee.user.imageUrl,
            addressId: employee.address.id,
            addressFullName: employee.address.fullName,
        }
    });
    dataSource.push(...employees);
}).catch((err) => {
    console.log("Get All Employee." + err);
})

const open = ref<boolean>(false);
const showModal = (v: EmployeeInfo) => {
    formState.key = v.key;
    formState.firstName = v.firstName;
    formState.lastName = v.lastName;
    formState.email = v.email;
    formState.addressFullName = v.addressFullName;
    formState.activated = v.activated;
    formState.role = v.role;
    formState.imageUrl = v.imageUrl;
    formState.phoneNumber = v.phoneNumber;
    open.value = true;
};
const confirmLoading = ref<boolean>(false);

const handleOk = () => {
    confirmLoading.value = true;
    axios.patch(`/user-xes/${formState.key}`,
        {
            id: formState.key,
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
        dataSource.forEach((employee: EmployeeInfo) => {
            if (employee.key === formState.key) {
                employee.firstName = formState.firstName;
                employee.lastName = formState.lastName;
                employee.email = formState.email;
                employee.addressFullName = formState.addressFullName;
                employee.activated = formState.activated;
                employee.role = formState.role;
                employee.imageUrl = formState.imageUrl;
                employee.phoneNumber = formState.phoneNumber;
            }
        });
    }).catch(err => {
        console.log(err);
    }).finally(() => {
        confirmLoading.value = false;
        open.value = false;

    });
};
const confirm = (e: MouseEvent) => {
    console.log(e);
    message.success('Click on Yes');
};

const cancel = (e: MouseEvent) => {
    console.log(e);
    message.error('Click on No');
    formRef.value.resetFields();

};

const formState: UnwrapRef<EmployeeInfo> = reactive({
    key: 0,
    firstName: "",
    lastName: "",
    addressFullName: "",
    email: "",
    activated: false,
    imageUrl: "",
    role: "",
    phoneNumber: "",
    userId: 0,
    addressId: 0,
    name: "",
    id: 0,
})
const formRef = ref();
</script>
<template>
    <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item>Nhân viên</a-breadcrumb-item>
        <a-breadcrumb-item>Danh sách nhân viên</a-breadcrumb-item>
    </a-breadcrumb>
    <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
        <a-table :dataSource="dataSource" :columns="columns">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'imageUrl'">
                    <a-avatar v-if="record.imageUrl === ''">
                        <template #icon><user-outlined /></template>
                    </a-avatar>
                    <a-avatar :src="record.imageUrl" v-else></a-avatar>
                </template>
                <template v-if="column.key === 'role'">
                    {{ record.role === "employee" ? "Điều phối viên" : "" }}
                    {{ record.role === "driver" ? "Tài xế" : "" }}
                    {{ record.role === "none" ? "Chờ phân công" : "" }}
                </template>
                <template v-if="column.key === 'operation'">
                    <a href="#" @click="() => showModal(<EmployeeInfo>record)">
                        <EditOutlined />
                    </a>

                    <a-modal v-model:open="open" title="Chỉnh sửa thông tin nhân viên" :confirm-loading="confirmLoading"
                        @ok="handleOk">
                        <a-form ref="formRef" :model="formState">
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
                    <a-popconfirm title="Xóa nhân viên?" ok-text="Yes" cancel-text="No" @confirm="confirm" @cancel="cancel">
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
</template>

<style scoped></style>
  