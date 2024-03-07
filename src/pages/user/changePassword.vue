<template>
  <a-breadcrumb style="margin: 16px 0">
    <a-breadcrumb-item>Tài khoản</a-breadcrumb-item>
    <a-breadcrumb-item>Đổi mật khẩu</a-breadcrumb-item>
  </a-breadcrumb>
  <a-form :model="passwordChangeForm" @submit="handleSubmit">
    <a-form-item
      label="Mật khẩu cũ"
      name="oldPassword"
      :rules="{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }"
    >
      <a-input-password v-model:value="passwordChangeForm.currentPassword" />
    </a-form-item>
    <a-form-item
      label="Mật khẩu mới"
      name="newPassword"
      :rules="{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }"
    >
      <a-input-password v-model:value="passwordChangeForm.newPassword" />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">Đổi mật khẩu</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { PasswordChangeDTO, AccountResourceApi } from "@/api";
import { Configuration } from "@/configuration";
import { ref } from "vue";
import store from "@/store";
import { message } from "ant-design-vue";
//vue route
import { useRouter } from "vue-router";
let accountResourceApi = new AccountResourceApi(
  new Configuration({
    accessToken: () => store.getters.jwt,
    baseOptions: { headers: { "Content-Type": "application/json" } },
  })
);
let router = useRouter();
let passwordChangeForm = ref<PasswordChangeDTO>({
  currentPassword: "",
  newPassword: "",
});

const handleSubmit = async () => {
  try {
    await accountResourceApi.changePassword(passwordChangeForm.value);
    message.success("Đổi mật khẩu thành công");
    router.push("/user/info");
  } catch (e) {
    console.error(e);
  }
};
</script>

<style scoped></style>
