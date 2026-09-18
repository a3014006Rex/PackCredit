import request from "./index";

export const ShoppingCartAPI = {
  GetList: () => request.get("/TbShoppingCartAPI/List"),
  AddItem: (data) => request.post("/TbShoppingCartAPI/Item", data),
  UpdateQuantity: (cartItemId, data) =>
    request.put(
      `/TbShoppingCartAPI/Item/${encodeURIComponent(cartItemId)}/Quantity`,
      data
    ),
  DeleteItem: (cartItemId) =>
    request.delete(`/TbShoppingCartAPI/Item/${encodeURIComponent(cartItemId)}`),
  Clear: () => request.delete("/TbShoppingCartAPI/Clear"),
};
