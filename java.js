// ACORDEÓN INTERACTIVO
const accordionHeaders = document.querySelectorAll(".accordion-header");

accordionHeaders.forEach((header) => {
    header.addEventListener("click", function () {
        const currentItem = this.parentElement;

        document.querySelectorAll(".accordion-item").forEach((item) => {
            if (item !== currentItem) {
                item.classList.remove("active");
            }
        });

        currentItem.classList.toggle("active");
    });
});


// NAVEGACIÓN
const navItems = document.querySelectorAll(".nav-item");

navItems.forEach(function (item) {
    item.addEventListener("click", function (event) {
        event.preventDefault();

        navItems.forEach(function (nav) {
            nav.classList.remove("active");
        });
        item.classList.add("active");

        const targetId = this.getAttribute("href"); 
        
        if (targetId && targetId !== "#") {
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: "smooth", 
                    block: "start"     
                });
            }
        }
    });
});


// ACCIONES DE BOTÓN DE INICIO Y DRAWER
const startButton = document.getElementById("startBtn");
const arrowBtn = document.getElementById("arrowBtn");
const drawerPanel = document.getElementById("drawerPanel");
const closeDrawerBtn = document.getElementById("closeDrawerBtn");

function toggleDrawer() {
    drawerPanel.classList.toggle("open");
    if (drawerPanel.classList.contains("open")) {
        arrowBtn.style.transform = "rotate(90deg)";
    } else {
        arrowBtn.style.transform = "rotate(0deg)";
    }
}

startButton.addEventListener("click", toggleDrawer);
closeDrawerBtn.addEventListener("click", toggleDrawer);

startButton.addEventListener("mouseenter", function () {
    this.style.transform = "translateY(-3px)";
});

startButton.addEventListener("mouseleave", function () {
    this.style.transform = "translateY(0)";
});


// REDIRECCIONES DE LOS MÓDULOS EN EL DRAWER ---
const btnLimites = document.getElementById("btn-limites");
if (btnLimites) {
    btnLimites.addEventListener("click", () => {
        window.location.href = "limites-planetarios.html"; 
    });
}

const btnEconomia = document.getElementById("btn-economia");
if (btnEconomia) {
    btnEconomia.addEventListener("click", () => {
        window.location.href = "economiacircular.html"; 
    });
}

const btnEnergias = document.getElementById("btn-energias");
if (btnEnergias) {
    btnEnergias.addEventListener("click", () => {
        window.location.href = "limites-planetarios.html";
    });
}

// REDIRECCIÓN BOTÓN PRINCIPAL DEL SIMULADOR
const mainSimBtn = document.getElementById("mainSimBtn");
if (mainSimBtn) {
    mainSimBtn.addEventListener("click", () => {
        window.location.href = "limites-planetarios.html";
    });
}
// ------------------------------------------------------


// PLANETA 3D INTERACTIVO (WEBGL)
function App() {
    const conf = {
        el: 'canvas',
        fov: 50,
        cameraZ: 260,
    };

    const { WebGLRenderer, PerspectiveCamera, OrbitControls, AmbientLight, DirectionalLight, Scene } = THREE;
    const { Object3D, CylinderGeometry, IcosahedronGeometry, SphereGeometry, MeshLambertMaterial, Mesh, Vector3, Color } = THREE;
    const { randFloat: rnd } = THREE.MathUtils || THREE.Math;
    const { random, PI } = Math;
    const simplex = new SimplexNoise();

    let renderer, scene, camera, cameraCtrl;
    let width, height;
    let planet;
    let objects = [];

    init();

    function init() {
        const wrapper = document.querySelector('.canvas-container');
        renderer = new WebGLRenderer({ canvas: document.getElementById(conf.el), antialias: true, alpha: true });
        
        camera = new PerspectiveCamera(conf.fov, wrapper.clientWidth / wrapper.clientHeight, 1, 1000);
        camera.position.z = conf.cameraZ;

        cameraCtrl = new OrbitControls(camera, renderer.domElement);
        cameraCtrl.enableDamping = true;
        cameraCtrl.dampingFactor = 0.1;
        cameraCtrl.rotateSpeed = 0.4;
        cameraCtrl.autoRotate = true;
        cameraCtrl.autoRotateSpeed = 0.6;
        cameraCtrl.enableZoom = false;

        updateSize();
        window.addEventListener('resize', updateSize, false);

        initScene();
        animate();
    }

    function initScene() {
        scene = new Scene();
        scene.add(new AmbientLight(0xffffff, 0.6));

        const light = new DirectionalLight(0xffffff, 0.8);
        light.position.set(200, 150, 100);
        scene.add(light);

        planet = new Object3D();
        scene.add(planet);

        const noiseF = 0.015;
        const noiseD = 15;
        const noiseWaterTreshold = 0.4;
        const noiseWaterLevel = 0.2;

        const vNoise = (v, f) => {
            const nv = new Vector3(v.x, v.y, v.z).multiplyScalar(f);
            let noise = (simplex.noise3D(nv.x, nv.y, nv.z) + 1) / 2;
            return (noise > noiseWaterTreshold) ? noise : noiseWaterLevel;
        };

        const dispV = (v) => {
            const dv = new Vector3(v.x, v.y, v.z);
            dv.add(dv.clone().normalize().multiplyScalar(vNoise(dv, noiseF) * noiseD));
            v.x = dv.x; v.y = dv.y; v.z = dv.z;
        };

        // Construcción de la superficie (Verde para continentes, Azul para océanos)
        let baseGeo = new IcosahedronGeometry(80, 4);
        baseGeo = baseGeo.toNonIndexed();

        const posAttr = baseGeo.attributes.position;
        const colors = [];
        const greenColor = new Color(0x417B2B);
        const blueColor = new Color(0x2080D0);

        for (let i = 0; i < posAttr.count; i += 3) {
            const vA = new Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
            const vB = new Vector3(posAttr.getX(i + 1), posAttr.getY(i + 1), posAttr.getZ(i + 1));
            const vC = new Vector3(posAttr.getX(i + 2), posAttr.getY(i + 2), posAttr.getZ(i + 2));

            const nA = vNoise(vA, noiseF);
            const nB = vNoise(vB, noiseF);
            const nC = vNoise(vC, noiseF);

            dispV(vA); dispV(vB); dispV(vC);

            posAttr.setXYZ(i, vA.x, vA.y, vA.z);
            posAttr.setXYZ(i + 1, vB.x, vB.y, vB.z);
            posAttr.setXYZ(i + 2, vC.x, vC.y, vC.z);

            const isWater = (nA === noiseWaterLevel && nB === noiseWaterLevel && nC === noiseWaterLevel);
            const faceColor = isWater ? blueColor : greenColor;

            colors.push(
                faceColor.r, faceColor.g, faceColor.b,
                faceColor.r, faceColor.g, faceColor.b,
                faceColor.r, faceColor.g, faceColor.b
            );
        }

        baseGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        baseGeo.computeVertexNormals();

        const material = new MeshLambertMaterial({ vertexColors: true, flatShading: true });
        const mesh = new Mesh(baseGeo, material);
        planet.add(mesh);

        // Animación GSAP de entrada
        planet.scale.set(0.2, 0.2, 0.2);
        gsap.to(planet.scale, { duration: 2.5, x: 1, y: 1, z: 1, ease: "power2.out" });

        // Población de vegetación y rocas
        const cscale = chroma.scale([0x509A36, 0xFF5A36, 0x509A36, 0xFFC236, 0x509A36]);
        const points = getFibonacciSpherePoints(500, 80);

        points.forEach((p) => {
            dispV(p);
            if (vNoise(p, noiseF) === noiseWaterLevel) return;

            let obj;
            if (random() > 0.3) {
                const tsize = rnd(4, 10);
                const bsize = tsize * rnd(0.5, 0.7);
                const vn2 = vNoise(p, 0.01);
                obj = createTree(tsize, bsize, 0x764114, cscale(vn2).hex());
            } else {
                obj = createRock(rnd(2, 4));
            }

            obj.position.set(p.x, p.y, p.z);
            obj.lookAt(0, 0, 0);

            objects.push(obj);
            obj.scale.set(0.01, 0.01, 0.01);
            gsap.to(obj.scale, {
                duration: rnd(2, 4),
                x: 1, y: 1, z: 1,
                ease: "elastic.out(1, 0.3)",
                delay: rnd(0, 2)
            });
            planet.add(obj);
        });
    }

    function createTree(tsize, bsize, tcolor, bcolor) {
        const tree = new Object3D();
        const tmaterial = new MeshLambertMaterial({ color: tcolor, flatShading: true });
        const bmaterial = new MeshLambertMaterial({ color: bcolor, flatShading: true });

        const tgeometry = new CylinderGeometry(tsize * 0.08, tsize * 0.12, tsize, 5);
        tgeometry.translate(0, tsize / 2, 0);
        tgeometry.rotateX(-PI / 2);
        const tmesh = new Mesh(tgeometry, tmaterial);
        tree.add(tmesh);

        const bgeometry = new SphereGeometry(bsize, 4, 4);
        bgeometry.translate(0, tsize + bsize * 0.6, 0);
        bgeometry.rotateX(-PI / 2);
        const bmesh = new Mesh(bgeometry, bmaterial);
        tree.add(bmesh);

        return tree;
    }

    function createRock(size) {
        const material = new MeshLambertMaterial({ color: 0x808080, flatShading: true });
        const geometry = new SphereGeometry(size, 4, 3);
        return new Mesh(geometry, material);
    }

    function animate() {
        requestAnimationFrame(animate);
        if (cameraCtrl) cameraCtrl.update();
        renderer.render(scene, camera);
    }

    function updateSize() {
        const wrapper = document.querySelector('.canvas-container');
        if (!wrapper) return;
        width = wrapper.clientWidth;
        height = wrapper.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
}

function getFibonacciSpherePoints(samples, radius) {
    let points = [];
    let offset = 2 / samples;
    let increment = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < samples; i++) {
        let y = ((i * offset) - 1) + (offset / 2);
        let distance = Math.sqrt(1 - Math.pow(y, 2));
        let phi = i * increment;
        let x = Math.cos(phi) * distance * radius;
        let z = Math.sin(phi) * distance * radius;
        y = y * radius;
        points.push(new THREE.Vector3(x, y, z));
    }
    return points;
}

window.addEventListener('DOMContentLoaded', App);