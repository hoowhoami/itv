import { useAppStore, useProxyStore, useSiteStore, useParserStore, useDriveStore } from '@/store';
import { INTERNAL_APP_CONFIG, INTERNAL_PROXIES, INTERNAL_API_SITES, INTERNAL_PARSERS, INTERNAL_DRIVES } from '@/config';

export const useConfig = () => {
  const appStore = useAppStore();
  const proxyStore = useProxyStore();
  const siteStore = useSiteStore();
  const parserStore = useParserStore();
  const driveStore = useDriveStore();

  return {
    init: async () => {
      return new Promise((resolve) => {
        if (!appStore.getAuthBaseUrl) {
          const { AUTH_BASE_URL } = INTERNAL_APP_CONFIG;
          appStore.setAppConfig({
            AUTH_BASE_URL,
          });
        }

        if (INTERNAL_PROXIES.length && !proxyStore.getProxies.length) {
          INTERNAL_PROXIES.forEach((proxy) => {
            proxyStore.addProxy(proxy);
          });
          proxyStore.setSelected(INTERNAL_PROXIES[0].key);
        }
        if (INTERNAL_API_SITES.length && !siteStore.getSites.length) {
          INTERNAL_API_SITES.forEach((site) => {
            siteStore.addSite(site);
          });
          siteStore.setSelected(INTERNAL_API_SITES.map((site) => site.key));
        }
        if (INTERNAL_PARSERS.length && !parserStore.getParsers.length) {
          INTERNAL_PARSERS.forEach((parser) => {
            parserStore.addParser(parser);
          });
        }
        if (INTERNAL_DRIVES.length && !driveStore.getDrives.length) {
          INTERNAL_DRIVES.forEach((drive) => {
            driveStore.addDrive(drive);
          });
          driveStore.setSelected(INTERNAL_DRIVES.map((drive) => drive.key));
        }

        resolve(true);
      });
    },
  };
};
