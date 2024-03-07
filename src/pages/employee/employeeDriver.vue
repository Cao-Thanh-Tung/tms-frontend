<script setup lang="ts">
import AddressForm from '@/components/AddressForm.vue';
import { ref } from 'vue';
// const initialAddressId = ref(1);
const id = ref(1);
function chooseAddress(addressId: number) {
    console.log(addressId);
    id.value = addressId;
}
</script>

<template>
    <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item>Nhân viên</a-breadcrumb-item>
        <a-breadcrumb-item>Tài xế</a-breadcrumb-item>
    </a-breadcrumb>
    <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
        <address-form :initial-address-id="id" @save="chooseAddress"></address-form>
    </a-layout-content>
</template>

<style scoped></style>