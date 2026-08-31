import request from "./index";

export const Member = {
  List: (data) => request.post("/Member/List", data),
  GetById: (id) => request.get(`/Member/${id}`),
  Update: (id, data) => request.put(`/Member/${id}`, data),
  SetBlacklist: (id, data) => request.put(`/Member/${id}/Blacklist`, data),
};
