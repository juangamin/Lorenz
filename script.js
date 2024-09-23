// Import Three.js, TrackballControls, and lil-gui from CDNs
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js';
import { TrackballControls } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/controls/TrackballControls.js';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.17.1/dist/lil-gui.esm.js';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene-container').appendChild(renderer.domElement);

// Create a cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Position the camera
camera.position.z = 5;

// Add TrackballControls for rotating the camera around the scene
const controls = new TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 5.0;
controls.zoomSpeed = 2.0;
controls.panSpeed = 1.0;

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

// Add lil-gui for controlling cube rotation and color
const gui = new GUI();
const cubeFolder = gui.addFolder('Cube Rotation');
cubeFolder.add(cube.rotation, 'x', 0, Math.PI * 2).name('Rotate X');
cubeFolder.add(cube.rotation, 'y', 0, Math.PI * 2).name('Rotate Y');
cubeFolder.add(cube.rotation, 'z', 0, Math.PI * 2).name('Rotate Z');
cubeFolder.open();

// Add a GUI controller for cube color
const cubeColor = { color: material.color.getHex() };
gui.addColor(cubeColor, 'color').onChange((value) => {
  material.color.setHex(value);
});
