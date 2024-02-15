<template>
    <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item>Nhà thầu</a-breadcrumb-item>
        <a-breadcrumb-item>Danh sách nhà thầu</a-breadcrumb-item>
    </a-breadcrumb>
    <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
        Danh sách nhà thầu
        <modal open="Add New" title="Add New Contractor">
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
        </modal>
        <a-table :dataSource="dataSource" :columns="columns" />
    </a-layout-content>
</template>
<script lang="ts" setup>
import { reactive, onMounted } from 'vue';
import axios from 'axios';
import modal from '@/components/modal.vue';

const state = reactive({
    dataSource: [],
    columns: [
        // Define your columns here based on the structure of ContractorDTO
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Signing Date', dataIndex: 'signingDate', key: 'signingDate' },
        { title: 'Expiration Date', dataIndex: 'expirationDate', key: 'expirationDate' },
        { title: 'addressId', dataIndex: 'addressId', key: 'addressId' }
        // Add more columns as needed
    ],
});

// Fetch data from the API endpoint when the component is mounted
onMounted(async () => {
    try {
        const response = await axios.get('/contractors?page=0&size=20');
        state.dataSource = response.data; // Assuming response.data is an array of contractor objects
        console.log("1")
    } catch (error) {
        console.error('Error fetching contractors:', error);
    }
});
</script>

<style scoped></style>
  