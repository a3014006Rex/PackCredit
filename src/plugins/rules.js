const Required = (trigger = "change") => {
  return { required: true, message: "必填", trigger: trigger };
};

const EmailOptional = (trigger = "blur") => {
  return { type: "email", message: "請輸入正確的 Email 格式", trigger: trigger };
};

const TaxIdOptional = (trigger = "blur") => {
  return { pattern: /^\d{8}$/, message: "統一編號格式錯誤，請輸入 8 位數字", trigger: trigger };
};

const TaxIdRequired = (trigger = "blur") => {
  return { required: true, pattern: /^\d{8}$/, message: "請輸入 8 位數統一編號", trigger };
};

const PhoneOptional = (trigger = "blur") => {
  return { pattern: /^[0-9\-+()\s]{7,20}$/, message: "電話格式錯誤", trigger: trigger };
};

export const Login = {
  account: [Required()],
  password: [Required()],
};

export const ProductCategory = {
  name: [Required()],
};

export const Product = {
  name: [Required()],
  categoryId: [Required()],
  price: [Required()],
  stock: [Required()],
};

export const Register = {
  memberLevel: [Required()],
  companyName: [Required("blur")],
  taxID: [TaxIdRequired()],
  password: [
    Required("blur"),
    { min: 6, max: 50, message: "密碼需 6-50 位", trigger: "blur" },
    { pattern: /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]{6,50}$/, message: "密碼可輸入英數字及符號", trigger: "blur" },
  ],
  confirmPassword: [Required("blur")],
  contactPhone: [Required("blur"), PhoneOptional()],
  addressCity: [Required()],
  addressDistrict: [Required()],
  addressDetail: [Required("blur")],
  deliveryMethod: [Required()],
  email: [Required("blur"), EmailOptional()],
  invoiceEmail: [Required("blur"), EmailOptional()],
  invoiceType: [Required()],
  contactName: [Required("blur")],
};
