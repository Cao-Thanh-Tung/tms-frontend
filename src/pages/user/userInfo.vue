<script setup lang="ts">
import { ref, onMounted } from "vue";
import { AccountResourceApi } from "@/api";
import { Configuration } from "@/configuration";
import store from "@/store";
import { AdminUserDTO } from "@/api";
let userInfor = ref<AdminUserDTO>();
let accountResourceApi = new AccountResourceApi(
  new Configuration({
    accessToken: () => store.getters.jwt,
  })
);
onMounted(() => {
  accountResourceApi
    .getAccount()
    .then((res) => {
      userInfor.value = res.data;
      console.log(userInfor.value);
    })
    .catch((e) => {
      console.error(e);
    });
});
</script>
<template>
  <a-breadcrumb style="margin: 16px 0">
    <a-breadcrumb-item>Tài khoản</a-breadcrumb-item>
    <a-breadcrumb-item>Thông tin chi tiết</a-breadcrumb-item>
  </a-breadcrumb>
  <a-card title="Thông tin cá nhân" style="width: 600px;">
    <a-row>
      <a-col :span="8"><strong>Tên:</strong></a-col>
      <a-col :span="16">{{ userInfor?.firstName }}</a-col>
    </a-row>
    <a-row>
      <a-col :span="8"><strong>Họ:</strong></a-col>
      <a-col :span="16">{{ userInfor?.lastName }}</a-col>
    </a-row>
    <a-row>
      <a-col :span="8"><strong>Email:</strong></a-col>
      <a-col :span="16">{{ userInfor?.email }}</a-col>
    </a-row>
    <a-row>
      <a-col :span="8"><strong>Login:</strong></a-col>
      <a-col :span="16">{{ userInfor?.login }}</a-col>
    </a-row>
    <a-row>
      <a-col :span="8"><strong>Activated:</strong></a-col>
      <a-col :span="16">{{ userInfor?.activated }}</a-col>
    </a-row>
  </a-card>
</template>

<style scoped></style>
