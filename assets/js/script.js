window.addEventListener("load", () => {
  miltimer();
  queuer_preparator();
  window.throttler = throttle;
  window.debouncer = debounce;

  setup_scrolls();
});
