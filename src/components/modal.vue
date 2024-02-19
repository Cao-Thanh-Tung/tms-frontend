<template>
    <p>{{ firstName + lastName }}</p>
    <input v-model="name" />
    <p>{{ name }}</p>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { defineProps } from 'vue';
const name = ref("");
defineProps<{
    firstName: string,
    lastName: string
}>();
</script>