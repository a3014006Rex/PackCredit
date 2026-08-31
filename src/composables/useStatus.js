export function useStatus(code, type) {
  // code = 0 , 1 , 2
  if (type == "class") {
    switch (code) {
      case true:
        return "green";
        break;
      case false:
        return "red";
        break;
      default:
        break;
    }
  } else if (type == "pay") {
    switch (code) {
      case 0:
        return "已註銷";
        break;
      case 1:
        return "已繳費";
        break;
      case 2:
        return "未繳費";
        break;

      default:
        break;
    }
  } else if (type == "pay-class") {
    switch (code) {
      case "已繳費":
        return "green";
        break;
      case "未繳費":
        return "red";
        break;

      default:
        break;
    }
  } else if (type == "PayTransactions") {
    switch (code) {
      case "已繳費":
      case "對帳成功":
      case "繳費成功":
      case "已入庫":
      case "銷帳成功":
      case "已請款":
      case "已銷帳":
      case "已確認":
      case "付款":
      case "退費完成":
      case "全額退款":
      case "Pay":
        return "green";
      case "尚未對帳":
      case "待入庫":
      case "待銷帳":
      case "尚未銷帳":
      case "銷帳中":
      case "退費待處理":
      case "退費處理中":
      case "部分退款":
        return "blue";
      case "未繳費":
      case "繳費失敗":
      case "對帳失敗":
      case "重複付款":
      case "銷帳失敗":
      case "重複繳費":
      case "錯誤":
      case "退款":
      case "退費失敗":
        return "red";
      case "手動入庫確認中":
        return "blue";
      case "不入庫":
      case "退費取消":
      case "已註銷":
        return "secondary";
      default:
        return "gray";
    }
  } else if (type == "PaymentChannel") {
    // 判斷如果是數值，轉文字型態
    if (typeof code === 'number') {
        code = code.toString();
    }
    switch (code) {

      // 台銀系列
      case "BankOfTaiwan":
        return "台銀 BankOfTaiwan";
      case "BankOfTaiwan_Cash":
      case "1":
        return "臺銀 - 現金";
      case "BankOfTaiwan_Transfer":
      case "2":
        return "臺銀 - 轉帳";
      case "BankOfTaiwan_ATM":
      case "3":
        return "臺銀 - 自動櫃員機";
      case "BankOfTaiwan_Remittance":
      case "4":
        return "臺銀 - 匯款";
      case "BankOfTaiwan_TaiwanPay":
      case "5":
        return "臺銀 - Taiwan pay";
      case "BankOfTaiwan_PhoneBanking":
      case "6":
        return "臺銀 - 電話銀行";
      case "BankOfTaiwan_MobileBanking":
      case "7":
        return "臺銀 - 行動銀行";
      case "BankOfTaiwan_InternetBanking":
      case "8":
        return "臺銀 - 網路銀行";
      case "BankOfTaiwan_WithholdingApplication":
      case "9":
        return "臺銀 - 扣繳申請";
      case "BankOfTaiwan_FundPayback":
      case "10":
        return "臺銀 - 基金繳回";

      // 悠遊付系列
      case "Easywallet":
        return "悠遊付";
      case "Easywallet_CreditCard":
      case "11":
        return "悠遊付 - 信用卡";
      case "Easywallet_Balance":
      case "12":
        return "悠遊付 - 電子支付帳戶餘額";
      case "Easywallet_LinkedAccount":
      case "13":
        return "悠遊付 - 約定連結帳戶";

      // 聯信 HppApi 系列
      case "HppApi":
        return "聯信";
      case "HppApi_CreditCard":
      case "14":
        return "聯信-信用卡";
      case "ApplePay":
      case "15":
        return "聯信-ApplePay";
      case "GooglePay":
      case "16":
        return "聯信-GooglePay";

      // 一卡通系列
      case "IPass":
        return "一卡通";
      case "IPass_Wallet":
      case "17":
        return "一卡通 - 錢包";
      case "IPass_CreditCard":
      case "18":
        return "一卡通 - 信用卡";

      default:
        return code || "";
    }
  } else if (type == "PaymentChannelAll") {
    // 7種繳費管道
    switch (code) {
      case "HppApi":
        return "信用卡";
      case "Easywallet":
        return "悠遊付";
      case "ATM":
        return "臺銀代收";
      case "TaiwanPay":
        return "台灣Pay";
      case "ApplePay":
        return "Apple Pay";
      case "GooglePay":
        return "Google Pay";
      case "IPass":
        return "一卡通";
      default:
        return code || "";
    }
  } else if (type == "TransactionType") {
    switch (code) {
      case "Create":
        return "建立時間";
        break;
      case "Gateway":
        return "Gateway時間";
        break;
      case "Pay":
        return "交易時間";
        break;

      default:
        return "Gateway時間";
        break;
    }
  } else {
    switch (code) {
      case true:
        return "啟用";
        break;
      case false:
        return "停用";
        break;

      default:
        break;
    }
  }
}

// 銷帳狀態顯示轉換函數
export function getWriteOffStatusDisplay(apiStatus) {
  const displayMap = {
    "尚未銷帳": "待入庫",
    "銷帳成功": "已入庫",
    "銷帳失敗": "銷帳失敗",
    "手動入庫確認中": "手動入庫確認中",
    "不入庫": "不入庫"
  };

  return displayMap[apiStatus] || apiStatus || "待入庫";
}

// 交易狀態顯示轉換函數
export function getPaymentStatusDisplay(apiStatus) {
  const displayMap = {
    "尚未繳費": "尚未交易",
    "繳費成功": "交易成功",
    "繳費失敗": "交易失敗",
    "已退費": "交易已退費",
    "已註銷": "交易已註銷",
    "重複繳費": "重複交易"
  };

  return displayMap[apiStatus] || apiStatus || "尚未交易";
}
