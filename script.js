import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js';

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

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.6, 1200);
camera.position.x = 35; // Set camera position
camera.position.y = 15; // Set camera position
camera.position.z = 35; // Set camera position
// Renderer
const renderer = new THREE.WebGLRenderer({antialias: true});

const material = new THREE.LineBasicMaterial({color: 0xFF0000});
const material2 = new THREE.LineBasicMaterial({color: 0xFFFF00});

const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32); // Define geometry
const sphereMaterial = new THREE.MeshBasicMaterial({color: 0xffff00 }); // Define material

const gui = new GUI();
const params = {
    rho: 28,
    sigma: 10,
    beta: 8/3,
    tail: 10000,
    grid: 1
};
gui.add(params, 'rho', 0.1, 200.0).name('rho');
gui.add(params, 'sigma', 0.1, 100.0).name('sigma');
gui.add(params, 'beta', 0.1, 100.0).name('beta');
gui.add(params, 'tail', 51, 10000).name('tail');
gui.add(params, 'grid', 0, 1).name('grid?');

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate the cube for animation
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

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
