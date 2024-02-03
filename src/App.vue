<script setup lang="ts">
import Navbar from '@/components/Navbar.vue';
import Authorization from '@/pages/auth/Authorization.vue';
import store from '@/store';
import { watch } from 'vue';
watch(store.state, (oldValue, newValue) => { console.log(oldValue); console.log(newValue) })
</script>
<template>
  <div>
    <Authorization v-if='store.state.jwt === ""' />
    <Navbar v-else />
  </div>
</template>