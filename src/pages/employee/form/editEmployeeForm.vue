<script setup lang="ts">
import { UserDTO, UserXDTO } from '@/api';
import { UnwrapRef, onMounted, onUpdated, reactive, ref } from 'vue';
import AddressForm from '@/components/AddressForm.vue';
import { UserXResourceApi } from '@/api';
import store from '@/store';
import { Configuration } from '@/configuration';
import { message } from 'ant-design-vue';
import { Form } from 'ant-design-vue';
const useForm = Form.useForm;

const props = defineProps<{
    open: boolean;
    user: number;
}>();
const emit = defineEmits(['edit-employee-success', 'update:open']);

const openEditForm = ref<boolean>(false);
const config = new Configuration({
    accessToken: () => store.getters.jwt,
    baseOptions: {
        headers: { 'Content-Type': 'application/json' }
    }
})
const userxApi = new UserXResourceApi(config);
let formEditState: UnwrapRef<UserXDTO> = reactive<UserXDTO>({
    id: undefined,
    phoneNumber: undefined,
    role: undefined,
    user: {
        id: undefined,
        login: undefined,
        firstName: undefined,
        lastName: undefined,
        email: undefined,
        imageUrl: undefined,
        activated: undefined
    },
    address: {
        id: undefined,
        fullName: undefined
    }
});
onMounted(() => {
    userxApi.getUserX(props.user!).then((res) => {
        let user = res.data;
        formEditState.id = user.id;
        formEditState.phoneNumber = user.phoneNumber;
        formEditState.role = user.role;
        formEditState.user = {
            id: user.user?.id,
            login: user.user?.login,
            firstName: user.user?.firstName,
            lastName: user.user?.lastName,
            email: user.user?.email,
            imageUrl: user.user?.imageUrl,
            activated: user.user?.activated
        };
        formEditState.address = {
            id: user.address?.id,
            fullName: user.address?.fullName
        };
    }).catch((err) => {
        console.log(err);

    })
})


const rulesRef = reactive({
    "user.firstName": [
        {
            required: true,
            message: 'Không để trống',
        },
    ],
    "user.lastName": [
        {
            required: true,
            message: 'Không để trống',
        },
    ],
    "user.email": [
        {
            required: true,
            message: 'Không để trống',
        },
        {
            type: 'email',
            message: 'Email không đúng định dạng',
        }
    ],
    "address.id": [
        {
            required: true,
            message: 'Không để trống',
        },
    ],
})
const { resetFields, validate, validateInfos } = useForm(formEditState, rulesRef);

const editLoading = ref<boolean>(false);

const edit = () => {
    validate().then(() => {
        editRequest();
    }).catch((e) => {
        console.log(e);
    })
};

const editRequest = () => {
    editLoading.value = true;
    userxApi.partialUpdateUserX(formEditState.id!, formEditState).then((res) => {
        console.log(res);
        message.success("Đã thay đổi thông tin nhân viên thành công!");
        emit('edit-employee-success');
        openEditForm.value = false;
        resetFields();
    }).catch((err) => {
        console.log(err);
        message.error("Email đã được sử dụng!");
    }).finally(() => {
        editLoading.value = false;
    })
};
const cancelHandle = () => {
    resetFields();
    emit('update:open', false);
}
</script>
<template>
    <a-modal width="700px" :open="$props.open" title="Chỉnh sửa thông tin nhân viên" :confirm-loading="editLoading"
        @ok="edit" :onCancel="cancelHandle">
        <a-form :model="formEditState" layout="vertical">
            <a-row :gutter="16">
                <a-col :span="8">
                    <a-form-item ref="firstName" label="Họ" required v-model="validateInfos['user.firstName']">
                        <a-input v-model:value="formEditState.user!.firstName" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item ref="lastName" label="Tên" required v-model="validateInfos['user.lastName']">
                        <a-input v-model:value="formEditState.user!.lastName" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="Kích hoạt tài khoản">
                        <a-switch v-model:checked="formEditState.user!.activated" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16">
                <a-col :span="8">
                    <a-form-item ref="phoneNumber" label="Phone">
                        <a-input v-model:value="formEditState.phoneNumber" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item ref="email" label="Email" required v-model="validateInfos['user.email']">
                        <a-input v-model:value="formEditState.user!.email" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="Đường dẫn ảnh" name="imageUrl">
                        <a-input v-model:value="formEditState.user!.imageUrl" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-form-item ref="address" label="Địa chỉ" required v-model="validateInfos['address.id']">
                <address-form :initial-address-id="formEditState.address?.id" @save="(addressId: number) => {
                    formEditState.address!.id = addressId;
                }"></address-form>
            </a-form-item>




        </a-form>
    </a-modal>
</template>
