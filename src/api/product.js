import request from "./index";

export const Product = {
  List: (data) => request.post("/Product/List", data),
  GetById: (id) => request.get(`/Product/${id}`),
  Create: (data) => request.post("/Product", data),
  Update: (id, data) => request.put(`/Product/${id}`, data),
  Delete: (id) => request.delete(`/Product/${id}`),
};
