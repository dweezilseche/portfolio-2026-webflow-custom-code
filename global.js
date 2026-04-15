function documentLayoutHeight() {
    return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        window.innerHeight
    );
}

function ensureCursorCloneRoot() {
    let root = document.getElementById("custom-cursor-clones");
    if (root) return root;

    root = document.createElement("div");
    root.id = "custom-cursor-clones";
    root.setAttribute("aria-hidden", "true");
    Object.assign(root.style, {
        position: "absolute",
        left: "0",
        top: "0",
        width: "100%",
        pointerEvents: "none",
        zIndex: "9998",
    });

    const syncHeight = () => {
        root.style.minHeight = `${documentLayoutHeight()}px`;
    };

    document.body.appendChild(root);
    syncHeight();
    window.addEventListener("resize", syncHeight);

    return root;
}

function initLenis() {
    if (typeof Lenis === "undefined") return;
  
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    });
  
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
  
    requestAnimationFrame(raf);
}

function initCursor() {
const cursor = document.getElementById("custom-cursor");
const leftPupil = document.getElementById("left-pupil");
const rightPupil = document.getElementById("right-pupil");
const leftBrow = document.getElementById("left-brow");
const rightBrow = document.getElementById("right-brow");

if (!cursor || !leftPupil || !rightPupil || !leftBrow || !rightBrow) return;

let cursorPosition = { x: 0, y: 0 };
let cloneIndex = 0;

document.addEventListener("mousemove", (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const screenWidth = window.innerWidth / 2;

    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;

    cursorPosition.x = e.clientX;
    cursorPosition.y = e.clientY;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const offsetX = (mouseX - centerX) / 30;
    const offsetY = (mouseY - centerY) / 30;

    const maxOffsetX = 5;
    const maxOffsetY = 8;

    const constrainedOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, offsetX));
    const constrainedOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, offsetY));

    leftPupil.setAttribute("cx", 6.13779 + constrainedOffsetX);
    leftPupil.setAttribute("cy", 9.70812 - constrainedOffsetY);
    rightPupil.setAttribute("cx", 6.13779 + constrainedOffsetX);
    rightPupil.setAttribute("cy", 9.70812 - constrainedOffsetY);

    if (mouseX > screenWidth) {
    leftBrow.style.transform = "translateY(-6px)";
    rightBrow.style.transform = "translateY(0)";
    } else {
    rightBrow.style.transform = "translateY(-6px)";
    leftBrow.style.transform = "translateY(0)";
    }
});

document.addEventListener("click", (e) => {
    const clientX = e.clientX;
    const clientY = e.clientY;
    const elementUnderCursor = document.elementFromPoint(clientX, clientY);

    if (elementUnderCursor && elementUnderCursor.classList.contains("toggle-color")) {
    return;
    }

    const pageX = e.pageX ?? clientX + (window.scrollX ?? window.pageXOffset);
    const pageY = e.pageY ?? clientY + (window.scrollY ?? window.pageYOffset);

    const cloneRoot = ensureCursorCloneRoot();
    cloneRoot.style.minHeight = `${documentLayoutHeight()}px`;

    const rootRect = cloneRoot.getBoundingClientRect();
    const scrollX = window.scrollX ?? window.pageXOffset;
    const scrollY = window.scrollY ?? window.pageYOffset;
    const rootDocX = rootRect.left + scrollX;
    const rootDocY = rootRect.top + scrollY;

    const clone = cursor.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.left = `${pageX - rootDocX}px`;
    clone.style.top = `${pageY - rootDocY}px`;
    clone.style.pointerEvents = "none";
    clone.style.transition = "none";
    clone.style.zIndex = "9999";

    clone.dataset.cloneIndex = cloneIndex;
    cloneIndex++;

    cloneRoot.appendChild(clone);

    if (cloneIndex === 1) {
    setTimeout(() => {
        const firstClone = document.querySelector('[data-clone-index="0"]');
        if (firstClone) firstClone.remove();
    }, 100);
    }
});
}
  
document.addEventListener("DOMContentLoaded", () => {
initLenis();
initCursor();
});