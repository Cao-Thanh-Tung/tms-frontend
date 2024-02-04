<template>
    <div>
        <a-button type="primary" @click="showModal">{{ open }}</a-button>
        <a-modal v-model:visible="visible" :title="title" @ok="handleOk">
            <slot></slot>
        </a-modal>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
export default defineComponent({
    props: {
        open: String,
        title: String
    },
    setup() {
        const visible = ref<boolean>(false);

        const showModal = () => {
            visible.value = true;
        };

        const handleOk = (e: MouseEvent) => {
            console.log(e);
            visible.value = false;
        };
        return {
            visible,
            showModal,
            handleOk,
        };
    },
});
</script>