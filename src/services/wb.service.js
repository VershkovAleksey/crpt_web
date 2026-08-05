import axios from "axios";

const API_URL = "http://localhost:8000/api/Wb/";

class WbService {
  createSupplies() {
    return axios.get(API_URL + "create-supplies");
  }
}

export default new WbService();
