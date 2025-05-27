<template>
  <div class="registration">
    <el-form
      label-width="auto"
      label-position="left"
      style="max-width: 800px"
      :model="userData"
    >
      <el-form-item label="Email" prop="email">
        <el-input v-model="userData.email" />
      </el-form-item>
      <el-form-item label="Пароль" prop="password">
        <el-input
          v-model="userData.password"
          type="password"
          placeholder="Введите пароль"
          show-password
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm()"> Войти </el-button>
        <el-button @click="registration()"> Регистрация </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import { ElMessage } from "element-plus";
import router from "@/router";
import store from "@/store";
import axios from "axios";

const userData = reactive({
  email: "",
  password: "",
});

const submitForm = () => {
  store.dispatch("auth/login", userData).then(
    (res) => {
      router.push("/");
    },
    (error) => {
      let message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      ElMessage.error(message);
    }
  );
};

const registration = () => {
  router.push("/register");
};
</script>

<style lang="css">
.registration {
  display: flex;
  justify-content: center;
}
</style>
<style scoped></style>
