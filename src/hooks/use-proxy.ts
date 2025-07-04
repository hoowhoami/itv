import { useAppStore } from '@/store';

const getProxyBaseUrl = () => {
  const appStore = useAppStore();
  const baseUrl = appStore.getProxyBaseUrl;
  if (!baseUrl) {
    throw new Error('Proxy base url is not set');
  }
  return baseUrl;
};

export const useProxy = () => {
  return {
    createProxyUrl,
    fetchWithProxy,
  };
};

const createProxyUrl = (targetUrl: string): string => {
  let baseUrl = getProxyBaseUrl();
  baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  targetUrl = targetUrl.startsWith('/') ? targetUrl.slice(1) : targetUrl;
  return `${baseUrl}/${encodeURIComponent(targetUrl)}`;
};

/**
 * 通过代理地址请求第三方接口
 */
const fetchWithProxy = async (targetUrl: string, options?: RequestInit) => {
  const proxyUrl = createProxyUrl(targetUrl);
  return fetch(proxyUrl, options);
};
