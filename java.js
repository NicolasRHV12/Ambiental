(function () {
  "use strict";

  // Registrar ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  /* =========================================
     ESTADOS INICIALES
     ========================================= */

  gsap.set(".header > *", {
    opacity: 0,
    y: -20
  });

  gsap.set(".eyebrow", {
    opacity: 0,
    y: 20
  });

  gsap.set(".title .word", {
    opacity: 0,
    y: 80,
    rotateX: 70
  });

  gsap.set(".title-desc", {
    opacity: 0,
    y: 30
  });

  gsap.set(".paren-group .paren", {
    opacity: 0,
    scale: 0.5
  });

  gsap.set(".avatar-group", {
    opacity: 0,
    scale: 0.8
  });

  gsap.set(".dna-icon", {
    opacity: 0,
    scale: 0.5,
    rotation: -30
  });

  gsap.set(".future-tag", {
    opacity: 0,
    x: 30
  });

  gsap.set(".badge", {
    opacity: 0,
    scale: 0.5
  });

  gsap.set(".res-item", {
    opacity: 0,
    y: 30
  });

  gsap.set(".wave-wrap", {
    opacity: 0,
    scale: 0.8
  });

  gsap.set(".bg-text", {
    opacity: 0,
    x: 100
  });

  /* =========================================
     ANIMACIÓN DE CARGA
     ========================================= */

  const intro = gsap.timeline({
    defaults: {
      ease: "power3.out"
    }
  });

  intro
    .to(".header > *", {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.1
    })

    .to(".eyebrow", {
      opacity: 1,
      y: 0,
      duration: 0.6
    }, "-=0.3")

    .to(".title .word", {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 1,
      stagger: 0.12
    }, "-=0.2")

    .to(".title-desc", {
      opacity: 1,
      y: 0,
      duration: 0.7
    }, "-=0.5")

    .to(".paren-group .paren", {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      stagger: 0.1
    }, "-=0.4")

    .to(".avatar-group", {
      opacity: 1,
      scale: 1,
      duration: 0.7
    }, "-=0.3")

    .to(".dna-icon", {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 0.8
    }, "-=0.4")

    .to(".future-tag", {
      opacity: 1,
      x: 0,
      duration: 0.6
    }, "-=0.4")

    .to(".badge", {
      opacity: 1,
      scale: 1,
      duration: 0.7
    }, "-=0.3")

    .to(".res-item", {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1
    }, "-=0.3")

    .to(".wave-wrap", {
      opacity: 1,
      scale: 1,
      duration: 1
    }, "-=0.8")

    .to(".bg-text", {
      opacity: 1,
      x: 0,
      duration: 1.2
    }, "-=0.8");


  /* =========================================
     ANIMACIÓN CONTINUA DE LA OLA
     ========================================= */

  gsap.to(".wave-wrap", {
    y: 15,
    duration: 3,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true
  });


  /* =========================================
     GLOW
     ========================================= */

  gsap.to(".wave-glow", {
    opacity: 0.5,
    scale: 1.08,
    duration: 2.5,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true
  });

  gsap.to(".wave-glow.b", {
    opacity: 0.4,
    scale: 1.12,
    duration: 3,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
    delay: 0.5
  });


  /* =========================================
     ANIMACIÓN DEL BADGE
     ========================================= */

  gsap.to(".badge", {
    y: -10,
    rotation: 2,
    duration: 2,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true
  });


  /* =========================================
     ANIMACIÓN DEL ADN
     ========================================= */

  gsap.to(".dna-icon", {
    rotation: 360,
    duration: 12,
    ease: "none",
    repeat: -1
  });


  /* =========================================
     ANIMACIÓN DE AVATARES
     ========================================= */

  gsap.to(".avatar-group img", {
    y: -5,
    duration: 1.8,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
    stagger: 0.2
  });


  /* =========================================
     SCROLL - PARALLAX
     ========================================= */

  gsap.to(".wave-wrap", {
    yPercent: 20,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });

  gsap.to(".bg-text", {
    yPercent: -30,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });

  gsap.to(".wave-glow", {
    yPercent: -15,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });


  /* =========================================
     REVEAL DE ELEMENTOS AL HACER SCROLL
     ========================================= */

  gsap.utils.toArray(".reveal").forEach(function (element) {

    gsap.from(element, {
      opacity: 0,
      y: 60,
      duration: 0.9,
      ease: "power3.out",

      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    });

  });


  /* =========================================
     CLAY CARDS
     ========================================= */

  gsap.utils.toArray(".clay-card").forEach(function (card) {

    card.addEventListener("mouseenter", function () {

      gsap.to(card, {
        scale: 1.03,
        y: -8,
        duration: 0.3,
        ease: "power2.out"
      });

    });

    card.addEventListener("mouseleave", function () {

      gsap.to(card, {
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out"
      });

    });

  });


  /* =========================================
     TILT DE TARJETAS
     ========================================= */

  gsap.utils.toArray(".clay-card").forEach(function (card) {

    card.addEventListener("mousemove", function (event) {

      const rect = card.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.3,
        ease: "power2.out"
      });

    });

    card.addEventListener("mouseleave", function () {

      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: "power2.out"
      });

    });

  });


  /* =========================================
     NAVIGATION PILLS
     ========================================= */

  const navPills = document.querySelectorAll(".nav-pill");

  navPills.forEach(function (pill) {

    pill.addEventListener("click", function () {

      navPills.forEach(function (item) {
        item.classList.remove("active");
      });

      pill.classList.add("active");

    });

  });


  /* =========================================
     BOTÓN CTA MAGNÉTICO
     ========================================= */

  const headerCTA = document.querySelector(".header-cta");

  if (headerCTA) {

    headerCTA.addEventListener("mousemove", function (event) {

      const rect = headerCTA.getBoundingClientRect();

      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      gsap.to(headerCTA, {
        x: x * 0.15,
        y: y * 0.15,
        duration: 0.3,
        ease: "power2.out"
      });

    });

    headerCTA.addEventListener("mouseleave", function () {

      gsap.to(headerCTA, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)"
      });

    });

  }


  /* =========================================
     RECURSOS - ITEM ACTIVO
     ========================================= */

  const resourceItems = document.querySelectorAll(".res-item");

  resourceItems.forEach(function (item) {

    item.addEventListener("mouseenter", function () {

      resourceItems.forEach(function (other) {
        other.classList.remove("active");
      });

      item.classList.add("active");

    });

  });


  /* =========================================
     PARALLAX CON EL MOUSE
     ========================================= */

  document.addEventListener("mousemove", function (event) {

    const mouseX =
      (event.clientX / window.innerWidth - 0.5) * 2;

    const mouseY =
      (event.clientY / window.innerHeight - 0.5) * 2;


    gsap.to(".wave-wrap", {
      x: mouseX * 15,
      y: mouseY * 10,
      duration: 1,
      ease: "power2.out"
    });


    gsap.to(".wave-glow", {
      x: mouseX * -10,
      y: mouseY * -8,
      duration: 1.2,
      ease: "power2.out"
    });


    gsap.to(".badge", {
      x: mouseX * 8,
      y: mouseY * 8,
      duration: 1,
      ease: "power2.out"
    });


    gsap.to(".bg-text", {
      x: mouseX * -20,
      duration: 1.5,
      ease: "power2.out"
    });

  });


  /* =========================================
     REFRESCAR SCROLLTRIGGER
     ========================================= */

  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });

})();