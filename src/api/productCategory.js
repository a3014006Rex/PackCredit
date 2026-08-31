import request from "./index";

export const ProductCategory = {
  List: (data) => request.post("/ProductCategory/List", data),
  GetById: (id) => request.get(`/ProductCategory/${id}`),
  Create: (data) => request.post("/ProductCategory", data),
  Update: (id, data) => request.put(`/ProductCategory/${id}`, data),
  Delete: (id) => request.delete(`/ProductCategory/${id}`),
};
