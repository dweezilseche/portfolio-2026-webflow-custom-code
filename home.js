function initLoader() {
    if (typeof gsap === "undefined" || typeof CustomEase === "undefined") return;

    gsap.registerPlugin(CustomEase);

    const loader = document.querySelector(".loader");
    const loaderNumber = document.querySelector(".loader_number");

    if (!loader || !loaderNumber) return;

    const customEase = "M0,0 C0.19,0.92 0.75,0.33 1,1";
    const counter = { value: 0 };
    const loaderDuration = 4.7;
  
    function updateLoaderText() {
      const progress = Math.round(counter.value);
      loaderNumber.textContent = `${progress}%`;
    }
  
    function endLoaderAnimation() {
      gsap.to(loader, {
        opacity: 0,
        duration: 0.6,
        pointerEvents: "none",
        onComplete: () => {
          loader.style.display = "none";
        }
      });
    }
  
    const tl = gsap.timeline({
      onComplete: endLoaderAnimation,
    });
  
    tl.to(counter, {
      value: 100,
      onUpdate: updateLoaderText,
      duration: loaderDuration,
      ease: CustomEase.create("custom", customEase),
    });

}
  
function initMoodButton() {
const button = document.querySelector(".mood-button");
if (!button) return;

const moods = [
    { mood: "mood1", "--color-primary": "#EFFF53", "--color-secondary": "#4F4C2B", "--color-third": "#464322" },
    { mood: "mood2", "--color-primary": "#FAE192", "--color-secondary": "#AD5B4F", "--color-third": "#CA786C" },
    { mood: "mood3", "--color-primary": "#2D69F6", "--color-secondary": "#161D2D", "--color-third": "#090E1B" },
    { mood: "mood4", "--color-primary": "#F5BFD2", "--color-secondary": "#336148", "--color-third": "#27513A" },
    { mood: "mood5", "--color-primary": "#DEFE52", "--color-secondary": "#272727", "--color-third": "#181717" },
    { mood: "mood6", "--color-primary": "#222222", "--color-secondary": "#f1f2ec", "--color-third": "#fcfcfc" },
];

let currentMood = 0;

button.addEventListener("click", () => {
    currentMood = (currentMood + 1) % moods.length;
    const mood = moods[currentMood];

    Object.entries(mood).forEach(([key, value]) => {
    if (key.startsWith("--color-")) {
        document.documentElement.style.setProperty(key, value);
    }
    });

    document.body.setAttribute("data-mood", mood.mood);
});
}

function loadExternalAsset(tagName, attributes) {
  const selector = attributes.id ? `#${attributes.id}` : null;
  if (selector) {
    const existingElement = document.querySelector(selector);
    if (existingElement) return Promise.resolve(existingElement);
  }

  return new Promise((resolve, reject) => {
    const element = document.createElement(tagName);

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    element.addEventListener("load", () => resolve(element), { once: true });
    element.addEventListener(
      "error",
      () => reject(new Error(`Failed to load asset: ${attributes.href || attributes.src}`)),
      { once: true }
    );

    if (tagName === "link") {
      document.head.appendChild(element);
      return;
    }

    document.body.appendChild(element);
  });
}

function initSwiperLibrary() {
  if (typeof Swiper !== "undefined") return Promise.resolve();

  return Promise.all([
    loadExternalAsset("link", {
      id: "swiper-stylesheet",
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css",
    }),
    loadExternalAsset("script", {
      id: "swiper-script",
      src: "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js",
    }),
  ]).catch((error) => {
    console.warn("Swiper could not be loaded.", error);
  });
}

const PROJECTS_TEXT_SELECTORS = [
  ".project-type",
  "h2",
  ".home-description-project",
  ".button",
];

function getProjectSlideParts(slide) {
  const image = slide.querySelector(".img-first-project");
  const description = slide.querySelector(".description-first-project");
  const textItems = description
    ? PROJECTS_TEXT_SELECTORS.map((selector) => description.querySelector(selector)).filter(Boolean)
    : [];

  return { image, description, textItems };
}

function applySlideBaseState(slide, isActive) {
  const { image, description, textItems } = getProjectSlideParts(slide);

  if (typeof gsap === "undefined") {
    slide.style.opacity = isActive ? "1" : "0";
    slide.style.pointerEvents = isActive ? "auto" : "none";
    return;
  }

  gsap.set(slide, {
    zIndex: isActive ? 3 : 1,
    pointerEvents: isActive ? "auto" : "none",
  });

  if (image) {
    gsap.set(image, {
      autoAlpha: isActive ? 1 : 0,
      filter: isActive ? "blur(0px)" : "blur(4px)",
      scale: isActive ? 1 : 1.02,
      transformOrigin: "center center",
      willChange: "opacity, transform, filter",
    });
  }

  if (description) {
    gsap.set(description, {
      autoAlpha: isActive ? 1 : 0,
      y: isActive ? 0 : 16,
      clipPath: isActive ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 18% 0%)",
      willChange: "opacity, transform, clip-path, filter",
    });
  }

  if (textItems.length) {
    gsap.set(textItems, {
      autoAlpha: isActive ? 1 : 0,
      y: isActive ? 0 : 18,
      filter: isActive ? "blur(0px)" : "blur(6px)",
      willChange: "opacity, transform, filter",
    });
  }
}

function lockProjectsCarouselHeight(swiper) {
  const wrapper = swiper?.wrapperEl;
  if (!wrapper) return;

  const allHeights = Array.from(swiper.slides, (slide) => slide.offsetHeight || 0);
  const maxHeight = Math.max(...allHeights, 0);
  if (maxHeight > 0) {
    wrapper.style.height = `${maxHeight}px`;
  }
}

function animateProjectsSlides(swiper, previousIndex, activeIndex, immediate = false) {
  const previousSlide = swiper.slides[previousIndex];
  const activeSlide = swiper.slides[activeIndex];
  if (!activeSlide) return;

  if (immediate || typeof gsap === "undefined") {
    Array.from(swiper.slides).forEach((slide) => {
      applySlideBaseState(slide, slide === activeSlide);
    });
    return;
  }

  if (swiper.projectsCarouselTl) {
    swiper.projectsCarouselTl.kill();
  }

  const { image: prevImage, description: prevDescription, textItems: prevItems } = previousSlide
    ? getProjectSlideParts(previousSlide)
    : {};
  const { image: nextImage, description: nextDescription, textItems: nextItems } =
    getProjectSlideParts(activeSlide);

  if (previousSlide && previousSlide !== activeSlide) {
    gsap.set(previousSlide, { zIndex: 2, pointerEvents: "none" });
  }
  gsap.set(activeSlide, { zIndex: 3, pointerEvents: "auto" });

  if (nextImage) {
    gsap.set(nextImage, {
      autoAlpha: 0,
      filter: "blur(6px)",
      scale: 1.025,
    });
  }

  if (nextDescription) {
    gsap.set(nextDescription, {
      autoAlpha: 0,
      y: 18,
      clipPath: "inset(0% 0% 20% 0%)",
    });
  }

  if (nextItems?.length) {
    gsap.set(nextItems, {
      autoAlpha: 0,
      y: 20,
      filter: "blur(7px)",
    });
  }

  const tl = gsap.timeline({
    defaults: { overwrite: "auto" },
    onComplete: () => {
      Array.from(swiper.slides).forEach((slide) => {
        if (slide !== activeSlide) {
          applySlideBaseState(slide, false);
        }
      });
      applySlideBaseState(activeSlide, true);
    },
  });

  if (prevImage) {
    tl.to(
      prevImage,
      {
        autoAlpha: 0,
        filter: "blur(4px)",
        scale: 1.015,
        duration: 0.55,
        ease: "power2.out",
      },
      0
    );
  }

  if (prevItems?.length) {
    tl.to(
      prevItems,
      {
        autoAlpha: 0,
        y: -10,
        filter: "blur(6px)",
        duration: 0.35,
        stagger: 0.03,
        ease: "power2.out",
      },
      0
    );
  }

  if (prevDescription) {
    tl.to(
      prevDescription,
      {
        autoAlpha: 0,
        y: -8,
        duration: 0.4,
        ease: "power2.out",
      },
      0.06
    );
  }

  if (nextImage) {
    tl.to(
      nextImage,
      {
        autoAlpha: 1,
        filter: "blur(0px)",
        scale: 1,
        duration: 0.82,
        ease: "power3.out",
      },
      0.16
    );
  }

  if (nextDescription) {
    tl.to(
      nextDescription,
      {
        autoAlpha: 1,
        y: 0,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.72,
        ease: "power3.out",
      },
      0.2
    );
  }

  if (nextItems?.length) {
    tl.to(
      nextItems,
      {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.58,
        stagger: 0.06,
        ease: "power3.out",
      },
      0.26
    );
  }

  swiper.projectsCarouselTl = tl;
}

function initProjectsCarousel() {
  const carousel = document.querySelector('[data-projects-swiper]');
  if (!carousel || carousel.dataset.enhanced === "true") return;
  if (typeof Swiper === "undefined") return;

  const nextEl =
    carousel.querySelector('[data-projects-swiper-next]') ||
    document.querySelector('[data-projects-swiper-next]');
  const prevEl =
    carousel.querySelector('[data-projects-swiper-prev]') ||
    document.querySelector('[data-projects-swiper-prev]');
  const paginationEl =
    carousel.querySelector('[data-projects-swiper-pagination]') ||
    document.querySelector('[data-projects-swiper-pagination]');

  let previousIndex = 0;
  const swiperConfig = {
    slidesPerView: 1,
    spaceBetween: 0,
    speed: 1600,
    grabCursor: true,
    effect: "fade",
    autoplay: {
      delay: 7000,
      disableOnInteraction: false,
    },
    fadeEffect: {
      crossFade: true,
    },
    virtualTranslate: true,
    followFinger: true,
    touchRatio: 1,
    loop: carousel.dataset.swiperLoop !== "false",
    watchOverflow: true,
    on: {
      init(swiper) {
        previousIndex = swiper.activeIndex;
        animateProjectsSlides(swiper, swiper.activeIndex, swiper.activeIndex, true);
        lockProjectsCarouselHeight(swiper);
      },
      slideChangeTransitionStart(swiper) {
        animateProjectsSlides(swiper, previousIndex, swiper.activeIndex);
      },
      slideChangeTransitionEnd(swiper) {
        previousIndex = swiper.activeIndex;
      },
      resize(swiper) {
        lockProjectsCarouselHeight(swiper);
      },
    },
  };

  if (nextEl && prevEl) {
    swiperConfig.navigation = {
      nextEl,
      prevEl,
    };
  }

  if (paginationEl) {
    swiperConfig.pagination = {
      el: paginationEl,
      clickable: true,
    };
  }

  if (carousel.dataset.swiperLoop === "true") {
    swiperConfig.loop = true;
  }

  const projectsSwiper = new Swiper(carousel, swiperConfig);
  carousel.swiperInstance = projectsSwiper;
  carousel.dataset.enhanced = "true";
}

  
function initHome() {
    initLoader();
    initMoodButton();
    initSwiperLibrary().then(() => {
      initProjectsCarousel();
    });
  }
  
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHome);
  } else {
    initHome();
  }