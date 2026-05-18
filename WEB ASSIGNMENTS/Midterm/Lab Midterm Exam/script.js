// ================= MOBILE MENU TOGGLE =================
const toggle = document.getElementById("menu-toggle");
const menu = document.querySelector(".nav-left");

toggle.addEventListener("click", function () {
  menu.classList.toggle("active");
});


// ================= SLIDER SCRIPT =================
$(document).ready(function () {

  $('.product-slider').each(function () {

    let slider = $(this);
    let wrapper = slider.closest('.slider-wrapper');
    let prevBtn = wrapper.find('.prev-btn');
    let nextBtn = wrapper.find('.next-btn');
    let counter = wrapper.find('.counter');

    // Initialize Slick
    slider.slick({
      infinite: true,
      slidesToShow: 4,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 5000,
      pauseOnHover: true,
      arrows: false,       // disable built-in arrows, we use custom buttons below
      dots: false,
      responsive: [
        {
          breakpoint: 1280,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 1024,   // Tablet: 2 slides
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 600,    // Mobile: 1 slide
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    });

    // ---- Counter ----
    function updateCounter() {
      let current = slider.slick('slickCurrentSlide') + 1;
      let total = slider.slick('getSlick').slideCount;
      counter.text(current + ' / ' + total);
    }

    // Set counter on load and on every slide change
    updateCounter();
    slider.on('afterChange', function () {
      updateCounter();
    });

    // ---- Custom Prev / Next Buttons ----
    prevBtn.on('click', function () {
      slider.slick('slickPrev');
    });

    nextBtn.on('click', function () {
      slider.slick('slickNext');
    });

  });

});

