<template>
  <div class="registration" v-loading="loading">
    <el-form
      label-width="auto"
      label-position="left"
      :rules="rules"
      ref="userFormRef"
      style="max-width: 800px"
      :model="userItem"
    >
      <el-form-item label="Имя" prop="firstName">
        <el-input v-model="userItem.firstName" />
      </el-form-item>
      <el-form-item label="Фамилия" prop="lastName">
        <el-input v-model="userItem.lastName" />
      </el-form-item>
      <el-form-item label="Апи ключ национального каталога" prop="apiKey">
        <el-input v-model="userItem.apiKey" />
      </el-form-item>
      <el-form-item label="Email" prop="email">
        <el-input v-model="userItem.email" />
      </el-form-item>
      <el-form-item label="Телефон" prop="phoneNumber">
        <el-input v-model="userItem.phoneNumber" />
      </el-form-item>
      <el-form-item label="Пароль" prop="password">
        <el-input
          v-model="userItem.password"
          type="password"
          placeholder="Введите пароль"
          show-password
        />
      </el-form-item>
      <el-form-item label="Повторите пароль" prop="passwordCheck">
        <el-input
          v-model="userItem.passwordCheck"
          type="password"
          placeholder="Повторите пароль"
          show-password
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm(userFormRef)">
          Create
        </el-button>
        <el-button @click="resetForm(userFormRef)">Reset</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import store from "@/store";
import router from "@/router";

type user = {
  firstName: string;
  lastName: string;
  apiKey: string;
  password: string;
  email: string;
  phoneNumber: string;
  passwordCheck: string;
  inn: string;
};
const userFormRef = ref<FormInstance>();
const loading = ref(false);
const userItem = reactive<user>({
  firstName: "",
  lastName: "",
  apiKey: "",
  password: "",
  email: "",
  phoneNumber: "",
  passwordCheck: "",
  inn: "",
});

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("Введите пароль"));
  } else {
    if (userItem.passwordCheck !== "") {
      if (!userFormRef.value) return;
      userFormRef.value.validateField("passwordCheck");
    }
    callback();
  }
};
const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("Повторите пароль"));
  } else if (value !== userItem.password) {
    callback(new Error("Пароли не совпадают!"));
  } else {
    callback();
  }
};

const validateApiKey = (rule: any, value: any, callback: any) => {
  let regex = new RegExp("^[A-Za-z0-9]+$");
  if (value === "") {
    callback(new Error("Обязательное поле"));
  } else if (!regex.test(value)) {
    callback(new Error("Допустимы только латинские буквы и арабские цифры"));
  } else {
    callback();
  }
};

const rules = reactive<FormRules<typeof userItem>>({
  firstName: [
    { required: true, trigger: "blur", message: "Обязательное поле" },
    {
      min: 3,
      message: "Имя должно содержать минимум 3 буквы",
      trigger: "blur",
    },
  ],
  lastName: [{ required: true, trigger: "blur", message: "Обязательное поле" }],
  apiKey: [
    { required: true, message: "Обязательное поле" },
    { validator: validateApiKey, trigger: "blur" },
  ],
  email: [{ required: true, trigger: "blur", message: "Обязательное поле" }],
  phoneNumber: [
    { required: true, trigger: "blur", message: "Обязательное поле" },
  ],
  password: [
    { required: true, message: "Обязательное поле" },
    { validator: validatePass, trigger: "blur" },
  ],
  passwordCheck: [
    { required: true, message: "Обязательное поле" },
    { validator: validatePass2, trigger: "blur" },
  ],
});

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      store
        .dispatch("auth/register", userItem)
        .then(
          (data) => {
            let message = data.message;
            router.push({ path: "/auth" });
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
        )
        .finally(() => {
          loading.value = false;
        });
    } else {
      console.log("error submit!", fields);
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

onMounted(() => {
  if (store.state.auth.status.loggedIn) {
    router.push("/");
  }
});
</script>

<style lang="css">
.registration {
  display: flex;
  justify-content: center;
}
</style>
<style scoped></style>
