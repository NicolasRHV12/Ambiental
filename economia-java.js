let particlesContainer;

// 1. CONFIGURACIÓN DEL ECOSISTEMA
tsParticles.load("tsparticles", {
    fpsLimit: 60,
    interactivity: {
        events: { onHover: { enable: true, mode: "grab" }, resize: true },
        modes: { grab: { distance: 150, links: { opacity: 0.8 } } },
    },
    particles: {
        color: { value: ["#417B2B", "#2080D0", "#FF5A36"] },
        links: { color: "#ffffff", distance: 120, enable: true, opacity: 0.15, width: 1 },
        move: { enable: true, speed: 0.8, direction: "none", random: true, straight: false, outModes: { default: "bounce" } },
        number: { density: { enable: true, area: 800 }, value: 70 },
        opacity: { value: 0.5 },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 4 } },
    },
    detectRetina: true,
}).then(container => { particlesContainer = container; });

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const responseEco = await fetch("economiadata.json");
        const data = await responseEco.json();

        const etapas = data.etapas || [];
        const riesgos = data.riesgos || []; 

        // Referencias - Módulo 02
        const buttonsContainer = document.getElementById("energy-buttons");
        const titleEl = document.getElementById("energy-title");
        const mechanismEl = document.getElementById("energy-mechanism");
        const prosEl = document.getElementById("energy-pros");
        const contrasEl = document.getElementById("energy-contras");
        const holoBtn = document.getElementById("btn-holo");
        const holoWorld = document.getElementById("holo-world");
        let isHoloActive = false;
        let currentItemData = null;

        // Referencias - Laboratorio
        const sandboxButtons = document.getElementById("sandbox-buttons");
        const cycleTrack = document.getElementById("cycle-track");
        const btnAnalyze = document.getElementById("btn-analyze");
        const btnClear = document.getElementById("btn-clear");
        let activeCycle = []; 

        // 2. LÓGICA MÓDULO 02 (Lectura)
        if (buttonsContainer && Array.isArray(etapas)) {
            buttonsContainer.innerHTML = "";
            etapas.forEach((item, index) => {
                const wrapper = document.createElement("div");
                wrapper.className = `energy-btn-wrapper ${index === 0 ? "active" : ""}`;
                wrapper.dataset.id = item.id;
                wrapper.innerHTML = `
                    <div class="energy-circle-btn" style="background-color: ${item.bg_color || '#1b2d23'}; border-color: ${item.color || '#46e6b4'}; width: 80px; height: 80px; border-radius: 50%; cursor: pointer;">
                        <span style="font-size: 32px;">${item.icono || '🔄'}</span>
                    </div>
                    <span class="energy-label">${item.nombre}</span>
                `;
                wrapper.addEventListener("click", () => {
                    document.querySelectorAll("#energy-buttons .energy-btn-wrapper").forEach(w => w.classList.remove("active"));
                    wrapper.classList.add("active");
                    mostrarDetalle(item);
                });
                buttonsContainer.appendChild(wrapper);
            });
            if (etapas.length > 0) mostrarDetalle(etapas[0]);
        }

        function mostrarDetalle(itemData) {
            currentItemData = itemData; 
            if (titleEl) titleEl.textContent = itemData.nombre;
            if (mechanismEl) mechanismEl.textContent = itemData.mecanismo || itemData.descripcion;
            if (prosEl && itemData.pros) prosEl.innerHTML = itemData.pros.map(pro => `<li>${pro}</li>`).join("");
            if (contrasEl && itemData.contras) contrasEl.innerHTML = itemData.contras.map(contra => `<li>${contra}</li>`).join("");
            
            if (isHoloActive) renderHoloSimulation(itemData);
        }

        if (holoBtn) {
            holoBtn.addEventListener("click", () => {
                isHoloActive = !isHoloActive;
                if (isHoloActive) {
                    holoWorld.classList.add("active");
                    holoBtn.innerHTML = "🔴 Detener Simulación";
                    holoBtn.style.borderColor = "#FF5A36";
                    holoBtn.style.color = "#FF5A36";
                    holoBtn.style.backgroundColor = "#0a0f16";
                    renderHoloSimulation(currentItemData); 
                } else {
                    holoWorld.classList.remove("active");
                    holoBtn.innerHTML = "🌐 Iniciar Simulación Holográfica";
                    holoBtn.style.borderColor = "#46e6b4";
                    holoBtn.style.color = "#46e6b4";
                    holoBtn.style.backgroundColor = "#0a0f16";
                }
            });
        }

        function renderHoloSimulation(itemData) {
            if (!holoWorld || !itemData) return;
            let metrics = []; let orbitHTML = ""; let planeta = "🌍"; 
            
            if (itemData.id === "diseno") {
                planeta = "🌎"; 
                metrics = [{ name: "Reducción Materia Virgen", percent: 85, color: "#4CAF50" }, { name: "Aumento de Reparabilidad", percent: 95, color: "#4CAF50" }, { name: "Costos de Ingeniería I+D", percent: 65, color: "#FF5A36" }];
                orbitHTML = `<div class="impact-orbit" style="animation-duration: 9s;"><span class="impact-item pos-top" style="color:#4CAF50; border: 1px solid #4CAF50;">🌳</span></div><div class="impact-orbit" style="animation-duration: 14s; animation-direction: reverse;"><span class="impact-item pos-bottom" style="color:#FF5A36; border: 1px solid #FF5A36;">🪙</span></div>`;
            } else if (itemData.id === "produccion") {
                planeta = "🌏"; 
                metrics = [{ name: "Reducción de Emisiones CO2", percent: 75, color: "#0097A7" }, { name: "Reaprovechamiento de Agua", percent: 90, color: "#0097A7" }, { name: "Renovación de Maquinaria", percent: 80, color: "#FFB300" }];
                orbitHTML = `<div class="impact-orbit" style="animation-duration: 7s;"><span class="impact-item pos-left" style="color:#0097A7; border: 1px solid #0097A7;">☀️</span><span class="impact-item pos-right" style="color:#FFB300; border: 1px solid #FFB300;">🏭</span></div>`;
            } else if (itemData.id === "consumo") {
                planeta = "🌍";
                metrics = [{ name: "Extensión de Vida Útil", percent: 80, color: "#66BB6A" }, { name: "Ahorro del Consumidor", percent: 70, color: "#66BB6A" }, { name: "Caída en Ventas Nuevas", percent: 45, color: "#FF5A36" }];
                orbitHTML = `<div class="impact-orbit" style="animation-duration: 10s;"><span class="impact-item pos-top" style="color:#66BB6A; border: 1px solid #66BB6A;">🛠️</span></div><div class="impact-orbit" style="animation-duration: 12s; animation-direction: reverse;"><span class="impact-item pos-bottom" style="color:#FF5A36; border: 1px solid #FF5A36;">📉</span></div>`;
            } else if (itemData.id === "reutilizacion-reciclaje") {
                planeta = "🌎"; 
                metrics = [{ name: "Desvío de Vertederos", percent: 92, color: "#2E7D32" }, { name: "Ahorro Energético", percent: 60, color: "#2E7D32" }, { name: "Degradación de Materiales", percent: 35, color: "#FFB300" }];
                orbitHTML = `<div class="impact-orbit" style="animation-duration: 6s;"><span class="impact-item pos-left" style="color:#2E7D32; border: 1px solid #2E7D32;">♻️</span></div><div class="impact-orbit" style="animation-duration: 15s; animation-direction: reverse;"><span class="impact-item pos-right" style="color:#FFB300; border: 1px solid #FFB300;">🗑️</span></div>`;
            }

            let metricsHTML = metrics.map(m => `
                <div class="metric-item">
                    <div class="metric-label"><span>${m.name}</span><span style="color: ${m.color}">${m.percent}%</span></div>
                    <div class="metric-bar-bg"><div class="metric-bar-fill" style="background-color: ${m.color}; color: ${m.color}; width: 0%;" data-target="${m.percent}%"></div></div>
                </div>
            `).join("");

            holoWorld.innerHTML = `
                <div class="holo-content">
                    <div class="holo-visual"><div class="holo-ring" style="border-color: ${itemData.color}"></div><div class="holo-ring-inner" style="border-color: ${itemData.color}"></div><div class="holo-globe-wrapper"><div class="holo-planet" style="filter: drop-shadow(0 0 20px ${itemData.color}80);">${planeta}</div>${orbitHTML}</div></div>
                    <div class="holo-metrics">${metricsHTML}</div>
                </div>
            `;
            setTimeout(() => { holoWorld.querySelectorAll('.metric-bar-fill').forEach(bar => { bar.style.width = bar.getAttribute('data-target'); }); }, 50);
        }

        // 3. LÓGICA DEL LABORATORIO EVALUADOR
        if (sandboxButtons && Array.isArray(etapas)) {
            sandboxButtons.innerHTML = "";
            etapas.forEach((item) => {
                const wrapper = document.createElement("div");
                wrapper.className = "energy-btn-wrapper";
                wrapper.innerHTML = `
                    <div class="energy-circle-btn" style="background-color: ${item.bg_color}; border-color: ${item.color}; width: 60px; height: 60px; border-radius: 50%; cursor: pointer;">
                        <span style="font-size: 24px;">${item.icono}</span>
                    </div>
                    <span class="energy-label" style="font-size: 0.8rem; color: #aaa;">+ Añadir</span>
                `;
                wrapper.addEventListener("click", () => { agregarAlCiclo(item); });
                sandboxButtons.appendChild(wrapper);
            });
        }

        function agregarAlCiclo(itemData) { activeCycle.push(itemData); actualizarTrackVisual(); }

        function actualizarTrackVisual() {
            if (activeCycle.length === 0) {
                cycleTrack.innerHTML = `<span id="empty-msg" class="empty-track-msg">Tu cadena de valor está vacía. Añade una etapa.</span>`;
                return;
            }
            cycleTrack.innerHTML = "";
            activeCycle.forEach((item) => {
                const token = document.createElement("div");
                token.className = "cycle-token";
                token.style.border = `2px solid ${item.color}`;
                token.innerHTML = `<span>${item.icono}</span> <span>${item.nombre}</span>`;
                cycleTrack.appendChild(token);
            });
        }

        if (btnClear) {
            btnClear.addEventListener("click", () => {
                activeCycle = [];
                actualizarTrackVisual();
                const scoreDisplay = document.getElementById("score-display");
                if (scoreDisplay) scoreDisplay.remove();
                document.body.className = '';
                document.querySelectorAll('.boundary-card, .sandbox-container').forEach(c => c.classList.remove('alerta'));
                if (particlesContainer) {
                    particlesContainer.options.particles.color.value = ["#417B2B", "#2080D0", "#FF5A36"];
                    particlesContainer.options.particles.move.speed = 0.8;
                    particlesContainer.refresh();
                }
            });
        }

        // 4. MOTOR LÓGICO DE EVALUACIÓN Y EJEMPLOS REALES GLOBALES
        if (btnAnalyze) {
            btnAnalyze.addEventListener("click", () => {
                if (activeCycle.length === 0) { alert("⚠️ Añade al menos una etapa al evaluador."); return; }

                const conteo = { diseno: 0, produccion: 0, consumo: 0, reutilizacion: 0 };
                activeCycle.forEach(item => {
                    if (item.id === "diseno") conteo.diseno++;
                    if (item.id === "produccion") conteo.produccion++;
                    if (item.id === "consumo") conteo.consumo++;
                    if (item.id === "reutilizacion-reciclaje") conteo.reutilizacion++;
                });

                let score = 0;
                if (conteo.diseno > 0) score += 30;
                if (conteo.produccion > 0) score += 20;
                if (conteo.consumo > 0) score += 20;
                if (conteo.reutilizacion > 0) score += 30;
                if (conteo.reutilizacion > 0 && conteo.diseno === 0) score -= 20; 
                if (conteo.produccion > 0 && conteo.reutilizacion === 0) score -= 30; 
                score = Math.max(0, Math.min(100, score));

                let specificRiskIds = [];
                let riesgoDetonado = "seguro";
                let colorPuntaje = "#4CAF50";
                let descripcionImpacto = "";
                let idEscenarioGlobal = ""; // ID para cargar el ejemplo real en el Modal

                if (score === 100) { 
                    specificRiskIds = ["simbiosis-industrial", "modelos-mantenimiento-alquiler"]; 
                    descripcionImpacto = "<strong>Proyección a Futuro:</strong> Este sistema representa el ideal de la economía circular. Al diseñar para la durabilidad y garantizar el retorno de materiales, has cerrado el ciclo. La extracción de recursos vírgenes se detiene y la huella de carbono se minimiza radicalmente.";
                    idEscenarioGlobal = "perfecto";
                } 
                else if (conteo.produccion > 0 && conteo.consumo > 0 && conteo.diseno === 0 && conteo.reutilizacion === 0) { 
                    specificRiskIds = ["extrativismo-lineal", "fuga-residuos"]; 
                    descripcionImpacto = "<strong>Proyección a Futuro:</strong> Modelo estrictamente lineal (tomar, hacer, desechar). Provocará un colapso rápido en los vertederos, alta toxicidad y una dependencia extrema de cadenas de suministro vulnerables.";
                    idEscenarioGlobal = "lineal";
                } 
                else if (conteo.reutilizacion > 0 && conteo.diseno === 0) { 
                    specificRiskIds = ["degradacion-materiales", "dependencia-energetica-reciclaje"]; 
                    descripcionImpacto = "<strong>Proyección a Futuro:</strong> Intentar reciclar productos no diseñados para ello es costoso e ineficiente. El modelo sufrirá de 'infraciclaje' (pérdida de calidad) y consumirá demasiada energía fósil intentando separar componentes complejos.";
                    idEscenarioGlobal = "infraciclaje";
                } 
                else if (conteo.diseno > 0 && conteo.produccion > 0 && conteo.reutilizacion === 0) { 
                    specificRiskIds = ["logistica-inversa-incompleta", "obsolescencia-programada"]; 
                    descripcionImpacto = "<strong>Proyección a Futuro:</strong> Tienes un buen inicio con el ecodiseño, pero al carecer de logística de retorno, los productos premium terminarán en la basura. Esto representa una fuga masiva de capital y materiales valiosos hacia los ecosistemas naturales.";
                    idEscenarioGlobal = "fuga";
                } 
                else { 
                    specificRiskIds = ["logistica-inversa-incompleta", "greenwashing"]; 
                    descripcionImpacto = "<strong>Proyección a Futuro:</strong> Modelo de transición con vulnerabilidades. Aunque hay intentos de sostenibilidad, las piezas desconectadas generarán cuellos de botella operativos y contaminación localizada.";
                    idEscenarioGlobal = "transicion";
                }

                if (score < 40) { riesgoDetonado = "riesgo alto"; colorPuntaje = "#FF5A36"; } 
                else if (score < 80) { riesgoDetonado = "riesgo creciente"; colorPuntaje = "#FFB300"; }

                const generatedRisks = riesgos.filter(r => specificRiskIds.includes(r.id));
                // Hemos quitado el botón de las minitarjetas para ponerlo en el panel principal
                let risksHTML = generatedRisks.map(r => `
                    <div class="mini-risk-card" style="border-color: ${r.color};">
                        <h5 style="color: ${r.color};">${r.nombre}</h5>
                        <p>${r.descripcion}</p>
                    </div>
                `).join("");

                let scoreDisplay = document.getElementById("score-display");
                if (!scoreDisplay) {
                    scoreDisplay = document.createElement("div");
                    scoreDisplay.id = "score-display";
                    scoreDisplay.style.marginTop = "20px";
                    document.querySelector(".sandbox-container").appendChild(scoreDisplay);
                }

                scoreDisplay.innerHTML = `
                    <div class="sandbox-results">
                        <div class="sandbox-score-panel">
                            <h4 style="margin-bottom: 5px; color: #fff;">📊 Análisis del Modelo</h4>
                            <span style="font-size: 2.2rem; font-weight: bold; color: ${colorPuntaje};">${score}%</span>
                            <p style="margin-top: 10px; color: #e0e0e0; font-size: 0.95rem; line-height: 1.5; margin-bottom: 20px;">
                                ${descripcionImpacto}
                            </p>
                            <button id="btn-global-example" class="holo-btn" style="width: 100%; font-size: 0.85rem; padding: 10px; border-color: ${colorPuntaje}; color: ${colorPuntaje};">👁️ Ver Ejemplo Real de este Escenario</button>
                        </div>
                        <div class="sandbox-risks-panel">
                            ${risksHTML}
                        </div>
                    </div>
                `;

                // Añadir el evento al nuevo botón global
                setTimeout(() => {
                    document.getElementById('btn-global-example').addEventListener('click', () => {
                        abrirModalEjemploGlobal(idEscenarioGlobal, colorPuntaje);
                    });
                }, 100);

                cambiarEcosistema(riesgoDetonado, document.querySelector('.sandbox-container'));
            });
        }

       // 5. MODAL DE EJEMPLOS REALES GLOBALES CON IMÁGENES
        function abrirModalEjemploGlobal(idEscenario, color) {
            const modal = document.getElementById('example-modal');
            const visual = document.getElementById('modal-visual');
            const title = document.getElementById('modal-title');
            const text = document.getElementById('modal-text');
            
            // Base de datos actualizada para usar imágenes fotográficas
            const escenariosReales = {
                "perfecto": { 
                    titulo: "Philips: Luz como Servicio (LaaS)", 
                    texto: "En el aeropuerto de Schiphol, Philips no vende bombillas; vende luz. Ellos son dueños de los equipos, por lo que diseñan luminarias que duran décadas y consumen poca energía. Si una se funde, Philips la recupera y recicla el 100% de los materiales. Cero basura electrónica, máxima rentabilidad.", 
                    imagen: "img/philips-circular.jpg", // Reemplaza con la ruta de tu foto
                    clase: "escena-verde"
                },
                "lineal": { 
                    titulo: "Dunas Tóxicas del Fast Fashion", 
                    texto: "En el Desierto de Atacama en Chile se acumulan más de 39,000 toneladas anuales de ropa barata (producida y consumida linealmente). Estos basurales textiles tardan 200 años en biodegradarse, liberando toxinas al subsuelo y asfixiando por completo el ecosistema desértico.", 
                    imagen: "img/atacama-ropa.jpg", // Reemplaza con la ruta de tu foto
                    clase: "escena-plastico"
                },
                "infraciclaje": { 
                    titulo: "El Mito del Reciclaje de Envases Flexibles", 
                    texto: "Millones de bolsas de snacks combinan capas de aluminio y plástico prensadas. Intentar reciclarlas consume inmensas cantidades de energía térmica y química. El resultado es un material oscuro y de baja calidad ('madera plástica') que no evita la extracción de nuevo aluminio para hacer más bolsas.", 
                    imagen: "img/maderanegra.jpeg", // <-- RUTA ACTUALIZADA
                    clase: "escena-toxica"
                },
                "fuga": { 
                    titulo: "Entierro Masivo de Oro y Coltán", 
                    texto: "Cada año se desechan 50 millones de toneladas de basura electrónica. Teléfonos de alta gama terminan en vertederos porque no hay logística de retorno. Enterramos metales preciosos valorados en 62,000 millones de dólares mientras destruimos selvas para minar más.", 
                    imagen: "img/ewaste-oro.jpg", // Reemplaza con la ruta de tu foto
                    clase: "escena-toxica"
                },
                "transicion": { 
                    titulo: "Logística Rota: Exportación de Basura", 
                    texto: "Muchos países recogen el plástico PET pero, al no tener capacidad industrial para procesarlo, lo exportan en barcos al sudeste asiático, donde termina siendo quemado a cielo abierto o arrojado a los ríos.", 
                    imagen: "img/exportacion-basura.jpeg", // Reemplaza con la ruta de tu foto
                    clase: "escena-plastico"
                }
            };

            const data = escenariosReales[idEscenario];
            
            title.textContent = data.titulo;
            title.style.color = color;
            text.textContent = data.texto;
            
            // Inyectamos la imagen fotográfica en lugar de los emojis
            visual.className = `modal-visual ${data.clase}`;
            visual.innerHTML = `<img src="${data.imagen}" alt="${data.titulo}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.9; transition: opacity 0.3s;">`;
            
            modal.classList.add('show');
        }
        // CERRAR EL MODAL
        document.getElementById('close-modal')?.addEventListener('click', () => {
            document.getElementById('example-modal').classList.remove('show');
        });
        
        document.getElementById('example-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'example-modal') {
                e.target.classList.remove('show');
            }
        });

        // 6. CARGAR REJILLA DE RIESGOS INFERIOR
        const grid = document.getElementById("boundaries-grid");
        if (grid && Array.isArray(riesgos)) {
            grid.innerHTML = "";
            riesgos.forEach(item => {
                const card = document.createElement("div");
                card.className = "boundary-card";
                card.style.borderTop = `2px solid ${item.color}`;
                card.innerHTML = `<h3 style="color: ${item.color}; margin-bottom: 6px; font-size: 1.15rem; font-weight: 600;">${item.nombre}</h3><p style="font-size: 0.85rem; margin-bottom: 8px; color: #ffffff;"><strong>Estado:</strong> ${item.estado}</p><p style="font-size: 0.82rem; opacity: 0.85; line-height: 1.4; margin: 0; color: #d0d0d0;">${item.descripcion}</p>`;
                card.addEventListener("click", () => { cambiarEcosistema(item.estado, card); });
                grid.appendChild(card);
            });
        }

    } catch (error) { console.error("Error:", error); }
});

function cambiarEcosistema(estado, targetElement) {
    document.body.className = '';
    document.querySelectorAll('.boundary-card, .sandbox-container').forEach(c => c.classList.remove('alerta'));
    if (!particlesContainer) return;

    if (estado === "riesgo alto") {
        document.body.classList.add("estado-alto");
        if(targetElement) targetElement.classList.add("alerta");
        particlesContainer.options.particles.color.value = ["#FF3333", "#8B0000", "#FF5A36"];
        particlesContainer.options.particles.move.speed = 4;
        particlesContainer.options.particles.links.opacity = 0; 
        particlesContainer.options.particles.number.value = 120; 
    } else if (estado === "riesgo creciente") {
        document.body.classList.add("estado-creciente");
        if(targetElement) targetElement.classList.add("alerta"); 
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