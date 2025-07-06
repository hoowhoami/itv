// 保留字母、数字、中文，移除其他字符
export const clearString = (str: string) => {
  return str.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '');
};
