// Import Three.js and other modules using CDN links
import * as THREE from 'three';
import { TrackballControls } from 'TrackballControls';
import { GUI } from 'moe';

// Three.js Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene-container').appendChild(renderer.domElement);

//Material
const material = new THREE.LineBasicMaterial({color: 0xFF0000});
const material2 = new THREE.LineBasicMaterial({color: 0xFFFF00});
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32); // Define geometry
const sphereMaterial = new THREE.MeshBasicMaterial({color: 0xffff00 }); // Define material

// Create a Cube
const geometry3 = new THREE.BoxGeometry();
const material3 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry3, material3);
scene.add(cube);

// Position the camera
camera.position.z = 5;


//renderer.setClearColor("#000000"); // Set background colour
//document.body.appendChild(renderer.domElement); // Add renderer to HTML as a canvas element

//Trackball Controls for Camera
const controls = new TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 4;
controls.dynamicDampingFactor = 0.15;

//Parameters
let lastFrameTime = Date.now();
const fps = 10; // Target frame rate
const interval = 1000 / fps;

let sigma = params.sigma;
let rho = params.rho;
let beta = params.beta;

let x = 5;
let y = 5;
let z = 10;

let t = 0;
let dt = 0.005;

let dx, dy, dz;
let x1, y1, z1;
let dx1, dy1, dz1;

let history = [];
let ro;


// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Rotate the cube for animation
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  
  // Update the TrackballControls
  controls.update();

  renderer.render(scene, camera);
}

animate();

// Adjust the scene size when the window is resized
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
