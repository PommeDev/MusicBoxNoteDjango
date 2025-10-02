const toggle = document.getElementById("nav-icon1");
const navLinks = document.querySelector(".nav-links");

toggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    toggle.classList.toggle("open");
});

