import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://10.129.0.24:8000/api/Auth/";

class CrptTokenService {
  getAuthData(token) {
    return axios.get(API_URL + "auth-data", { headers: authHeader() });
  }

  getAuthToken(request) {
    return axios.post(API_URL + "crpt-token", request, {
      headers: authHeader(),
    });
  }
}

export default new CrptTokenService();
