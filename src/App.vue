<script setup lang="ts">
import { ref, onUpdated } from "vue";
import { KJUR } from "jsrsasign";
import store from "@/store";
import Navbar from "@/components/Navbar.vue";
import Authorization from "@/pages/auth/Authorization.vue";

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = KJUR.jws.JWS.parse(token).payloadObj;
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
onUpdated(() => {
  tokenExpired.value = isTokenExpired(store.state.jwt);
});

</script>

<template>
  <div>
    <Authorization v-if="store.state.jwt === '' || tokenExpired" />
    <Navbar v-else>
      <router-view />
    </Navbar>
  </div>
</template>