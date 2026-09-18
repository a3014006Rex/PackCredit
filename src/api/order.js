import request from "./index";

export const Order = {
  CheckoutPreview: () => request.get("/OrderAPI/CheckoutPreview"),
  Checkout: (data) => request.post("/OrderAPI/Checkout", data),
  GetByRequest: (requestId) =>
    request.get(`/OrderAPI/Request/${encodeURIComponent(requestId)}`),
  List: (params = {}) => request.get("/OrderAPI/List", params),
  Options: () => request.get("/OrderAPI/Options"),
  GetById: (id) => request.get(`/OrderAPI/Detail/${encodeURIComponent(id)}`),
  DownloadInvoice: (id) =>
    request.get(`/OrderAPI/Invoice/${encodeURIComponent(id)}`, {}, { responseType: "blob" }),
};
