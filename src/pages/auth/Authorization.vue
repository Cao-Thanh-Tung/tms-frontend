<script setup lang="ts">
import login from '@/pages/auth/login.vue';
import register from '@/pages/auth/register.vue';
import { ref } from 'vue';
const formLogin = ref(true);
</script>
<template>
    <div class="form">
        <login v-if='formLogin === true' />
        <register v-else />
        <!-- <p @click="formLogin = !formLogin" style="color: rgb(22,119,255);text-align: center; cursor: pointer;">{{ formLogin
            === true ?
            `Or register
            now!` : `Or log in
            now!`}}</p> -->
    </div>
</template>
<style scoped>
.form {
    width: 30%;
    margin: auto;
    margin-top: 50px;
    padding: 50px;
    padding-top: 40px;
    border: 1px solid rgb(197, 197, 235);
    border-radius: 8px;
    box-shadow: 0 8px 60px 0 rgba(103, 151, 255, .11), 0 12px 90px 0 rgba(103, 151, 255, .11);
    background-color: white;
}
</style>