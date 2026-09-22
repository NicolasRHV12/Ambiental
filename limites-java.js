
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("limitesdata.json");
        const limitesData = await response.json();

        const buttonsContainer = document.getElementById("energy-buttons");

        const titleEl = document.getElementById("energy-title");
        const mechanismEl = document.getElementById("energy-mechanism");
        const prosEl = document.getElementById("energy-pros");
        const contrasEl = document.getElementById("energy-contras");

        if (!buttonsContainer) return;

        buttonsContainer.innerHTML = "";

        limitesData.forEach((item, index) => {
            const wrapper = document.createElement("div");
            wrapper.className = `energy-btn-wrapper ${index === 0 ? "active" : ""}`;
            wrapper.dataset.id = item.id;

            wrapper.innerHTML = `
                <div class="energy-circle-btn" style="background-color: ${item.bg_color}; display: flex; align-items: center; justify-content: center; width: 80px; height: 80px; border-radius: 50%; cursor: pointer;">
                    <span style="font-size: 32px;">${item.icono}</span>
                </div>
                <span class="energy-label">${item.nombre}</span>
            `;

            wrapper.addEventListener("click", () => {
                document.querySelectorAll(".energy-btn-wrapper").forEach(w => w.classList.remove("active"));
                wrapper.classList.add("active");
                mostrarDetalle(item);
            });

            buttonsContainer.appendChild(wrapper);
        });

        if (limitesData.length > 0) {
            mostrarDetalle(limitesData[0]);
        }

        function mostrarDetalle(data) {
            if (titleEl) {
                titleEl.textContent = data.nombre;
            }
            
            if (mechanismEl) {
                mechanismEl.textContent = data.mecanismo;
            }

            if (prosEl) {
                prosEl.innerHTML = data.pros.map(pro => `<li>${pro}</li>`).join("");
            }

            if (contrasEl) {
                contrasEl.innerHTML = data.contras.map(contra => `<li>${contra}</li>`).join("");
            }
        }

    } catch (error) {
        console.error("Error al cargar los datos de limitesdata.json:", error);
    }
});

tsParticles.load("tsparticles", {
    fpsLimit: 60,
    interactivity: {
        events: {
            onHover: {
                enable: true,
                mode: "grab", // Conecta las partículas con el cursor al pasar por encima
            },
            resize: true,
        },
        modes: {
            grab: {
                distance: 150,
                links: {
                    opacity: 0.8, // Opacidad de las líneas que se unen al cursor
                },
            },
        },
    },
    particles: {
        color: {
            value: ["#417B2B", "#2080D0", "#FF5A36"], // Verde, Azul y Naranja
        },
        links: {
            color: "#ffffff",
            distance: 120,
            enable: true,
            opacity: 0.15,
            width: 1,
        },
        move: {
            enable: true,
            speed: 0.8, // Movimiento lento y orgánico
            direction: "none",
            random: true,
            straight: false,
            outModes: {
                default: "bounce", // Rebotan en los bordes de la pantalla
            },
        },
        number: {
            density: {
                enable: true,
                area: 800,
            },
            value: 70, // Cantidad de nodos (procesos ecológicos)
        },
        opacity: {
            value: 0.5,
        },
        shape: {
            type: "circle",
        },
        size: {
            value: { min: 1, max: 4 },
        },
    },
    detectRetina: true,
});
// Función para cargar y renderizar los límites planetarios
async function loadBoundaries() {
    try {
        // Hacemos el fetch al archivo JSON local
        const response = await fetch('limites-data.json');
        const data = await response.json();
        
        const grid = document.getElementById('boundaries-grid');
        
        // Recorremos cada elemento del JSON para crear su tarjeta
        data.forEach(limite => {
            const card = document.createElement('div');
            card.className = 'boundary-card';
            // Aplicamos el color de estado al borde superior
            card.style.borderTopColor = limite.color; 
            
            card.innerHTML = `
                <h3 style="color: ${limite.color}">${limite.nombre}</h3>
                <p><strong>Estado:</strong> ${limite.estado.replace('-', ' ')}</p>
                <p>${limite.descripcion}</p>
            `;
            
            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Error al cargar los datos de los límites:", error);
    }
}
loadBoundaries();