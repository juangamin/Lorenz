// Import Three.js and other modules using CDN links
import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';

// Three.js Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene-container').appendChild(renderer.domElement);

// Create a Cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Position the camera
camera.position.z = 5;


//renderer.setClearColor("#000000"); // Set background colour
//document.body.appendChild(renderer.domElement); // Add renderer to HTML as a canvas element

//Trackball Controls for Camera
//const controls = new TrackballControls(camera, renderer.domElement);
//controls.rotateSpeed = 4;
//controls.dynamicDampingFactor = 0.15;


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
