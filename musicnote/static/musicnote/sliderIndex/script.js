document.addEventListener('DOMContentLoaded', function () {


  const VITESSE_PX_PAR_SEC = 100;

  // Largeur moyenne d’une slide (à ajuster selon ton design)
  const LARGEUR_SLIDE = 150;

  // Fonction pour initialiser le slider Splide

  const sliderElement1 = document.querySelector('#slider-1');
  const slides1 = sliderElement1.querySelectorAll('.splide__slide');

    // Largeur totale du contenu (approximation)
  const totalLargeur1 = slides1.length * LARGEUR_SLIDE;

    // Durée d’un cycle complet à vitesse constante
  const dureeMs1 = (totalLargeur1 / VITESSE_PX_PAR_SEC) * 1000;

  let dureeMS2;
  try{
    const sliderElement2 = document.querySelector('#slider-2');
  const slides2 = sliderElement2.querySelectorAll('.splide__slide');

    // Largeur totale du contenu (approximation)
  const totalLargeur2 = slides2.length * LARGEUR_SLIDE;

    // Durée d’un cycle complet à vitesse constante
  dureeMs2 = (totalLargeur2 / VITESSE_PX_PAR_SEC) * 1000;
    //slide2.style.animation = `scroll ${duree}s linear infinite`;

  }catch (error){
    dureeMs2 = 10000;
  }


  const largeur = window.innerWidth;
  let perPage = 3; // valeur par défaut

  if (largeur > 1200) perPage = 10;
  else if (largeur > 768) perPage = 6;
  else if (largeur > 480) perPage = 4;
  else perPage = 2;



  // Slider 1 → gauche à droite
  new Splide('#slider-1', {
    type        : 'loop',       // boucle infinie
    perPage: perPage,
    autoplay    : false,         // active le défilement automatique
    interval    : 0,         // temps entre chaque transition (ms)
    pauseOnHover: false,        // continue même si on survole
    arrows      : false,        // cache les flèches
    pagination  : false,
    easing : 'linear',
    drag : false,        // pas de pagination
  }).mount(window.splide.Extensions );

  // Animation CSS appliquée dynamiquement
  //slide1.style.animation = `scroll ${duree}s linear infinite`;



  new Splide('#slider-2', {
    type        : 'loop',       // boucle infinie
    perPage     : perPage,
    breakpoints: {
    1200: { perPage: 8 },
    768:  { perPage: 4 },
    480:  { perPage: 2 },
    },            // nombre de slides visibles
    autoplay    : false,         // active le défilement automatique
    interval    : 0,         // temps entre chaque transition (ms)
    pauseOnHover: false,        // continue même si on survole
    arrows      : false,        // cache les flèches
    pagination  : false,
    speed : dureeMs2,
    easing : 'linear',
    drag : false,
    direction : 'rtl',        // pas de pagination
  }).mount(window.splide.Extensions);



  window.addEventListener('resize', () => {
  document.querySelector('#slider-1').splide?.destroy(); // détruit l’ancienne instance
  initAutoScrollSlider();
  });


});