<template>
  <div class="common-layout">
    <el-container>
      <el-header v-if="isLoggedIn()" class="header">
        <div v-if="isLoggedIn()">
          <el-button type="primary"
            ><router-link to="/">Главная</router-link></el-button
          >
          <el-button type="primary"
            ><router-link to="/about">About</router-link></el-button
          >
        </div>
        <el-button v-if="isLoggedIn()" @click="logOut" type="danger"
          >Выйти
        </el-button>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
      <el-footer v-if="isLoggedIn()">Footer</el-footer>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import store from "@/store";
import router from "@/router";

const logOut = () => {
  store.dispatch("auth/logout");
  router.push({ path: "/auth" });
};

const isLoggedIn = () => {
  console.log(store.state.auth.status.loggedIn);
  return store.state.auth.status.loggedIn;
};
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

.header a {
  color: #ffffff;
  text-decoration: none;
}
.header {
  display: flex;
  justify-content: space-between;
}

iframe#webpack-dev-server-client-overlay {
  display: none !important;
}
</style>
<script setup lang="ts"></script>
