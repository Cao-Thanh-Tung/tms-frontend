<script setup lang="ts">
import modal from '@/components/modal.vue';
import axios from 'axios';
import { reactive } from 'vue';
const dataSource = reactive([
    {
        key: '1',
        name: 'Mike',
        phone: "0373653636",
        address: '10 Downing Street',
        role: "Nhân viên điều phối"
    },
    {
        key: '2',
        name: 'John',
        phone: "0373873877",
        address: '10 Downing Street',
        role: "Tài xế"
    },
]);

const columns = [
    {
        title: 'Tên',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Số điện thoại',
        dataIndex: 'phone',
        key: 'phone',
    },
    {
        title: 'Địa chỉ',
        dataIndex: 'address',
        key: 'address',
    }, {
        title: 'Chức vụ',
        dataIndex: 'role',
        key: 'role',
    },
];
axios.get("/user-xes").then((res) => {
    // let data = res.data;
    // let data1 = [];
    // data1.map((item, index)=>{
    //     return {
    //         key: index+'',
    //     name: item.name,
    //     phone: "0373873877",
    //     address: '10 Downing Street',
    //     role: "Tài xế"
    //     }
    // })
}).catch((err) => {
    console.log("Get All Employee." + err);
})
</script>
<template>
    <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item>Nhân viên</a-breadcrumb-item>
        <a-breadcrumb-item>Danh sách nhân viên</a-breadcrumb-item>
    </a-breadcrumb>
    <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
        <modal open="Add New" title="Add New Employee">
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
        </modal>
        <a-table :dataSource="dataSource" :columns="columns" />
    </a-layout-content>
</template>

<style scoped></style>
  