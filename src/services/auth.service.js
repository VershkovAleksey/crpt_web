import axios from "axios";

const API_URL = "http://130.193.52.139:8000/api/User/";

class AuthService {
  login(user) {
    return axios
      .post(API_URL + "auth", {
        username: user.email,
        password: user.password,
      })
      .then((response) => {
        if (response.data.accessToken) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }

        return response.data;
      });
  }

  logout() {
    localStorage.removeItem("user");
  }

  register(user) {
    return axios.post(API_URL + "register", {
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      apiKey: user.apiKey,
      phoneNumber: user.phoneNumber,
      inn: user.inn,
    });
  }
}

export default new AuthService();
