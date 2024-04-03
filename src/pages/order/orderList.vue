<script setup lang="ts">
import store from '@/store';
import orderListForAdmin from '@/pages/order/orderListComponent/orderListForAdmin.vue';
import orderListForEmployee from '@/pages/order/orderListComponent/orderListForEmployee.vue';
</script>

<template>
    <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item>Đơn vận chuyển</a-breadcrumb-item>
        <a-breadcrumb-item>Danh sách đơn</a-breadcrumb-item>
    </a-breadcrumb>
    <orderListForAdmin v-if="store.getters.user.role == 'admin'" />
    <orderListForEmployee v-else-if="store.getters.user.role == 'employee'" />
</template>
