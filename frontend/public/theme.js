// Apply the preferred theme before Angular starts to avoid a bright flash.
(() => {
  let saved;
  try {
    saved = localStorage.getItem('solano-theme');
  } catch {
    /* Storage may be blocked. */
  }
  const theme =
    saved === 'light' || saved === 'dark'
      ? saved
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
  document.documentElement.dataset.theme = theme;
})();
