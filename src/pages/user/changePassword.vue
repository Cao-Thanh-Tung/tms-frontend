<template>
  <a-breadcrumb style="margin: 16px 0">
    <a-breadcrumb-item>Tài khoản</a-breadcrumb-item>
    <a-breadcrumb-item>Đổi mật khẩu</a-breadcrumb-item>
  </a-breadcrumb>
  <a-card title="Đổi mật khẩu">
    <a-form :form="passwordChangeForm" @submit="handleSubmit">
      <a-form-item label="Mật khẩu hiện tại">
        <a-input
          v-model:value="passwordChangeForm.currentPassword"
          type="password"
          required="true"
        />
      </a-form-item>
      <a-form-item label="Mật khẩu mới">
        <a-input
          v-model:value="passwordChangeForm.newPassword"
          type="password"
          required="true"
        />
      </a-form-item>
      <a-form-item label="Nhập lại mật khẩu mới">
        <a-input
          v-model:value="confirmPassword"
          type="password"
          required="true"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit"> Đổi mật khẩu </a-button>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import { PasswordChangeDTO, AccountResourceApi } from "@/api";
import { Configuration } from "@/configuration";
import { ref } from "vue";
import store from "@/store";
import { message } from "ant-design-vue";
let accountResourceApi = new AccountResourceApi(
  new Configuration({
    accessToken: () => store.getters.jwt,
    baseOptions: { headers: { "Content-Type": "application/json" } },
  })
);
const confirmPassword = ref("");
let passwordChangeForm = ref<PasswordChangeDTO>({
  currentPassword: "",
  newPassword: "",
});
const checkLengthPassword = () => {
  if (
    !passwordChangeForm.value.newPassword ||
    !passwordChangeForm.value.currentPassword
  ) {
    message.error("Mật khẩu không được để trống");
    return false;
  }
  if (passwordChangeForm.value.newPassword.length < 6) {
    message.error("Mật khẩu mới phải có ít nhất 6 ký tự");
    return false;
  }
  return true;
};
const passWordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
const checkRegexPassword = () => {
  const newPassword = passwordChangeForm.value?.newPassword;
  if (!newPassword || !passWordRegex.test(newPassword)) {
    message.error(
      "Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số"
    );
    return false;
  }
  return true;
};
const checkValidPassword = () => {
  if (!checkLengthPassword()) return false;
  if (!checkRegexPassword()) return false;
  if (passwordChangeForm.value.newPassword !== confirmPassword.value) {
    message.error("Mật khẩu mới không trùng khớp");
    return false;
  }
  return true;
};
const handleSubmit = async () => {
  try {
    if (!checkValidPassword()) return;
    await accountResourceApi.changePassword(passwordChangeForm.value);
    message.success("Đổi mật khẩu thành công");
    // logout
    store.dispatch("logout");
  } catch (e) {
    console.error(e);
  }
};
</script>

<style scoped></style>
