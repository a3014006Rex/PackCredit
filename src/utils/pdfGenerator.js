/**
 * PDF 生成器工具類別
 * 提供通用的 PDF 生成功能，支援各種報表類型
 */
import jsPDF from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import { calculateColumnWidths, formatValue } from "./reportConfigs.js";

// 應用 jsPDF 的 autoTable 插件
applyPlugin(jsPDF);

export class PDFGenerator {
  constructor() {
    this.doc = null;
    this.config = null;
    this.dateRange = null; // 保存查詢區間
  }

  /**
   * 計算文字所需的行數和高度
   * @param {string} text - 文字內容
   * @param {number} width - 可用寬度
   * @param {number} fontSize - 字體大小
   * @returns {object} 包含行數、文字陣列和所需高度的物件
   */
  calculateTextDimensions(text, width, fontSize = 9) {
    if (!text || text.length === 0) {
      return { lines: 1, textArray: [""], height: fontSize + 4 };
    }

    // 設定字體大小
    this.doc.setFontSize(fontSize);

    // 計算可用寬度（扣除左右邊距）
    const availableWidth = width - 2; // 左右各留1mm邊距 (調整此值可改變文字寬度)

    // 使用 jsPDF 的 splitTextToSize 方法自動換行
    const textArray = this.doc.splitTextToSize(text, availableWidth);
    const lines = Array.isArray(textArray) ? textArray.length : 1;

    // 計算所需高度：行數 * 行高 + 上下邊距
    const lineHeight = fontSize + 1; // 每行高度 (調整此值可改變行間距)
    const maxHeight = 8;
    const height = Math.max(maxHeight, lines * lineHeight + 2); // 最小高度8mm (調整+2可改變上下邊距)

    return {
      lines,
      textArray: Array.isArray(textArray) ? textArray : [text],
      height,
    };
  }

  /**
   * 智能繪製文字到單元格中
   * @param {string} text - 文字內容
   * @param {number} x - X 座標
   * @param {number} y - Y 座標
   * @param {number} width - 單元格寬度
   * @param {number} height - 單元格高度
   * @param {number} fontSize - 字體大小
   * @param {string} align - 對齊方式
   */
  drawTextInCell(text, x, y, width, height, fontSize = 9, align = "center") {
    if (!text || text.length === 0) return;

    // 設定字體大小
    this.doc.setFontSize(fontSize);

    // 計算文字維度
    const textDimensions = this.calculateTextDimensions(text, width, fontSize);
    const { textArray } = textDimensions;

    // 計算起始 Y 位置（垂直居中）
    const lineHeight = fontSize + 1; // 文字行間距 (調整此值可改變實際繪製的行間距)
    const totalTextHeight = textArray.length * lineHeight;
    const startY = y + (height - totalTextHeight) / 2 + lineHeight * 0.7;

    // 繪製每一行文字
    textArray.forEach((line, index) => {
      const lineY = startY + index * lineHeight;

      // 根據對齊方式計算 X 位置
      let textX;
      switch (align) {
        case "left":
          textX = x + 2;
          break;
        case "right":
          textX = x + width - 2;
          break;
        case "center":
        default:
          textX = x + width / 2;
          break;
      }

      this.doc.text(line, textX, lineY, { align });
    });
  }

  /**
   * 初始化 PDF 文件
   * @param {object} config - 報表配置
   */
  async initPDF(config) {
    await import("@/views/main/report/font/NotoSerifTC-Regular-normal.js");
    this.config = config;
    this.doc = new jsPDF({
      orientation: config.orientation,
      unit: "mm",
      format: config.pageSize.toLowerCase(),
    });

    // 動態載入字體
    try {
      this.doc.setFont("NotoSerifTC");
    } catch (e) {
      console.warn("無法載入 NotoSerifTC 字體，使用預設字體", e);
    }
  }

  /**
   * 計算頁面尺寸
   * @returns {object} 包含寬度和高度的物件
   */
  getPageDimensions() {
    const { pageSize, orientation } = this.config;

    let width, height;
    if (pageSize === "A3") {
      width = orientation === "landscape" ? 420 : 297;
      height = orientation === "landscape" ? 297 : 420;
    } else {
      // A4
      width = orientation === "landscape" ? 297 : 210;
      height = orientation === "landscape" ? 210 : 297;
    }

    return { width, height };
  }

  /**
   * 添加標題
   * @param {string} title - 標題文字
   * @param {string} dateRange - 查詢區間（可選）
   */
  addTitle(title, dateRange = null) {
    const genDate = () => {
      const now = new Date();
      const dateStr = `匯出日期：${now.getFullYear()}/${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${now.getDate().toString().padStart(2, "0")}`;
      return dateStr;
    };

    const { width } = this.getPageDimensions();
    const lastFontSize = this.doc.getFontSize();

    // 繪製主標題
    this.doc.setFontSize(18);
    const newTitle = `${title}`;

    if (dateRange) {
      // 有查詢區間時：計算整體寬度並置中
      this.doc.setFontSize(13); // 設定查詢區間字體大小
      const rangeText = `(查詢區間${dateRange})`;
      const rangeWidth = this.doc.getTextWidth(rangeText);

      this.doc.setFontSize(18); // 恢復主標題字體大小
      const titleWidth = this.doc.getTextWidth(newTitle);

      // 計算整體寬度和起始位置
      const totalWidth = titleWidth + 5 + rangeWidth; // 5mm 間距
      const startX = (width - totalWidth) / 2;

      // 繪製主標題
      this.doc.text(newTitle, startX + titleWidth / 2, 20, { align: "center" });

      // 繪製查詢區間（較小字體）
      this.doc.setFontSize(13);
      this.doc.text(rangeText, startX + titleWidth + 2 + rangeWidth / 2, 20, {
        align: "center",
      });
    } else {
      // 沒有查詢區間時：直接置中
      this.doc.text(newTitle, width / 2, 20, { align: "center" });
    }

    // 在標題下方添加產生報表的日期
    this.doc.setFontSize(11);
    const generateDateText = genDate();
    this.doc.text(generateDateText, width - 9, 28, { align: "right" });

    this.doc.setFontSize(lastFontSize);
  }

  /**
   * 繪製表格
   * @param {Array} data - 表格資料
   * @param {number} startX - 起始 X 座標（可選，會優先使用 config 中的設定）
   * @param {number} startY - 起始 Y 座標（可選，會優先使用 config 中的設定）
   * @param {number} rowHeight - 行高（可選，會優先使用 config 中的設定）
   */
  drawTable(data, startX = 10, startY = 35, rowHeight = 8) {
    let colWidths = calculateColumnWidths(this.config);

    // 從 config 讀取布局參數，如果沒有設定則使用預設值
    const actualStartX = this.config.layout?.startX ?? startX;
    const actualStartY = this.config.layout?.startY ?? startY;
    const actualRowHeight = this.config.layout?.rowHeight ?? rowHeight;

    // 自動縮放欄位寬度以適應頁面
    const { width: pageWidth } = this.getPageDimensions();
    const rightMargin = 10;
    const availableWidth = pageWidth - actualStartX - rightMargin;
    const totalTableWidth = colWidths.reduce((sum, w) => sum + w, 0);

    if (totalTableWidth > availableWidth) {
      const scaleFactor = availableWidth / totalTableWidth;
      colWidths = colWidths.map((w) => w * scaleFactor);
      console.log(
        `表格寬度 (${totalTableWidth}mm) 超出頁面可用寬度 (${availableWidth}mm)，已自動縮放 ${
          Math.round(scaleFactor * 10000) / 100
        }%`
      );
    }

    // 檢查是否支援欄位合併
    if (this.config.supportMergedCells) {
      this.drawTableWithMergedCells(
        data,
        actualStartX,
        actualStartY,
        actualRowHeight,
        colWidths
      );
    } else {
      this.drawRegularTable(
        data,
        actualStartX,
        actualStartY,
        actualRowHeight,
        colWidths
      );
    }
  }

  /**
   * 檢查是否需要換頁（支援合併單元格）
   * @param {number} currentY - 當前 Y 座標
   * @param {number} rowHeight - 行高
   * @param {number} rowIndex - 當前行索引
   * @param {Array} mergeInfo - 合併資訊（可選）
   * @returns {number} 新的 Y 座標
   */
  checkPageBreak(currentY, rowHeight, rowIndex = -1, mergeInfo = null) {
    const MARGIN = 28;
    const { height } = this.getPageDimensions();
    const bottomMargin = MARGIN; // 底部邊距，預留頁尾空間

    let totalHeightNeeded = rowHeight;

    // 如果有合併資訊且是主合併單元格，計算整個合併區塊的高度
    if (mergeInfo && rowIndex >= 0 && this.config.supportMergedCells) {
      const { mergeColumns = [] } = this.config.mergeRules || {};

      // 檢查是否有任何欄位是 master 類型且有 span > 1
      for (let colIndex of mergeColumns) {
        if (mergeInfo[rowIndex] && mergeInfo[rowIndex][colIndex]) {
          const cellMergeInfo = mergeInfo[rowIndex][colIndex];
          if (cellMergeInfo.type === "master" && cellMergeInfo.span > 1) {
            // 這是一個合併區塊的開始，計算整個區塊的高度
            totalHeightNeeded = rowHeight * cellMergeInfo.span;
            // console.log(`檢測到合併區塊，行 ${rowIndex}，span=${cellMergeInfo.span}，總高度需求=${totalHeightNeeded}`);
            break; // 只要有一個合併欄位就夠了
          }
        }
      }
    }

    // 檢查是否會超出頁面
    if (currentY + totalHeightNeeded > height - bottomMargin) {
      // console.log(`需要換頁：currentY=${currentY}, totalHeightNeeded=${totalHeightNeeded}, 頁面高度=${height}, 底部邊距=${bottomMargin}`);

      // 添加新頁面
      this.doc.addPage();

      // 在新頁面添加標題（包含查詢區間）
      this.addTitle(this.config.name, this.dateRange);

      // 重繪表頭（如果有的話）
      if (
        this.config.headerRows > 0 &&
        this.lastHeaderData &&
        this.lastColWidths
      ) {
        const startX = this.config.layout?.startX ?? 10;
        const startY = this.config.layout?.startY ?? 35;
        let headerY = startY;

        // 繪製表頭行
        for (let i = 0; i < this.config.headerRows; i++) {
          if (this.lastHeaderData[i]) {
            // 動態計算表頭行高
            const headerRowHeight = this.calculateRowHeight(
              this.lastHeaderData[i],
              this.lastColWidths,
              i,
              this.config.layout?.rowHeight ?? 8
            );

            // 檢查是否是支付統計報表的第一行（需要特殊處理）
            if (this.config.paymentMethods && i === 0) {
              this.drawPaymentSummaryHeader(
                this.lastHeaderData[i],
                startX,
                headerY,
                headerRowHeight,
                this.lastColWidths
              );
            } else {
              this.drawTableRow(
                this.lastHeaderData[i],
                i,
                startX,
                headerY,
                headerRowHeight,
                this.lastColWidths
              );
            }
            headerY += headerRowHeight;
          }
        }

        return headerY;
      }

      // 如果沒有表頭，返回標準起始位置
      return this.config.layout?.startY ?? MARGIN;
    }

    return currentY;
  }

  /**
   * 計算行的最大高度
   * @param {Array} row - 行資料
   * @param {Array} colWidths - 欄位寬度陣列
   * @param {number} rowIndex - 行索引
   * @param {number} defaultHeight - 預設高度
   * @returns {number} 計算出的行高
   */
  calculateRowHeight(row, colWidths, rowIndex, defaultHeight = 8) {
    let maxHeight = defaultHeight;

    row.forEach((cell, colIndex) => {
      const value = cell === null ? "" : String(cell);
      if (value) {
        const cellWidth = colWidths[colIndex] || 25;
        const fontSize = rowIndex < this.config.headerRows ? 10 : 9;
        const textDimensions = this.calculateTextDimensions(
          value,
          cellWidth,
          fontSize
        );
        maxHeight = Math.max(maxHeight, textDimensions.height);
      }
    });

    return maxHeight;
  }

  /**
   * 繪製一般表格（無合併）- 支援動態行高
   * @param {Array} data - 表格資料
   * @param {number} startX - 起始 X 座標
   * @param {number} startY - 起始 Y 座標
   * @param {number} rowHeight - 預設行高
   * @param {Array} colWidths - 欄位寬度陣列
   */
  drawRegularTable(data, startX, startY, rowHeight, colWidths) {
    let currentY = startY;

    // 保存表頭資料和欄位寬度，用於換頁時重繪
    this.lastHeaderData = data.slice(0, this.config.headerRows);
    this.lastColWidths = colWidths;

    data.forEach((row, rowIndex) => {
      // 計算此行的實際高度
      const actualRowHeight = this.calculateRowHeight(
        row,
        colWidths,
        rowIndex,
        rowHeight
      );

      // 檢查是否需要換頁（表頭行不檢查）
      if (rowIndex >= this.config.headerRows) {
        currentY = this.checkPageBreak(
          currentY,
          actualRowHeight,
          rowIndex,
          null
        );
      }

      this.drawTableRow(
        row,
        rowIndex,
        startX,
        currentY,
        actualRowHeight,
        colWidths
      );
      currentY += actualRowHeight;
    });
  }

  /**
   * 繪製支援欄位合併的表格 - 支援動態行高
   * @param {Array} data - 表格資料
   * @param {number} startX - 起始 X 座標
   * @param {number} startY - 起始 Y 座標
   * @param {number} rowHeight - 預設行高
   * @param {Array} colWidths - 欄位寬度陣列
   */
  drawTableWithMergedCells(data, startX, startY, rowHeight, colWidths) {
    let currentY = startY;
    const mergeInfo = this.calculateMergeInfo(data);

    // 保存表頭資料和欄位寬度，用於換頁時重繪
    this.lastHeaderData = data.slice(0, this.config.headerRows);
    this.lastColWidths = colWidths;

    data.forEach((row, rowIndex) => {
      // 計算此行的實際高度
      const actualRowHeight = this.calculateRowHeight(
        row,
        colWidths,
        rowIndex,
        rowHeight
      );

      // 檢查是否需要換頁（表頭行不檢查）
      if (rowIndex >= this.config.headerRows) {
        // 傳入合併資訊進行智能換頁檢查
        currentY = this.checkPageBreak(
          currentY,
          actualRowHeight,
          rowIndex,
          mergeInfo
        );
      }

      this.drawMergedTableRow(
        row,
        rowIndex,
        startX,
        currentY,
        actualRowHeight,
        colWidths,
        mergeInfo
      );
      currentY += actualRowHeight;
    });
  }

  /**
   * 計算合併資訊
   * @param {Array} data - 表格資料
   * @returns {Array} 合併資訊陣列
   */
  calculateMergeInfo(data) {
    const mergeInfo = [];
    const { mergeColumns = [] } = this.config.mergeRules || {};

    // 調試：打印初始資訊
    // console.log("=== calculateMergeInfo 調試資訊 ===");
    // console.log("data:", data);
    // console.log("mergeColumns:", mergeColumns);
    // console.log("headerRows:", this.config.headerRows);

    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      mergeInfo[rowIndex] = [];

      for (let colIndex = 0; colIndex < data[rowIndex].length; colIndex++) {
        const shouldMerge = mergeColumns.includes(colIndex);
        const currentValue = data[rowIndex][colIndex];

        // 調試：打印每個單元格的處理資訊
        // console.log(`處理單元格 [${rowIndex}][${colIndex}]:`, {
        //   shouldMerge,
        //   currentValue,
        //   isAfterHeader: rowIndex >= this.config.headerRows,
        // });

        if (shouldMerge && rowIndex >= this.config.headerRows) {
          if (currentValue === null) {
            // 找到最近的非 null 值來判斷是否應該合併
            let foundMasterRow = -1;
            for (
              let prevRowIndex = rowIndex - 1;
              prevRowIndex >= 0;
              prevRowIndex--
            ) {
              const prevValue = data[prevRowIndex][colIndex];
              if (prevValue !== null) {
                foundMasterRow = prevRowIndex;
                break;
              }
            }

            // 如果找到了非 null 的主行，且該行是 master 類型，則標記為 merged
            if (
              foundMasterRow >= 0 &&
              foundMasterRow >= this.config.headerRows
            ) {
              mergeInfo[rowIndex][colIndex] = {
                type: "merged",
                skipDraw: true,
              };
              // console.log(`  -> 設為 merged (找到主行在 ${foundMasterRow})`);
            } else {
              mergeInfo[rowIndex][colIndex] = { type: "normal" };
              // console.log(`  -> 設為 normal (沒有找到有效的主行)`);
            }
          } else {
            let span = 1;
            let nextRowIndex = rowIndex + 1;
            while (
              nextRowIndex < data.length &&
              data[nextRowIndex][colIndex] === null
            ) {
              span++;
              nextRowIndex++;
            }
            mergeInfo[rowIndex][colIndex] = { type: "master", span };
            // console.log(`  -> 設為 master, span=${span}`);
          }
        } else {
          mergeInfo[rowIndex][colIndex] = { type: "normal" };
          // console.log(`  -> 設為 normal (不合併欄位或表頭)`);
        }
      }
    }

    // console.log("最終 mergeInfo:", mergeInfo);
    // console.log("=== calculateMergeInfo 調試結束 ===");
    return mergeInfo;
  }

  /**
   * 繪製支援合併的表格行
   * @param {Array} row - 行資料
   * @param {number} rowIndex - 行索引
   * @param {number} startX - 起始 X 座標
   * @param {number} currentY - 當前 Y 座標
   * @param {number} rowHeight - 行高
   * @param {Array} colWidths - 欄位寬度陣列
   * @param {Array} mergeInfo - 合併資訊
   */
  drawMergedTableRow(
    row,
    rowIndex,
    startX,
    currentY,
    rowHeight,
    colWidths,
    mergeInfo
  ) {
    let currentX = startX;

    // 設定字體大小
    const fontSize = rowIndex < this.config.headerRows ? 10 : 9;
    this.doc.setFontSize(fontSize);

    row.forEach((cell, colIndex) => {
      const cellWidth = colWidths[colIndex] || 25;
      const cellMergeInfo = mergeInfo[rowIndex][colIndex];

      // 完全跳過被合併的單元格（不繪製邊框，不繪製內容）
      if (cellMergeInfo.type === "merged" && cellMergeInfo.skipDraw) {
        currentX += cellWidth;
        return;
      }

      let cellHeight = rowHeight;

      // 如果是主合併單元格，調整高度
      if (cellMergeInfo.type === "master" && cellMergeInfo.span > 1) {
        cellHeight = rowHeight * cellMergeInfo.span;
      }

      // 繪製單元格
      this.drawMergedTableCell(
        cell,
        currentX,
        currentY,
        cellWidth,
        cellHeight,
        rowIndex,
        cellMergeInfo
      );
      currentX += cellWidth;
    });
  }

  /**
   * 繪製合併表格單元格
   * @param {*} cellValue - 單元格值
   * @param {number} x - X 座標
   * @param {number} y - Y 座標
   * @param {number} width - 寬度
   * @param {number} height - 高度
   * @param {number} rowIndex - 行索引
   * @param {object} mergeInfo - 合併資訊
   */
  drawMergedTableCell(cellValue, x, y, width, height, rowIndex, mergeInfo) {
    const value = cellValue === null ? "" : String(cellValue);

    // 總是繪製邊框（包括 master 和 normal 類型）
    this.doc.rect(x, y, width, height);

    // 填入文字 - 處理所有有內容的單元格
    if (value && value !== "") {
      // 根據行類型設定字體大小
      const fontSize = rowIndex < this.config.headerRows ? 10 : 9;

      // 使用智能文字繪製
      this.drawTextInCell(value, x, y, width, height, fontSize, "center");
    }
  }

  /**
   * 繪製表格行
   * @param {Array} row - 行資料
   * @param {number} rowIndex - 行索引
   * @param {number} startX - 起始 X 座標
   * @param {number} currentY - 當前 Y 座標
   * @param {number} rowHeight - 行高
   * @param {Array} colWidths - 欄位寬度陣列
   */
  drawTableRow(row, rowIndex, startX, currentY, rowHeight, colWidths) {
    let currentX = startX;

    // 設定字體大小
    const fontSize = rowIndex < this.config.headerRows ? 10 : 9;
    this.doc.setFontSize(fontSize);

    // 特殊處理有合併表頭的情況（如支付統計報表）
    if (this.config.paymentMethods && rowIndex === 0) {
      this.drawPaymentSummaryHeader(
        row,
        currentX,
        currentY,
        rowHeight,
        colWidths
      );
    } else {
      // 一般表格繪製
      row.forEach((cell, colIndex) => {
        const cellWidth = colWidths[colIndex] || 25;
        this.drawTableCell(
          cell,
          currentX,
          currentY,
          cellWidth,
          rowHeight,
          rowIndex
        );
        currentX += cellWidth;
      });
    }
  }

  /**
   * 繪製表格單元格
   * @param {*} cellValue - 單元格值
   * @param {number} x - X 座標
   * @param {number} y - Y 座標
   * @param {number} width - 寬度
   * @param {number} height - 高度
   * @param {number} rowIndex - 行索引
   */
  drawTableCell(cellValue, x, y, width, height, rowIndex) {
    const value = cellValue === null ? "" : String(cellValue);

    // 繪製邊框
    this.doc.rect(x, y, width, height);

    // 填入文字
    if (value) {
      // 根據行類型設定字體大小
      const fontSize = rowIndex < this.config.headerRows ? 10 : 9;

      // 使用智能文字繪製
      this.drawTextInCell(value, x, y, width, height, fontSize, "center");
    }
  }

  /**
   * 繪製支付統計報表的合併表頭
   * @param {Array} row - 表頭行資料
   * @param {number} startX - 起始 X 座標
   * @param {number} currentY - 當前 Y 座標
   * @param {number} rowHeight - 行高
   * @param {Array} colWidths - 欄位寬度陣列
   */
  drawPaymentSummaryHeader(row, startX, currentY, rowHeight, colWidths) {
    let currentX = startX;

    // 計算前置欄位數量（非Sub的欄位）
    const nonPaymentColumns = this.config.columns.filter(
      (col) => col.isSub !== true
    );
    const prefixColumnCount = nonPaymentColumns.length;

    // 繪製前置欄位（非支付方式欄位）
    for (let colIndex = 0; colIndex < prefixColumnCount; colIndex++) {
      const cellWidth = colWidths[colIndex];
      const cellValue = row[colIndex] || "";

      this.doc.rect(currentX, currentY, cellWidth, rowHeight);

      if (cellValue) {
        // 使用智能文字繪製
        this.drawTextInCell(
          cellValue,
          currentX,
          currentY,
          cellWidth,
          rowHeight,
          10,
          "center"
        );
      }

      currentX += cellWidth;
    }

    // 繪製合併的支付方式欄位
    this.config.paymentMethods.forEach((method, index) => {
      // 動態計算每個支付方式的子欄位數量
      const paymentColumns = this.config.columns.filter(
        (col) => col.isSub === true
      );
      
      // 如果沒有子欄位定義，則不繪製支付方式表頭
      if (paymentColumns.length === 0) return;

      const subColumnCount = paymentColumns[0].subColumns.length;

      // 計算支付方式欄位在 colWidths 中的起始索引
      const startIndex = prefixColumnCount + index * subColumnCount;

      // 動態計算合併寬度 (累加所有子欄位的寬度)
      let methodWidth = 0;
      for (let i = 0; i < subColumnCount; i++) {
        methodWidth += colWidths[startIndex + i] || 0;
      }

      // 只有當寬度大於 0 時才繪製
      if (methodWidth > 0) {
        this.doc.rect(currentX, currentY, methodWidth, rowHeight);

        // 使用智能文字繪製支付方式名稱
        this.drawTextInCell(
          method,
          currentX,
          currentY,
          methodWidth,
          rowHeight,
          9,
          "center"
        );

        currentX += methodWidth;
      }
    });
  }

  /**
   * 添加頁尾資訊到所有頁面
   */
  addFooter() {
    const { width, height } = this.getPageDimensions();
    const totalPages = this.doc.internal.getNumberOfPages();

    // 遍歷所有頁面添加頁尾
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      this.doc.setPage(pageNum);
      this.doc.setFontSize(8);

      // 添加頁碼
      if (totalPages >= 1) {
        this.doc.text(
          `第 ${pageNum} 頁，共 ${totalPages} 頁`,
          width - 20,
          height - 12,
          { align: "right" }
        );
      }
    }
  }

  /**
   * 生成並下載 PDF
   * @param {Array} data - 表格資料
   * @param {object} config - 報表配置
   * @param {string} dateRange - 查詢區間（可選，格式：YYYY-MM-DD~YYYY-MM-DD）
   * @returns {Promise} Promise 物件
   */
  async generatePDF(data, config, dateRange = null) {
    try {
      // 初始化 PDF
      ElMessage("開始載入PDF套件(首次載入可能因網速較慢有影響)");
      await this.initPDF(config);
      ElMessage("完成載入PDF套件");

      // 保存查詢區間供換頁時使用
      this.dateRange = dateRange;

      // 添加標題（包含查詢區間）
      this.addTitle(config.name, dateRange);

      // 繪製表格
      this.drawTable(data);

      // 添加頁尾
      this.addFooter();

      // 下載 PDF
      this.doc.save(config.fileName);

      return { success: true, message: `${config.name} 已成功下載` };
    } catch (error) {
      console.error("PDF生成錯誤:", error);
      return { success: false, message: `PDF生成失敗: ${error.message}` };
    }
  }

  /**
   * 添加自訂內容
   * @param {Function} customDrawFunction - 自訂繪製函數
   */
  addCustomContent(customDrawFunction) {
    if (typeof customDrawFunction === "function") {
      customDrawFunction(this.doc, this.config);
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
 * 便利函數：快速生成 PDF
 * @param {Array} data - 表格資料
 * @param {object} config - 報表配置
 * @param {string} dateRange - 查詢區間（可選）
 * @returns {Promise} Promise 物件
 */
export const quickGeneratePDF = async (data, config, dateRange = null) => {
  const generator = new PDFGenerator();
  return await generator.generatePDF(data, config, dateRange);
};

export default PDFGenerator;
