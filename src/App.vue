<script setup lang="ts">
import { ref, onUpdated } from "vue";
import { KJUR } from "jsrsasign";
import store from "@/store";
import Navbar from "@/components/Navbar.vue";
import Authorization from "@/pages/auth/Authorization.vue";

let isTokenExpired = ref(false);

onMounted(() => {
  const jwt = store.getters.jwt;
  if (jwt) {
    const decodedToken = KJUR.jws.JWS.parse(jwt);
    if (decodedToken.payloadObj) {
      const payloadObj = decodedToken.payloadObj as { exp: number };
      const now = Math.floor(Date.now() / 1000);
      if (now > payloadObj.exp) {
        isTokenExpired.value = true;
      }
    } else {
      isTokenExpired.value = true;
    }
  }
});

</script>

<template>
  <div>
    <Authorization v-if="store.getters.jwt == '' || isTokenExpired" />
    <Navbar v-else>
      <router-view />
    </Navbar>
  </div>
</template>
