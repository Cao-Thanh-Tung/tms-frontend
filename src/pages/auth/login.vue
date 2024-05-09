<script lang="ts" setup>
import { reactive, computed, ref } from "vue";
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import { LoginVM } from "@/api";
import store from "@/store";
import { message } from "ant-design-vue";
import { UserJwtControllerApi } from "../../api";
import router from "@/router";
const formState = reactive<LoginVM>({
  username: "",
  password: "",
  rememberMe: false,
});
let userJwtControllerApi = new UserJwtControllerApi();
const loading = ref(false);
const login = async (values: LoginVM) => {
  loading.value = true;
  try {
    const res = await userJwtControllerApi.authorize(values);
    store.dispatch("login", res.data.id_token)
    message.success("Đăng nhập thành công");
    router.push("/orders");
  } catch (e: any) {
    if (e.code === "ERR_BAD_REQUEST") {
      if (e.response.data.status == "UNAUTHORIZED") {
        message.error("Tài khoản hoặc mật khẩu không đúng");
      } else {
        message.error("Lỗi không xác định");
        console.log(e);
      }
    }
    else if (e.code === "ERR_NETWORK") {
      message.error("Không tìm thấy máy chủ");
    } else {
      message.error("Lỗi không xác định");
    }
  } finally {
    loading.value = false;
  };
};
const disabled = computed(() => {
  return !(formState.username && formState.password);
});
</script>

<template>
  <h2 class="title-login">
    TMS
  </h2>
  <a-form :model="formState" name="normal_login" class="login-form" @finish="login">
    <a-form-item name="username"
      :rules="[{ required: true, message: 'Vui lòng nhập nhập tên đăng nhập!' }, { min: 4, message: 'Tên đăng nhập phải dài ít nhất 4 ký tự!' }]">
      <a-input v-model:value="formState.username" placeholder="Tên đăng nhập">
        <template #prefix>
          <UserOutlined class="site-form-item-icon" />
        </template>
      </a-input>
    </a-form-item>

    <a-form-item name="password"
      :rules="[{ required: true, message: 'Vui lòng nhập mật khẩu!' }, { min: 4, message: 'Mật khẩu phải dài ít nhất 4 ký tự!' }]">
      <a-input-password type="password" v-model:value="formState.password" placeholder="Mật khẩu">
        <template #prefix>
          <LockOutlined class="site-form-item-icon" />
        </template>
      </a-input-password>
    </a-form-item>

    <a-form-item name="rememberMe" no-style>
      <a-checkbox v-model:checked="formState.rememberMe" v-model:value="formState.rememberMe">Nhớ đăng
        nhập</a-checkbox>
    </a-form-item>

    <a-form-item>
      <a-button :disabled="disabled" type="primary" html-type="submit" class="login-form-button" :loading="loading"
        style="width: 100%;margin-top:20px; height: 40px;">
        Đăng nhập
      </a-button>
    </a-form-item>
    <a-form-item style="text-align: center;">
      <a href="">Quên mật khẩu</a>
    </a-form-item>
  </a-form>
</template>

<style scoped>
#components-form-demo-normal-login .login-form {
  max-width: 300px;
}


.title-login {
  font-size: 40px;
  text-align: center;
  font-style: italic;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: rgb(54, 54, 239);
  text-shadow: 1px 1px 5px rgb(97, 218, 229);
  margin-bottom: 50px;
}
</style>
