import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('three-canvas'),
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true; // Enable zooming
controls.enablePan = true;  // Optional: allow panning too

// PMREM + HDRI
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// HDRI Loader
new RGBELoader()
  .setPath('hdr/')
  .load('golden_gate_hills_4k.hdr', function (hdrTexture) {
    const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;
    scene.environment = envMap;
    scene.background = envMap;

    hdrTexture.dispose();
    pmremGenerator.dispose();

    addObjects();
  });

// Geometry and Material
let icosahedron;

function addObjects() {
  const geometry = new THREE.IcosahedronGeometry(1, 0);
  const material = new THREE.MeshStandardMaterial({
    color: 0x871d2b,
    metalness: 0.8,
    roughness: 0.1
  });

  icosahedron = new THREE.Mesh(geometry, material);
  scene.add(icosahedron);
}

// Render loop
function render() {
  requestAnimationFrame(render);
  controls.update(); // required for damping
  renderer.render(scene, camera);
}
render();

// Responsive canvas
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
