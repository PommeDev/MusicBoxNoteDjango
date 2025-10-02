
const stars = document.querySelectorAll(".star-rating");

stars.forEach(star => {
    const rating = parseFloat(star.getAttribute("data-rating")) || 0;
    const starPercentage = (rating / 10) * 100; // note sur 10 → % sur 100
    const starsInner = star.querySelector(".stars-inner");
    if (starsInner) {
        starsInner.style.width = `${starPercentage}%`;
    }
});

