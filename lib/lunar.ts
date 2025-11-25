// 简化的农历转换工具（用于演示，生产环境建议使用专业库）
// 这里提供一个基本的农历日期显示

const LUNAR_MONTHS = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
const LUNAR_DAYS = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];

// 简化的农历转换（基于公历日期的简单映射，实际应使用专业算法）
export function getLunarDate(date: Date): string {
  // 这是一个简化版本，实际应该使用专业的农历转换算法
  // 这里使用日期作为简单映射
  const day = date.getDate();
  const month = date.getMonth() + 1;
  
  // 简化的农历日期计算（仅用于演示）
  const lunarDayIndex = (day - 1) % 30;
  const lunarMonthIndex = (month - 1) % 12;
  
  return LUNAR_DAYS[lunarDayIndex];
}

export function getLunarMonth(date: Date): string {
  const month = date.getMonth() + 1;
  const lunarMonthIndex = (month - 1) % 12;
  return LUNAR_MONTHS[lunarMonthIndex];
}

export function getFullLunarDate(date: Date): string {
  const year = date.getFullYear();
  const lunarDay = getLunarDate(date);
  const lunarMonth = getLunarMonth(date);
  
  // 简化的天干地支年份（实际应使用专业算法）
  const ganZhi = ['甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
    '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
    '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
    '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
    '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
    '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'];
  
  const ganZhiIndex = (year - 4) % 60;
  const ganZhiYear = ganZhi[ganZhiIndex];
  
  return `${ganZhiYear}年${lunarMonth}月${lunarDay}`;
}

