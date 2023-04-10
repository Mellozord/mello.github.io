import { debounce, throttle } from "./performance.js";

const the_content_mover = (scroller, anchor, content) => {
  let anchorCalc, contentCalc;

  if (scroller.attributes.horizontal) {
    anchorCalc =
      anchor.offsetLeft / (scroller.scrollWidth - anchor.scrollWidth);
    contentCalc = anchorCalc * (content.scrollWidth - scroller.scrollWidth);
    // contentCalc =
    //   anchorCalc *
    //   (content.scrollWidth -
    //     content.scrollWidth * (scroller.scrollWidth / content.scrollWidth));
  } else {
    anchorCalc =
      anchor.offsetTop / (scroller.scrollHeight - anchor.scrollHeight);
    contentCalc =
      anchorCalc *
      (content.scrollHeight -
        content.scrollHeight * (scroller.scrollHeight / content.scrollHeight));
  }

  let finalCalc = contentCalc;

  if (scroller.attributes.horizontal) {
    content.style.marginLeft = `-${finalCalc}px`;
  } else {
    content.style.marginTop = `-${finalCalc}px`;
  }

  if (scroller.attributes.breakpoints) {
    if (!window.breakpointings) window.breakpointings = [];

    if (!content.attributes.subdomain) {
      content.setAttribute("subdomain", Math.floor(Math.random() * 100));
    }

    let subdomain = content.attributes.subdomain.value;

    if (!window.breakpointings[subdomain])
      window.breakpointings[subdomain] = [];

    if (window.breakpointings[subdomain])
      clearTimeout(window.breakpointings[subdomain]);
    window.breakpointings[subdomain] = setTimeout(() => {
      breakpoints_mover(scroller, anchor, content);
    }, 700);
  }

  // if (content.localName === "virtual") {
  //   if (!window.virtualization) window.virtualization = [];
  //   if (!window.virtualization[content.attributes.subdomain.value])
  //     window.virtualization[content.attributes.subdomain.value] = [];

  //   if (window.virtualization[content.attributes.subdomain.value])
  //     clearTimeout(window.virtualization[content.attributes.subdomain.value]);
  //   window.virtualization[content.attributes.subdomain.value] = setTimeout(
  //     () => {
  //       virtualization(content);
  //     },
  //     700
  //   );
  // }
};

const scrollings_pure = (
  direction = "vertical",
  scroller,
  anchor,
  virtual,
  movement = 0,
  debounce_delay = 5
) => {
  let stylings, offsetings;

  if (direction === "horizontal") {
    stylings = "left";
    offsetings = ["Width", "Left"];
  } else {
    stylings = "top";
    offsetings = ["Height", "Top"];
  }

  let size = scroller[`client${offsetings[0]}`];
  let anchorSize = anchor[`scroll${offsetings[0]}`];

  let calc = anchor[`client${offsetings[0]}`];
  let old = anchor[`offset${offsetings[1]}`];

  let movethis = old + movement;

  if (movethis < 0) {
    anchor.style[`${stylings}`] = `0px`;
  }

  if (movethis > 0 && movethis + anchorSize < size) {
    anchor.style[`${stylings}`] = `${movethis}px`;
  }

  if (movethis + anchorSize > size) {
    anchor.style[`${stylings}`] = `${size - calc - 1}px`;
  }

  debounce(
    the_content_mover(scroller, anchor, virtual),
    debounce_delay,
    "movings"
  );
};

const smoothings = (
  direction = "vertical",
  scroller,
  anchor,
  virtual,
  movement = 0,
  delay = 5,
  debounce_delay = 5,
  increments = 5
) => {
  if (window.smoothscroller) {
    clearInterval(window.smoothscroller);
  }

  let stylings, offsetings;

  if (direction === "horizontal") {
    stylings = "left";
    offsetings = ["Width", "Left"];
  } else {
    stylings = "top";
    offsetings = ["Height", "Top"];
  }

  let size = scroller[`scroll${offsetings[0]}`];
  let anchorSize = anchor[`scroll${offsetings[0]}`];

  let calc = anchor[`client${offsetings[0]}`];
  let old = anchor[`offset${offsetings[1]}`];
  let smoothed = 0;

  window.smoothscroller = setInterval(() => {
    if (movement > 0) {
      if (smoothed >= movement) {
        smoothed = movement;
        clearInterval(window.smoothscroller);
      } else {
        smoothed = smoothed + increments;
      }
    }

    if (movement < 0) {
      if (smoothed <= movement) {
        smoothed = movement;
        clearInterval(window.smoothscroller);
      } else {
        smoothed = smoothed - increments;
      }
    }

    let movethis = old + smoothed;

    if (movethis < 0) {
      anchor.style[`${stylings}`] = `0px`;
    }

    if (movethis >= 0) {
      anchor.style[`${stylings}`] = `${movethis}px`;
    }

    if (movethis + anchorSize > size) {
      anchor.style[`${stylings}`] = `${size - calc - 1}px`;
    }

    debounce(
      the_content_mover(scroller, anchor, virtual),
      debounce_delay,
      "movings"
    );
  }, delay);
};

const virtualization = (content) => {
  let height = content.scrollHeight;
  let viewport = content.parentElement.clientHeight;
  let offset = Math.abs(content.offsetTop);

  let data = {
    height,
    viewport,
    offset,
  };

  content.dispatchEvent(new CustomEvent("repopulate", { detail: data }));
};

const breakpoints_mover = (scroller, anchor, content) => {
  if (!content.current) {
    content.current = 0;
  }

  let breakpoint, item, total;

  if (scroller.attributes.horizontal) {
    item = content.scrollWidth / content.children.length;
    total = content.scrollWidth / item;
  } else {
    item = content.scrollHeight / content.children.length;
    total = content.scrollHeight / item;
  }

  breakpoint = item * 0.4;

  let old, destination, movement;

  if (scroller.attributes.horizontal) {
    let current = Math.floor(Math.abs(content.offsetLeft - breakpoint) / item);

    if (current === content.current) return;
    content.current = current;

    let percentage = scroller.clientWidth / content.scrollWidth;

    old = anchor.offsetLeft;
    destination = item * current * percentage;

    movement = destination - old - 0.2 * total;

    smoothings("horizontal", scroller, anchor, content, movement, 1, 66, 1);
  }
};

const set_touch_events = () => {
  document.addEventListener("touchstart", (e) => {
    if (!window.ongoingtouches) {
      window.ongoingtouches = [];
    }

    window.ongoingtouches.push(e);

    if (!window.scrollertoucher) {
      window.scrollertoucher = [];
    }

    let parent = e.path[0].closest(".has-scroller");
    if (!parent) return;

    if (parent.attributes.horizontal && e.target.localName !== "offset")
      parent = parent.parentElement.closest(".has-scroller");
    if (!parent) return;

    window.scrollertoucher[0] = e.touches[0].clientX;
    window.scrollertoucher[1] = e.touches[0].clientY;
    window.scrollertoucher["parent"] = parent;

    document.addEventListener(
      "touchend",
      (event) => {
        window.ongoingtouches = window.ongoingtouches.filter(function (value) {
          return event !== value;
        });
      },
      {
        once: true,
      }
    );

    document.addEventListener(
      "touchcancel",
      (event) => {
        window.ongoingtouches = window.ongoingtouches.filter(function (value) {
          return event !== value;
        });
      },
      {
        once: true,
      }
    );
  });

  document.addEventListener("touchmove", (e) => {
    if (!window.scrollertoucher) return;

    let parent = window.scrollertoucher["parent"];

    if (
      parent.attributes.horizontal &&
      Math.abs(window.scrollertoucher[1] - e.touches[0].clientY) >
        2 * Math.abs(window.scrollertoucher[0] - e.touches[0].clientX)
    ) {
      parent = parent.parentElement.closest(".has-scroller");
      if (!parent) return;
      window.scrollertoucher["parent"] = parent;
    }

    let scroller = parent.querySelector(`scroller`);
    let anchor = parent.querySelector(`anchor`);
    let virtual = parent.querySelector(`.content-to-scroll`);
    let direction = "vertical";
    let movement;

    if (parent.attributes.horizontal) {
      direction = "horizontal";
      movement = window.scrollertoucher[0] - e.touches[0].clientX;
      movement = movement * (anchor.clientWidth / virtual.scrollWidth) * 0.5;
    } else {
      movement = window.scrollertoucher[1] - e.touches[0].clientY;
      movement = movement * (anchor.clientHeight / virtual.scrollHeight) * 0.5;
    }

    scrollings_pure(direction, scroller, anchor, virtual, movement, 33);
  });

  document.addEventListener("touchend", () => {
    if (window.smoothscroller) {
      clearInterval(window.smoothscroller);
    }
  });

  document.addEventListener("touchcancel", () => {
    if (window.smoothscroller) {
      clearInterval(window.smoothscroller);
    }
  });
};

const set_wheel_events = () => {
  document.addEventListener("wheel", (e) => {
    let parent;
    (e.path)
      ? (parent = e.path[0].closest(".has-scroller"))
      : (parent = e.target.closest(".has-scroller"));
    if (!parent) return;
    if (parent.attributes.horizontal && e.target.localName !== "offset")
      parent = parent.parentElement.closest(".has-scroller");
    if (!parent) return;

    let scroller = parent.querySelector(`scroller`);
    let anchor = parent.querySelector(`anchor`);
    let position = anchor.getBoundingClientRect();

    let movement = -1 * (e.wheelDeltaY * 0.5);

    if (
      scroller.attributes.horizontal &&
      ((position["width"] + position["left"] + Math.abs(movement * 0.5) >=
        scroller.scrollWidth + Math.abs(movement) &&
        movement > 0) ||
        position["left"] + movement <= 0)
    ) {
      parent = parent.parentElement.closest(".has-scroller");
      anchor = parent.querySelector(`anchor`);
      scroller = parent.querySelector(`scroller`);
    }

    let virtual = parent.querySelector(`.content-to-scroll`);

    if (scroller.attributes.horizontal) {
      movement = -1 * (e.wheelDeltaY * 0.5);
      smoothings("horizontal", scroller, anchor, virtual, movement, 0, 25);
    } else {
      movement = -1 * e.wheelDeltaY;
      smoothings("vertical", scroller, anchor, virtual, movement, 0, 25);
    }
  });
};

const set_mouse_events = (scrollers, anchors, virtuals) => {
  for (let i = 0; i < scrollers.length; i++) {
    if (!anchors[i]) continue;

    document.addEventListener("mousemove", (e) => {
      if (!anchors[i].classList.contains(`moveable`)) return;

      e.stopPropagation();
      e.preventDefault();

      let movement;

      if (scrollers[i].attributes.horizontal) {
        movement = e.movementY;
        scrollings_pure(
          "horizontal",
          scrollers[i],
          anchors[i],
          virtuals[i],
          movement,
          66
        );
      } else {
        movement = e.movementY;
        scrollings_pure(
          "vertical",
          scrollers[i],
          anchors[i],
          virtuals[i],
          movement,
          66
        );
      }
    });

    anchors[i].addEventListener("mousedown", () => {
      anchors[i].classList.add(`moveable`);
    });

    document.addEventListener("mouseup", () => {
      anchors[i].classList.remove(`moveable`);
    });

    anchors[i].hasListener = true;
  }
};

const reset_to_top = (scrollers, anchors, virtuals) => {
  for (let i = 0; i < scrollers.length; i++) {
    if (scrollers[i].attributes.noresize) return;
    anchors[i].style.left = `0px`;
    anchors[i].style.top = `0px`;
    the_content_mover(scrollers[i], anchors[i], virtuals[i]);
  }
};

const set_anchor_size = (scrollers, anchors, virtuals) => {
  for (let i = 0; i < virtuals.length; i++) {
    if (!anchors[i]) continue;
    let size, content;

    scrollers[i].classList.remove("nothing-to-scroll");
    virtuals[i].parentElement.classList.remove("nothing-to-scroll");

    if (scrollers[i].attributes.horizontal) {
      size = scrollers[i].scrollWidth;
      content =
        virtuals[i].scrollWidth +
        parseInt(window.getComputedStyle(virtuals[i]).marginInline) +
        parseInt(window.getComputedStyle(virtuals[i]).paddingInline);
    } else {
      size = scrollers[i].clientHeight;
      content =
        virtuals[i].scrollHeight +
        parseInt(window.getComputedStyle(virtuals[i]).marginBlock) +
        parseInt(window.getComputedStyle(virtuals[i]).paddingBlock);
    }

    let relativeSize = (size / content) * size;

    if (scrollers[i].attributes.horizontal) {
      anchors[i].style.width = `${relativeSize}px`;
    } else {
      anchors[i].style.height = `${relativeSize}px`;
    }

    if (relativeSize >= size) {
      scrollers[i].classList.add("nothing-to-scroll");
      virtuals[i].parentElement.classList.add("nothing-to-scroll");
    }
  }
};

const resize_mins = (scroller, virtual) => {
  if (!scroller.attributes) return;
  if (!scroller.attributes.noresize) return;

  if (scroller.attributes.horizontal) {
    virtual.style.minWidth = ``;
    virtual.style.minWidth = `${scroller.parentElement.scrollWidth}px`;
  } else {
    virtual.style.minHeight = ``;
    virtual.style.minHeight = `${scroller.parentElement.scrollHeight}px`;
  }
};

const scroller = () => {
  let scrollers = document.querySelectorAll(`scroller`);
  let anchors = [];
  let virtuals = [];

  for (let i = 0; i < scrollers.length; i++) {
    anchors[i] = scrollers[i].querySelector(`anchor`);
    scrollers[i].parentElement.classList.add(`has-scroller`);

    if (scrollers[i].attributes.horizontal) {
      scrollers[i].parentElement.setAttribute("horizontal", "");

      let offset = document.createElement(`offset`);
      scrollers[i].parentElement.appendChild(offset);
    }

    let has_content =
      scrollers[i].parentElement.querySelector(`.content-to-scroll`);
    if (has_content) {
      virtuals[i] = has_content;
    } else {
      virtuals[i] = scrollers[i].nextElementSibling;
    }
    virtuals[i].classList.add(`content-to-scroll`);

    resize_mins(scrollers[i], virtuals[i]);
  }

  set_anchor_size(scrollers, anchors, virtuals);
  set_mouse_events(scrollers, anchors, virtuals);
  set_wheel_events();
  set_touch_events();

  window.addEventListener("resize", () => {
    window.debouncer(
      () => {
        reset_to_top(scrollers, anchors, virtuals);
        resize_mins(scrollers, anchors, virtuals);
        set_anchor_size(scrollers, anchors, virtuals);
      },
      66,
      "resizings"
    );
  });
};

export { scroller };
