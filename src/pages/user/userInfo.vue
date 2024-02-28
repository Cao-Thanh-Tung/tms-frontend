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
  console.log(userInfor.value);
});
</script>
<template>
  <a-breadcrumb style="margin: 16px 0">
    <a-breadcrumb-item>Tài khoản</a-breadcrumb-item>
    <a-breadcrumb-item>Thông tin chi tiết</a-breadcrumb-item>
  </a-breadcrumb>
  <div>{{ userInfor }}</div>
</template>

<style scoped></style>
