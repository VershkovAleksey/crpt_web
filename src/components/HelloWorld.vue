<template>
  <div class="sets" v-loading="loading">
    <div class="buttons">
      <el-button plain @click="dialogVisible = true"> Создать наборы</el-button>
      <el-button plain @click="seedNationalCatalog"
        >Загрузить товары из национального каталога
      </el-button>
    </div>
    <el-dialog v-model="dialogVisible" title="Tips" :before-close="handleClose">
      <el-table :data="newSetsTable" border>
        <el-table-column label="Название">
          <template #default="scope">
            <el-select
              v-model="scope.row.gtin"
              filterable
              remote
              reserve-keyword
              placeholder="Введите Название или Gtin"
              :remote-method="remoteMethod"
              :loading="loading"
            >
              <el-option
                v-for="item in options"
                :key="item.id"
                :label="item.setName"
                :value="item.gtin"
              >
                <span style="float: left; margin-right: 10px">{{
                  item.setName
                }}</span>
                <span
                  style="
                    float: right;
                    color: var(--el-text-color-secondary);
                    font-size: 13px;
                  "
                >
                  {{ item.gtin }}
                </span>
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="Количество">
          <template #default="scope">
            <el-input-number v-model="scope.row.count" :min="1" />
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <div>
            <el-button type="success" @click="addNewRow()">+</el-button>
          </div>
          <div>
            <el-button @click="dialogVisible = false">Отмена</el-button>
            <el-button type="primary" @click="AcceptSets">
              Подтвердить
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="setName" label="Название" />
      <el-table-column prop="gtin" label="Gtin" />
      <el-table-column prop="count" label="Количество" />
    </el-table>
    <el-button plain @click="chooseCertDialogVisible">
      Сформировать наборы
    </el-button>

    <el-dialog v-model="setCertDialogVisible" style="width: 700px">
      <el-card class="cert_card" v-for="item in userCerts" :key="item.name">
        <template #header>
          <div class="card-header">
            <h1>{{ item.name }}</h1>
          </div>
        </template>
        <div class="cert-wrapper">
          <div>
            <h3>Владелец</h3>
            <p>{{ item.name }}</p>
          </div>
          <el-divider />
          <div>
            <h3>Издатель</h3>
            <p>{{ item.issuerName }}</p>
          </div>
          <el-divider />
          <div>
            <h3>Информация</h3>
            <p>{{ item.subjectName }}</p>
          </div>
          <el-divider />
          <div>
            <h3>Отпечаток</h3>
            <p>{{ item.thumbprint }}</p>
          </div>
          <el-divider />
          <div>
            <h3>Действителен до</h3>
            <p>{{ item.validTo }}</p>
          </div>
        </div>

        <template #footer
          ><el-button type="success" @click="sendSetsToCreate(item)"
            >Выбрать</el-button
          ></template
        >
      </el-card>
    </el-dialog>
    <el-table :data="createdSets" style="width: 100%">
      <el-table-column prop="setName" label="Название" />
      <el-table-column prop="gtin" label="Gtin" />
      <el-table-column prop="date" label="Дата создания" />
      <el-table-column prop="count" label="Количество" />
      <el-table-column prop="status" label="Статус" />
      <el-table-column prop="response" label="Идентификатор набора в ЧЗ" />
    </el-table>
    <pre>{{ sign }}</pre>
  </div>
</template>

<script lang="ts" async setup>
import { ref, onMounted, reactive } from "vue";
import {
  getUserCertificates,
  Certificate,
  createHash,
  createAttachedSignature,
  createDetachedSignature,
} from "crypto-pro";
import axios from "axios";
import NationalCatalogService from "@/services/national.catalog.service";
import crptTokenService from "@/services/crpt.token.service";
import markingService from "@/services/marking.service";
import store from "@/store";
import { ElNotification } from "element-plus";
import { CloseBold } from "@element-plus/icons-vue";

type ListItem = {
  id: number;
  setName: string;
  gtin: string;
  count: number;
};

type createdSetItem = {
  id: number;
  setName: string;
  gtin: string;
  count: number;
  response: string;
  status: number;
};

const userCerts = ref<Certificate[]>([]);
const dialogVisible = ref(false);
const setCertDialogVisible = ref(false);
const currentSertificate = ref(Certificate);
const loading = ref(false);
const options = ref<ListItem[]>([]);
const list = ref<ListItem[]>([]);
const tableData = ref<ListItem[]>([]);
const newSetsTable = ref<ListItem[]>([
  {
    setName: "",
    gtin: "",
    count: 0,
    id: 0,
  },
]);

const remoteMethod = (query: string) => {
  if (query) {
    loading.value = true;
    setTimeout(() => {
      loading.value = false;
      options.value = list.value.filter((item) => {
        return (
          item.setName.toLowerCase().includes(query.toLowerCase()) ||
          item.gtin.includes(query.toLowerCase())
        );
      });
    }, 100);
  } else {
    options.value = [];
  }
};

const getSets = async () => {
  console.log(store.state.auth.user);
  NationalCatalogService.getSetsOptions()
    .then((response) => {
      list.value = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
};

const onSubmit = () => {
  console.log("submit!");
};

const getUserCerts = async function () {
  let certificates;

  try {
    userCerts.value = await getUserCertificates();
  } catch (error) {
    console.log(error);
  }
};

const AcceptSets = () => {
  let newSets = newSetsTable.value.map((item) => {
    return {
      setName:
        list.value.find((element) => element.gtin === item.gtin)?.setName ?? "",
      gtin: item.gtin,
      count: item.count,
      id: item.id,
    };
  });
  tableData.value = tableData.value.concat(newSets);
  dialogVisible.value = false;

  newSetsTable.value = [
    {
      setName: "",
      gtin: "",
      count: 1,
      id: 0,
    },
  ];
};
const addNewRow = () => {
  newSetsTable.value.push({
    setName: "",
    gtin: "",
    count: 1,
    id: 0,
  });
};

const createSignature = async function (
  message: string,
  Certificate: Certificate,
  detached: boolean
) {
  try {
    if (detached) {
      return await createDetachedSignature(Certificate.thumbprint, message);
    } else {
      return await createAttachedSignature(Certificate.thumbprint, message);
    }
  } catch (error) {
    console.log(error);
  }
};

const sign = ref();
const createdSets = ref<createdSetItem[]>();

const getCreatedSets = () => {
  NationalCatalogService.getSets().then((response) => {
    createdSets.value = response.data;
  });
};

const seedNationalCatalog = () => {
  loading.value = true;
  NationalCatalogService.seedData().then((response) => {
    if (response.status == 200) {
      loading.value = false;
    }
  });
};
const chooseCertDialogVisible = () => {
  setCertDialogVisible.value = true;
};

const sendToMark = async (token: string, request: any) => {
  await markingService
    .sendSetsToMark({
      token: token,
      request: request,
    })
    .then((markResponse) => {
      console.log(markResponse);
    })
    .catch((error) => {
      ElNotification({
        title: "Ошибка",
        message: error.response.data,
        closeIcon: CloseBold,
        type: "error",
        duration: 0,
      });
      throw new Error(error.response.data);
    });
};
const getSignData = async (token: string, certificate: Certificate) => {
  let request: any;
  await markingService
    .getDataToSign(token)
    .then(async (dataToSignResponse) => {
      request = dataToSignResponse.data;
      console.log(request);
      let hash = await createHash(request.product_document);
      request.signature = await createSignature(hash, certificate, true);
    })
    .catch((error) => {
      console.log(error.response.data);
      ElNotification({
        title: "Ошибка",
        message: error.response.data,
        closeIcon: CloseBold,
        type: "error",
        duration: 0,
      });
      throw new Error(error.response.data);
    });
  await sendToMark(token, request);
};
const getToken = async (
  signature: string,
  uuid: string,
  certificate: Certificate
) => {
  let token = "";
  await crptTokenService
    .getAuthToken({
      uuid: uuid,
      data: signature,
    })
    .then((response) => {
      token = response.data;
    })
    .catch((error) => {
      ElNotification({
        title: "Ошибка",
        message: error.response.data,
        closeIcon: CloseBold,
        type: "error",
        duration: 0,
      });
      throw new Error(error.response.data);
    });

  await getSignData(token, certificate);
};
const getAuthData = async (certificate: Certificate) => {
  let signature = "";
  let uuid = "";

  await crptTokenService
    .getAuthData()
    .then(async (response) => {
      let signatureResponse = await createSignature(
        response.data.data,
        certificate,
        false
      );
      if (signatureResponse) {
        signature = signatureResponse;
      } else {
        throw new Error("Не удалось создать подпись для получения токена CRPT");
      }
      uuid = response.data.uuid;
    })
    .catch((error) => {
      console.log(error.response.data);
      ElNotification({
        title: "Ошибка",
        message: error.response.data,
        closeIcon: CloseBold,
        type: "error",
        duration: 0,
      });
      throw new Error(error.response.data);
    });

  await getToken(signature, uuid, certificate);
};
const sendSetsToCreate = async (certificate: Certificate) => {
  setCertDialogVisible.value = false;
  loading.value = true;
  await NationalCatalogService.createSets(tableData.value).then((response) =>
    console.log(response)
  );
  await getAuthData(certificate).finally(() => {
    loading.value = false;
  });
};

onMounted(async () => {
  await getUserCerts();
  //await createSignature("Привет мир", userCerts.value[1]);
  getSets();
  getCreatedSets();
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.dialog-footer {
  display: flex;
  justify-content: space-between;
}

.sets {
  display: flex;
  flex-direction: column;
}

.buttons {
  display: flex;
  justify-content: space-between;
}
.cert-wrapper {
  display: flex;
  flex-direction: column;

  div {
    display: flex;
    justify-content: space-between;
    align-items: center;

    p {
      text-align: right;
    }
  }
}
.cert_card {
  padding: 10px;
  margin-bottom: 20px;

  p {
    font-size: 12px;
  }
}
</style>
