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
const pointLight = new THREE.PointLight(0xfefddc, 2),
    ambientLight = new THREE.AmbientLight(0xffffff, 0.8),
    lightHelper = new THREE.PointLightHelper(pointLight),
    gridHelper = new THREE.GridHelper(800, 50)

pointLight.position.set(0, 0, 0)
scene.add(pointLight, ambientLight, /*lightHelper, gridHelper*/ )

// controls
const controls = new OrbitControls(camera, renderer.domElement);



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
let rings = [
    addTorus(200, 0.1, "grey"),
    addTorus(100, 1, "grey"),
    addTorus(70, 1, "grey"),
    addTorus(600, 0.1, "grey"),
]
rings[0].rotateX(83 * Math.PI / 180);
rings[3].rotateX(97 * Math.PI / 180);
// random stars
function addStar() {
    const geometry = new THREE.SphereGeometry(0.15, 24, 24);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(geometry, material);
    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(1000));
    star.position.set(x, y, z);
    scene.add(star)
}
Array(3000).fill().forEach(addStar)

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
    new THREE.MeshStandardMaterial({ map: sunTexture, emissive: 0xf5902c, emissiveIntensity: 0.5 })
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

const boxTexture = new THREE.TextureLoader().load("images/francheesestick.png");
const box = new THREE.Mesh(
    new THREE.BoxGeometry(60, 60, 60),
    new THREE.MeshPhysicalMaterial({ map: boxTexture, emissive: "white", emissiveIntensity: 10 })
);
//scene.add(box);

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
        addSphere("images/mercury.jpg", 10, 100, 20, 0),
        addSphere("images/venus.jpg", 15, -150, -5, 0),
        addSphere("images/earth.jpg", 16, 200, 10, 0),
        addSphere("images/mars.jpg", 12, -250, 5, 0),
        addSphere("images/jupiter.jpg", 50, 300, -20, 0),
        addSphere("images/saturn.jpg", 40, -350, -10, 0),
        addSphere("images/uranus.jpg", 30, 400, -20, 0),
        addSphere("images/neptune.jpg", 35, -450, 30, 0),
    ]
    // stl loader
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
loadSTLModel("./models/4dCube.stl", "red", 0.7, 0, 1, false, 0, 0, 0)

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
// anim loop

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
    rotateAboutPoint(planets[0], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.075, true);
    rotateAboutPoint(planets[1], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.065, true);
    rotateAboutPoint(planets[2], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.04, true);
    rotateAboutPoint(planets[3], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.025, true);
    rotateAboutPoint(planets[4], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.005, true);
    rotateAboutPoint(planets[5], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.004, true);
    rotateAboutPoint(planets[6], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.002, true);
    rotateAboutPoint(planets[7], new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 0.001, true);
    rings[1].rotation.x += 0.1;
    rings[2].rotation.y += 0.1;

    renderer.render(scene, camera);
    controls.update();
}

animate()