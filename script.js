// Import Three.js, TrackballControls, and lil-gui from CDNs
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js';
import { TrackballControls } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/controls/TrackballControls.js';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
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
//const controls = new TrackballControls(camera, renderer.domElement);
//controls.rotateSpeed = 5.0;
//controls.zoomSpeed = 2.0;
//controls.panSpeed = 1.0;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate the cube for animation
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  // Update the TrackballControls
  //controls.update();

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

