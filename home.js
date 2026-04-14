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
  
function initDescriptionBlocks() {
if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

if (typeof SplitText !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, SplitText);
} else {
    gsap.registerPlugin(ScrollTrigger);
}

gsap.utils.toArray(".description-first-project").forEach((bloc) => {
    const headline = bloc.querySelector(".headline-project-description");
    const title = bloc.querySelector(".ltp-1");
    const description = bloc.querySelector(".home-description-project");

    if (!headline || !title || !description) return;

    const tl = gsap.timeline({ paused: true });

    if (typeof SplitText !== "undefined") {
    const splitHeadline = SplitText.create(headline, { type: "lines", mask: "lines" });
    const splitTitle = SplitText.create(title, { type: "words", mask: "words" });
    const splitDescription = SplitText.create(description, { type: "lines", mask: "lines" });

    tl.from(splitHeadline.lines, {
        x: -32,
        opacity: 0,
        duration: 0.55,
        stagger: 0.1,
        ease: "power2.out",
        immediateRender: false,
    })
    .from(
        splitTitle.words,
        {
        opacity: 0,
        duration: 0.45,
        stagger: 0.05,
        ease: "power2.out",
        immediateRender: false,
        },
        "+=0.2"
    )
    .from(
        splitDescription.lines,
        {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        immediateRender: false,
        },
        "-=0.2"
    );
    } else {
    tl.from(headline, { y: 30, opacity: 0, duration: 0.5, immediateRender: false })
    .from(title, { opacity: 0, duration: 0.5, immediateRender: false }, "+=0.2")
    .from(description, { y: 20, opacity: 0, duration: 0.5, immediateRender: false }, "+=0.2");
    }

    ScrollTrigger.create({
    trigger: bloc,
    start: "top 65%",
    once: true,
    markers: true,
    onEnter: () => tl.play(0),
    });
});

// SplitText modifies the DOM structure, so we refresh trigger positions once.
ScrollTrigger.refresh();
}
  
function initHome() {
    initLoader();
    initMoodButton();
    initDescriptionBlocks();
  }
  
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHome);
  } else {
    initHome();
  }