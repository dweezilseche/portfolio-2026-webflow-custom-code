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

function injectProjectsSwiperPaginationStyles() {
  const styleId = "projects-swiper-pagination-overrides";
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    [data-projects-swiper] .swiper-pagination {
      position: static;
      margin-top: auto !important;
      text-align: left;
      font-style: normal;
    }
  `;
  document.head.appendChild(style);
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
  ".headline-project-description",
  "h2",
  ".home-description-project",
  ".home-decription-project",
  ".button"
];

function getProjectSlideParts(slide) {
  const image = slide.querySelector(".img-project-home");
  const description = slide.querySelector(".description-first-project");
  const button = slide.querySelector(".button");
  const textItems = description
    ? PROJECTS_TEXT_SELECTORS.map((selector) => description.querySelector(selector)).filter(Boolean)
    : [];

  return { image, description, textItems, button };
}

function applySlideBaseState(slide, isActive) {
  const { image, description, textItems, button } = getProjectSlideParts(slide);

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

  if (button) {
    gsap.set(button, {
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

function formatProjectsPaginationNumber(value) {
  return String(value).padStart(2, "0");
}

function placeProjectsPaginationInActiveDescription(swiper) {
  const paginationEl = swiper?.pagination?.el;
  const activeSlide = swiper?.slides?.[swiper.activeIndex];
  if (!paginationEl || !activeSlide) return;

  const activeDescription = activeSlide.querySelector(".description-first-project");
  if (!activeDescription || activeDescription.contains(paginationEl)) return;

  activeDescription.appendChild(paginationEl);
}

function animateProjectsSlides(swiper, fromIndex, toIndex, isInitial = false) {
  const slides = Array.from(swiper?.slides || []);
  if (!slides.length) return;

  const nextSlide = slides[toIndex];
  const previousSlide = slides[fromIndex];

  if (!nextSlide) return;

  if (typeof gsap === "undefined") {
    slides.forEach((slide, index) => {
      const isActive = index === toIndex;
      slide.style.opacity = isActive ? "1" : "0";
      slide.style.pointerEvents = isActive ? "auto" : "none";
      slide.style.zIndex = isActive ? "3" : "1";
    });
    return;
  }

  slides.forEach((slide, index) => {
    const isTarget = index === toIndex;
    gsap.set(slide, {
      autoAlpha: isTarget ? 1 : 0,
      pointerEvents: isTarget ? "auto" : "none",
      zIndex: isTarget ? 2 : 1,
    });
  });

  const { image: nextImage, textItems: nextTextItems } = getProjectSlideParts(nextSlide);
  if (nextImage) {
    gsap.set(nextImage, {
      clipPath: "inset(0% 0% 0% 0%)",
      xPercent: 0,
      willChange: "clip-path, transform",
    });
  }
  if (nextTextItems.length) {
    gsap.set(nextTextItems, {
      autoAlpha: 1,
      y: 0,
      filter: "blur(0px)",
      willChange: "transform, opacity, filter",
    });
  }

  if (isInitial || !previousSlide || fromIndex === toIndex) {
    gsap.set(nextSlide, { autoAlpha: 1, zIndex: 3, pointerEvents: "auto" });
    return;
  }

  const { image: previousImage, textItems: previousTextItems } = getProjectSlideParts(previousSlide);

  gsap.set(previousSlide, {
    autoAlpha: 1,
    zIndex: 4,
    pointerEvents: "none",
  });

  if (!previousImage) {
    gsap.set(previousSlide, { autoAlpha: 0, zIndex: 1 });
    gsap.set(nextSlide, { autoAlpha: 1, zIndex: 3, pointerEvents: "auto" });
    return;
  }

  gsap.set(previousImage, {
    clipPath: "inset(0% 0% 0% 0%)",
    xPercent: 0,
    willChange: "clip-path, transform",
  });

  gsap.killTweensOf([...previousTextItems, ...nextTextItems, previousImage]);

  const transitionTl = gsap.timeline({
    defaults: { overwrite: "auto" },
    onComplete: () => {
      gsap.set(previousImage, { clipPath: "inset(0% 0% 0% 0%)", xPercent: 0, clearProps: "willChange" });
      gsap.set([...previousTextItems, ...nextTextItems], { clearProps: "willChange" });
      gsap.set(previousSlide, { autoAlpha: 0, zIndex: 1 });
      gsap.set(nextSlide, { autoAlpha: 1, zIndex: 3, pointerEvents: "auto" });
    },
  });

  if (previousTextItems.length) {
    transitionTl.to(previousTextItems, {
      autoAlpha: 0,
      y: -14,
      filter: "blur(6px)",
      duration: 0.45,
      ease: "power2.inOut",
      stagger: 0.04,
    }, 0);
  }

  if (nextTextItems.length) {
    transitionTl.set(nextTextItems, {
      autoAlpha: 0,
      y: 24,
      filter: "blur(8px)",
    }, 0);
  }

  transitionTl.to(previousImage, {
    clipPath: "inset(0% 100% 0% 0%)",
    xPercent: -8,
    duration: 1.1,
    ease: "power3.inOut",
  }, 0);

  if (nextTextItems.length) {
    transitionTl.to(nextTextItems, {
      autoAlpha: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.65,
      ease: "power3.out",
      stagger: 0.06,
    }, 0.28);
  }
}

function initProjectsCarousel() {
  const carousel = document.querySelector("[data-projects-swiper]");
  if (!carousel || carousel.dataset.enhanced === "true") return;
  if (typeof Swiper === "undefined") return;

  const nextEl =
    carousel.querySelector("[data-projects-swiper-next]") ||
    carousel.querySelector(".swiper-button-next") ||
    document.querySelector("[data-projects-swiper-next]");

  const prevEl =
    carousel.querySelector("[data-projects-swiper-prev]") ||
    carousel.querySelector(".swiper-button-prev") ||
    document.querySelector("[data-projects-swiper-prev]");

  const paginationEl =
    carousel.querySelector("[data-projects-swiper-pagination]") ||
    document.querySelector("[data-projects-swiper-pagination]");

  const swiperConfig = {
    slidesPerView: 1,
    spaceBetween: 0,
    speed: 1100,
    grabCursor: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    effect: "fade",
    fadeEffect: {
      crossFade: false,
    },
    pagination: {
      el: ".swiper-pagination",
      type: "fraction",
      formatFractionCurrent: (number) => {
        return number < 10 ? `0${number}` : number;
      },
      formatFractionTotal: (number) => {
        return number < 10 ? `0${number}` : number;
      },
    },
    virtualTranslate: true,
    followFinger: true,
    touchRatio: 1,
    loop: carousel.dataset.swiperLoop !== "false",
    watchOverflow: true,
    on: {
      init(swiper) {
        animateProjectsSlides(swiper, swiper.activeIndex, swiper.activeIndex, true);
        lockProjectsCarouselHeight(swiper);
        placeProjectsPaginationInActiveDescription(swiper);
      },
      setTranslate(swiper) {
        swiper.slides.forEach((slide) => {
          slide.style.opacity = "1";
        });
      },
      slideChangeTransitionStart(swiper) {
        const fromIndex = Number.isInteger(swiper.previousIndex)
          ? swiper.previousIndex
          : swiper.activeIndex;

        animateProjectsSlides(swiper, fromIndex, swiper.activeIndex);
        placeProjectsPaginationInActiveDescription(swiper);
      },
      resize(swiper) {
        lockProjectsCarouselHeight(swiper);
        placeProjectsPaginationInActiveDescription(swiper);
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
      type: "custom",
      renderCustom: (swiper, current, total) =>
        `<span class="swiper-pagination-current">${formatProjectsPaginationNumber(current)}</span><span class="swiper-pagination-separator">/</span><span class="swiper-pagination-total">${formatProjectsPaginationNumber(total)}</span>`,
    };
  }

  if (carousel.dataset.swiperLoop === "true") {
    swiperConfig.loop = true;
  }

  const projectsSwiper = new Swiper(carousel, swiperConfig);
  carousel.swiperInstance = projectsSwiper;
  carousel.dataset.enhanced = "true";
}

function initWordsOpacityScroll() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const words = document.querySelectorAll(".word-item");
  if (!words.length) return;

  words.forEach((word) => {
    const wordImage = word.querySelector(".img_word_container");
    const wordText = word.querySelector(".word-item-description");

    // Pour que le z-index ait un effet, l'élément doit être "positionné".
    if (getComputedStyle(word).position === "static") {
      word.style.position = "relative";
    }

    gsap.set(word, {
      opacity: 0.2,
      willChange: "opacity",
    });

    if (wordImage) {
      gsap.set(wordImage, {
        opacity: 0,
        willChange: "opacity",
      });
    }

    if (wordText) {
      gsap.set(wordText, {
        opacity: 0,
        willChange: "opacity",
      });
    }

    ScrollTrigger.create({
      trigger: word,
      // markers: true,
      start: "top 55%",
      end: "bottom 54%",
      onToggle: (self) => {
        const targetOpacity = self.isActive ? 1 : 0.2;

        // Quand le mot est actif, on le met au-dessus des autres.
        gsap.set(word, { zIndex: self.isActive ? 5 : 1 });

        gsap.to(word, {
          opacity: targetOpacity,
          duration: 0.2,
          ease: "power1.out",
          overwrite: "auto",
        });

        if (!wordImage) return;

        gsap.to(wordImage, {
          opacity: self.isActive ? 1 : 0,
          duration: 0.2,
          ease: "power1.in",
          overwrite: "auto",
        });

        if (!wordText) return;

        gsap.to(wordText, {
          opacity: self.isActive ? 1 : 0,
          duration: 0.2,
          ease: "power1.in",
          overwrite: "auto",
        });
      },
    });
  });
}

function initAllProjectsSelector() {
  const allProjectsBlocks = document.querySelectorAll(".all-projects");
  if (!allProjectsBlocks.length) return;

  allProjectsBlocks.forEach((block) => {
    // Le container qui contient la ligne de sélection et la liste de projets.
    const listContainer = block.querySelector(".div-block-4");
    const selector = block.querySelector(".selector");
    const items = Array.from(block.querySelectorAll(".project-all-project"));

    if (!listContainer || !selector || !items.length) return;
    if (block.dataset.selectorEnhanced === "true") return;

    const rowHeight = 52;
    const startIndex = 0;

    const setSelectorVisibility = (isVisible, animate = true) => {
      if (typeof gsap === "undefined" || !animate) {
        selector.style.opacity = isVisible ? "1" : "0";
        return;
      }

      gsap.to(selector, {
        autoAlpha: isVisible ? 1 : 0,
        duration: 0.2,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    // On utilise transform plutôt que top pour une animation plus fluide.
    const setSelectorPosition = (index, animate = true) => {
      const safeIndex = Math.max(0, Math.min(index, items.length - 1));
      const targetY = safeIndex * rowHeight;

      if (typeof gsap === "undefined" || !animate) {
        selector.style.transform = `translateY(${targetY}px)`;
        return;
      }

      gsap.to(selector, {
        y: targetY,
        duration: 0.35,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    // État initial pour éviter tout flash visuel.
    selector.style.willChange = "transform, opacity";
    if (typeof gsap === "undefined") {
      selector.style.transform = `translateY(${startIndex * rowHeight}px)`;
      selector.style.opacity = "0";
    } else {
      gsap.set(selector, { y: startIndex * rowHeight, autoAlpha: 0 });
    }

    items.forEach((item, index) => {
      // Le hover déplace le selector sur la ligne active.
      item.addEventListener("mouseenter", () => {
        setSelectorVisibility(true, true);
        setSelectorPosition(index, true);
      });

      // Le focus clavier garde un comportement accessible.
      item.addEventListener("focusin", () => {
        setSelectorVisibility(true, true);
        setSelectorPosition(index, true);
      });
    });

    // Quand la souris sort de la liste, on cache le selector.
    listContainer.addEventListener("mouseleave", () => {
      setSelectorVisibility(false, true);
    });

    block.dataset.selectorEnhanced = "true";
  });
}

function initHome() {
  initLoader();
  initMoodButton();
  injectProjectsSwiperPaginationStyles();
  initWordsOpacityScroll();
  initAllProjectsSelector();

  initSwiperLibrary().then(() => {
    initProjectsCarousel();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHome);
} else {
  initHome();
}