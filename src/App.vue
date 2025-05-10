<template>
  <div class="common-layout">
    <el-container>
      <!--      <el-header>Header</el-header>-->
      <el-main
        ><!--  <nav>-->
        <!--    <router-link to="/">Home</router-link>-->
        <!--    <router-link to="/about">About</router-link>-->
        <!--  </nav>-->
        <router-view />
      </el-main>
      <!--      <el-footer>Footer</el-footer>-->
    </el-container>
  </div>
</template>

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

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

iframe#webpack-dev-server-client-overlay {
  display: none !important;
}
</style>
<script setup lang="ts"></script>
