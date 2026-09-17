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

    // Actualizar clase activa en los botones
    const wrappers = document.querySelectorAll('.energy-btn-wrapper');
    wrappers.forEach((wrap, i) => {
        if (energiasData[i].id === id) {
            wrap.classList.add('active');
        } else {
            wrap.classList.remove('active');
        }
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

loadEnergies();