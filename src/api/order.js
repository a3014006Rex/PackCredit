import request from "./index";

export const Order = {
  List: (data) => request.post("/Order/List", data),
  GetById: (id) => request.get(`/Order/${id}`),
  UpdateStatus: (id, data) => request.put(`/Order/${id}/Status`, data),
  Cancel: (id, data) => request.put(`/Order/${id}/Cancel`, data),
};
