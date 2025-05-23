import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://130.193.52.139:8000/api/NationalCatalog/";

class NationalCatalogService {
  seedData() {
    return axios.get(API_URL + "seed-data", { headers: authHeader() });
  }

  getSetsOptions() {
    return axios.get(API_URL + "set-options", { headers: authHeader() });
  }

  createSets(items) {
    return axios.post(API_URL + "create-sets", items, {
      headers: authHeader(),
    });
  }

  getSets() {
    return axios.get(API_URL + "get-sets", { headers: authHeader() });
  }
}

export default new NationalCatalogService();
