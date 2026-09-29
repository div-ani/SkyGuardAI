/* useTheme – returns a function that flips light <-> dark.
   It sets data-theme on <html>, which css/styles.css reacts to. */
SkyGuard.useTheme = function () {
  return () => {
    const root = document.documentElement;
    const current = root.dataset.theme ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    root.dataset.theme = current === 'dark' ? 'light' : 'dark';
  };
};
