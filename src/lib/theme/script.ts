import {
  DARK_SCHEME_QUERY,
  DEFAULT_THEME_MODE,
  RESOLVED_THEMES,
  THEME_STORAGE_KEY,
} from './constants';

const storageKey = JSON.stringify(THEME_STORAGE_KEY);
const defaultMode = JSON.stringify(DEFAULT_THEME_MODE);
const darkSchemeQuery = JSON.stringify(DARK_SCHEME_QUERY);
const themeClasses = RESOLVED_THEMES.map((theme) => JSON.stringify(theme)).join(
  `,`,
);

/**
 * Blocking bootstrap script, rendered in `<head>` by the root layout.
 *
 * It runs before the first paint and before React hydrates, writing the
 * resolved theme class to `<html>` so a dark-mode visitor never sees a flash of
 * the light theme. It mirrors `ThemeStore` exactly; any change to how a theme
 * is resolved must be made in both places.
 *
 * Kept tiny, dependency-free and wrapped in `try` so a blocked `localStorage`
 * (private mode, disabled cookies) degrades to the OS preference.
 */
export const themeInitScript = `(function(){try{var d=document.documentElement,m=localStorage.getItem(${storageKey});if(m!=="light"&&m!=="dark"){m=${defaultMode}}var r=m==="system"?(window.matchMedia(${darkSchemeQuery}).matches?"dark":"light"):m;d.classList.remove(${themeClasses});d.classList.add(r)}catch(e){}})();`;
