<script setup lang="ts">
import { ref, reactive } from "vue";
import { message } from "ant-design-vue";
import { UserResourceApi, UserXDTO, UserXResourceApi } from "@/api";
import store from '@/store';
import { Configuration } from '@/configuration';
import { AdminUserDTO } from "@/api";
import AddressForm from "@/components/AddressForm.vue";
import { Form } from 'ant-design-vue';
const useForm = Form.useForm;
const props = defineProps<{
    open: boolean;
}>();

const emit = defineEmits(['create-employee-success', 'update:open']);
const addLoading = ref<boolean>(false);
const config = new Configuration({
    accessToken: () => store.getters.jwt,
    baseOptions: {
        headers: { 'Content-Type': 'application/json' }
    }
})
const userApi = new UserResourceApi(config);
const userxApi = new UserXResourceApi(config);
const formAddState = reactive<
    {
        login: string | undefined;
        password: string | undefined;
        firstName: string | undefined;
        lastName: string | undefined;
        phone: string | undefined;
        email: string | undefined;
        imageUrl: string | undefined;
        address: { id: number | undefined, fullName: string };
        role: string;
    }>({
        login: undefined,
        password: undefined,
        firstName: undefined,
        lastName: undefined,
        phone: undefined,
        email: undefined,
        imageUrl: undefined,
        address: { id: undefined, fullName: '' },
        role: "employee",
    })

const rulesRef = reactive({
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
    // "address.id": [
    //     {
    //         required: true,
    //         message: 'Không để trống',
    //     },
    // ],
})
const { resetFields, validate, validateInfos } = useForm(formAddState, rulesRef);
const addEmployee = () => {
    validate().then(() => {
        addRequest();
    }).catch((e) => {
        console.log(e);
    });
}
const addRequest = async () => {
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
        emit('create-employee-success');
        resetFields();
        addLoading.value = false;
    } catch (err: any) {
        console.log(err);
        if (err.code === "ERR_BAD_REQUEST") {
            if (err.response.data.errorKey === "userexists") {
                message.error("Tên tài khoản đã tồn tại!");
            } else if (err.response.data.errorKey === "emailexists") {
                message.error("Email đã tồn tại!");
            } else {
                message.error("Tạo tài khoản nhân viên thất bại! Lỗi không xác định!");
            }
        } else {
            message.error("Tạo tài khoản nhân viên thất bại! Lỗi không xác định");
        }
        addLoading.value = false;
    }
}
const cancelHandle = () => {
    resetFields();
    emit('update:open', false);
}

</script>
<template>
    <a-modal width="700px" :open="$props.open" title="Tạo mới nhân viên" :confirm-loading="addLoading" @ok="addEmployee"
        :onCancel="cancelHandle">
        <a-form layout="vertical">
            <a-row :gutter="16">
                <a-col :span="8">
                    <a-form-item label="Tài khoản" required v-bind="validateInfos.login">
                        <a-input v-model:value="formAddState.login" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="Họ" required v-bind="validateInfos.firstName">
                        <a-input v-model:value="formAddState.firstName" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="Tên" required v-bind="validateInfos.lastName">
                        <a-input v-model:value="formAddState.lastName" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16">
                <a-col :span="8">
                    <a-form-item label="Số điện thoại" name="phoneNumber">
                        <a-input v-model:value="formAddState.phone" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="Email" required v-bind="validateInfos.email">
                        <a-input v-model:value="formAddState.email" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="Ảnh">
                        <a-input v-model:value="formAddState.imageUrl" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-form-item label="Địa chỉ" required v-bind="validateInfos['address.id']">
                <address-form @save="(addressId: number) => { formAddState.address.id = addressId }"></address-form>
            </a-form-item>
        </a-form>
    </a-modal>
</template>
<style lang="css" scoped></style>