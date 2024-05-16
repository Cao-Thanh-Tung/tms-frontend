<template>
    <!-- -->
    <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item>Khách hàng</a-breadcrumb-item>
        <a-breadcrumb-item>Danh sách khách hàng</a-breadcrumb-item>
    </a-breadcrumb>

    <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
        <a-table :dataSource="customerList" :columns="columns" :scroll="{ x: 1300 }"
            :pagination="{ pageSize: 6, totalPage: totalPage }" :loading="loading" @change="handleTableChange">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                    {{ `${(<UserXDTO>record).user?.firstName} ${(<UserXDTO>record).user?.lastName} ` }}
                </template>

                <template v-if="column.key === 'imageUrl'">
                    <a-avatar :src="(<UserXDTO>record).user?.imageUrl">
                        <template #icon><user-outlined /></template>
                    </a-avatar>
                </template>
                <template v-if="column.key === 'employee'">
                    {{ getEmployeeName(record.id) }}
                </template>
                <template v-if="column.key === 'phone'">
                    {{ record.phoneNumber }}
                </template>
                <template v-if="column.key === 'operation'">
                    <a href="#" @click="() => showEditForm(record)">
                        <EditOutlined />
                    </a>
                    <a-popconfirm title="Xóa khách hàng?" ok-text="Yes" cancel-text="No"
                        @confirm="() => deleteCustomer((<UserXDTO>record))">
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

    <!-- Float button create new employee -->
    <a-float-button type="primary" @click="showAddForm" tooltip="Tạo khách hàng mới">

        <template #icon>
            <plus-outlined />
        </template>
    </a-float-button>

    <!-- Popup edit employee form -->
    <a-modal v-model:open="openEditForm" title="Chỉnh sửa thông tin khách hàng" :confirm-loading="confirmLoading"
        @ok="handleOk" width="700px">
        <a-form layout="vertical">
            <a-row :gutter="16">
                <a-col :span="16">
                    <a-form-item label="Tên" name="customerName">
                        <a-input v-model:value="formState.customerName" />
                    </a-form-item>
                </a-col>
                <a-col :span="16">
                    <a-form-item label="Số điện thoại" name="phoneNumber">
                        <a-input v-model:value="formState.phoneNumber" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16">
                <a-col :span="16">
                    <a-form-item label="Email" name="email">
                        <a-input v-model:value="formState.email" />
                    </a-form-item>
                </a-col>
                <a-col :span="16">
                    <a-form-item label="Nhân viên điều phối">
                        <a-select v-model:value="formState.employee" placeholder="Chọn nhân viên điều phối" show-search
                            :filter-option="filterOption"
                            :options="allEmployeeList.map(item => ({ value: item.id, label: item.user?.firstName + ' ' + item.user?.lastName }))">
                            <a-select-option v-for="item in allEmployeeList" :key="item.id" :value="item.id">
                                {{ item.user?.firstName + " " + item.user?.lastName }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
            </a-row>
            <a-form-item label="Địa chỉ" name="address">
                <address-form @save="chooseAddressAddForm"></address-form>
            </a-form-item>
        </a-form>
    </a-modal>


    <!-- Popup create employee form -->
    <a-modal v-model:open="openAddForm" title="Tạo mới nhân viên" :confirm-loading="addLoading" @ok="addCustomer"
        @cancel="reset" width="700px">
        <a-form layout="vertical">
            <a-row :gutter="16">
                <a-col :span="6">
                    <a-form-item label="Tài khoản" name="username" required v-bind="validateInfosAddForm.login">
                        <a-input v-model:value="formAddState.login" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Họ" name="firstName" required v-bind="validateInfosAddForm.firstName">
                        <a-input v-model:value="formAddState.firstName" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Tên" name="lastName" required v-bind="validateInfosAddForm.lastName">
                        <a-input v-model:value="formAddState.lastName" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Ảnh" name="imageUrl">
                        <a-input v-model:value="formAddState.imageUrl" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16">
                <a-col :span="8">
                    <a-form-item ref="phoneNumber" label="Phone" name="phoneNumber">
                        <a-input v-model:value="formAddState.phone" />
                    </a-form-item>
                </a-col>
                <a-col :span="10">
                    <a-form-item label="Email" name="email" required v-bind="validateInfosAddForm.email">
                        <a-input v-model:value="formAddState.email" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Nhân viên điều phối">
                        <a-select v-model:value="formState.employee" placeholder="Chọn nhân viên điều phối" show-search
                            :filter-option="filterOption"
                            :options="allEmployeeList.map(item => ({ value: item.id, label: item.user?.firstName + ' ' + item.user?.lastName }))">
                            <a-select-option v-for="item in allEmployeeList" :key="item.id" :value="item.id">
                                {{ item.user?.firstName + " " + item.user?.lastName }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
            </a-row>
            <a-form-item label="Địa chỉ" name="address">
                <address-form @save="chooseAddressAddForm"></address-form>
            </a-form-item>
        </a-form>
    </a-modal>
</template>
<script setup lang="ts">
import {
    UserXDTO,
    CustomerAssignmentDTO,
    UserXResourceApi,
    CustomerAssignmentResourceApi,
    UserResourceApi,
} from "../../api";
import { Configuration } from "../../configuration";
import { onMounted, ref } from "vue";
import store from "@/store";
import { EditOutlined, DeleteFilled, UserOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { message } from "ant-design-vue";
import { usePagination } from 'vue-request';
import { computed, reactive, watch } from 'vue';
import AddressForm from "@/components/AddressForm.vue";
import { Form } from 'ant-design-vue';
const useForm = Form.useForm;
const config = new Configuration({
    accessToken: () => store.getters.jwt,
    baseOptions: {
        headers: {
            "Content-Type": "application/json",
        },
    },
});
const userXApi = new UserXResourceApi(config);
const userApi = new UserResourceApi(config);
const customerAssignmentApi = new CustomerAssignmentResourceApi(config);
const customerList = ref([] as UserXDTO[]);
const allEmployeeList = ref([] as UserXDTO[]);
const customerAssignmentList = ref([] as CustomerAssignmentDTO[]);
const openEditForm = ref(false);
const formState = ref({
    id: 0,
    customerName: "",
    phoneNumber: "",
    email: "",
    employee: 0,
    assignmentId: 0,
});
const openAddForm = ref(false);
const addLoading = ref(false);
const formAddState = reactive({
    login: "",
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    email: "",
    imageUrl: "",
    assignEmployee: 0,
    addressId: 0,
});
const showAddForm = () => {
    resetFieldsAddForm();
    openAddForm.value = true;
};
const chooseAddressAddForm = (addressId: number) => {
    formAddState.addressId = addressId;
}
const reset = () => {
    openAddForm.value = false;
    formAddState.login = "";
    formAddState.firstName = "";
    formAddState.lastName = "";
    formAddState.address = "";
    formAddState.phone = "";
    formAddState.email = "";
    formAddState.imageUrl = "";
    formAddState.assignEmployee = 0;
    formAddState.addressId = 0;
};
const addCustomerRequest = async () => {
    addLoading.value = true;
    const userId = (await userApi.createUser({
        login: formAddState.login,
        email: formAddState.email,
        firstName: formAddState.firstName,
        lastName: formAddState.lastName,
        imageUrl: formAddState.imageUrl,
        activated: true,
    })).data.id;
    userXApi
        .createUserX({
            phoneNumber: formAddState.phone,
            role: "customer",
            user: {
                id: userId,
            },
        })
        .then(() => {
            userXApi.getUserXByRole("customer").then((res) => {
                customerList.value = res.data;
            });
            addLoading.value = false;
            openAddForm.value = false;
        });
};
const confirmLoading = ref<boolean>(false);
type APIParams = {
    page?: number;
    pageSize?: number;
    results?: number;
    sortField?: string;
    sortOrder?: string;
};
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
        title: 'Địa chỉ',
        dataIndex: ['user', 'address'],
        key: 'address',
        width: '6%',
        customFilterDropdown: true,
        onFilter: (value: string, record: UserXDTO) =>
            record.address!.fullName!.toLowerCase().includes(value.toLowerCase()),
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
        title: "Nhân viên điều phối",
        key: "employee",
        width: "6%",
        customFilterDropdown: true,
        onFilter: (value: string, record: UserXDTO) =>
            getEmployeeName(record.id).toLowerCase().includes(value.toLowerCase()),
    },
    {
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
const fetchCustomer = async (params: APIParams): Promise<void> => {
    const res = await userXApi.getUserXByRole("customer", params.page! - 1, 6);
    customerList.value = res.data;
};
const filterOption = (input: string, option: any) => {
    return (
        option.value.toString().toLowerCase().includes(input.toLowerCase()) ||
        (option.children &&
            option.children
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase()))
    );
};
const {
    data,
    run,
    loading,
} = usePagination(fetchCustomer, {
    pagination: {
        currentKey: 'page',
    },

});
// Watch for changes in data and update customerList
watch(data, (newData: any) => {
    customerList.value = newData;
});
const showEditForm = (record: UserXDTO) => {
    openEditForm.value = true;
    formState.value.id = record.id || 0;
    formState.value.customerName =
        record.user?.firstName + " " + record.user?.lastName;
    formState.value.phoneNumber = record.phoneNumber || "";
    formState.value.email = record.user?.email || "";
    formState.value.employee = getEmployeeIdByCustomerId(record.id) || 0;
    formState.value.assignmentId = getAssignmentIdByCustomerId(record.id) || 0;
};
const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm();
    run({
        results: 6,
        page: 1,
        sortField: dataIndex,
        sortOrder: 'ascend',
        ...selectedKeys,
    });
};
const handleReset = (clearFilters: any) => {
    clearFilters();
    run({
        results: 6,
        page: 1,
        sortField: 'name',
        sortOrder: 'ascend',
    });
};
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
const numberOfCustomer = ref(0);
const totalPage = computed(() => {
    const numberPage = Math.ceil(numberOfCustomer.value / 6);
    if (numberPage === 0) return 1;
    return numberPage;
});

onMounted(() => {
    userXApi.getNumberOfUserXByRole("customer").then((res) => {
        numberOfCustomer.value = res.data;
    });
    fetchCustomer({ page: 1, pageSize: 6 });
    userXApi.getUserXByRole("employee").then((res) => {
        allEmployeeList.value = res.data;
    });
    customerAssignmentApi.getAllCustomerAssignments().then((res) => {
        customerAssignmentList.value = res.data;
    });
});
const getEmployeeName = (customerId: any) => {
    const employee = customerAssignmentList.value.find(
        (item) => item.customerUserXId === customerId
    );
    if (employee) {
        const employeeName = allEmployeeList.value.find(
            (item) => item.id === employee.employeeUserXId
        );
        return employeeName?.user?.firstName + " " + employeeName?.user?.lastName;
    }
    return "Chưa phân công";
};

const deleteCustomer = (user: UserXDTO) => {
    const user_id = user.id || 0;
    const assignmentId = getAssignmentIdByCustomerId(user_id) || 0;
    customerAssignmentApi
        .deleteCustomerAssignment(assignmentId)
        .then(() => {
            userXApi.deleteUserX(user_id).then(() => {
                userXApi.getUserXByRole("customer").then((res) => {
                    customerList.value = res.data;
                });
            });
        })
        .catch((err) => {
            console.log(err);
        });
};
const getAssignmentIdByCustomerId = (customerId: any) => {
    const assignment = customerAssignmentList.value.find(
        (item) => item.customerUserXId === customerId
    );
    return assignment?.id;
};
const getEmployeeIdByCustomerId = (customerId: any) => {
    const employee = customerAssignmentList.value.find(
        (item) => item.customerUserXId === customerId
    );
    return employee?.employeeUserXId;
};
const formState2UserXDTO = (form: any) => {
    const firstName = form.customerName.split(" ")[0];
    const lastName = form.customerName.split(" ")[1];
    return {
        id: form.id,
        phoneNumber: form.phoneNumber,
        user: {
            email: form.email,
            firstName: firstName,
            lastName: lastName,
            activated: true,
        },
    };
};
const handleOk = () => {
    confirmLoading.value = true;
    userXApi
        .partialUpdateUserX(formState.value.id, formState2UserXDTO(formState.value))
        .then(() => {
            userXApi.getUserXByRole("customer").then((res) => {
                customerList.value = res.data;
            });
            confirmLoading.value = false;
            openEditForm.value = false;
        });
    if (formState.value.employee) {
        customerAssignmentApi
            .partialUpdateCustomerAssignment(formState.value.assignmentId, {
                id: formState.value.assignmentId,
                employeeUserXId: formState.value.employee,
                customerUserXId: formState.value.id,
            })
            .then(() => {
                customerAssignmentApi.getAllCustomerAssignments().then((res) => {
                    customerAssignmentList.value = res.data;
                });
                message.success("Chỉnh sửa thông tin khách hàng thành công");

            })
            .catch((err) => {
                // that mean customerAssignment not exist, so we create new one
                console.log(err);
                customerAssignmentApi
                    .createCustomerAssignment({
                        employeeUserXId: formState.value.employee,
                        customerUserXId: formState.value.id,
                    })
                    .then(() => {
                        customerAssignmentApi.getAllCustomerAssignments().then((res) => {
                            customerAssignmentList.value = res.data;
                        });
                    });
                message.error("Chỉnh sửa thông tin khách hàng thất bại");
            });
    }
};

const rulesRefEditForm = reactive({
    firstName: [
        {
            required: true,
            message: 'Không để trống',
        },
    ],
    lastName: [
        {
            required: true,
            message: 'Không để trống',
        },
    ],
    email: [
        {
            required: true,
            message: 'Không để trống',
        },
        {
            type: 'email',
            message: 'Email không đúng định dạng',
        }
    ],
})

const rulesRefAddForm = reactive({
    login: [
        {
            required: true,
            message: 'Không để trống',
        },
    ],
    firstName: [
        {
            required: true,
            message: 'Không để trống',
        },
    ],
    lastName: [
        {
            required: true,
            message: 'Không để trống',
        },
    ],
    email: [
        {
            required: true,
            message: 'Không để trống',
        },
        {
            type: 'email',
            message: 'Email không đúng định dạng',
        }
    ],
})
const { resetFields: resetFieldsAddForm, validate: validateAddForm, validateInfos: validateInfosAddForm } = useForm(formAddState, rulesRefAddForm);

const addCustomer = () => {
    validateAddForm().then(() => {
        addCustomerRequest();
    }).catch((e) => {
        console.log(e);
    });
}
</script>
<style scoped></style>
