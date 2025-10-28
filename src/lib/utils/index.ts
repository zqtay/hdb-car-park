const isDevMode = import.meta.env.DEV;

export const log = (...args: any[]) => {
  if (!isDevMode) return;
  console.debug(...args);
};