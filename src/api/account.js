import request from "./index";

export const Account = {
  Login: (data) => {
    return request.post("/Account/Login", data);
  },
  LoginByEip: (data) => {
    return request.post("/Account/LoginByEip", data);
  },
};
