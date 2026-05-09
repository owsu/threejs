import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import vertexShader from '/shaders/boid.vert?raw';
import fragmentShader from '/shaders/boid.frag?raw';


class ColorGUIHelper {
    constructor(object, prop) {
        this.object = object;
        this.prop = prop;
    }
    get value() {
        return '#' + this.object[this.prop].getHexString();
    }
    set value(hexString) {
        this.object[this.prop].set(hexString);
    }
}

function makeXYZGUI(gui, vector3, name, onChangeFn) {
    const folder = gui.addFolder(name);
    folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
    folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
    folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
    folder.open();
}

function updateLight() {
    helper.update();
}

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(0, 10, 20);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
controls.update();

const ambientSkyColor = 0xB1E1FF;
const ambientFloorColor = 0xB97A20;
const ambientIntensity = 1;
const ambientlight = new THREE.HemisphereLight(ambientSkyColor, ambientFloorColor, ambientIntensity);
scene.add(ambientlight);


const color = 0xFFFFFF;
const intensity = 150;
const light = new THREE.PointLight(color, intensity);
light.position.set(0, 10, 0);
scene.add(light);

const helper = new THREE.PointLightHelper(light);
scene.add(helper);

const gui = new GUI();

gui.addColor(new ColorGUIHelper(ambientlight, 'color'), 'value').name('skyColor');
gui.addColor(new ColorGUIHelper(ambientlight, 'groundColor'), 'value').name('groundColor');
gui.add(ambientlight, 'intensity', 0, 5, 0.01);



gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 250, 1);
gui.add(light, 'distance', 0, 40).onChange(updateLight);

makeXYZGUI(gui, light.position, 'position', updateLight);

// baseplate
{
    const loader = new THREE.TextureLoader();

    const texture = loader.load("/resources/checker.png");
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(20, 20);

    const planeGeo = new THREE.PlaneGeometry(40, 40);

    const planeMat = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
    });

    const planeMesh = new THREE.Mesh(planeGeo, planeMat);
    planeMesh.rotation.x = -Math.PI * 0.5;
    planeMesh.receiveShadow = true;
    scene.add(planeMesh);
}

const material = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0.0 }
    },

    vertexShader,
    fragmentShader
})

{
   for (let i = 0; i < 25; i++) {
        const boidGeo = new THREE.ConeGeometry(0.2, 0.5, 8);
        const boidMesh = new THREE.Mesh(boidGeo, material)
        boidMesh.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() * 5) + 2,
            (Math.random() - 0.5) * 20
        )
        boidMesh.receiveShadow = true;
        scene.add(boidMesh)
   }
}


renderer.shadowMap.enabled = true;
light.castShadow = true;

function animate(time) {
    material.uniforms.uTime.value = time * .001;
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);