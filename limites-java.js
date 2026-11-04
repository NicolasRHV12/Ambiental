// =========================================================
// MÓDULO SIMULADOR: CONSTRUCTOR DE CIVILIZACIONES Y PLANETA 3D
// =========================================================

let boundariesData = [];
let limitesDetalleData = [];

const megaprojects = {
    'ciudad': { id: 'ciudad', nombre: 'Ciudad Autónoma', icono: '🏙️', bg: '#29B6F6', affects: [{idx: 3, val: 10}, {idx: 5, val: 12}, {idx: 0, val: 8}] },
    'granja': { id: 'granja', nombre: 'Granja Intensiva', icono: '🚜', bg: '#FFB300', affects: [{idx: 2, val: 15}, {idx: 3, val: 15}, {idx: 5, val: 10}, {idx: 1, val: 5}] },
    'mina': { id: 'mina', nombre: 'Mina a Cielo Abierto', icono: '⛏️', bg: '#8D6E63', affects: [{idx: 4, val: 12}, {idx: 8, val: 8}, {idx: 1, val: 10}, {idx: 3, val: 8}] },
    'fabrica': { id: 'fabrica', nombre: 'Fábrica Química', icono: '🏭', bg: '#AB47BC', affects: [{idx: 4, val: 20}, {idx: 8, val: 10}, {idx: 6, val: 12}, {idx: 0, val: 5}] },
    'reserva': { id: 'reserva', nombre: 'Reserva Natural', icono: '🌲', bg: '#4CAF50', affects: [{idx: 1, val: -15}, {idx: 3, val: -10}, {idx: 0, val: -5}] },
    'transporte': { id: 'transporte', nombre: 'Corredor de Transporte', icono: '🚄', bg: '#EF5350', affects: [{idx: 0, val: 12}, {idx: 3, val: 8}, {idx: 8, val: 10}] },
    'represa': { id: 'represa', nombre: 'Gran Represa', icono: '🌊', bg: '#42A5F5', affects: [{idx: 5, val: 18}, {idx: 3, val: 7}, {idx: 1, val: 5}] },
    'solar': { id: 'solar', nombre: 'Campo Solar', icono: '☀️', bg: '#FDD835', affects: [{idx: 0, val: -12}, {idx: 8, val: -5}, {idx: 4, val: 3}] },
    'reforestacion': { id: 'reforestacion', nombre: 'Programa de Reforestación', icono: '🌳', bg: '#66BB6A', affects: [{idx: 0, val: -15}, {idx: 1, val: -12}, {idx: 3, val: -15}, {idx: 5, val: -5}] },
    'reciclaje': { id: 'reciclaje', nombre: 'Red de Reciclaje', icono: '♻️', bg: '#26A69A', affects: [{idx: 4, val: -18}, {idx: 2, val: -8}, {idx: 8, val: -6}] }
};

let placedProjects = [];

// Variables Globales de Three.js para modificarlas desde el simulador
let planetMaterial, glowMaterial, planetMesh, planetClouds, glowSprite;

if (window.tsParticles) {
    tsParticles.load('tsparticles', {
        fpsLimit: 60,
        interactivity: {
            events: {
                onHover: { enable: true, mode: 'grab' },
                resize: true
            },
            modes: {
                grab: {
                    distance: 150,
                    links: { opacity: 0.8 }
                }
            }
        },
        particles: {
            color: { value: ['#417B2B', '#2080D0', '#FF5A36'] },
            links: {
                color: '#ffffff',
                distance: 120,
                enable: true,
                opacity: 0.15,
                width: 1
            },
            move: {
                enable: true,
                speed: 0.8,
                direction: 'none',
                random: true,
                straight: false,
                outModes: { default: 'bounce' }
            },
            number: {
                density: { enable: true, area: 800 },
                value: 70
            },
            opacity: { value: 0.5 },
            shape: { type: 'circle' },
            size: { value: { min: 1, max: 4 } }
        },
        detectRetina: true
    });
}

async function loadBoundaryDetails() {
    try {
        const response = await fetch('limitesdata.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        limitesDetalleData = await response.json();
        const container = document.getElementById('energy-buttons');
        if (!container) return;

        container.innerHTML = '';
        limitesDetalleData.forEach((limite, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = `energy-btn-wrapper ${index === 0 ? 'active' : ''}`;
            wrapper.onclick = () => selectBoundaryDetail(limite.id);
            wrapper.innerHTML = `
                <div class="energy-circle-btn" style="background-color: ${limite.bg_color}; color: ${limite.color}">
                    <span>${limite.icono}</span>
                </div>
                <span class="energy-label">${limite.nombre}</span>
            `;
            container.appendChild(wrapper);
        });

        if (limitesDetalleData.length > 0) displayBoundaryDetail(limitesDetalleData[0]);
    } catch (error) {
        console.error('Error al cargar los detalles de los límites:', error);
    }
}

function selectBoundaryDetail(id) {
    const selected = limitesDetalleData.find(limite => limite.id === id);
    if (!selected) return;

    document.querySelectorAll('.energy-btn-wrapper').forEach((wrapper, index) => {
        wrapper.classList.toggle('active', limitesDetalleData[index].id === id);
    });
    displayBoundaryDetail(selected);
}

function displayBoundaryDetail(limite) {
    document.getElementById('energy-title').innerText = limite.nombre;
    document.getElementById('energy-title').style.color = limite.color;
    document.getElementById('energy-mechanism').innerText = limite.mecanismo;
    document.getElementById('energy-pros').innerHTML = limite.pros.map(pro => `<li>${pro}</li>`).join('');
    document.getElementById('energy-contras').innerHTML = limite.contras.map(contra => `<li>${contra}</li>`).join('');
}

function initBuilderUI() {
    const inv = document.getElementById('inventory');
    inv.innerHTML = `<h2>Megaproyectos</h2><p style="font-size:0.85rem; color:#aaa; margin-bottom:15px;">Arrastra infraestructuras al lienzo superior.</p>`;
    
    for (const key in megaprojects) {
        const m = megaprojects[key];
        inv.innerHTML += `
            <div class="draggable-item" draggable="true" ondragstart="drag(event, '${m.id}')">
                <div class="item-icon" style="background: rgba(255,255,255,0.1); border: 2px solid ${m.bg};">${m.icono}</div>
                <div class="item-info">
                    <h4>${m.nombre}</h4>
                    <p style="color:${m.bg}">Impacto Multisistémico</p>
                </div>
            </div>
        `;
    }

    const barsContainer = document.getElementById('progress-bars-container');
    barsContainer.innerHTML = '';
    boundariesData.forEach(b => {
        barsContainer.innerHTML += `
            <div class="progress-item">
                <div class="progress-label">
                    <span>${b.nombre}</span>
                    <span id="label-${b.id}">${b.baseVal}%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" id="bar-${b.id}" style="width: ${b.baseVal}%;"></div>
                </div>
            </div>
        `;
    });

    init3DPlanet(); 
    updatePlanetaryImpact();
}

function renderBoundaryCards() {
    const container = document.getElementById('boundaries-grid');
    if (!container) return;

    container.innerHTML = boundariesData.map(boundary => `
        <article class="boundary-card ${boundary.estado}" style="border-top-color: ${boundary.color};">
            <h3 style="color: ${boundary.color};">${boundary.nombre}</h3>
            <div class="status">Estado: ${boundary.estado.replace('-', ' ')}</div>
            <p>${boundary.descripcion}</p>
        </article>
    `).join('');
}

async function loadBoundariesData() {
    try {
        const response = await fetch('limites-data.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        boundariesData = await response.json();
        renderBoundaryCards();
        initBuilderUI();
    } catch (error) {
        console.error('Error al cargar los límites planetarios:', error);
        const container = document.getElementById('boundaries-grid');
        if (container) container.innerHTML = '<p class="data-error">No se pudo cargar la información de los límites planetarios.</p>';
    }
}

// ----------------------------------------------------
// MOTOR DEL PLANETA 3D (THREE.JS)
// ----------------------------------------------------
function init3DPlanet() {
    const container = document.getElementById('planet-3d-container');
    if(!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    
    const scene = new THREE.Scene();
    
    // Rotaciones
    const baseRotationPoint = new THREE.Object3D();
    scene.add( baseRotationPoint );
    const worldRotationPoint = new THREE.Object3D();
    scene.add( worldRotationPoint );
    
    const earthRadius = 80;
    const rotationPoint = new THREE.Object3D();
    rotationPoint.position.set( 0, 0, earthRadius * 4 );
    baseRotationPoint.add( rotationPoint );

    // Cámara adaptada al contenedor[cite: 26]
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    rotationPoint.add( camera );

    // Renderizador transparente[cite: 26]
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize( width, height );
    container.appendChild( renderer.domElement );

    // Controles orbitales[cite: 26]
    const controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableRotate = false;
    controls.enabled = false;
    controls.maxDistance = earthRadius * 7;
    controls.minDistance = earthRadius * 1.5;
    controls.target.copy( new THREE.Vector3( 0, 0, -1 * earthRadius * 4 ));

    // Iluminación[cite: 26]
    scene.add( new THREE.AmbientLight( 0x222222 ) );
    const light = new THREE.PointLight( 0xffffff, 1, 5000 );
    light.position.set( -400, 100, 100 );
    scene.add( light );

    const light2 = new THREE.PointLight( 0xffffff, 0.5, 4000 );
    light2.position.set( 400, -100, 200 );
    scene.add( light2 );

    // Texturas del Planeta original[cite: 26]
    const TEXTURE_PATH = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123879/';
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin( 'anonymous' );
    
    planetMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff, 
        shininess: 5,
        map: loader.load( TEXTURE_PATH + 'ColorMap.jpg' ),
        specularMap: loader.load( TEXTURE_PATH + 'SpecMask.jpg' ),
        specular: "#666666",
        bumpMap: loader.load( TEXTURE_PATH + 'Bump.jpg' ),
    });

    const sphere = new THREE.Mesh( new THREE.SphereGeometry( earthRadius, 64, 64 ), planetMaterial );
    planetMesh = sphere;
    sphere.rotation.y = -1 * (8.7 * Math.PI / 17);
    worldRotationPoint.add( sphere );

    // Capa de nubes (Alpha)[cite: 26]
    const materialCloud = new THREE.MeshPhongMaterial({
        alphaMap: loader.load( TEXTURE_PATH + "alphaMap.jpg" ),
        transparent: true,
        color: 0xffffff
    });
    const sphereCloud = new THREE.Mesh( new THREE.SphereGeometry( earthRadius + 0.5, 64, 64 ), materialCloud );
    planetClouds = sphereCloud;
    scene.add( sphereCloud );

    // Efecto de Resplandor (Glow)[cite: 26]
    glowMaterial = new THREE.SpriteMaterial({
        map: loader.load( TEXTURE_PATH + "glow.png" ),
        color: 0x0099ff, // Azul por defecto
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    const sprite = new THREE.Sprite( glowMaterial );
    glowSprite = sprite;
    sprite.scale.set( earthRadius * 2.5, earthRadius * 2.5, 1.0);
    sphereCloud.add(sprite);

    // Bucle de Animación[cite: 26]
    function animate() {
        requestAnimationFrame(animate);
        worldRotationPoint.rotation.y += 0.001;
        sphereCloud.rotation.y += 0.0015;
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // Reajuste al cambiar tamaño de ventana[cite: 26]
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }, false);
}

// ----------------------------------------------------
// DRAG & DROP Y LÓGICA DE SIMULACIÓN
// ----------------------------------------------------
function drag(ev, type) { ev.dataTransfer.setData("type", type); }
function allowDrop(ev) { ev.preventDefault(); }

function drop(ev) {
    ev.preventDefault();
    const typeId = ev.dataTransfer.getData("type");
    if (!megaprojects[typeId]) return;

    const m = megaprojects[typeId];
    const uniqueId = 'node_' + Math.random().toString(36).substr(2, 9);
    
    const rect = document.getElementById('dropzone').getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;

    placedProjects.push({ uid: uniqueId, ...m });

    const nodeEl = document.createElement('div');
    nodeEl.className = 'placed-node';
    nodeEl.style.left = x + 'px';
    nodeEl.style.top = y + 'px';
    nodeEl.style.borderColor = m.bg;
    nodeEl.style.background = 'rgba(10,15,22,0.8)';
    nodeEl.innerHTML = m.icono;
    nodeEl.id = uniqueId;
    nodeEl.onclick = () => removeNode(uniqueId);

    document.getElementById('dropzone').appendChild(nodeEl);
    updatePlanetaryImpact();
}

function removeNode(uid) {
    placedProjects = placedProjects.filter(u => u.uid !== uid);
    document.getElementById(uid).remove();
    updatePlanetaryImpact();
}

function updatePlanetaryImpact() {
    let currentValues = boundariesData.map(b => b.baseVal);

    placedProjects.forEach(proj => {
        proj.affects.forEach(effect => {
            currentValues[effect.idx] += effect.val;
        });
    });

    let brokenLimits = 0;
    let maxRisk = 0;
    let isAcid = false, isHot = false, isDesert = false;
    
    currentValues.forEach((val, i) => {
        let displayVal = Math.max(0, Math.min(val, 100)); 
        maxRisk = Math.max(maxRisk, displayVal);
        const bar = document.getElementById(`bar-${i}`);
        const label = document.getElementById(`label-${i}`);
        
        bar.style.width = displayVal + '%';
        label.innerText = displayVal + '%';

        if (displayVal < 50) bar.style.backgroundColor = '#4CAF50'; 
        else if (displayVal < 80) bar.style.backgroundColor = '#FFB300'; 
        else {
            bar.style.backgroundColor = '#FF5252'; 
            if(displayVal >= 100) brokenLimits++;
        }

        // Banderas de impacto global para alterar el Planeta 3D
        if (i === 6 && displayVal > 75) isAcid = true; 
        if (i === 0 && displayVal > 75) isHot = true; 
        if (i === 3 && displayVal > 75) isDesert = true; 
    });

    const statusTxt = document.getElementById('planet-status-text');
    if (brokenLimits === 0) {
        statusTxt.innerText = "Ecosistema Estable";
        statusTxt.style.color = "#4CAF50";
    } else if (brokenLimits < 3) {
        statusTxt.innerText = `Riesgo Crítico (${brokenLimits} Límites superados)`;
        statusTxt.style.color = "#FFB300";
    } else {
        statusTxt.innerText = `Colapso Planetario (${brokenLimits} Límites superados)`;
        statusTxt.style.color = "#FF5252";
    }

    // Actualizar Planeta 3D Visualmente
    if (brokenLimits >= 3) {
        update3DVisuals(isAcid, isHot, isDesert, true, maxRisk);
        setTimeout(() => { document.getElementById('collapse-overlay').classList.remove('hidden'); }, 800);
    } else {
        update3DVisuals(isAcid, isHot, isDesert, false, maxRisk);
    }
}

// Función que altera directamente los colores y el resplandor del Modelo 3D de Three.js
function update3DVisuals(acid, hot, desert, dead, maxRisk) {
    if(!planetMaterial || !glowMaterial) return;
    const container = document.getElementById('planet-3d-container');
    const danger = Math.max(0, Math.min(1, (maxRisk - 35) / 65));

    // El planeta se degrada gradualmente antes de llegar al colapso total.
    container.style.filter = `grayscale(${danger * 75}%) contrast(${1 + danger * 0.6}) brightness(${1 - danger * 0.25})`;
    if (planetMesh) planetMesh.scale.setScalar(1 - danger * 0.12);
    if (planetClouds) planetClouds.scale.setScalar(1 + danger * 0.05);
    if (glowSprite) glowSprite.scale.set(80 * (2.5 + danger * 0.8), 80 * (2.5 + danger * 0.8), 1);

    if(dead) {
        container.style.filter = "grayscale(100%) contrast(1.8) brightness(0.65)";
        glowMaterial.color.setHex(0x555555);
        return;
    }

    let tint = 0xffffff;
    let glow = 0x0099ff;

    if (danger >= 0.75) {
        tint = 0xff6f61;
        glow = 0xff2200;
    } else if (danger >= 0.45) {
        tint = 0xffc857;
        glow = 0xff6600;
    } else if (danger >= 0.15) {
        tint = 0xd8e88a;
        glow = 0x8aaa22;
    }

    // La jerarquía visual dictamina el estado predominante
    if (hot) { 
        tint = 0xff9990;
        glow = 0xff3300;
    }
    else if (acid) { 
        tint = 0xaaffaa;
        glow = 0x33ff33;
    }
    else if (desert) { 
        tint = 0xffffaa;
        glow = 0xffaa00;
    }

    planetMaterial.color.setHex(tint);
    glowMaterial.color.setHex(glow);
}

function resetSimulator() {
    document.getElementById('collapse-overlay').classList.add('hidden');
    placedProjects = [];
    document.querySelectorAll('.placed-node').forEach(node => node.remove());
    updatePlanetaryImpact();
}

loadBoundariesData();
loadBoundaryDetails();