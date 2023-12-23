<script setup lang="ts">
import {ref, VueElement} from 'vue'
import {
  AccountResourceApi,
  AccountResourceApiFactory,
  AddressResourceApiFactory,
  UserJwtControllerApiFactory
} from "../api";
import {Configuration} from "../configuration";

defineProps<{ msg: string }>()

const count = ref(0)

let jwtToken: ref<string> = ref("");
let accountInfo = ref("");
let userJwtController = UserJwtControllerApiFactory();

// example call api
userJwtController.authorize({username: "admin", password: "admin"})
    .then((response) => {
      jwtToken.value = response.data.id_token;
      // example call api with jwt token
      let accountResource = new AccountResourceApiFactory(new Configuration({
        accessToken: () => jwtToken.value // use callback because jwt token can be changed in runtime
      }));
      accountResource.getAccount().then((response) => {
        accountInfo.value = JSON.stringify(response.data);
      });

    })
    .catch((error) => {
      console.log(error);
    });

</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>

    <p>You are signed in with the following JWT token:</p>
    <p>{{ jwtToken }}</p>

    <p>Account info: {{ accountInfo }}</p>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
    >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Install
    <a href="https://github.com/vuejs/language-tools" target="_blank">Volar</a>
    in your IDE for a better DX
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
