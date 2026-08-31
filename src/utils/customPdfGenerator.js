/**
 * 自訂 PDF 生成器 - 適用於非表格格式的報表
 * 專門用於生成類似 report9.md 格式的報表
 */
import jsPDF from "jspdf";

export class CustomPDFGenerator {
  constructor() {
    this.doc = null;
    this.currentY = 30; // 當前Y座標
    this.pageWidth = 210; // A4 寬度
    this.pageHeight = 297; // A4 高度
    this.margin = 20; // 頁面邊距
    this.lineHeight = 8; // 行高
    this.titleFontSize = 18;
    this.normalFontSize = 12;
    this.smallFontSize = 10;
  }

  /**
   * 初始化 PDF 文件
   */
  async initPDF() {
    // 動態載入字體
    await import("@/views/main/report/font/NotoSerifTC-Regular-normal.js");

    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // 設定字體
    try {
      this.doc.setFont("NotoSerifTC");
    } catch (e) {
      console.warn("無法載入 NotoSerifTC 字體，使用預設字體", e);
    }
  }

  /**
   * 檢查是否需要換頁
   * @param {number} requiredHeight - 需要的高度
   * @returns {boolean} 是否換頁了
   */
  checkPageBreak(requiredHeight = 20) {
    if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
      return true;
    }
    return false;
  }

  /**
   * 添加標題
   * @param {string} title - 標題文字
   */
  addTitle(title) {
    this.doc.setFontSize(this.titleFontSize);
    this.doc.setFont("NotoSerifTC", "bold");

    // 標題居中
    const titleWidth = this.doc.getTextWidth(title);
    const titleX = (this.pageWidth - titleWidth) / 2;

    this.doc.text(title, titleX, this.currentY);
    this.currentY += this.lineHeight * 2; // 標題後留更多空間

    // 恢復一般字體
    this.doc.setFont("NotoSerifTC", "normal");
    this.doc.setFontSize(this.normalFontSize);
  }

  /**
   * 添加日期資訊
   * @param {string} selectedDate - 選擇的日期
   */
  addDateInfo(selectedDate) {
    this.checkPageBreak();

    this.doc.setFontSize(this.normalFontSize);
    
    // 查詢日期置中
    const queryDateText = `查詢日期：${selectedDate}`;
    const queryDateWidth = this.doc.getTextWidth(queryDateText);
    const queryDateX = (this.pageWidth - queryDateWidth) / 2;
    this.doc.text(queryDateText, queryDateX, this.currentY);
    this.currentY += this.lineHeight * 1.5;

    // 添加產生日期
    const now = new Date();
    const generateDate = `${now.getFullYear()}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now.getDate().toString().padStart(2, "0")} `;

    // 匯出日期置中
    const exportDateText = `匯出日期：${generateDate}`;
    const exportDateWidth = this.doc.getTextWidth(exportDateText);
    const exportDateX = (this.pageWidth - exportDateWidth) / 2;
    this.doc.text(exportDateText, exportDateX, this.currentY);
    this.currentY += this.lineHeight * 2;
  }

  /**
   * 添加區塊標題
   * @param {string} title - 區塊標題
   */
  addSectionTitle(title) {
    this.checkPageBreak();

    this.doc.setFontSize(this.normalFontSize);
    this.doc.setFont("NotoSerifTC", "bold");
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += this.lineHeight * 1.2;

    // 恢復一般字體
    this.doc.setFont("NotoSerifTC", "normal");
  }

  /**
   * 添加繳費交易統計
   * @param {object} paymentStats - 繳費統計資料
   */
  addPaymentStats(paymentStats) {
    this.addSectionTitle("繳費交易筆數");

    this.checkPageBreak();

    // 總筆數
    const totalText = `總筆數：${this.formatNumber(paymentStats.total)}筆`;
    this.doc.text(totalText, this.margin + 5, this.currentY);
    this.currentY += this.lineHeight;

    // 各支付方式詳細
    const detailText = `(聯信${this.formatNumber(
      paymentStats.unionpay
    )}筆、悠遊付${this.formatNumber(
      paymentStats.easyWallet
    )}筆、一卡通${this.formatNumber(
      paymentStats.ipass
    )}筆、台銀代收${this.formatNumber(paymentStats.bankCollection)}筆)`;

    // 處理長文字換行
    const maxWidth = this.pageWidth - this.margin * 2 - 5;
    const textLines = this.doc.splitTextToSize(detailText, maxWidth);

    textLines.forEach((line) => {
      this.checkPageBreak();
      this.doc.text(line, this.margin + 5, this.currentY);
      this.currentY += this.lineHeight;
    });

    this.currentY += this.lineHeight * 0.5; // 區塊間距
  }

  /**
   * 添加對帳(請款)統計
   * @param {object} reconcileStats - 對帳統計資料
   */
  addReconcileStats(reconcileStats) {
    this.addSectionTitle("●對帳(請款)筆數(每日批次對帳)");

    const channels = [
      { key: "unionpay", name: "聯信", prefix: "請款" },
      { key: "easyWallet", name: "悠遊付", prefix: "" },
      { key: "ipass", name: "一卡通", prefix: "" },
      { key: "bankCollection", name: "台銀代收", prefix: "" },
    ];

    channels.forEach((channel) => {
      this.checkPageBreak();

      const stats = reconcileStats[channel.key];
      const prefixText = channel.prefix ? `${channel.prefix}` : "";
      const text = `${channel.name}：${prefixText}${this.formatNumber(
        stats.total
      )}筆(成功${this.formatNumber(stats.success)}筆、異常${this.formatNumber(
        stats.error
      )}筆)`;

      this.doc.text(text, this.margin + 5, this.currentY);
      this.currentY += this.lineHeight;
    });

    this.currentY += this.lineHeight * 0.5; // 區塊間距
  }

  /**
   * 添加銷帳入庫統計
   * @param {object} writeOffStats - 銷帳統計資料
   */
  addWriteOffStats(writeOffStats) {
    this.addSectionTitle("●銷帳入庫(前一日)");

    this.checkPageBreak();

    // 銷帳日期
    this.doc.text(
      `銷帳日期：${writeOffStats.writeOffDate || "無資料"}`,
      this.margin + 5,
      this.currentY
    );
    this.currentY += this.lineHeight * 1.2;

    // 預計匯款週期
    this.doc.text(
      `預計匯款週期(日)：${writeOffStats.expectedTransferPeriod || "無資料"}`,
      this.margin + 10,
      this.currentY
    );
    this.currentY += this.lineHeight;

    // 預計匯款金額
    const totalAmount = this.formatNumber(writeOffStats.expectedAmount.total);
    const unionpayAmount = this.formatNumber(
      writeOffStats.expectedAmount.unionpay
    );
    const easyWalletAmount = this.formatNumber(
      writeOffStats.expectedAmount.easyWallet
    );
    const ipassAmount = this.formatNumber(writeOffStats.expectedAmount.ipass);
    const bankCollectionAmount = this.formatNumber(
      writeOffStats.expectedAmount.bankCollection
    );

    const amountText1 = `預計匯款金額：合計${totalAmount}元`;
    this.doc.text(amountText1, this.margin + 10, this.currentY);
    this.currentY += this.lineHeight;

    const amountText2 = `(聯信${unionpayAmount}元、悠遊付${easyWalletAmount}元、一卡通${ipassAmount}元、台銀代收${bankCollectionAmount}元)`;

    // 處理長文字換行
    const maxWidth = this.pageWidth - this.margin * 2 - 10;
    const amountLines = this.doc.splitTextToSize(amountText2, maxWidth);

    amountLines.forEach((line) => {
      this.checkPageBreak();
      this.doc.text(line, this.margin + 10, this.currentY);
      this.currentY += this.lineHeight;
    });

    this.currentY += this.lineHeight * 0.5;

    // 銷帳入庫筆數及金額
    this.doc.text("銷帳入庫筆數及金額：", this.margin + 5, this.currentY);
    this.currentY += this.lineHeight;

    const successCount = this.formatNumber(
      writeOffStats.writeOffResult.successCount
    );
    const errorCount = this.formatNumber(
      writeOffStats.writeOffResult.errorCount
    );
    const successAmount = this.formatNumber(
      writeOffStats.writeOffResult.successAmount
    );
    const errorAmount = this.formatNumber(
      writeOffStats.writeOffResult.errorAmount
    );

    this.doc.text(
      `銷帳成功筆數${successCount}筆、銷帳異常(未銷帳)筆數${errorCount}筆`,
      this.margin + 10,
      this.currentY
    );
    this.currentY += this.lineHeight;

    this.doc.text(
      `銷帳成功金額${successAmount}元、銷帳異常金額${errorAmount}元`,
      this.margin + 10,
      this.currentY
    );
    this.currentY += this.lineHeight;
  }

  /**
   * 格式化數字 (千分位)
   * @param {number} num - 數字
   * @returns {string} 格式化後的字串
   */
  formatNumber(num) {
    if (!num && num !== 0) return "0";
    return new Intl.NumberFormat().format(num);
  }

  /**
   * 添加頁尾
   */
  addFooter() {
    const totalPages = this.doc.internal.getNumberOfPages();

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      this.doc.setPage(pageNum);
      this.doc.setFontSize(this.smallFontSize);

      // 添加頁碼
      if (totalPages >= 1) {
        this.doc.text(
          `第 ${pageNum} 頁，共 ${totalPages} 頁`,
          this.pageWidth - this.margin,
          this.pageHeight - 10,
          { align: "right" }
        );
      }
    }
  }

  /**
   * 生成並下載 PDF
   * @param {object} reportData - 報表資料
   * @param {string} selectedDate - 選擇的日期
   * @param {string} fileName - 檔案名稱
   * @returns {Promise} Promise 物件
   */
  async generatePDF(
    reportData,
    selectedDate,
    fileName = "繳費對帳銷帳統計日報表"
  ) {
    try {
      // 初始化 PDF
      await this.initPDF();

      // 添加標題
      this.addTitle("繳費、對帳及銷帳成功異常統計日報表");

      // 添加日期資訊
      this.addDateInfo(selectedDate);

      // 添加各個區塊
      this.addPaymentStats(reportData.paymentStats);
      this.addReconcileStats(reportData.reconcileStats);
      this.addWriteOffStats(reportData.writeOffStats);

      // 添加頁尾
      this.addFooter();

      // 下載 PDF
      this.doc.save(`${fileName}.pdf`);

      return { success: true, message: "PDF 已成功下載" };
    } catch (error) {
      console.error("PDF生成錯誤:", error);
      return { success: false, message: `PDF生成失敗: ${error.message}` };
    }
  }

  /**
   * 獲取當前 PDF 文件
   * @returns {jsPDF} PDF 文件物件
   */
  getDocument() {
    return this.doc;
  }
}

/**
 * 便利函數：快速生成自訂格式 PDF
 * @param {object} reportData - 報表資料
 * @param {string} selectedDate - 選擇的日期
 * @param {string} fileName - 檔案名稱
 * @returns {Promise} Promise 物件
 */
export const generateCustomPDF = async (reportData, selectedDate, fileName) => {
  const generator = new CustomPDFGenerator();
  return await generator.generatePDF(reportData, selectedDate, fileName);
};

export default CustomPDFGenerator;
