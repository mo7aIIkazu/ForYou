import { siteConfig } from "../config.js";

/** Namespaced, defensive localStorage helpers. The site still works if storage is blocked. */
function fullKey(key) {
  return `${siteConfig.storagePrefix}${key}`;
}

export function readStorage(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(fullKey(key));
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    console.warn(`[ForYou] Could not read saved value for "${key}".`, error);
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(fullKey(key), JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[ForYou] Could not save "${key}" in this browser.`, error);
    return false;
  }
}

export function removeStorage(key) {
  try {
    window.localStorage.removeItem(fullKey(key));
  } catch (error) {
    console.warn(`[ForYou] Could not clear saved value for "${key}".`, error);
  }
}
