import { useColorMode } from '@vueuse/core';

export const useTheme = () => {
  const mode = useColorMode();
  return {
    colorMode: mode,
    switchTheme: (themeName: 'light' | 'dark' | 'auto') => {
      mode.value = themeName;
    }
  };
};
