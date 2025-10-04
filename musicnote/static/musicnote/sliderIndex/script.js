document.addEventListener('DOMContentLoaded', function () {
  // Slider 1 → gauche à droite
  new Splide('#slider-1', {
    type        : 'loop',       // boucle infinie
    perPage     : 5,            // nombre de slides visibles
    autoplay    : true,         // active le défilement automatique
    interval    : 0,         // temps entre chaque transition (ms)
    pauseOnHover: false,        // continue même si on survole
    arrows      : false,        // cache les flèches
    pagination  : false,
    speed : 40000,
    easing : 'linear',
    drag : false,        // pas de pagination
  }).mount();


  new Splide('#slider-2', {
    type        : 'loop',       // boucle infinie
    perPage     : 5,            // nombre de slides visibles
    autoplay    : true,         // active le défilement automatique
    interval    : 0,         // temps entre chaque transition (ms)
    pauseOnHover: false,        // continue même si on survole
    arrows      : false,        // cache les flèches
    pagination  : false,
    speed : 40000,
    easing : 'linear',
    drag : false,
    direction : 'rtl',        // pas de pagination
  }).mount();


});