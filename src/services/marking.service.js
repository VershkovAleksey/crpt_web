import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://130.193.52.139/api/Marking/";

class MarkingService {
  sendSetsToMark(request) {
    return axios.post(API_URL + "send-sets-to-mark", request, {
      headers: authHeader(),
    });
  }

  getDataToSign(token) {
    let user = JSON.parse(localStorage.getItem("user"));
    return axios.post(
      API_URL + "data-to-sign",
      {
        token: token,
      },
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      }
    );
  }
}

export default new MarkingService();
