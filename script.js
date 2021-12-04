import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { STLLoader } from './STLLoader.js';

//scene
const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000),
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById("bg"),
    });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(500);


// lighting and helpers
const pointLight = new THREE.PointLight(0xfefddc, 1),
    ambientLight = new THREE.AmbientLight(0xffffff, 0.1),
    lightHelper = new THREE.PointLightHelper(pointLight),
    gridHelper = new THREE.GridHelper(800, 50)

pointLight.position.set(0, 0, 0)
scene.add(pointLight, ambientLight, /*lightHelper, gridHelper*/ )

// controls



// background textures
const spaceTexture = new THREE.TextureLoader().load("images/background.jpg");
scene.background = spaceTexture;

// objects


//scene.add(torus)
function addTorus(radius, tubeRadius, color) {
    const geometry = new THREE.TorusGeometry(radius, tubeRadius, 16, 100),
        material = new THREE.MeshStandardMaterial({ color: color }),
        torus = new THREE.Mesh(geometry, material);
    scene.add(torus)
    return torus;

}
// random stars
function addStar() {
    const geometry = new THREE.SphereGeometry(0.15, 24, 24);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(geometry, material);
    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(10000));
    star.position.set(x, y, z);
    scene.add(star)
}
Array(1000).fill().forEach(addStar)

// moon
const skyTexture = new THREE.TextureLoader().load("images/background.jpg");
const sky = new THREE.Mesh(
    new THREE.SphereGeometry(3000, 32, 32),
    new THREE.MeshStandardMaterial({ map: skyTexture, })
);
sky.material.side = THREE.DoubleSide;
scene.add(sky);
const sunTexture = new THREE.TextureLoader().load("images/sun.jpg");
const sun = new THREE.Mesh(
    new THREE.SphereGeometry(50, 32, 32),
    new THREE.MeshBasicMaterial({ map: sunTexture, emissive: 0xf5902c, emissiveIntensity: 0.5 })
);
scene.add(sun);
// https://stemkoski.github.io/Three.js/
var spriteMaterial = new THREE.SpriteMaterial({
    map: new THREE.TextureLoader().load('images/glow.png'),
    color: 0xf5902c,
    transparent: true,
    blending: THREE.AdditiveBlending,
    opacity: 0.6
});
var sprite = new THREE.Sprite(spriteMaterial);
sprite.scale.set(400, 400, 1.0);
sun.add(sprite); // this centers the glow at the mesh

function addSphere(textureURL, radius, x, y, z) {
    const sphereTexture = new THREE.TextureLoader().load(textureURL);
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 32, 32),
        new THREE.MeshStandardMaterial({ map: sphereTexture, })
    );
    sphere.position.set(x, y, z)
    scene.add(sphere);
    return sphere;
}
let planets = [
    addSphere("images/mercury.jpg", 2, 100, 0, 0),
    addSphere("images/venus.jpg", 6, -350, -5, 0),
    addSphere("images/earth.jpg", 7, 500, 10, 0),
    addSphere("images/mars.jpg", 5, -850, 5, 0),
    addSphere("images/jupiter.jpg", 50, 1000, -20, 0),
    addSphere("images/saturn.jpg", 45, -1350, -10, 0),
    addSphere("images/uranus.jpg", 30, 1600, -20, 0),
    addSphere("images/neptune.jpg", 35, -1950, 30, 0),
]
let planetCores = [
        addSphere("", 0, 100, 0, 0),
        addSphere("", 0, -350, -5, 0),
        addSphere("", 0, 500, 10, 0),
        addSphere("", 0, -850, 5, 0),
        addSphere("", 0, 1000, -20, 0),
        addSphere("", 0, -1350, -10, 0),
        addSphere("", 0, 1600, -20, 0),
        addSphere("", 0, -1950, 30, 0),
    ] // stl loader
let model;

function loadSTLModel(fileURL, color, metalness, roughness, opacity, transparent, transmission, clearcoat, clearcoatRoughness) {
    const loader = new STLLoader()
    loader.load(
        fileURL,
        function(geometry) {
            const material = new THREE.MeshPhysicalMaterial({
                color: color,
                metalness: metalness,
                roughness: roughness,
                opacity: opacity,
                transparent: transparent,
                transmission: transmission,
                clearcoat: clearcoat,
                clearcoatRoughness: clearcoatRoughness
            })
            model = new THREE.Mesh(geometry, material);
            scene.add(model)
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log(error)
        }
    )
}

function rotateAboutPoint(obj, point, axis, theta, pointIsWorld) {
    pointIsWorld = (pointIsWorld === undefined) ? false : pointIsWorld;

    if (pointIsWorld) {
        obj.parent.localToWorld(obj.position); // compensate for world coordinate
    }

    obj.position.sub(point); // remove the offset
    obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
    obj.position.add(point); // re-add the offset

    if (pointIsWorld) {
        obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
    }

    obj.rotateOnAxis(axis, theta); // rotate the OBJECT
}
let planetUpdate = () => {
        for (let i = 0; i < planets.length - 1; i++) {
            planets[i].position.x = planetCores.position.x;
            planets[i].position.y = planetCores.position.y;
            planets[i].position.z = planetCores.position.z;
            planets[i].rotation.y += 0.1
        }
    }
    // anim loop
let zoom = 0;
let index = 0;
document.addEventListener("keydown", (e) => {
    if (e.key == "ArrowDown") {
        zoom += 1;
    }
    if (e.key == "ArrowUp" && zoom >= 10) {
        zoom -= 1;
    }
    if (e.key == "ArrowLeft") {
        if (index >= 1 && index <= planets.length - 1) {
            index--;
        }
        if (index == 0) {
            index = planets.length - 1;
        }
        if (index > planets.length - 1) {
            index = 0;
        }
    }
    if (e.key == "ArrowRight") {
        if (index >= 0 && index <= planets.length - 2) {
            index--;
        }
        if (index > planets.length - 1) {
            index = 0;
        }
    }
})

function animate() {
    requestAnimationFrame(animate);
    //Make an object
    //Move the object
    // for (let i = 0; i < planets.length; i++) {
    //     rotateAboutPoint(planets[i], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.1 - 0.01 * i, true);
    // }
    for (let i = 0; i < planets.length; i++) {
        planets[i].rotation.y += 0.01
    }
    sun.rotation.y += 0.01
    rotateAboutPoint(planetCores[0], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.0075, true);
    rotateAboutPoint(planetCores[1], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.0065, true);
    rotateAboutPoint(planetCores[2], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.004, true);
    rotateAboutPoint(planetCores[3], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.0025, true);
    rotateAboutPoint(planetCores[4], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.0005, true);
    rotateAboutPoint(planetCores[5], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.0004, true);
    rotateAboutPoint(planetCores[6], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.0002, true);
    rotateAboutPoint(planetCores[7], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.0001, true);
    camera.position.x = planets[index].position.x - planets[index].geometry.parameters.radius * 4 - zoom;
    camera.position.y = planets[index].position.y;
    camera.position.z = planets[index].position.z - planets[index].geometry.parameters.radius * 4 - zoom;
    camera.lookAt(planets[2].position)
    console.log(camera.position);
    renderer.render(scene, camera);
}

animate()