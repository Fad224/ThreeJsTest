import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { PMREMGenerator } from 'three';



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



const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();


// Load HDR environment
new RGBELoader()
  .setPath('hdr/')
  .load('golden_gate_hills_4k.hdr', function (hdrTexture) {
    const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;
    
    scene.environment = envMap;
    scene.background = envMap;

    hdrTexture.dispose();
    pmremGenerator.dispose();

    // After environment is loaded, add objects
    addObjects();
  });


// Lighting
// const ambientLight = new THREE.AmbientLight(0xcad6dc, 0.2);
// scene.add(ambientLight);

// const pointLight = new THREE.PointLight(0xfeeb94, 6);
// pointLight.position.set(5, 5, 5);
// scene.add(pointLight);

// Geometry and Material
let icosahedron;

function addObjects(){

  const geometry = new THREE.IcosahedronGeometry(1, 0);
  const material = new THREE.MeshStandardMaterial({
    color: 0x871d2b,
    metalness: 0.8,
    roughness: 0.05
  });

  const icosahedron = new THREE.Mesh(geometry, material);
  scene.add(icosahedron);
}

// Mouse control variables
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Mouse event handlers
renderer.domElement.addEventListener('mousedown', function (e) {
  isDragging = true;
});

renderer.domElement.addEventListener('mouseup', function (e) {
  isDragging = false;
});

renderer.domElement.addEventListener('mousemove', function (e) {
  if (!isDragging || !icosahedron) return;

  const deltaMove = {
    x: e.movementX,
    y: e.movementY
  };

  const rotationSpeed = 0.005;
  icosahedron.rotation.y += deltaMove.x * rotationSpeed;
  icosahedron.rotation.x += deltaMove.y * rotationSpeed;
});

// Render loop (no auto rotation)
function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}
render();

// Optional: handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
