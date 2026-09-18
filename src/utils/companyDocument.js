export const companyDocumentAccept = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png";
export const companyDocumentMaxSize = 10 * 1024 * 1024;

const allowedExtensions = new Set(["pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png"]);

export const validateCompanyDocument = (file) => {
  if (!file) return "";
  if (file.size <= 0) return "上傳檔案不可為空";
  if (file.size > companyDocumentMaxSize) return "上傳檔案不可超過 10 MB";
  const extension = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";
  if (!allowedExtensions.has(extension)) return "僅允許上傳 PDF、Word、Excel、JPG 或 PNG 檔案";
  return "";
};

export const toCompanyDocumentFormData = (data, file) => {
  const formData = new FormData();
  Object.entries(data || {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined) formData.append(key, value);
  });
  if (file) formData.append("file", file, file.name);
  return formData;
};

export const saveDownloadResponse = (response, fileName) => {
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || "附件";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const formatFileSize = (bytes) => {
  const size = Number(bytes || 0);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};
