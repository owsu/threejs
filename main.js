import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

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

const material = new THREE.ShaderMaterial({
    uniforms: {
        uTime: {value: 0.0},
        uColor: {value: new THREE.Color(0x00ff00)}
    },

    vertexShader: `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        
        void main() {
            float dist = distance(vUv, vec2(0.5, 0.5));
            float glow = smoothstep(0.5, 0.0, dist);
            float pulse = sin(uTime) * 0.5 + 0.5;
            gl_FragColor = vec4(glow * pulse, 0.0, glow * (1.0 - pulse), 1.0);
        }
    `
})

{
    const shaderGeo = new THREE.SphereGeometry(2, 32, 16);
    const shaderMesh = new THREE.Mesh(shaderGeo, material)
    shaderMesh.position.set(5,2,-10)
    shaderMesh.receiveShadow = true;
    scene.add(shaderMesh)
}

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

// cube
{
    const geo = new THREE.BoxGeometry(4, 4, 4);
    const mat = new THREE.MeshPhongMaterial({
        color: "#8AC" }
    );

    const cube = new THREE.Mesh(geo, mat);
    cube.position.set(5, 2, 0);
    cube.castShadow = true;
    scene.add(cube);
}

// sphere
{
    const geo = new THREE.SphereGeometry(3, 32, 16);
    const mat = new THREE.MeshPhongMaterial({ 
        color: "#CA8"}
    );

    const sphere = new THREE.Mesh(geo, mat);
    sphere.position.set(-4, 3, 0);
    sphere.castShadow = true;
    scene.add(sphere);
}

renderer.shadowMap.enabled = true;
light.castShadow = true;

function animate(time) {
    material.uniforms.uTime.value = time * .001;
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);