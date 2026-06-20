/**
 * 取得指定日期的 ISO 8601 週數 (Week Number)。
 * 第一週為該年中包含星期四的第一個星期。
 *
 * Edge cases 處理：
 * 1. 跨年份的日期可能會被歸類在前一年的最後一週，或新年的第一週。
 * 
 * @param {Date} date - 欲計算的日期物件。
 * @returns {number} 該日期對應的週數 (1~53)。
 */
export const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

/**
 * 將日期物件格式化為「月/日」的字串形式。
 * 注意：月份沒有補零（例如：1/5、12/10）。
 *
 * @param {Date} date - 欲格式化的日期物件。
 * @returns {string} 格式化後的字串，格式為 'M/D'。
 */
export const formatDate = (date) => `${date.getMonth() + 1}/${date.getDate()}`;

/**
 * 取得指定日期在星期中的對應中文名稱。
 *
 * @param {Date} date - 欲取得星期名稱的日期物件。
 * @returns {string} 該日期的中文星期名稱（如：'日', '一', '二', 等）。
 */
export const getDayName = (date) => ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
