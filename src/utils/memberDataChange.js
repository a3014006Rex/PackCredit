import dayjs from "dayjs";

export const changeStatuses = {
  PENDING: { label: "審核中", type: "warning" },
  APPROVED: { label: "已核准", type: "success" },
  REJECTED: { label: "已退回", type: "danger" },
};
export const changeStatus = (value) => changeStatuses[value] || { label: value || "－", type: "info" };
export const changeDate = (value, dateOnly = false) =>
  value && dayjs(value).isValid() ? dayjs(value).format(dateOnly ? "YYYY/MM/DD" : "YYYY/MM/DD HH:mm") : "－";

export const changeSections = [
  { title: "申請變更後的公司資料", fields: [
    { key: "afterCompanyName", label: "公司名稱", max: 200, required: true, wide: true, before: "beforeCompanyName" },
    { key: "afterTaxId", label: "統一編號", max: 8 },
    { key: "afterEmail", label: "電子發票信箱", max: 200 },
    { key: "afterAddress", label: "聯絡地址", max: 300, required: true, wide: true, before: "beforeAddress" },
    { key: "afterPhone", label: "聯絡電話", max: 50, before: "beforePhone" },
    { key: "afterFax", label: "傳真", max: 50, before: "beforeFax" },
  ] },
  { title: "公司負責人（選填）", fields: [
    { key: "directorName", label: "負責人姓名", max: 100 },
    { key: "directorMobile", label: "手機", max: 50 },
    { key: "directorPhone", label: "室內電話", max: 50 },
  ] },
  { title: "聯絡人：稿件問題（選填）", fields: [
    { key: "contact1Name", label: "聯絡人姓名", max: 100 },
    { key: "contact1Mobile", label: "手機", max: 50 },
    { key: "contact1Phone", label: "室內電話", max: 50 },
  ] },
  { title: "聯絡人：帳款與出貨（選填）", fields: [
    { key: "contact2Name", label: "聯絡人姓名", max: 100 },
    { key: "contact2Mobile", label: "手機", max: 50 },
    { key: "contact2Phone", label: "室內電話", max: 50 },
  ] },
];
export const changeFields = changeSections.flatMap((section) => section.fields);
export const emptyChangeForm = () => Object.fromEntries([...changeFields.map((field) => [field.key, ""]), ["changeReason", ""]]);
export const changeError = (error, fallback) => error.response?.data?.message || fallback;
