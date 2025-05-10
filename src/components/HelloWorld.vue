<template>
  <div class="sets">
    <el-button plain @click="dialogVisible = true"> Создать наборы</el-button>
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
    <el-button plain @click="sendSetsToCreate"> Сформировать наборы</el-button>

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

type ListItem = {
  id: number;
  setName: string;
  gtin: string;
  count: number;
};

const userCerts = ref<Certificate[]>([]);
const dialogVisible = ref(false);

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

const getSets = () => {
  axios
    .get("http://localhost:5274/api/Test/sets")
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

const sendSetsToCreate = () => {
  axios
    .post("http://localhost:5274/api/Test/createSets", tableData.value)
    .then((response) => console.log(response));

  let token: string | undefined = undefined;
  axios
    .get("http://localhost:5274/api/Test/auth-data")
    .then(async (response) => {
      await getUserCerts();
      let signature = await createSignature(
        response.data.data,
        userCerts.value[1],
        false
      );
      axios
        .post(
          "http://localhost:5274/api/Test/crpt-token",
          {
            uuid: response.data.uuid,
            data: signature,
          },
          {
            headers: {
              accept: "application/json",
            },
          }
        )
        .then((response) => {
          token = response.data;
          axios
            .post(
              "http://localhost:5274/api/Test/data-to-sign",
              {},
              {
                headers: {
                  accept: "application/json",
                  token: token,
                },
              }
            )
            .then(async (dataToSignResponse) => {
              let request = dataToSignResponse.data;
              console.log(request);
              let hash = await createHash(request.product_document);
              console.log(hash);
              console.log(userCerts.value[1]);
              request.signature = await createSignature(
                hash,
                userCerts.value[1],
                true
              );
              axios
                .post(
                  "http://localhost:5274/api/Test/send-sets-to-mark",
                  {
                    token: token,
                    request: request,
                  },
                  {
                    headers: {
                      accept: "application/json",
                    },
                  }
                )
                .then((markResponse) => {
                  console.log(markResponse);
                });
            });
        });
    })
    .catch((error) => {
      console.log(error);
    });
};

onMounted(async () => {
  //await getUserCerts();
  //await createSignature("Привет мир", userCerts.value[1]);
  getSets();
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
</style>
