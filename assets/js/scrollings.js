const setup_dimensions = (carousels) => {
  if (!window.dimensions) window.dimensions = {};

  for (let i = 0; i < carousels.length; i++) {
    carousels[i].setAttribute("identifier", i);
    let dimensions = {};
    dimensions["container"] = carousels[i]
      .querySelector(`.visual-container`)
      .getBoundingClientRect();
    dimensions["box"] = carousels[i]
      .querySelector(`.visual`)
      .getBoundingClientRect();
    dimensions["topics"] = carousels[i]
      .querySelector(`.topics`)
      .getBoundingClientRect();
    dimensions["topic"] = carousels[i]
      .querySelector(`.topic`)
      .getBoundingClientRect();

    window.dimensions[i] = dimensions;
  }
};

const activate = (e) => {
  let scroller = e.srcElement.closest(`.visual`);
  scroller.classList.add("can-scroll");
};

const deactivate = (e) => {
  let scroller = e.srcElement.closest(`.visual`);
  scroller?.classList.remove("can-scroll");
};

const touch_dragging = (e) => {
  let scroller = e.srcElement.closest(`.scrolling-topic`);

  if (!scroller.classList.contains(`can-scroll`)) return;
};

const mouse_dragging = (e) => {
  let scroller = e.srcElement.closest(`.visual`);

  if (!scroller?.classList.contains(`can-scroll`)) return;

  let dimensions =
    window.dimensions[scroller.parentElement.attributes.identifier.value];
  let boundaryBottom =
    dimensions["container"].height - dimensions["box"].height;
  boundaryBottom = parseInt(boundaryBottom);
  let boundaryTopics = dimensions["topics"].height - dimensions["topic"].height;
  boundaryTopics = parseInt(boundaryTopics);

  if (boundaryBottom < 0) boundaryBottom = 0;

  let visual_container = scroller.querySelector(`.visual-container`);
  let topics_container = scroller.parentElement.querySelector(`.topics`);
  let interactors = topics_container.querySelectorAll(`.interactor`);

  let topics = topics_container.querySelectorAll(`.topic`);
  let breakpoints = [];

  for (let i = 0; i < topics.length; i++) {
    if (topics[i].attributes.weight?.value) {
      breakpoints.push(parseInt(topics[i].attributes.weight.value));
    } else {
      breakpoints.push(1);
    }
  }

  let visual_container_pos = visual_container.style["transform"]
    ? -1 *
      window
        .getComputedStyle(visual_container)
        .transform.match(/matrix.*\((.+)\)/)[1]
        .split(", ")[5]
    : 0;
  // let interactors_pos = interactors[0].style["transform"]
  //   ? -1 *
  //     window
  //       .getComputedStyle(interactors[0])
  //       .transform.match(/matrix.*\((.+)\)/)[1]
  //       .split(", ")[5]
  //   : 0;
  let movementY = -1 * e.movementY;

  setTimeout(() => {
    let calc = parseInt(visual_container_pos) + parseInt(movementY);

    if (calc >= boundaryBottom) {
      calc = boundaryBottom;
    }

    if (calc <= 0) {
      calc = 0;
    }

    let calc_percent = calc / boundaryBottom;
    let int_calc = calc_percent * (boundaryTopics / topics.length);

    setTimeout(() => {
      visual_container.style.transform = `translateY(-${calc}px)`;

      if (100 * calc_percent >= 100 / topics.length) {
        for (let i = 0; i < interactors.length; i++) {
          interactors[i].style.transform = `translateY(${int_calc}px)`;
        }
      } else {
        for (let i = 0; i < interactors.length; i++) {
          interactors[i].style.transform = `translateY(0px)`;
        }
      }
    }, 0);
  });

  // if (currentPos )

  // if (currentPos + movementY <= boundaryBottom) {

  // }
};

const setup_touch_events = (carousel) => {
  carousel.addEventListener("touchstart", activate, false);
  carousel.addEventListener("touchend", touch_dragging, false);
  carousel.addEventListener("touchend", deactivate, false);
};

const setup_mouse_events = (carousel) => {
  carousel.addEventListener("mousedown", activate, false);
  carousel.addEventListener("mousemove", mouse_dragging, false);
  carousel.addEventListener("mouseup", deactivate, false);
  carousel.addEventListener("mouseleave", deactivate, false);
};

const setup_wheel_events = () => {
  document.addEventListener("wheel", (e) => {
    let parent;
    e.path
      ? (parent = e.path[0].closest(".scrolling-topic"))
      : (parent = e.target.closest(".scrolling-topic"));
    if (!parent) return;

    console.log(parent);
  });
};

const setup_listeners = (carousels) => {
  if (!window.dimensions) return;

  setup_wheel_events();

  for (let i = 0; i < carousels.length; i++) {
    setup_touch_events(carousels[i]);
    setup_mouse_events(carousels[i]);
  }
};

const setup_scrolls = () => {
  const carousels = document.querySelectorAll(`.scrolling-topic`);

  setup_dimensions(carousels);

  setup_listeners(carousels);

  window.addEventListener("resize", () => {
    setup_dimensions(carousels);
  });
};
