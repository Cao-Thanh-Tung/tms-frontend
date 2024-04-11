<script setup lang="ts">
import AddressForm from '@/components/AddressForm.vue';
</script>
<template>
    <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item>Nhân viên</a-breadcrumb-item>
        <a-breadcrumb-item>Tài xế</a-breadcrumb-item>
    </a-breadcrumb>
    <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
        <address-form></address-form>
    </a-layout-content>
</template>
<style scoped></style>
  