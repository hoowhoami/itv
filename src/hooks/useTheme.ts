import { themeManager } from '../utils/theme-manager';

export const useTheme = () => {
    const { theme, switchTheme } = useThemeManager();

    return {
        theme,
        setTheme: switchTheme,
    };
};