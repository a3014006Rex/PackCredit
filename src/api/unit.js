import request from "./index";
// 單位機關
export const Unit = {
  List: (data) => {
    return request.post("/Unit/List", data);
  },
  AffiliatedAgencyList: (data) => {
    return request.post("/Unit/AffiliatedAgency/List", data);
  },
};
