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
const formEditState = reactive({
    id: 0,
    phone: '',
    firstName: '',
    lastName: '',
    email: '',
    imageUrl: '',
    activated: false,
    addressId: -1,
})
onMounted(() => {
    userxApi.getUserX(props.user!).then((res) => {
        let user = res.data;
        formEditState.id = user.id!;
        formEditState.phone = user.phoneNumber || '';
        formEditState.firstName = user.user!.firstName!;
        formEditState.lastName = user.user!.lastName!;
        formEditState.email = user.user!.email!;
        formEditState.imageUrl = user.user!.imageUrl!;
        formEditState.activated = user.user!.activated!;
        formEditState.addressId = user.address!.id!;
    }).catch((err) => {
        console.log(err);

    })
})


const rulesRef = reactive({
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
    addressId: [
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
    userxApi.partialUpdateUserX(formEditState.id!, {
        id: formEditState.id,
        phoneNumber: formEditState.phone,
        user: {
            firstName: formEditState.firstName,
            lastName: formEditState.lastName,
            email: formEditState.email,
            imageUrl: formEditState.imageUrl,
            activated: formEditState.activated,
        },
        address: {
            id: formEditState.addressId,
        }
    }).then((res) => {
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
                    <a-form-item ref="firstName" label="Họ" required v-bind="validateInfos.firstName">
                        <a-input v-model:value="formEditState.firstName" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item ref="lastName" label="Tên" required v-bind="validateInfos.lastName">
                        <a-input v-model:value="formEditState.lastName" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="Kích hoạt tài khoản">
                        <a-switch v-model:checked="formEditState.activated" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16">
                <a-col :span="8">
                    <a-form-item ref="phoneNumber" label="Phone">
                        <a-input v-model:value="formEditState.phone" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item ref="email" label="Email" required v-model="validateInfos.email">
                        <a-input v-model:value="formEditState.email" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="Đường dẫn ảnh" name="imageUrl">
                        <a-input v-model:value="formEditState.imageUrl" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-form-item ref="address" label="Địa chỉ">
                <address-form :initial-address-id="formEditState.addressId" @save="(addressId: number) => {
                    formEditState.addressId = addressId;
                }"></address-form>
            </a-form-item>
        </a-form>
    </a-modal>
</template>
