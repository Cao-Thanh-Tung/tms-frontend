<template>
  <a-breadcrumb style="margin: 16px 0">
    <a-breadcrumb-item>Khách hàng</a-breadcrumb-item>
    <a-breadcrumb-item>Danh sách khách hàng</a-breadcrumb-item>
  </a-breadcrumb>
  <a-table :dataSource="clientList" rowKey="id">
    <a-table-column title="STT" dataIndex="id" key="id"></a-table-column>
    <a-table-column title="Tên khách hàng" key="customerName">
      <template #customRender="{ record }">
        {{ record.user?.firstName + " " + record.user?.lastName }}
      </template>
    </a-table-column>
    <a-table-column
      title="Số điện thoại"
      dataIndex="phoneNumber"
      key="phoneNumber"
    ></a-table-column>
    <a-table-column title="Email" dataIndex="email" key="email">
      <template #customRender="{ record }">
        {{ record.user?.email }}
      </template>
    </a-table-column>
    <a-table-column title="Nhân viên điều phối">
      <template #customRender="{ record }">
        {{ getEmployeeName(record.id) }}
      </template>
    </a-table-column>
    <a-table-column title="Thao tác" key="action">
      <template #customRender="{ record }">
        <a-space>
          <a-button type="primary" @click="editCustomer(record)">Sửa</a-button>
          <a-button type="danger" @click="deleteCustomer(record)">Xóa</a-button>
        </a-space>
      </template>
    </a-table-column>
  </a-table>
  <a-modal
    v-model:open="openEditForm"
    title="Chỉnh sửa thông tin khách hàng"
    :confirm-loading="confirmLoading"
    @ok="handleOk"
  >
    <a-form>
      <a-form-item label="Tên" name="customerName">
        <a-input v-model:value="formState.customerName" />
      </a-form-item>
      <a-form-item label="Số điện thoại" name="phoneNumber">
        <a-input v-model:value="formState.phoneNumber" />
      </a-form-item>
      <a-form-item label="Email" name="email">
        <a-input v-model:value="formState.email" />
      </a-form-item>
      <a-form-item lable="Nhân viên điều phối">
        <a-select
          v-model:value="formState.employee"
          placeholder="Chọn nhân viên điều phối"
        >
          <a-select-option
            v-for="item in allEmployeeList"
            :key="item.id"
            :value="item.id"
            >{{
              item.user?.firstName + " " + item.user?.lastName
            }}</a-select-option
          >
        </a-select>
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
} from "../../api";
import { Configuration } from "../../configuration";
import { onMounted, ref } from "vue";
import store from "@/store";
import { get } from "http";
const config = new Configuration({
  accessToken: () => store.getters.jwt,
  baseOptions: {
    headers: {
      "Content-Type": "application/json",
    },
  },
});
const userXApi = new UserXResourceApi(config);
const customerAssignmentApi = new CustomerAssignmentResourceApi(config);
const clientList = ref([] as UserXDTO[]);
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
const confirmLoading = ref<boolean>(false);

onMounted(() => {
  userXApi.getUserXByRole("KH").then((res) => {
    clientList.value = res.data;
  });
  userXApi.getUserXByRole("NV").then((res) => {
    allEmployeeList.value = res.data;
    console.log(allEmployeeList.value);
  });
  customerAssignmentApi.getAllCustomerAssignments().then((res) => {
    customerAssignmentList.value = res.data;
  });
});
const getEmployeeName = (customerId: number) => {
  const employee = customerAssignmentList.value.find(
    (item) => item.customerUserXId === customerId
  );
  if (employee) {
    const employeeName = allEmployeeList.value.find(
      (item) => item.id === employee.employeeUserXId
    );
    return employeeName?.user?.firstName + " " + employeeName?.user?.lastName;
  }
  return "";
};
const editCustomer = (record: UserXDTO) => {
  openEditForm.value = true;
  formState.value.id = record.id || 0;
  formState.value.customerName =
    record.user?.firstName + " " + record.user?.lastName;
  formState.value.phoneNumber = record.phoneNumber || "";
  formState.value.email = record.user?.email || "";
  formState.value.employee = getEmployeeIdByCustomerId(record.id) || 0;
  formState.value.assignmentId = getAssignmentIdByCustomerId(record.id) || 0;
};
const deleteCustomer = (id: UserXDTO) => {
  console.log(id);
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
    },
  };
};
const handleOk = () => {
  confirmLoading.value = true;
  console.log(formState.value);
  userXApi
    .partialUpdateUserX(formState.value.id, formState2UserXDTO(formState.value))
    .then(() => {
      userXApi.getUserXByRole("KH").then((res) => {
        clientList.value = res.data;
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
      })
      .catch((err) => {
        console.log(err);
      });
  }
};
</script>
<style scoped></style>
