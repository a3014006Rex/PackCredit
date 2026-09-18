import request from "./index";
import { toCompanyDocumentFormData } from "@/utils/companyDocument";

export const MemberDataChangeAPI = {
  GetList: ({ pageIndex = 1, pageSize = 10, status = null } = {}) =>
    request.get("/TrMemberDataChangeAPI/GetList", { pageIndex, pageSize, status }),
  GetDetail: (id) => request.get(`/TrMemberDataChangeAPI/GetDetail/${encodeURIComponent(id)}`),
  Create: (data, file = null) =>
    request.post("/TrMemberDataChangeAPI/Create", toCompanyDocumentFormData(data, file)),
  ReplaceFile: (id, file) =>
    request.post(`/TrMemberDataChangeAPI/File/${encodeURIComponent(id)}`, toCompanyDocumentFormData({}, file)),
  DownloadFile: (id, fileId) =>
    request.get(`/TrMemberDataChangeAPI/File/${encodeURIComponent(id)}/${encodeURIComponent(fileId)}`, {}, { responseType: "blob" }),
};
