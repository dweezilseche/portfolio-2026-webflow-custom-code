console.log("global.js loaded");

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
  
    document.addEventListener("click", () => {
      const elementUnderCursor = document.elementFromPoint(cursorPosition.x, cursorPosition.y);
  
      if (elementUnderCursor && elementUnderCursor.classList.contains("toggle-color")) {
        return;
      }
  
      const clone = cursor.cloneNode(true);
      clone.style.position = "absolute";
      clone.style.left = `${cursorPosition.x}px`;
      clone.style.top = `${cursorPosition.y}px`;
      clone.style.pointerEvents = "none";
      clone.style.transition = "none";
      clone.style.zIndex = "9999";
  
      clone.dataset.cloneIndex = cloneIndex;
      cloneIndex++;
  
      document.body.appendChild(clone);
  
      if (cloneIndex === 1) {
        setTimeout(() => {
          const firstClone = document.querySelector('[data-clone-index="0"]');
          if (firstClone) firstClone.remove();
        }, 100);
      }
    });
  }
  
  function initHomeScript() {
    const page = document.querySelector("[data-page]");
    if (!page || page.dataset.page !== "home") return;
  
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/gh/dweezilseche/portfolio-2026-webflow-custom-code@main/home.js";
    script.defer = true;
    document.body.appendChild(script);
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    initLenis();
    initCursor();
    initHomeScript();
  });