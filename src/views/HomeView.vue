<template>
  <div class="home">
    <HelloWorld />
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import router from "@/router";
import store from "@/store";
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src

onMounted(() => {
  let user = store.state.auth.user;
  if (!user) {
    router.push("/auth");
  }
});
</script>
