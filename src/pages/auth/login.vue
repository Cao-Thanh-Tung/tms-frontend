<script lang="ts" setup>
import { reactive, computed } from "vue";
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import { LoginVM } from "@/api";
import store from "@/store";
import { message } from "ant-design-vue";
import { UserJwtControllerApi } from "../../api";
const formState = reactive<LoginVM>({
  username: "",
  password: "",
  rememberMe: false,
});
let userJwtControllerApi = new UserJwtControllerApi();
const login = async (values: LoginVM) => {
  try {
    const res = await userJwtControllerApi.authorize(values);
    store.commit("SET_JWT", res.data.id_token);
    console.log(res.data.id_token);
  } catch (e) {
    message.error("Login failed");
  }
};
const disabled = computed(() => {
  return !(formState.username && formState.password);
});
</script>

<template>
  <h2
    style="
      text-align: center;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    "
  >
    Log in
  </h2>
  <a-form
    :model="formState"
    name="normal_login"
    class="login-form"
    @finish="login"
  >
    <a-form-item
      label="Username"
      name="username"
      :rules="[{ required: true, message: 'Please input your username!' }]"
    >
      <a-input v-model:value="formState.username">
        <template #prefix>
          <UserOutlined class="site-form-item-icon" />
        </template>
      </a-input>
    </a-form-item>

    <a-form-item
      label="Password"
      name="password"
      :rules="[{ required: true, message: 'Please input your password!' }]"
    >
      <a-input-password v-model:value="formState.password">
        <template #prefix>
          <LockOutlined class="site-form-item-icon" />
        </template>
      </a-input-password>
    </a-form-item>

    <a-form-item>
      <a-form-item name="remember" no-style>
        <a-checkbox v-model:checked="formState.rememberMe"
          >Remember me</a-checkbox
        >
      </a-form-item>
      <a class="login-form-forgot" href="">Forgot password</a>
    </a-form-item>

    <a-form-item>
      <a-button
        :disabled="disabled"
        type="primary"
        html-type="submit"
        class="login-form-button"
      >
        Log in
      </a-button>
    </a-form-item>
  </a-form>
</template>

<style scoped>
#components-form-demo-normal-login .login-form {
  max-width: 300px;
}

#components-form-demo-normal-login .login-form-forgot {
  float: right;
}

#components-form-demo-normal-login .login-form-button {
  width: 100%;
}
</style>
@/service/apiconfig
