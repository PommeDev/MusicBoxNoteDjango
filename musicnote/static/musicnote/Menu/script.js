const toggle = document.getElementById("nav-icon1");
const navLinks = document.querySelector(".nav-links");

toggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  toggle.classList.toggle("open");
});

const header = document.querySelector("header");
const shrinkTrigger = 100;

window.addEventListener("scroll", () => {
  if (window.scrollY > shrinkTrigger) {
    header.classList.add("shrink");
  } else {
    header.classList.remove("shrink");
  }
});

