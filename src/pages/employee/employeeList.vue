<script setup lang="ts">
import modal from '@/components/modal.vue';
const dataSource = [
    {
        key: '1',
        name: 'Mike',
        age: 32,
        address: '10 Downing Street',
    },
    {
        key: '2',
        name: 'John',
        age: 42,
        address: '10 Downing Street',
    },
];

const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
    },
    {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
    },
];
</script>
<template>
    <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item>Nhân viên</a-breadcrumb-item>
        <a-breadcrumb-item>Danh sách nhân viên</a-breadcrumb-item>
    </a-breadcrumb>
    <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
        Employee list
        <modal open="Add New" title="Add New Employee">
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
        </modal>
        <a-table :dataSource="dataSource" :columns="columns" />
    </a-layout-content>
</template>

<style scoped></style>
  