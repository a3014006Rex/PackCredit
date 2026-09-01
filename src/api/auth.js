import request from "./index";

const apiBaseUrl = `${import.meta.env.VITE_API_BASE_PATH || "/api"}`.replace(/\/$/, "");

export const AuthAPI = {
  // 後台 LoginAPIController
  GetCaptcha: () => request.get("/LoginAPI/Captcha"),
  MemberLogin: (data) => request.post("/LoginAPI/Login", data),

  // 後台 BannerAPIController（公開）
  GetHeroBanners: () => request.get("/BannerAPI/Heroes"),

  // 後台 PortalContentAPIController（公開）
  GetPortalMenus: () => request.get("/PortalContentAPI/Menus"),
  GetPortalContent: (pcKey) => request.get("/PortalContentAPI/Detail", { pcKey }),
  GetMemberRights: () => request.get("/PortalContentAPI/MemberRights"),
  GetAboutUs: () => request.get("/PortalContentAPI/AboutUs"),

  // 後台 sysNEWSAPIController（公開）
  GetLatestNews: () => request.get("/sysNEWSAPI/Latest"),
  GetNewsList: (page = 1, pageSize = 10) =>
    request.get("/sysNEWSAPI/List", { page, pageSize }),
  GetNewsDetail: (newsId) => request.get(`/sysNEWSAPI/Detail/${newsId}`),
  GetNewsAttachmentUrl: (newsId, fileId) =>
    `${apiBaseUrl}/sysNEWSAPI/Attachment/${encodeURIComponent(newsId)}/${encodeURIComponent(fileId)}`,

  // 後台 TbProductAPIController（公開）
  GetLatestProducts: () => request.get("/TbProductAPI/Latest"),
  GetProductList: ({ page = 1, pageSize = 20, keyword = null, categoryId = null } = {}) =>
    request.get("/TbProductAPI/List", { page, pageSize, keyword, categoryId }),

  // 後台 TrQaCollectionAPIController（需會員登入）
  GetQaList: ({ page = 1, pageSize = 10 } = {}) =>
    request.get("/TrQaCollectionAPI/List", { page, pageSize }),
  CreateQaQuestion: (data) => request.post("/TrQaCollectionAPI/Create", data),

  // 後台 MemberProfileAPIController（需會員登入、唯讀）
  GetMemberProfile: () => request.get("/MemberProfileAPI/Current"),

  // 公司聯絡人帳號（需公司管理權限）
  GetCompanyMembers: () => request.get("/CompanyMemberAPI/List"),
  CreateCompanyMember: (data) => request.post("/CompanyMemberAPI/Create", data),
  UpdateCompanyMember: (memberId, data) => request.put(`/CompanyMemberAPI/${memberId}`, data),
  SetCompanyMemberStatus: (memberId, isActive) =>
    request.put(`/CompanyMemberAPI/${memberId}/Status`, { isActive }),

  // 公司儲值及首次開通
  GetTopUpCurrent: () => request.get("/TopUpAPI/Current"),
  SubmitTopUp: (data) => request.post("/TopUpAPI/Submit", data),

  // 後台 RegisterAPIController
  GetRegisterParameters: () => request.get("/RegisterAPI/Register"),
  GetDistricts: (cityCode) => request.get("/RegisterAPI/Districts", { cityCode }),
  CheckTaxID: (taxID) => request.get("/RegisterAPI/CheckTaxID", { taxID }),
  CheckCompanyName: (companyName) => request.get("/RegisterAPI/CheckCompanyName", { companyName }),
  CheckEmail: (email) => request.get("/RegisterAPI/CheckEmail", { email }),
  Register: (data) => request.post("/RegisterAPI/Register", data),
};
