<script setup lang="ts">
import store from "@/store";
import Navbar from "@/components/Navbar.vue";
import Authorization from "@/pages/auth/Authorization.vue";
</script>

<template>
  <div>
    <Authorization v-if="!store.getters.isLogin" />
    <Navbar :role="store.getters?.user?.role" :avatar="store.getters?.user.user?.imageUrl"
      :name="store.getters.user.user?.lastName" v-else>
      <router-view />
    </Navbar>
  </div>
</template>
<style>
* {
  font-size: 16px;
}
</style>
