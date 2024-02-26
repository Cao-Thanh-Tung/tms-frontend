<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as jwtDecode from "jwt-decode";
import store from "@/store";
import Navbar from "@/components/Navbar.vue";
import Authorization from "@/pages/auth/Authorization.vue";

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    const dateNow = new Date();
    return decoded.exp < dateNow.getTime() / 1000;
  } catch (err) {
    return true;
  }
};

let tokenExpired = ref(true);

onMounted(() => {
  tokenExpired.value = isTokenExpired(store.state.jwt);
});
</script>
<template>
  <div>
    <authorization v-if="store.state.jwt === '' || !tokenExpired" />
    <navbar v-else>
      <router-view />
    </navbar>
  </div>
</template>
