// Fondo de partículas
tsParticles.load("tsparticles", {
    fpsLimit: 60,
    particles: {
        color: { value: ["#FFC107", "#2196F3", "#4CAF50"] },
        links: { color: "#ffffff", distance: 130, enable: true, opacity: 0.15 },
        move: { enable: true, speed: 0.8 },
        number: { value: 60 },
        opacity: { value: 0.5 },
        size: { value: { min: 1, max: 4 } }
    }
});

let energiasData = [];

// =========================================================
// MÓDULO 03: CARGA DE ENERGÍAS
// =========================================================
async function loadEnergies() {
    try {
        const response = await fetch('energias-data.json');
        energiasData = await response.json();
        
        const container = document.getElementById('energy-buttons');
        container.innerHTML = '';

        energiasData.forEach((energia, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = `energy-btn-wrapper ${index === 0 ? 'active' : ''}`;
            wrapper.onclick = () => selectEnergy(energia.id);

            wrapper.innerHTML = `
                <div class="energy-circle-btn" style="background-color: ${energia.bg_color}; color: ${energia.color}">
                    <span>${energia.icono}</span>
                </div>
                <span class="energy-label">${energia.nombre}</span>
            `;
            container.appendChild(wrapper);
        });

        if (energiasData.length > 0) {
            displayEnergyDetail(energiasData[0]);
        }
    } catch (error) {
        console.error("Error al cargar los datos de energías:", error);
    }
}

function selectEnergy(id) {
    const selected = energiasData.find(e => e.id === id);
    if (!selected) return;

    const wrappers = document.querySelectorAll('.energy-btn-wrapper');
    wrappers.forEach((wrap, i) => {
        if (energiasData[i].id === id) wrap.classList.add('active');
        else wrap.classList.remove('active');
    });

    displayEnergyDetail(selected);
}

function displayEnergyDetail(energia) {
    document.getElementById('energy-title').innerText = `Energía ${energia.nombre}`;
    document.getElementById('energy-title').style.color = energia.color;
    document.getElementById('energy-mechanism').innerText = energia.mecanismo;

    const prosList = document.getElementById('energy-pros');
    prosList.innerHTML = energia.pros.map(pro => `<li>${pro}</li>`).join('');

    const contrasList = document.getElementById('energy-contras');
    contrasList.innerHTML = energia.contras.map(contra => `<li>${contra}</li>`).join('');
}


// =========================================================
// MÓDULO SIMULADOR: RED ELÉCTRICA (DRAG & DROP Y BIOMAS)
// =========================================================

const demandCurve = [45, 40, 38, 38, 40, 50, 70, 80, 75, 70, 70, 70, 70, 70, 70, 75, 85, 95, 100, 95, 85, 70, 60, 50]; 
const solarCurve  = [0, 0, 0, 0, 0, 0, 10, 30, 60, 85, 100, 100, 90, 70, 50, 20, 0, 0, 0, 0, 0, 0, 0, 0]; 
const windCurve   = [80, 85, 90, 85, 80, 70, 60, 50, 40, 30, 30, 40, 50, 60, 65, 70, 75, 80, 80, 80, 75, 75, 75, 80]; 

const techData = {
    'solar': { id: 'solar', nombre: 'Parque Solar', icono: '☀️', color: '#FFC107', bg: '#FFF8E1', mw: 15, costM: 12, type: 'variable' },
    'eolica': { id: 'eolica', nombre: 'Parque Eólico', icono: '🌬️', color: '#2196F3', bg: '#E3F2FD', mw: 15, costM: 18, type: 'variable' },
    'hidro': { id: 'hidro', nombre: 'Central Hidroeléctrica', icono: '🌊', color: '#03A9F4', bg: '#E0F7FA', mw: 25, costM: 50, type: 'base' },
    'biomasa': { id: 'biomasa', nombre: 'Planta de Biomasa', icono: '🌱', color: '#4CAF50', bg: '#E8F5E9', mw: 10, costM: 25, type: 'base' },
    'geo': { id: 'geo', nombre: 'Planta Geotérmica', icono: '♨️', color: '#FF9800', bg: '#FFF3E0', mw: 10, costM: 40, type: 'base' },
    'bateria': { id: 'bateria', nombre: 'Batería Litio', icono: '🔋', color: '#9C27B0', bg: '#F3E5F5', mw: 15, mwh: 60, costM: 20, type: 'storage' }
};

let placedUnits = []; 
let simChart = null;
let simInterval = null;

function initSimulatorUI() {
    const inv = document.getElementById('inventory');
    for (const key in techData) {
        const t = techData[key];
        const capText = t.type === 'storage' ? `Potencia: ${t.mw}MW | ${t.mwh}MWh` : `Capacidad: ${t.mw} MW`;
        inv.innerHTML += `
            <div class="draggable-item" draggable="true" ondragstart="drag(event, '${t.id}')">
                <div class="item-icon" style="background:${t.bg}; color:${t.color};">${t.icono}</div>
                <div class="item-info">
                    <h4>${t.nombre}</h4>
                    <p>${capText} | <strong>$${t.costM}M</strong></p>
                </div>
            </div>
        `;
    }
    
    const ctx = document.getElementById('simChart').getContext('2d');
    Chart.defaults.color = '#aaa';
    simChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 24}, (_, i) => `${i}:00`),
            datasets: [
                { label: 'Demanda', data: Array(24).fill(0), borderColor: '#FF5A36', backgroundColor: 'transparent', borderWidth: 2, tension: 0.4, borderDash: [5, 5] },
                { label: 'Generación', data: Array(24).fill(0), borderColor: '#46e6b4', backgroundColor: 'rgba(70, 230, 180, 0.2)', borderWidth: 2, fill: true, tension: 0.4 },
                { label: 'Apagón', data: Array(24).fill(0), backgroundColor: 'rgba(255, 90, 54, 0.5)', type: 'bar' }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, suggestedMax: 120 } },
            animation: { duration: 0 },
            plugins: { legend: { position: 'top', labels: { boxWidth: 10 } } }
        }
    });
}

function drag(ev, type) { ev.dataTransfer.setData("type", type); }
function allowDrop(ev) { ev.preventDefault(); }

function drop(ev) {
    ev.preventDefault();
    const typeId = ev.dataTransfer.getData("type");
    if (!techData[typeId]) return;

    const t = techData[typeId];
    const uniqueId = 'node_' + Math.random().toString(36).substr(2, 9);
    
    const rect = document.getElementById('dropzone').getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;

    // LÓGICA DE BIOMAS
    let assignedBiome = 'none';
    const halfWidth = rect.width / 2;
    const halfHeight = rect.height / 2;
    
    if (x < halfWidth && y < halfHeight) assignedBiome = 'desert';
    else if (x >= halfWidth && y < halfHeight) assignedBiome = 'coast';
    else if (x < halfWidth && y >= halfHeight) assignedBiome = 'river';
    else assignedBiome = 'forest';

    placedUnits.push({ uid: uniqueId, biome: assignedBiome, ...t });

    const nodeEl = document.createElement('div');
    nodeEl.className = 'placed-node';
    nodeEl.style.left = x + 'px';
    nodeEl.style.top = y + 'px';
    nodeEl.style.backgroundColor = t.bg;
    nodeEl.style.borderColor = t.color;
    nodeEl.innerHTML = t.icono;
    nodeEl.id = uniqueId;
    nodeEl.onclick = () => removeNode(uniqueId);

    document.getElementById('dropzone').appendChild(nodeEl);
    updateLiveStats();
    resetSimulationView();
}

function removeNode(uid) {
    placedUnits = placedUnits.filter(u => u.uid !== uid);
    document.getElementById(uid).remove();
    updateLiveStats();
    resetSimulationView();
}

function updateLiveStats() {
    let totalCap = 0;
    let totalCost = 0;
    
    placedUnits.forEach(u => {
        if(u.type !== 'storage') totalCap += u.mw;
        totalCost += u.costM;
    });

    document.getElementById('ui-cap').innerText = `${totalCap} MW`;
    document.getElementById('ui-cost').innerText = `$${totalCost} M`;
    
    document.getElementById('ui-status').innerText = totalCap >= 100 ? "Capacidad OK" : "Baja Capacidad";
    document.getElementById('ui-status').style.color = totalCap >= 100 ? "#4CAF50" : "#FFB300";

    updateBiomeVisuals();
}

function updateBiomeVisuals() {
    const counts = { desert: 0, coast: 0, river: 0, forest: 0 };
    
    placedUnits.forEach(u => {
        if(counts[u.biome] !== undefined) counts[u.biome]++;
    });

    Object.keys(counts).forEach(biome => {
        const el = document.getElementById(`biome-${biome}`);
        if(!el) return;
        
        el.classList.remove('stage-1', 'stage-2', 'stage-3');
        
        if (counts[biome] === 0) el.classList.add('stage-1');
        else if (counts[biome] <= 2) el.classList.add('stage-2');
        else el.classList.add('stage-3');
    });
}

function resetSimulationView() {
    clearInterval(simInterval);
    const btn = document.getElementById('btn-simulate');
    btn.disabled = false;
    btn.innerText = "▶ Simular 24 Horas";
    simChart.data.datasets.forEach(ds => ds.data.fill(0));
    simChart.update();
    document.getElementById('diagnosis-placeholder').classList.remove('hidden');
    document.getElementById('diagnosis-results').classList.add('hidden');
}

function runSimulation() {
    if (placedUnits.length === 0) return alert("¡Añade plantas al lienzo!");
    
    const btn = document.getElementById('btn-simulate');
    btn.disabled = true;
    btn.innerText = "Simulando...";
    
    simChart.data.datasets.forEach(ds => ds.data = []);

    let totalBatStorage = 0, totalBatPower = 0, currentBatCharge = 0, blackoutHours = 0;
    placedUnits.forEach(u => { if(u.type === 'storage') { totalBatStorage += u.mwh; totalBatPower += u.mw; }});

    let hour = 0;
    simInterval = setInterval(() => {
        if (hour >= 24) {
            clearInterval(simInterval);
            btn.innerText = "Simulación Completada";
            setTimeout(() => { btn.disabled = false; btn.innerText = "▶ Re-Simular"; }, 2000);
            showDiagnosis(blackoutHours);
            return;
        }

        const dem = demandCurve[hour];
        let genInstant = 0;

        placedUnits.forEach(u => {
            let multiplier = 1.0;
            if (u.id === 'solar' && u.biome === 'desert') multiplier = 1.30;
            if (u.id === 'eolica' && u.biome === 'coast') multiplier = 1.30;
            if (u.id === 'hidro' && u.biome === 'river') multiplier = 1.20;
            if ((u.id === 'biomasa' || u.id === 'geo') && u.biome === 'forest') multiplier = 1.20;

            if (u.id === 'solar') genInstant += (u.mw * multiplier) * (solarCurve[hour] / 100);
            else if (u.id === 'eolica') genInstant += (u.mw * multiplier) * (windCurve[hour] / 100);
            else if (u.type === 'base') genInstant += (u.mw * multiplier); 
        });

        let net = genInstant - dem;
        let deficitParaGrafica = 0, genEfectiva = genInstant;

        if (net > 0) {
            let carga = Math.min(net, totalBatStorage - currentBatCharge, totalBatPower);
            currentBatCharge += carga;
        } else if (net < 0) {
            let deficit = Math.abs(net);
            let descarga = Math.min(deficit, currentBatCharge, totalBatPower);
            currentBatCharge -= descarga;
            genEfectiva += descarga;
            net += descarga;

            if (net < -0.1) {
                deficitParaGrafica = Math.abs(net);
                blackoutHours++;
            }
        }

        simChart.data.datasets[0].data.push(dem);
        simChart.data.datasets[1].data.push(genEfectiva);
        simChart.data.datasets[2].data.push(deficitParaGrafica);
        simChart.update();

        hour++;
    }, 100);
}

function showDiagnosis(blackouts) {
    document.getElementById('diagnosis-placeholder').classList.add('hidden');
    document.getElementById('diagnosis-results').classList.remove('hidden');

    const cobertura = (((24 - blackouts) / 24) * 100).toFixed(1);
    document.getElementById('diag-cov').innerText = `${cobertura}%`;

    const rc = document.getElementById('dynamic-risks');
    rc.innerHTML = '';

    let nSol = placedUnits.filter(u => u.id === 'solar').length;
    let nEol = placedUnits.filter(u => u.id === 'eolica').length;
    let nHid = placedUnits.filter(u => u.id === 'hidro').length;
    let nBat = placedUnits.filter(u => u.id === 'bateria').length;
    let nGeo = placedUnits.filter(u => u.id === 'geo').length;

    if (blackouts > 0 || ((nSol + nEol) > 0 && nBat === 0)) {
        rc.innerHTML += `<div class="boundary-card alto" style="margin-bottom:10px; padding:10px;">
            <h3 style="font-size:1rem;">Intermitencia e Inestabilidad</h3>
            <p style="font-size:0.8rem;">Variabilidad climática genera fluctuaciones severas, requiriendo baterías masivas.</p>
        </div>`;
    }
    
    if (nSol + nEol >= 4) {
        rc.innerHTML += `<div class="boundary-card alto" style="margin-bottom:10px; padding:10px;">
            <h3 style="font-size:1rem;">Minerales y Tierras Raras</h3>
            <p style="font-size:0.8rem;">Alta dependencia de extracción intensiva de litio, cobalto y neodimio.</p>
        </div>`;
        rc.innerHTML += `<div class="boundary-card creciente" style="margin-bottom:10px; padding:10px;">
            <h3 style="font-size:1rem;">Uso del Suelo</h3>
            <p style="font-size:0.8rem;">Grandes parques requieren amplias extensiones provocando pérdida de hábitats.</p>
        </div>`;
    }

    if (nHid >= 2) {
        rc.innerHTML += `<div class="boundary-card creciente" style="margin-bottom:10px; padding:10px;">
            <h3 style="font-size:1rem;">Alteración Hidrológica</h3>
            <p style="font-size:0.8rem;">Las mega represas alteran el caudal de los ríos y afectan la biodiversidad acuática.</p>
        </div>`;
    }

    if (nEol > 0) {
        rc.innerHTML += `<div class="boundary-card seguro" style="margin-bottom:10px; padding:10px;">
            <h3 style="font-size:1rem;">Impacto en Fauna Silvestre</h3>
            <p style="font-size:0.8rem;">Riesgo mitigado mediante paradas programadas y sistemas acústicos.</p>
        </div>`;
    }

    if (rc.innerHTML === '') {
        rc.innerHTML = `<div class="boundary-card seguro" style="padding:10px;"><h3 style="font-size:1rem;">Red Balanceada</h3><p style="font-size:0.8rem;">Cobertura estable y mitigación de los principales impactos físicos analizados.</p></div>`;
    }
}

setTimeout(initSimulatorUI, 500);
loadEnergies();