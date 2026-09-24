// Variable global para guardar el control de las partículas
let particlesContainer;

// 1. Configuración de partículas de fondo original
tsParticles.load("tsparticles", {
    fpsLimit: 60,
    interactivity: {
        events: {
            onHover: { enable: true, mode: "grab" },
            resize: true,
        },
        modes: {
            grab: { distance: 150, links: { opacity: 0.8 } },
        },
    },
    particles: {
        color: { value: ["#417B2B", "#2080D0", "#FF5A36"] },
        links: {
            color: "#ffffff", distance: 120, enable: true, opacity: 0.15, width: 1,
        },
        move: {
            enable: true, speed: 0.8, direction: "none", random: true, straight: false,
            outModes: { default: "bounce" },
        },
        number: { density: { enable: true, area: 800 }, value: 70 },
        opacity: { value: 0.5 },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 4 } },
    },
    detectRetina: true,
}).then(container => {
    particlesContainer = container; // Guardamos la instancia
});

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const responseEco = await fetch("economiadata.json");
        const data = await responseEco.json();

        // 2. REFERENCIAS DOM PARA ECONOMÍA CIRCULAR Y SIMULADOR
        const etapas = data.etapas || [];
        const buttonsContainer = document.getElementById("energy-buttons");
        const titleEl = document.getElementById("energy-title");
        const mechanismEl = document.getElementById("energy-mechanism");
        const prosEl = document.getElementById("energy-pros");
        const contrasEl = document.getElementById("energy-contras");
        
        // Elementos del Simulador Holográfico
        const holoBtn = document.getElementById("btn-holo");
        const holoWorld = document.getElementById("holo-world");
        let isHoloActive = false;
        let currentItemData = null; // Guarda la etapa actual seleccionada

        // Lógica del Botón Iniciar Simulación
        // Lógica del Botón Iniciar Simulación
        if (holoBtn) {
            holoBtn.addEventListener("click", () => {
                isHoloActive = !isHoloActive;
                
                if (isHoloActive) {
                    holoWorld.classList.add("active");
                    holoBtn.innerHTML = "🔴 Detener Simulación";
                    holoBtn.style.borderColor = "#FF5A36";
                    holoBtn.style.color = "#FF5A36";
                    holoBtn.style.backgroundColor = "#0a0f16"; // Fuerza fondo oscuro al activar
                    renderHoloSimulation(currentItemData); 
                } else {
                    holoWorld.classList.remove("active");
                    holoBtn.innerHTML = "🌐 Iniciar Simulación Holográfica";
                    holoBtn.style.borderColor = "#46e6b4";
                    holoBtn.style.color = "#46e6b4";
                    holoBtn.style.backgroundColor = "#0a0f16"; // Fuerza fondo oscuro al detener
                }
            });
        }

        // Cargar botones superiores
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

        // Mostrar detalles y actualizar simulación
        function mostrarDetalle(itemData) {
            currentItemData = itemData; // Guardamos el estado actual
            
            if (titleEl) titleEl.textContent = itemData.nombre;
            if (mechanismEl) mechanismEl.textContent = itemData.mecanismo || itemData.descripcion;
            if (prosEl && itemData.pros) prosEl.innerHTML = itemData.pros.map(pro => `<li>${pro}</li>`).join("");
            if (contrasEl && itemData.contras) contrasEl.innerHTML = itemData.contras.map(contra => `<li>${contra}</li>`).join("");

            // Si el simulador está abierto, lo actualizamos dinámicamente
            if (isHoloActive) {
                renderHoloSimulation(itemData);
            }
        }

     // Función que genera las métricas y el mundo con órbitas de impacto
      // Función que genera las métricas y el mundo con órbitas de impacto
        function renderHoloSimulation(itemData) {
            if (!holoWorld || !itemData) return;

            let metrics = [];
            let orbitHTML = "";
            let planeta = "🌍"; // Planeta base
            
            // LÓGICA DE ÓRBITAS Y MÉTRICAS SEGÚN LA ETAPA
            if (itemData.id === "diseno") {
                planeta = "🌎"; // Cambia el ángulo del planeta
                metrics = [
                    { name: "Reducción Materia Virgen", percent: 85, color: "#4CAF50" },
                    { name: "Aumento de Reparabilidad", percent: 95, color: "#4CAF50" },
                    { name: "Costos de Ingeniería I+D", percent: 65, color: "#FF5A36" }
                ];
                orbitHTML = `
                    <div class="impact-orbit" style="animation-duration: 9s;">
                        <span class="impact-item pos-top" style="color:#4CAF50; border: 1px solid #4CAF50;" title="Ecodiseño">🌳</span>
                    </div>
                    <div class="impact-orbit" style="animation-duration: 14s; animation-direction: reverse;">
                        <span class="impact-item pos-bottom" style="color:#FF5A36; border: 1px solid #FF5A36;" title="Alta Inversión">🪙</span>
                    </div>
                `;
            } else if (itemData.id === "produccion") {
                planeta = "🌏"; 
                metrics = [
                    { name: "Reducción de Emisiones CO2", percent: 75, color: "#0097A7" },
                    { name: "Reaprovechamiento de Agua", percent: 90, color: "#0097A7" },
                    { name: "Renovación de Maquinaria", percent: 80, color: "#FFB300" }
                ];
                orbitHTML = `
                    <div class="impact-orbit" style="animation-duration: 7s;">
                        <span class="impact-item pos-left" style="color:#0097A7; border: 1px solid #0097A7;" title="Energía Limpia">☀️</span>
                        <span class="impact-item pos-right" style="color:#FFB300; border: 1px solid #FFB300;" title="Restructuración">🏭</span>
                    </div>
                `;
            } else if (itemData.id === "consumo") {
                planeta = "🌍";
                metrics = [
                    { name: "Extensión de Vida Útil", percent: 80, color: "#66BB6A" },
                    { name: "Ahorro del Consumidor", percent: 70, color: "#66BB6A" },
                    { name: "Caída en Ventas Nuevas", percent: 45, color: "#FF5A36" }
                ];
                orbitHTML = `
                    <div class="impact-orbit" style="animation-duration: 10s;">
                        <span class="impact-item pos-top" style="color:#66BB6A; border: 1px solid #66BB6A;" title="Reparabilidad">🛠️</span>
                    </div>
                    <div class="impact-orbit" style="animation-duration: 12s; animation-direction: reverse;">
                        <span class="impact-item pos-bottom" style="color:#FF5A36; border: 1px solid #FF5A36;" title="Impacto Fabricantes">📉</span>
                    </div>
                `;
            } else if (itemData.id === "reutilizacion-reciclaje") {
                planeta = "🌎"; 
                metrics = [
                    { name: "Desvío de Vertederos", percent: 92, color: "#2E7D32" },
                    { name: "Ahorro Energético", percent: 60, color: "#2E7D32" },
                    { name: "Degradación de Materiales", percent: 35, color: "#FFB300" }
                ];
                orbitHTML = `
                    <div class="impact-orbit" style="animation-duration: 6s;">
                        <span class="impact-item pos-left" style="color:#2E7D32; border: 1px solid #2E7D32;" title="Nuevo Ciclo">♻️</span>
                    </div>
                    <div class="impact-orbit" style="animation-duration: 15s; animation-direction: reverse;">
                        <span class="impact-item pos-right" style="color:#FFB300; border: 1px solid #FFB300;" title="Pérdida de calidad">🗑️</span>
                    </div>
                `;
            }

            // Construir las barras de estadísticas
            let metricsHTML = metrics.map(m => `
                <div class="metric-item">
                    <div class="metric-label">
                        <span>${m.name}</span>
                        <span style="color: ${m.color}">${m.percent}%</span>
                    </div>
                    <div class="metric-bar-bg">
                        <div class="metric-bar-fill" style="background-color: ${m.color}; color: ${m.color}; width: 0%;" data-target="${m.percent}%"></div>
                    </div>
                </div>
            `).join("");

            // Inyectar el mundo y las métricas
            holoWorld.innerHTML = `
                <div class="holo-content">
                    <div class="holo-visual">
                        <div class="holo-ring" style="border-color: ${itemData.color}"></div>
                        <div class="holo-ring-inner" style="border-color: ${itemData.color}"></div>
                        
                        <div class="holo-globe-wrapper">
                            <div class="holo-planet" style="filter: drop-shadow(0 0 20px ${itemData.color}80);">${planeta}</div>
                            ${orbitHTML}
                        </div>
                    </div>
                    <div class="holo-metrics">
                        ${metricsHTML}
                    </div>
                </div>
            `;

            setTimeout(() => {
                const bars = holoWorld.querySelectorAll('.metric-bar-fill');
                bars.forEach(bar => {
                    bar.style.width = bar.getAttribute('data-target');
                });
            }, 50);
        }

        // 3. CARGAR REJILLA DE RIESGOS EN ECONOMÍA CIRCULAR (Simulador de Ecosistema)
        const riesgos = data.riesgos || [];
        const grid = document.getElementById("boundaries-grid");
        
        if (grid && Array.isArray(riesgos)) {
            grid.innerHTML = "";

            riesgos.forEach(item => {
                const card = document.createElement("div");
                card.className = "boundary-card";
                card.style.borderTop = `2px solid ${item.color}`;
                card.title = "Haz clic para ver el impacto en el ecosistema"; 

                card.innerHTML = `
                    <h3 style="color: ${item.color}; margin-bottom: 6px; font-size: 1.15rem; font-weight: 600;">${item.nombre}</h3>
                    <p style="font-size: 0.85rem; margin-bottom: 8px; color: #ffffff;">
                        <strong>Estado:</strong> ${item.estado}
                    </p>
                    <p style="font-size: 0.82rem; opacity: 0.85; line-height: 1.4; margin: 0; color: #d0d0d0;">
                        ${item.descripcion}
                    </p>
                `;

                // Evento click que transforma el fondo
                card.addEventListener("click", () => {
                    cambiarEcosistema(item.estado, card);
                });

                grid.appendChild(card);
            });
        }

    } catch (error) {
        console.error("Error al cargar economiadata.json:", error);
    }
});

// 4. FUNCIÓN PARA CAMBIAR EL FONDO Y PARTÍCULAS (Impacto Ambiental)
function cambiarEcosistema(estado, cardElement) {
    document.body.className = '';
    document.querySelectorAll('.boundary-card').forEach(c => c.classList.remove('alerta'));

    if (!particlesContainer) return;

    if (estado === "riesgo alto") {
        document.body.classList.add("estado-alto");
        cardElement.classList.add("alerta");
        
        particlesContainer.options.particles.color.value = ["#FF3333", "#8B0000", "#FF5A36"];
        particlesContainer.options.particles.move.speed = 4;
        particlesContainer.options.particles.links.opacity = 0; 
        particlesContainer.options.particles.number.value = 120; 
        
    } else if (estado === "riesgo creciente") {
        document.body.classList.add("estado-creciente");
        cardElement.classList.add("alerta"); 
        
        particlesContainer.options.particles.color.value = ["#FFB300", "#D2B48C", "#DAA520"];
        particlesContainer.options.particles.move.speed = 1.5;
        particlesContainer.options.particles.links.opacity = 0.05;
        particlesContainer.options.particles.number.value = 90;
        
    } else if (estado === "seguro") {
        document.body.classList.add("estado-seguro");
        
        particlesContainer.options.particles.color.value = ["#417B2B", "#2080D0", "#46e6b4"];
        particlesContainer.options.particles.move.speed = 0.8;
        particlesContainer.options.particles.links.opacity = 0.2;
        particlesContainer.options.particles.number.value = 70;
    }

    particlesContainer.refresh();
}