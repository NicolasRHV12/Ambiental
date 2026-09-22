// Configuración de partículas de fondo
tsParticles.load("tsparticles", {
    fpsLimit: 60,
    interactivity: {
        events: {
            onHover: {
                enable: true,
                mode: "grab",
            },
            resize: true,
        },
        modes: {
            grab: {
                distance: 150,
                links: {
                    opacity: 0.8,
                },
            },
        },
    },
    particles: {
        color: {
            value: ["#417B2B", "#2080D0", "#FF5A36"],
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
            speed: 0.8,
            direction: "none",
            random: true,
            straight: false,
            outModes: {
                default: "bounce",
            },
        },
        number: {
            density: {
                enable: true,
                area: 800,
            },
            value: 70,
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

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const responseEco = await fetch("economiadata.json");
        const data = await responseEco.json();

        // 1. CARGAR BOTONES SUPERIORES DE ECONOMÍA CIRCULAR
        const etapas = data.etapas || [];
        const buttonsContainer = document.getElementById("energy-buttons");
        const titleEl = document.getElementById("energy-title");
        const mechanismEl = document.getElementById("energy-mechanism");
        const prosEl = document.getElementById("energy-pros");
        const contrasEl = document.getElementById("energy-contras");

        if (buttonsContainer && Array.isArray(etapas)) {
            buttonsContainer.innerHTML = "";

            etapas.forEach((item, index) => {
                const wrapper = document.createElement("div");
                wrapper.className = `energy-btn-wrapper ${index === 0 ? "active" : ""}`;
                wrapper.dataset.id = item.id;

                wrapper.innerHTML = `
                    <div class="energy-circle-btn" style="background-color: ${item.bg_color || '#1b2d23'}; border-color: ${item.color || '#46e6b4'}; display: flex; align-items: center; justify-content: center; width: 80px; height: 80px; border-radius: 50%; cursor: pointer;">
                        <span style="font-size: 32px;">${item.icono || '🔄'}</span>
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

            if (etapas.length > 0) {
                mostrarDetalle(etapas[0]);
            }
        }

        function mostrarDetalle(itemData) {
            if (titleEl) titleEl.textContent = itemData.nombre;
            if (mechanismEl) mechanismEl.textContent = itemData.mecanismo || itemData.descripcion;
            if (prosEl && itemData.pros) prosEl.innerHTML = itemData.pros.map(pro => `<li>${pro}</li>`).join("");
            if (contrasEl && itemData.contras) contrasEl.innerHTML = itemData.contras.map(contra => `<li>${contra}</li>`).join("");
        }

        // 2. CARGAR REJILLA DE RIESGOS EN ECONOMÍA CIRCULAR
        const riesgos = data.riesgos || [];
        const grid = document.getElementById("boundaries-grid");
        
        if (grid && Array.isArray(riesgos)) {
            grid.innerHTML = "";

            riesgos.forEach(item => {
                const card = document.createElement("div");
                card.className = "boundary-card";
                card.style.borderTop = `2px solid ${item.color}`;

                card.innerHTML = `
                    <h3 style="color: ${item.color}; margin-bottom: 6px; font-size: 1.15rem; font-weight: 600;">${item.nombre}</h3>
                    <p style="font-size: 0.85rem; margin-bottom: 8px; color: #ffffff;">
                        <strong>Estado:</strong> ${item.estado}
                    </p>
                    <p style="font-size: 0.82rem; opacity: 0.85; line-height: 1.4; margin: 0; color: #d0d0d0;">
                        ${item.descripcion}
                    </p>
                `;

                grid.appendChild(card);
            });
        }

    } catch (error) {
        console.error("Error al cargar economiadata.json:", error);
    }
});