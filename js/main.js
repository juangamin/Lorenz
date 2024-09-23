// three.test.js

// Import Three.js from a CDN
const THREE = require('https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js');

test('Three.js scene creation test', () => {
  // Create a Three.js scene
  const scene = new THREE.Scene();
  
  // Check that the scene is an instance of THREE.Scene
  expect(scene).toBeInstanceOf(THREE.Scene);
  
  // Add a cube to the scene
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  
  // Check if the cube has been added to the scene
  expect(scene.children.length).toBe(1);
  expect(scene.children[0]).toBe(cube);
});

