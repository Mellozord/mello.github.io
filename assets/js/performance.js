const miltimer = () => {
  window.miltimer = 0;

  setInterval(() => {
    window.miltimer = window.miltimer + 1;
  }, 1);
};

const queuer_preparator = () => {
  window.action_queuer = [];
  window.action_queuer.throttles = [];
  window.action_queuer.debounces = [];
};

const throttle = (func, limit, name, ...vars) => {
  if (!window.action_queuer.throttles[name]) {
    {
      if (typeof func !== "function") return;
      window.action_queuer.throttles[name] = window.miltimer;
      func.apply(...vars);
      return;
    }
  }

  if (window.action_queuer.throttles[name] + limit > window.miltimer) {
    return;
  }

  if (typeof func !== "function") return;
  window.action_queuer.throttles[name] = window.miltimer;
  func.apply(...vars);
};

const debounce = (func, delay, name, ...vars) => {
  if (!window.action_queuer.debounces[name]) {
    window.action_queuer.debounces[name] = setTimeout(() => {
      if (typeof func !== "function") return;
      func.apply(...vars);
    }, delay);

    return;
  }

  clearTimeout(window.action_queuer.debounces[name]);
  window.action_queuer.debounces[name] = setTimeout(() => {
    if (typeof func !== "function") return;
    func.apply(...vars);
  }, delay);
};