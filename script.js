import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { STLLoader } from './STLLoader.js';

//scene
const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 600000000),
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
    new THREE.SphereGeometry(300000000000, 32, 32),
    new THREE.MeshStandardMaterial({ map: skyTexture, })
);
sky.material.side = THREE.DoubleSide;
scene.add(sky);
const sunTexture = new THREE.TextureLoader().load("images/sun.jpg");
const sun = new THREE.Mesh(
    new THREE.SphereGeometry(1392000 / 2, 320, 320),
    new THREE.MeshBasicMaterial({ map: sunTexture, transparent: false }),
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
sprite.scale.set((1392000 / 2) * 10, (1392000 / 2) * 10, 1.0);
sun.add(sprite); // this centers the glow at the mesh

function addSphere(textureURL, radius, x, y, z) {
    const sphereTexture = new THREE.TextureLoader().load(textureURL);
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 320, 320),
        new THREE.MeshStandardMaterial({ map: sphereTexture, })
    );
    sphere.position.set(x, y, z)
    scene.add(sphere);
    return sphere;
}
let planets = [
    addSphere("images/mercury.jpg", 4879 / 2, 57900000, 0, 0),
    addSphere("images/venus.jpg", 12104 / 2, -108200000, -5, 0),
    addSphere("images/earth.jpg", 12756 / 2, 149600000, 10, 0),
    addSphere("images/mars.jpg", 6879 / 2, -227900000, 5, 0),
    addSphere("images/jupiter.jpg", 142984 / 2, 778600000, -20, 0),
    addSphere("images/saturn.jpg", 120536 / 2, -1433500000, -10, 0),
    addSphere("images/uranus.jpg", 51104 / 2, 2872500000, -20, 0),
    addSphere("images/neptune.jpg", 49528 / 2, -4495100000, 30, 0),
]
let planetCores = [
        addSphere("", 0, 57900000, 0, 0),
        addSphere("", 0, -108200000, -5, 0),
        addSphere("", 0, 149600000, 10, 0),
        addSphere("", 0, -227900000, 5, 0),
        addSphere("", 0, 778600000, -20, 0),
        addSphere("", 0, -1433500000, -10, 0),
        addSphere("", 0, 2872500000, -20, 0),
        addSphere("", 0, -4495100000, 30, 0),
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

function degreesRadians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}
let planetUpdate = () => {
        for (let i = 0; i < planets.length; i++) {
            planets[i].position.x = planetCores[i].position.x;
            planets[i].position.y = planetCores[i].position.y;
            planets[i].position.z = planetCores[i].position.z;
            planets[i].rotateY(0.01);
        }
        //tilt

    }
    // anim loop
let zoom = 2;
let index = 0;
document.addEventListener("keydown", (e) => {
    if (e.key == "ArrowDown") {
        zoom += 1;
    }
    if (e.key == "ArrowUp" && zoom >= 2) {
        zoom -= 1;
    }
    if (e.key == "ArrowLeft") {
        if (index >= 0 && index <= planets.length) {
            index--;
        }
        if (index < 0) {
            index = planets.length;
        }
        if (index > planets.length) {
            index = 0;
        }
    }
    if (e.key == "ArrowRight") {
        if (index >= 0 && index <= planets.length) {
            index++;
        }
        if (index > planets.length) {
            index = 0;
        }
    }
})


planets[0].rotateZ(degreesRadians(0.01));
planets[1].rotateZ(degreesRadians(2.64));
planets[2].rotateZ(degreesRadians(23.44));
planets[3].rotateZ(degreesRadians(25.19));
planets[4].rotateZ(degreesRadians(3.12));
planets[5].rotateZ(degreesRadians(10.66));
planets[6].rotateZ(degreesRadians(82.23));
planets[7].rotateZ(degreesRadians(28.33));

function animate() {
    requestAnimationFrame(animate);
    //Make an object
    //Move the object
    // for (let i = 0; i < planets.length; i++) {
    //     rotateAboutPoint(planets[i], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.1 - 0.01 * i, true);
    // }
    sun.rotation.y += 0.01
    rotateAboutPoint(planetCores[0], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.0075, true);
    rotateAboutPoint(planetCores[1], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.0065, true);
    rotateAboutPoint(planetCores[2], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.004, true);
    rotateAboutPoint(planetCores[3], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.0025, true);
    rotateAboutPoint(planetCores[4], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.0005, true);
    rotateAboutPoint(planetCores[5], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.0004, true);
    rotateAboutPoint(planetCores[6], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.0002, true);
    rotateAboutPoint(planetCores[7], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.0001, true);
    planetUpdate();
    if (index != 0) {
        camera.position.x = planets[index - 1].position.x + planets[index - 1].geometry.parameters.radius * zoom;
        camera.position.y = planets[index - 1].position.y;
        camera.position.z = planets[index - 1].position.z + planets[index - 1].geometry.parameters.radius * zoom;
        camera.lookAt(planets[index - 1].position)
    } else {
        camera.position.x = sun.position.x - sun.geometry.parameters.radius * 4 * zoom;
        camera.position.y = 0;
        camera.position.z = 0;
        camera.lookAt(sun.position)
    }
    sky.position.x = camera.position.x;
    sky.position.y = camera.position.y;
    sky.position.z = camera.position.x;
    renderer.render(scene, camera);
}

animate()