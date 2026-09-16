// =========================================
// MENÚ DE NAVEGACIÓN
// =========================================

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach(function (item) {

    item.addEventListener("click", function (event) {

        event.preventDefault();

        // Quitar active de todos
        navItems.forEach(function (nav) {
            nav.classList.remove("active");
        });

        // Activar el seleccionado
        item.classList.add("active");

    });

});


// =========================================
// BOTÓN START NOW
// =========================================

const startButton = document.querySelector(".start-button");



// =========================================
// ANIMACIÓN DEL BOTÓN
// =========================================

startButton.addEventListener("mouseenter", function () {

    this.style.transform = "translateY(-3px)";

});


startButton.addEventListener("mouseleave", function () {

    this.style.transform = "translateY(0)";

});


// =========================================
// FLECHAS LATERALES
// =========================================

const arrows = document.querySelectorAll(".small-arrow");

arrows.forEach(function (arrow) {

    arrow.addEventListener("click", function () {

        console.log("Flecha seleccionada");

    });

});