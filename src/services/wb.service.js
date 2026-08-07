import axios from "axios";

const API_URL = "http://213.165.218.221:8000/api/Wb/";

class WbService {
  createSupplies() {
    return axios.get(API_URL + "create-supplies");
  }
}

export default new WbService();
