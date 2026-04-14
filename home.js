function initLoader() {
    if (typeof gsap === "undefined" || typeof CustomEase === "undefined") return;
  
    const loaderNumber = document.querySelector(".loader_number");
    const loaderProgress = document.querySelector(".loader_progress");
    const trigger = document.querySelector(".trigger");
  
    if (!loaderNumber || !loaderProgress || !trigger) return;
  
    const customEase = "M0,0 C0.19,0.92 0.75,0.33 1,1";
    const counter = { value: 0 };
    const loaderDuration = 4.7;
  
    function updateLoaderText() {
      const progress = Math.round(counter.value);
      loaderNumber.textContent = `${progress}%`;
    }
  
    function endLoaderAnimation() {
      trigger.click();
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
  
    tl.to(
      loaderProgress,
      {
        width: "100%",
        duration: loaderDuration,
        ease: CustomEase.create("custom", customEase),
      },
      0
    );
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
  
  function initDescriptionBlocks() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  
    gsap.registerPlugin(ScrollTrigger);
  
    gsap.utils.toArray(".mon-bloc").forEach((bloc) => {
      const titre = bloc.querySelector(".titre");
      const image = bloc.querySelector(".image");
      const texte = bloc.querySelector(".texte");
  
      if (!titre || !image || !texte) return;
  
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: bloc,
          start: "top 80%",
        },
      });
  
      tl.from(titre, { y: 30, opacity: 0, duration: 0.5 })
        .from(image, { scale: 0.9, opacity: 0, duration: 0.5 }, "-=0.2")
        .from(texte, { y: 20, opacity: 0, duration: 0.5 }, "-=0.2");
    });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    initLoader();
    initMoodButton();
    initDescriptionBlocks();
  });