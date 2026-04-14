console.log("home.js loaded");
  
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
initMoodButton();
initDescriptionBlocks();
});