<script setup lang="ts">
import Navbar from '@/components/Navbar.vue';
import Authorization from '@/pages/auth/Authorization.vue';
import store from '@/store';
import { watch } from 'vue';
watch(store.state, () => { })
</script>
<template>
  <div>
    <authorization v-if='store.state.jwt === ""' />
    <navbar v-else>
      <router-view />
    </navbar>
  </div>
</template>
