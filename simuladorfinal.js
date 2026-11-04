const catalog = {
    infra: [
        { id: "ciudad", name: "Ciudad Autónoma", icon: "🏙️", color: "#29b6f6", cost: 180, demand: 22, affects: [{ idx: 3, val: 10 }, { idx: 5, val: 12 }, { idx: 0, val: 8 }] },
        { id: "granja", name: "Granja Intensiva", icon: "🚜", color: "#ffb300", cost: 100, demand: 8, affects: [{ idx: 2, val: 15 }, { idx: 3, val: 15 }, { idx: 5, val: 10 }, { idx: 1, val: 5 }] },
        { id: "mina", name: "Mina a Cielo Abierto", icon: "⛏️", color: "#8d6e63", cost: 140, demand: 12, affects: [{ idx: 4, val: 12 }, { idx: 8, val: 8 }, { idx: 1, val: 10 }, { idx: 3, val: 8 }] },
        { id: "fabrica", name: "Fábrica Química", icon: "🏭", color: "#ab47bc", cost: 160, demand: 18, affects: [{ idx: 4, val: 20 }, { idx: 8, val: 10 }, { idx: 6, val: 12 }, { idx: 0, val: 5 }] },
        { id: "transporte", name: "Corredor de Transporte", icon: "🚄", color: "#ef5350", cost: 120, demand: 10, affects: [{ idx: 0, val: 12 }, { idx: 3, val: 8 }, { idx: 8, val: 10 }] },
        { id: "represa", name: "Gran Represa", icon: "🌊", color: "#42a5f5", cost: 220, demand: 4, affects: [{ idx: 5, val: 18 }, { idx: 3, val: 7 }, { idx: 1, val: 5 }] }
    ],
    energy: [
        { id: "solar", name: "Parque Solar", icon: "☀️", color: "#ffc107", cost: 90, supply: 25, affects: [{ idx: 0, val: -5 }, { idx: 8, val: -3 }] },
        { id: "eolica", name: "Parque Eólico", icon: "🌬️", color: "#2196f3", cost: 120, supply: 25, affects: [{ idx: 0, val: -5 }, { idx: 8, val: -2 }] },
        { id: "hidro", name: "Central Hidroeléctrica", icon: "💧", color: "#03a9f4", cost: 190, supply: 40, affects: [{ idx: 5, val: 8 }, { idx: 3, val: 4 }] },
        { id: "biomasa", name: "Planta de Biomasa", icon: "🌱", color: "#4caf50", cost: 110, supply: 18, affects: [{ idx: 0, val: -2 }, { idx: 1, val: 3 }] },
        { id: "geo", name: "Planta Geotérmica", icon: "♨️", color: "#ff9800", cost: 160, supply: 20, affects: [{ idx: 0, val: -3 }] },
        { id: "bateria", name: "Batería de Litio", icon: "🔋", color: "#9c27b0", cost: 100, supply: 12, affects: [{ idx: 4, val: 5 }] }
    ],
    policy: [
        { id: "reserva", name: "Reserva Natural", icon: "🌳", color: "#4caf50", cost: 100, affects: [{ idx: 1, val: -15 }, { idx: 3, val: -10 }, { idx: 0, val: -5 }] },
        { id: "reforestacion", name: "Programa de Reforestación", icon: "🌲", color: "#66bb6a", cost: 80, affects: [{ idx: 0, val: -15 }, { idx: 1, val: -12 }, { idx: 3, val: -15 }, { idx: 5, val: -5 }] },
        { id: "reciclaje", name: "Red de Reciclaje", icon: "♻️", color: "#26a69a", cost: 70, affects: [{ idx: 4, val: -18 }, { idx: 2, val: -8 }, { idx: 8, val: -6 }] }
    ]
};

const placedItems = [];
let boundaries = [];
let simulationChart = null;
let mapRoot = null;
let worldChart = null;
let backgroundSeries = null;
let countrySeries = null;
let projectSeries = null;
let mapRotationAnimation = null;
let colombiaGeometry = null;
let currentScope = "global";
let budgetLimit = null;
let isFlatMap = false;
let selectedItemId = null;
let itemSequence = 0;
let initialized = false;
let simulationRan = false;
let economyStages = [];
let economyChain = [];
let economyEvaluated = false;
let economyScore = 0;
let selectedScope = "global";

function getAllCatalogItems() {
    return Object.values(catalog).flat();
}

function buildInventory() {
    Object.entries(catalog).forEach(([tab, items]) => {
        const container = document.getElementById(`tab-${tab}`);
        const heading = document.createElement("h3");
        heading.className = "inventory-heading";
        heading.textContent = tab === "infra" ? "Infraestructura" : tab === "energy" ? "Tecnologías de energía" : "Políticas ambientales";
        container.replaceChildren(heading);

        items.forEach(item => {
            const card = document.createElement("div");
            card.className = "inventory-item";
            card.dataset.itemId = item.id;
            card.draggable = true;
            card.tabIndex = 0;
            card.setAttribute("role", "button");
            card.setAttribute("aria-pressed", "false");
            card.addEventListener("click", () => selectItem(item.id));
            card.addEventListener("keydown", event => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                selectItem(item.id);
            });
            card.addEventListener("dragstart", event => drag(event, item.id));

            const icon = document.createElement("span");
            icon.className = "item-icon";
            icon.style.backgroundColor = `${item.color}24`;
            icon.style.color = item.color;
            icon.textContent = item.icon;

            const details = document.createElement("div");
            details.className = "item-info";
            const name = document.createElement("h4");
            name.textContent = item.name;
            const info = document.createElement("p");
            const capacities = [];
            if (item.supply) capacities.push(`Genera ${item.supply} MW`);
            if (item.demand) capacities.push(`Demanda +${item.demand} MW`);
            capacities.push(`$${item.cost} M`);
            info.textContent = capacities.join(" · ");

            details.append(name, info);
            card.append(icon, details);
            container.appendChild(card);
        });
    });
}

function switchTab(tab) {
    if (!catalog[tab]) return;

    document.querySelectorAll(".tab-btn").forEach(button => {
        const isActive = button.id === `tab-button-${tab}`;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-selected", String(isActive));
    });
    Object.keys(catalog).forEach(name => {
        const content = document.getElementById(`tab-${name}`);
        content.classList.toggle("active", name === tab);
        content.classList.toggle("hidden", name !== tab);
    });
}

async function initSimulator(scope) {
    if ((scope !== "global" && scope !== "colombia") || !economyEvaluated) return;
    currentScope = scope;
    document.getElementById("setup-modal").classList.add("hidden");
    document.getElementById("main-ui").classList.remove("hidden");

    buildInventory();
    switchTab("infra");
    initializeChart();
    initializeWorldMap();
    initializeParticles();
    document.getElementById("map-scope-label").textContent = scope === "colombia"
        ? "Explora y construye sobre el territorio colombiano"
        : "Explora y construye directamente sobre el globo";

    if (!initialized) {
        initialized = true;
        await loadBoundaries();
    }
    updateDashboard();
}

async function loadBoundaries() {
    const container = document.getElementById("progress-bars-container");
    try {
        const response = await fetch("limites-data.json");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error("El archivo no contiene límites planetarios.");

        boundaries = data;
        container.replaceChildren();
        boundaries.forEach((boundary, index) => {
            const item = document.createElement("div");
            item.className = "progress-item";
            item.innerHTML = `
                <div class="progress-label">
                    <span></span>
                    <span id="label-${index}"></span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" id="bar-${index}"></div>
                </div>`;
            item.querySelector(".progress-label span").textContent = boundary.nombre;
            container.appendChild(item);
        });
    } catch (error) {
        console.error("No se pudieron cargar los límites planetarios:", error);
        container.innerHTML = '<p class="data-error">No se pudieron cargar los límites. Abre el simulador mediante un servidor web local.</p>';
        document.getElementById("planet-status-text").textContent = "Datos de límites no disponibles";
        document.getElementById("planet-status-text").style.color = "#ff9a84";
    }
}

function drag(event, itemId) {
    selectItem(itemId);
    event.dataTransfer.setData("text/plain", itemId);
    event.dataTransfer.effectAllowed = "copy";
}

function selectItem(itemId) {
    if (!getAllCatalogItems().some(item => item.id === itemId)) return;
    selectedItemId = itemId;
    document.querySelectorAll(".inventory-item").forEach(card => {
        const isSelected = card.dataset.itemId === itemId;
        card.classList.toggle("selected", isSelected);
        card.setAttribute("aria-pressed", String(isSelected));
    });
    const item = getAllCatalogItems().find(entry => entry.id === itemId);
    const locationHint = currentScope === "colombia"
        ? "Solo puedes instalar proyectos dentro de Colombia."
        : "Pulsa sobre el planeta para instalarlo.";
    document.querySelector(".drop-hint").textContent = `Seleccionado: ${item.name}. ${locationHint}`;
}

function allowDrop(event) {
    const mapBounds = document.getElementById("chartdiv").getBoundingClientRect();
    const insideMap = event.clientX >= mapBounds.left && event.clientX <= mapBounds.right
        && event.clientY >= mapBounds.top && event.clientY <= mapBounds.bottom;
    if (!insideMap || !event.dataTransfer.types.includes("text/plain")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    document.getElementById("dropzone").classList.add("drag-over");
}

function leaveDropzone(event) {
    const dropzone = document.getElementById("dropzone");
    if (!dropzone.contains(event.relatedTarget)) {
        dropzone.classList.remove("drag-over");
    }
}

function drop(event) {
    const dropzone = document.getElementById("dropzone");
    dropzone.classList.remove("drag-over");
    const mapBounds = document.getElementById("chartdiv").getBoundingClientRect();
    const insideMap = event.clientX >= mapBounds.left && event.clientX <= mapBounds.right
        && event.clientY >= mapBounds.top && event.clientY <= mapBounds.bottom;
    if (!insideMap) return;
    event.preventDefault();

    const itemId = event.dataTransfer.getData("text/plain") || selectedItemId;
    placeItemOnPlanet(itemId, event.clientX, event.clientY, mapBounds);
}

function getGeographicPoint(clientX, clientY, mapBounds) {
    if (!worldChart) return null;
    const point = {
        x: clientX - mapBounds.left,
        y: clientY - mapBounds.top
    };
    if (!isFlatMap) {
        const radius = Math.min(mapBounds.width, mapBounds.height) * 0.49;
        const distanceFromCenter = Math.hypot(point.x - mapBounds.width / 2, point.y - mapBounds.height / 2);
        if (distanceFromCenter > radius) return null;
    }

    const coordinates = worldChart.invert(point);
    if (!coordinates || !Number.isFinite(coordinates.latitude) || !Number.isFinite(coordinates.longitude)) return null;
    if (coordinates.latitude < -90 || coordinates.latitude > 90 || coordinates.longitude < -180 || coordinates.longitude > 180) return null;
    if (currentScope === "colombia" && !isPointInColombia(coordinates.longitude, coordinates.latitude)) {
        document.querySelector(".drop-hint").textContent = "En el modo Colombia, solo puedes instalar proyectos dentro del país.";
        return null;
    }
    return coordinates;
}

function isPointOnRing(longitude, latitude, ring) {
    for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
        const [x1, y1] = ring[previous];
        const [x2, y2] = ring[index];
        const crossProduct = (longitude - x1) * (y2 - y1) - (latitude - y1) * (x2 - x1);
        const withinSegment = longitude >= Math.min(x1, x2) - 1e-8 && longitude <= Math.max(x1, x2) + 1e-8
            && latitude >= Math.min(y1, y2) - 1e-8 && latitude <= Math.max(y1, y2) + 1e-8;
        if (Math.abs(crossProduct) < 1e-8 && withinSegment) return true;
    }
    return false;
}

function isPointInRing(longitude, latitude, ring) {
    if (isPointOnRing(longitude, latitude, ring)) return true;
    let inside = false;
    for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
        const [x1, y1] = ring[index];
        const [x2, y2] = ring[previous];
        const crossesLatitude = (y1 > latitude) !== (y2 > latitude);
        if (crossesLatitude && longitude < (x2 - x1) * (latitude - y1) / (y2 - y1) + x1) {
            inside = !inside;
        }
    }
    return inside;
}

function isPointInColombia(longitude, latitude) {
    if (!colombiaGeometry) return false;
    const polygons = colombiaGeometry.type === "Polygon"
        ? [colombiaGeometry.coordinates]
        : colombiaGeometry.type === "MultiPolygon"
            ? colombiaGeometry.coordinates
            : [];
    return polygons.some(rings => isPointInRing(longitude, latitude, rings[0])
        && !rings.slice(1).some(ring => isPointInRing(longitude, latitude, ring)));
}

function placeItemOnPlanet(itemId, clientX, clientY, mapBounds) {
    const coordinates = getGeographicPoint(clientX, clientY, mapBounds);
    if (!coordinates) return;
    placeItemAtCoordinates(itemId, coordinates);
}

function placeItemAtCoordinates(itemId, coordinates) {
    const item = getAllCatalogItems().find(entry => entry.id === itemId);
    if (!item) return;

    const remainingBudget = getRemainingBudget();
    if (remainingBudget !== null && item.cost > remainingBudget) {
        window.alert("No hay presupuesto suficiente para instalar este elemento.");
        return;
    }

    const entry = {
        ...item,
        uid: `placed-${++itemSequence}`,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
    };
    placedItems.push(entry);
    updateProjectMarkers();
    stopMapRotation();
    selectedItemId = null;
    document.querySelectorAll(".inventory-item").forEach(card => {
        card.classList.remove("selected");
        card.setAttribute("aria-pressed", "false");
    });
    document.querySelector(".drop-hint").textContent = currentScope === "colombia"
        ? "Arrastra o selecciona un elemento y pulsa dentro de Colombia."
        : "Arrastra un elemento o selecciónalo y pulsa sobre el planeta.";
    updateDashboard();
}

function updateProjectMarkers() {
    if (!projectSeries) return;
    projectSeries.data.setAll(placedItems.map(item => ({
        id: item.uid,
        uid: item.uid,
        name: item.name,
        icon: item.icon,
        latitude: item.latitude,
        longitude: item.longitude
    })));
}

function removePlacedItem(uid) {
    const index = placedItems.findIndex(item => item.uid === uid);
    if (index < 0) return;
    placedItems.splice(index, 1);
    updateProjectMarkers();
    updateDashboard();
}

function getRemainingBudget() {
    if (budgetLimit === null) return null;
    return budgetLimit - placedItems.reduce((total, item) => total + item.cost, 0);
}

function calculateBoundaryValues() {
    return boundaries.map(boundary => {
        const impact = placedItems.reduce((total, item) => {
            const effect = (item.affects || []).find(entry => entry.idx === boundary.id);
            return total + (effect ? effect.val : 0);
        }, 0);
        const infrastructurePressure = Math.max(0, Math.min(100, boundary.baseVal + impact));
        const circularReduction = economyScore / 100 * 0.3;
        return infrastructurePressure * (1 - circularReduction);
    });
}

function updateDashboard() {
    simulationRan = false;
    document.getElementById("ui-demand").textContent = "Variable por día";
    document.getElementById("ui-supply").textContent = "Simula el día";
    const result = document.getElementById("simulation-result");
    result.textContent = "Simula el día para conocer la demanda aleatoria, la generación y el posible déficit.";
    result.classList.remove("simulation-deficit", "simulation-covered");
    if (simulationChart) {
        simulationChart.data.datasets.forEach(dataset => { dataset.data = []; });
        simulationChart.update();
    }
    const remainingBudget = getRemainingBudget();
    document.getElementById("ui-budget").textContent = remainingBudget === null ? "Sin límite" : `$${remainingBudget} M`;

    updateBoundaryBars();
    updateMapAppearance();
}

function updateBoundaryBars() {
    if (!boundaries.length) return;
    const values = calculateBoundaryValues();
    let exceeded = 0;

    values.forEach((value, index) => {
        const bar = document.getElementById(`bar-${index}`);
        const label = document.getElementById(`label-${index}`);
        if (!bar || !label) return;
        bar.style.width = `${value}%`;
        bar.style.backgroundColor = value < 50 ? "#4caf50" : value < 80 ? "#ffb300" : "#ff5252";
        label.textContent = `${Math.round(value)}%`;
        if (value >= 100) exceeded += 1;
    });

    const status = document.getElementById("planet-status-text");
    if (exceeded >= 3) {
        status.textContent = `Colapso Planetario (${exceeded} límites superados)`;
        status.style.color = "#ff5252";
    } else if (exceeded > 0) {
        status.textContent = `Riesgo crítico (${exceeded} límites superados)`;
        status.style.color = "#ffb300";
    } else {
        status.textContent = "Ecosistema Estable";
        status.style.color = "#4caf50";
    }
}

function initializeChart() {
    if (simulationChart) {
        simulationChart.resize();
        return;
    }
    const context = document.getElementById("simChart").getContext("2d");
    simulationChart = new Chart(context, {
        type: "line",
        data: {
            labels: Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`),
            datasets: [
                { label: "Demanda (MW)", data: [], borderColor: "#ff785f", borderWidth: 2, tension: 0.3 },
                { label: "Generación (MW)", data: [], borderColor: "#46e6b4", backgroundColor: "rgba(70, 230, 180, 0.15)", fill: true, borderWidth: 2, tension: 0.3 },
                { label: "Déficit (MW)", data: [], borderColor: "#ffb300", borderDash: [4, 4], borderWidth: 2, tension: 0.2 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                x: { ticks: { color: "#b7c2ce", maxTicksLimit: 8 }, grid: { color: "rgba(255,255,255,0.07)" } },
                y: { beginAtZero: true, ticks: { color: "#b7c2ce" }, grid: { color: "rgba(255,255,255,0.07)" } }
            },
            plugins: { legend: { labels: { color: "#e5eaf0", boxWidth: 10, font: { size: 10 } } } }
        }
    });
}

function runSimulation() {
    if (!simulationChart) return;

    const demandBase = currentScope === "colombia" ? 65 : 100;
    const installedDemand = placedItems.reduce((total, item) => total + (item.demand || 0), 0);
    const renewableItems = placedItems.filter(item => item.supply);
    const solarProfile = [0, 0, 0, 0, 0, 5, 15, 35, 60, 80, 95, 100, 95, 80, 60, 35, 15, 5, 0, 0, 0, 0, 0, 0];
    const windProfile = [70, 75, 80, 75, 70, 65, 55, 45, 40, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 85, 80, 75, 70];

    const demand = [];
    const generation = [];
    const deficit = [];
    const dailyDemandVariation = 0.9 + Math.random() * 0.2;
    for (let hour = 0; hour < 24; hour += 1) {
        const dailyFactor = hour >= 17 && hour <= 21 ? 1.25 : hour >= 0 && hour <= 5 ? 0.65 : 1;
        const hourlyVariation = 0.94 + Math.random() * 0.12;
        const hourlyDemand = Math.round((demandBase + installedDemand) * dailyFactor * dailyDemandVariation * hourlyVariation);
        const hourlySupply = renewableItems.reduce((total, item) => {
            if (item.id === "solar") return total + item.supply * solarProfile[hour] / 100;
            if (item.id === "eolica") return total + item.supply * windProfile[hour] / 100;
            return total + item.supply;
        }, 0);
        demand.push(hourlyDemand);
        generation.push(Math.round(hourlySupply));
        deficit.push(Math.max(0, Math.round(hourlyDemand - hourlySupply)));
    }

    simulationChart.data.datasets[0].data = demand;
    simulationChart.data.datasets[1].data = generation;
    simulationChart.data.datasets[2].data = deficit;
    simulationChart.update();

    const averageDemand = demand.reduce((total, value) => total + value, 0) / demand.length;
    const averageGeneration = generation.reduce((total, value) => total + value, 0) / generation.length;
    const totalDemand = demand.reduce((total, value) => total + value, 0);
    const totalGeneration = generation.reduce((total, value) => total + value, 0);
    const coverage = totalDemand > 0 ? Math.min(100, totalGeneration / totalDemand * 100) : 100;
    const deficitHours = deficit.filter(value => value > 0).length;
    const peakDemand = Math.max(...demand);
    document.getElementById("ui-demand").textContent = `Pico ${peakDemand} MW`;
    document.getElementById("ui-supply").textContent = `${Math.round(averageGeneration)} MW`;
    const result = document.getElementById("simulation-result");
    result.textContent = `Demanda media: ${Math.round(averageDemand)} MW · Generación media: ${Math.round(averageGeneration)} MW · Cobertura: ${Math.round(coverage)}% · Déficit en ${deficitHours} de 24 horas. La demanda de este día se generó aleatoriamente.`;
    result.classList.toggle("simulation-deficit", deficitHours > 0);
    result.classList.toggle("simulation-covered", deficitHours === 0);
    simulationRan = true;

    const button = document.getElementById("btn-simulate");
    button.textContent = "✓ Simulación completada";
    window.setTimeout(() => {
        button.textContent = "▶ Simular 24h";
    }, 1800);
}

function initializeWorldMap() {
    if (mapRoot) {
        mapRoot.resize();
        return;
    }

    if (!window.am5 || !window.am5map || !window.am5geodata_worldLow || !window.am5themes_Animated) {
        document.getElementById("chartdiv").innerHTML =
            '<p class="data-error">No se pudo cargar el globo interactivo. Comprueba tu conexión a internet.</p>';
        return;
    }

    mapRoot = am5.Root.new("chartdiv");
    const theme = am5.Theme.new(mapRoot);
    theme.rule("InterfaceColors").setAll({
        primaryButton: am5.color(0x8b5e3c),
        primaryButtonHover: am5.color(0x5c3a1e),
        primaryButtonDown: am5.color(0x3c1e0e),
        primaryButtonActive: am5.color(0xc4956a),
        primaryButtonText: am5.color(0xf5ece0),
        secondaryButton: am5.color(0xe8d5b7),
        secondaryButtonHover: am5.color(0xd4c4a8),
        secondaryButtonDown: am5.color(0xc4956a),
        secondaryButtonText: am5.color(0x3c1e0e),
        background: am5.color(0xe8d5b7),
        text: am5.color(0x3c1e0e)
    });
    mapRoot.setThemes([am5themes_Animated.new(mapRoot), theme]);

    worldChart = mapRoot.container.children.push(am5map.MapChart.new(mapRoot, {
        panX: currentScope === "colombia" ? "none" : "rotateX",
        panY: currentScope === "colombia" ? "none" : "rotateY",
        projection: am5map.geoOrthographic(),
        rotationX: currentScope === "colombia" ? 74 : -15,
        rotationY: currentScope === "colombia" ? -5 : -20,
        minZoomLevel: 0.5,
        zoomLevel: currentScope === "colombia" ? 2.4 : 0.9,
        wheelY: currentScope === "colombia" ? "none" : "zoom"
    }));

    backgroundSeries = worldChart.series.push(am5map.MapPolygonSeries.new(mapRoot, {}));
    backgroundSeries.mapPolygons.template.setAll({
        fill: am5.color(0xede4d4),
        fillOpacity: 1,
        strokeOpacity: 0
    });
    backgroundSeries.data.push({
        geometry: am5map.getGeoRectangle(90, 180, -90, -180)
    });

    const graticuleSeries = worldChart.series.push(am5map.GraticuleSeries.new(mapRoot, {}));
    graticuleSeries.mapLines.template.setAll({
        stroke: am5.color(0x8b5e3c),
        strokeOpacity: 0.2,
        strokeWidth: 0.5
    });

    countrySeries = worldChart.series.push(am5map.MapPolygonSeries.new(mapRoot, {
        geoJSON: am5geodata_worldLow
    }));
    countrySeries.mapPolygons.template.setAll({
        fill: am5.color(0xf5ece0),
        stroke: am5.color(0xc4956a),
        strokeWidth: 0.5,
        strokeOpacity: 0.5
    });

    const colombiaFeature = am5geodata_worldLow.features.find(feature => feature.id === "CO");
    colombiaGeometry = colombiaFeature ? colombiaFeature.geometry : null;
    if (currentScope === "colombia" && !colombiaGeometry) {
        console.error("No se pudo cargar el contorno geográfico de Colombia.");
        document.querySelector(".drop-hint").textContent = "No se pudo validar el territorio colombiano; no es posible instalar proyectos.";
    }

    countrySeries.events.on("datavalidated", updateMapAppearance);

    projectSeries = worldChart.series.push(am5map.MapPointSeries.new(mapRoot, {
        latitudeField: "latitude",
        longitudeField: "longitude"
    }));
    projectSeries.bullets.push(() => {
        const marker = am5.Container.new(mapRoot, {
            width: 38,
            height: 38,
            centerX: am5.p50,
            centerY: am5.p50,
            interactive: true,
            focusable: true,
            role: "button",
            cursorOverStyle: "pointer"
        });
        marker.children.push(am5.Circle.new(mapRoot, {
            x: am5.p50,
            y: am5.p50,
            centerX: am5.p50,
            centerY: am5.p50,
            radius: 18,
            fill: am5.color(0x10212e),
            fillOpacity: 0.95,
            stroke: am5.color(0x46e6b4),
            strokeWidth: 2
        }));
        marker.children.push(am5.Label.new(mapRoot, {
            x: am5.p50,
            y: am5.p50,
            centerX: am5.p50,
            centerY: am5.p50,
            text: "{icon}",
            populateText: true,
            fontSize: 20,
            textAlign: "center"
        }));
        marker.events.on("click", event => {
            const item = event.target.dataItem && event.target.dataItem.dataContext;
            if (item) removePlacedItem(item.uid);
        });
        return am5.Bullet.new(mapRoot, { sprite: marker });
    });

    const switchContainer = worldChart.children.push(am5.Container.new(mapRoot, {
        layout: mapRoot.horizontalLayout,
        x: 12,
        y: 12
    }));
    switchContainer.children.push(am5.Label.new(mapRoot, {
        centerY: am5.p50,
        text: "Globo",
        fill: am5.color(0xf5ece0),
        fontSize: 11
    }));
    const switchButton = switchContainer.children.push(am5.Button.new(mapRoot, {
        themeTags: ["switch"],
        centerY: am5.p50,
        icon: am5.Circle.new(mapRoot, { themeTags: ["icon"] })
    }));
    const transition = am5.ease.inOut(am5.ease.cubic);
    const transitionDuration = 1100;

    function showGlobe() {
        isFlatMap = false;
        worldChart.set("projection", am5map.geoOrthographic());
        worldChart.set("panX", currentScope === "colombia" ? "none" : "rotateX");
        worldChart.set("panY", currentScope === "colombia" ? "none" : "rotateY");
        worldChart.set("wheelY", currentScope === "colombia" ? "none" : "zoom");
        if (currentScope === "colombia") {
            worldChart.zoomToGeoPoint({ longitude: -74, latitude: 5 }, 2.4);
        } else {
            worldChart.animate({ key: "rotationX", to: -15, duration: transitionDuration, easing: transition });
            worldChart.animate({ key: "rotationY", to: -20, duration: transitionDuration, easing: transition });
        }
        backgroundSeries.mapPolygons.template.set("fillOpacity", 1);
        worldChart.set("minZoomLevel", 0.9);
        if (currentScope !== "colombia") {
            worldChart.animate({ key: "zoomLevel", to: 0.9, duration: transitionDuration, easing: transition });
        }
    }

    function showMap() {
        isFlatMap = true;
        worldChart.set("projection", am5map.geoMercator());
        worldChart.set("panX", currentScope === "colombia" ? "none" : "translateX");
        worldChart.set("panY", currentScope === "colombia" ? "none" : "translateY");
        worldChart.set("wheelY", currentScope === "colombia" ? "none" : "zoom");
        if (currentScope === "colombia") {
            worldChart.zoomToGeoPoint({ longitude: -74, latitude: 5 }, 5);
        } else {
            worldChart.animate({ key: "rotationX", to: 0, duration: transitionDuration, easing: transition });
            worldChart.animate({ key: "rotationY", to: 0, duration: transitionDuration, easing: transition });
        }
        backgroundSeries.mapPolygons.template.set("fillOpacity", 0);
        worldChart.set("minZoomLevel", 1);
        if (currentScope !== "colombia") {
            worldChart.animate({ key: "zoomLevel", to: 1.7, duration: transitionDuration, easing: transition });
        }
    }

    switchButton.on("active", () => {
        worldChart.goHome(transitionDuration);
        window.setTimeout(() => {
            worldChart.seriesContainer.animate({ key: "opacity", to: 0, duration: 250 });
        }, transitionDuration - 250);
        window.setTimeout(() => {
            if (switchButton.get("active")) showMap();
            else showGlobe();
            worldChart.seriesContainer.animate({ key: "opacity", to: 1, duration: 250 });
        }, transitionDuration);
    });
    switchContainer.children.push(am5.Label.new(mapRoot, {
        centerY: am5.p50,
        text: "Mapa",
        fill: am5.color(0xf5ece0),
        fontSize: 11
    }));

    const zoomControl = worldChart.set("zoomControl", am5map.ZoomControl.new(mapRoot, {}));
    zoomControl.homeButton.set("visible", currentScope !== "colombia");
    if (currentScope !== "colombia") {
        mapRotationAnimation = worldChart.animate({
            key: "rotationX",
            from: -15,
            to: 345,
            duration: 120000,
            loops: Infinity,
            easing: am5.ease.linear
        });
    }
    worldChart.chartContainer.events.on("pointerdown", () => {
        stopMapRotation();
    });
    document.getElementById("chartdiv").addEventListener("click", event => {
        if (!selectedItemId || event.target.closest(".am5-html-container, button, [role='button']")) return;
        const mapBounds = document.getElementById("chartdiv").getBoundingClientRect();
        placeItemOnPlanet(selectedItemId, event.clientX, event.clientY, mapBounds);
    });
    worldChart.appear(700, 100);
    if (currentScope === "colombia") {
        worldChart.zoomToGeoPoint({ longitude: -74, latitude: 5 }, 2.4);
    }
}

function updateMapAppearance() {
    if (!countrySeries) return;
    const colombia = countrySeries.dataItems.find(dataItem => dataItem.get("id") === "CO");
    const polygon = colombia && colombia.get("mapPolygon");
    if (!polygon) return;
    if (currentScope !== "colombia") {
        polygon.set("fill", am5.color(0xf5ece0));
        return;
    }
    const risk = boundaries.length ? Math.max(...calculateBoundaryValues()) : 35;
    const color = risk >= 80 ? 0xc6534b : risk >= 50 ? 0xc4a878 : 0x8fae7e;
    polygon.set("fill", am5.color(color));
}

function stopMapRotation() {
    if (!mapRotationAnimation) return;
    mapRotationAnimation.stop();
    mapRotationAnimation = null;
}

function initializeParticles() {
    if (!window.tsParticles || document.getElementById("tsparticles").dataset.initialized) return;
    document.getElementById("tsparticles").dataset.initialized = "true";
    window.tsParticles.load("tsparticles", {
        fpsLimit: 45,
        particles: {
            color: { value: ["#46e6b4", "#2080d0", "#ffc107"] },
            links: { color: "#ffffff", distance: 140, enable: true, opacity: 0.12 },
            move: { enable: true, speed: 0.5 },
            number: { value: 38 },
            opacity: { value: 0.35 },
            size: { value: { min: 1, max: 3 } }
        },
        detectRetina: true
    }).catch(error => console.error("No se pudo iniciar el fondo animado:", error));
}

function refreshSetupState() {
    const capEnabled = document.getElementById("budget-cap-toggle").checked;
    const capValue = Number(document.getElementById("budget-cap-input").value);
    const validBudget = !capEnabled || (Number.isFinite(capValue) && capValue > 0);
    const canEnter = economyEvaluated && validBudget;
    document.getElementById("btn-enter-simulator").disabled = !canEnter;

    const message = document.getElementById("setup-message");
    if (!economyEvaluated) {
        message.textContent = "Evalúa tu economía circular para habilitar el simulador.";
    } else if (!validBudget) {
        message.textContent = "Escribe un presupuesto máximo válido, mayor que cero y en millones.";
    } else {
        message.textContent = "Configuración lista. Ya puedes entrar al planeta.";
    }
}

function renderEconomyChain() {
    const container = document.getElementById("economy-chain");
    container.replaceChildren();
    if (!economyChain.length) {
        const emptyMessage = document.createElement("span");
        emptyMessage.className = "economy-empty";
        emptyMessage.textContent = "Agrega al menos una etapa para comenzar.";
        container.appendChild(emptyMessage);
        return;
    }

    economyChain.forEach((stage, index) => {
        const token = document.createElement("button");
        token.type = "button";
        token.className = "economy-token";
        token.title = `Quitar ${stage.nombre}`;
        token.setAttribute("aria-label", `Quitar ${stage.nombre} de la cadena`);
        token.textContent = `${stage.icono || "♻️"} ${stage.nombre} ×`;
        token.addEventListener("click", () => {
            economyChain.splice(index, 1);
            economyEvaluated = false;
            economyScore = 0;
            document.getElementById("economy-result").classList.add("hidden");
            renderEconomyChain();
            refreshSetupState();
        });
        container.appendChild(token);
    });
}

function evaluateEconomy() {
    if (!economyChain.length) {
        document.getElementById("setup-message").textContent = "Agrega al menos una etapa antes de evaluar.";
        return;
    }

    const counts = { diseno: 0, produccion: 0, consumo: 0, reutilizacion: 0 };
    economyChain.forEach(stage => {
        if (stage.id === "diseno") counts.diseno += 1;
        if (stage.id === "produccion") counts.produccion += 1;
        if (stage.id === "consumo") counts.consumo += 1;
        if (stage.id === "reutilizacion-reciclaje") counts.reutilizacion += 1;
    });

    let score = 0;
    if (counts.diseno > 0) score += 30;
    if (counts.produccion > 0) score += 20;
    if (counts.consumo > 0) score += 20;
    if (counts.reutilizacion > 0) score += 30;
    if (counts.reutilizacion > 0 && counts.diseno === 0) score -= 20;
    if (counts.produccion > 0 && counts.reutilizacion === 0) score -= 30;

    const totalStages = economyChain.length;
    const linearLoad = counts.produccion + counts.consumo;
    const circularLoad = counts.diseno + counts.reutilizacion;
    if (totalStages >= 10 && linearLoad > circularLoad * 2) {
        score -= 40;
    } else if (totalStages >= 12 && counts.diseno >= 3 && counts.produccion >= 3
        && counts.consumo >= 3 && counts.reutilizacion >= 3) {
        score = 100;
    } else if (counts.produccion > counts.consumo * 2 && counts.produccion >= 3) {
        score -= 40;
    } else if (counts.consumo > counts.produccion * 2 && counts.consumo >= 3) {
        score -= 40;
    }
    score = Math.max(0, Math.min(100, score));

    const status = score >= 80 ? "Cadena circular sólida" : score >= 40 ? "Riesgo creciente" : "Riesgo alto";
    const advice = score >= 80
        ? "La cadena contempla las fases clave. Mantén el equilibrio entre producción, consumo y recuperación."
        : "Refuerza las etapas que faltan: el ecodiseño reduce residuos desde el origen y la reutilización devuelve materiales al ciclo.";
    const result = document.getElementById("economy-result");
    result.textContent = `${status}: ${score}%. Diseño ${counts.diseno} · producción ${counts.produccion} · consumo ${counts.consumo} · reutilización/reciclaje ${counts.reutilizacion}. ${advice}`;
    result.classList.remove("hidden");
    result.classList.toggle("economy-result-good", score >= 80);
    result.classList.toggle("economy-result-risk", score < 40);
    economyScore = score;
    economyEvaluated = true;
    result.textContent += ` En el simulador, este resultado reduce la presión de los límites planetarios en ${Math.round(economyScore * 0.3)}% (máximo 30%).`;
    refreshSetupState();
}

async function initializeSetup() {
    const error = document.getElementById("economy-error");
    const stageButtons = document.getElementById("economy-stage-buttons");
    try {
        const response = await fetch("economiadata.json");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data.etapas) || data.etapas.length === 0) {
            throw new Error("No se encontraron etapas de economía circular.");
        }
        economyStages = data.etapas;
        economyStages.forEach(stage => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "economy-stage-btn";
            button.setAttribute("aria-label", `Agregar ${stage.nombre}`);
            button.innerHTML = `<span>${stage.icono || "♻️"}</span><strong></strong>`;
            button.querySelector("strong").textContent = stage.nombre;
            button.addEventListener("click", () => {
                economyChain.push(stage);
                economyEvaluated = false;
                economyScore = 0;
                document.getElementById("economy-result").classList.add("hidden");
                renderEconomyChain();
                refreshSetupState();
            });
            stageButtons.appendChild(button);
        });
    } catch (loadError) {
        console.error("No se pudieron cargar las etapas de economía circular:", loadError);
        error.textContent = "No se pudieron cargar las etapas. Abre el simulador mediante un servidor web local y vuelve a intentarlo.";
        error.classList.remove("hidden");
        document.getElementById("btn-evaluate-economy").disabled = true;
    }

    document.getElementById("btn-evaluate-economy").addEventListener("click", evaluateEconomy);
    document.getElementById("btn-clear-economy").addEventListener("click", () => {
        economyChain = [];
        economyEvaluated = false;
        economyScore = 0;
        document.getElementById("economy-result").classList.add("hidden");
        renderEconomyChain();
        refreshSetupState();
    });
    document.querySelectorAll(".scope-btn").forEach(button => {
        button.addEventListener("click", () => {
            selectedScope = button.dataset.scope;
            document.querySelectorAll(".scope-btn").forEach(scopeButton => {
                const isSelected = scopeButton === button;
                scopeButton.classList.toggle("selected", isSelected);
                scopeButton.setAttribute("aria-pressed", String(isSelected));
            });
        });
    });
    const budgetToggle = document.getElementById("budget-cap-toggle");
    const budgetInput = document.getElementById("budget-cap-input");
    budgetToggle.addEventListener("change", () => {
        budgetInput.disabled = !budgetToggle.checked;
        refreshSetupState();
    });
    budgetInput.addEventListener("input", refreshSetupState);
    document.getElementById("btn-enter-simulator").addEventListener("click", () => {
        if (!economyEvaluated) return;
        if (budgetToggle.checked) {
            const cap = Number(budgetInput.value);
            if (!Number.isFinite(cap) || cap <= 0) {
                refreshSetupState();
                return;
            }
            budgetLimit = cap;
        } else {
            budgetLimit = null;
        }
        initSimulator(selectedScope);
    });
    renderEconomyChain();
    refreshSetupState();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeSetup, { once: true });
} else {
    initializeSetup();
}

window.initSimulator = initSimulator;
window.switchTab = switchTab;
window.drag = drag;
window.selectItem = selectItem;
window.allowDrop = allowDrop;
window.leaveDropzone = leaveDropzone;
window.drop = drop;
window.runSimulation = runSimulation;
