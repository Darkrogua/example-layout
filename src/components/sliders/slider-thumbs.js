import Swiper from 'swiper/bundle';

import {Fancybox} from "@fancyapps/ui/dist/fancybox.umd.js";





//$('[data-fancybox]').fancybox({
//   protect: true
//});

//Fancybox.bind("[data-fancybox]", {
//   // Your options go here
//   protect: true
//});

Fancybox.bind("[data-fancybox]", {
   groupAll: true, // Group all items
   on: {
      ready: (fancybox) => {
         console.log(`fancybox #${fancybox.id} is ready!`);
      }
   }
});


export function acceptSwipers() {
   if (!window.jQuery && !window.Swiper) {
      setTimeout(() => {
         acceptSwipers()
      }, 100)
      return
   }

   let swipers = $('section[swiper]:not([loaded])')
   if (!swipers) return
   for (let i = 0; i < swipers.length; i++) {
      let swiper = swipers.eq(i)
      let swiper_class = swiper.attr('swiper')
      Fancybox.bind(`.${swiper_class} a`, {
         groupAll: true, // Group all items
         on: {
            ready: (fancybox) => {
               console.log(`fancybox #${fancybox.id} is ready!`);
            }
         }
      });

      window['swiper_' + swiper_class] = new Swiper(`.${swiper_class} .thumbSlider`, {
         loop: false,
         spaceBetween: 10,
         slidesPerView: 4,
         freeMode: true,
         watchSlidesVisibility: true,
         watchSlidesProgress: true,
         breakpoints: {
            0: {
               slidesPerView: 3,
            },
            568: {
               slidesPerView: 4,
            }
         }
      })

      new Swiper("." + swiper_class + " .shipSlide", {
         loop: false,
         spaceBetween: 10,
         navigation: {
            nextEl: "." + swiper_class + " .swiper-button-next",
            prevEl: "." + swiper_class + " .swiper-button-prev",
         },
         thumbs: {
            swiper: window['swiper_' + swiper_class],
         },
      })

      let parent = $('.' + swiper_class).parents('.tab-item.close-mobile');
      if (parent) {
         parent.on('click', function () {
            window['swiper_' + swiper_class].update();
         });
      }
      swiper.attr('loaded', true);
     
     
   }
}