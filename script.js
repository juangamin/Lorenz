// Import Three.js and other modules using CDN links
import * as THREE from 'three';
import { TrackballControls } from 'TrackballControls';
import GUI from 'GUI';

// Three.js Scene Setup
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene-container').appendChild(renderer.domElement);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.6, 1200);
camera.position.x = 35; // Set camera position
camera.position.y = 15; // Set camera position
camera.position.z = 35; // Set camera position

//Material
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


// Position the camera
//camera.position.z = 5;


//renderer.setClearColor("#000000"); // Set background colour
//document.body.appendChild(renderer.domElement); // Add renderer to HTML as a canvas element

//Trackball Controls for Camera
const controls = new TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 4;
controls.dynamicDampingFactor = 0.15;

//scene.add( axesHelper ); // X axis = red, Y axis = green, Z axis = blue
const axesHelper = new THREE.AxesHelper(5);
const points = [];
const points2 = [];
let axespoints;

  var geometry = new THREE.BufferGeometry().setFromPoints( points );
  var geometry2 = new THREE.BufferGeometry().setFromPoints( points2 );
  var curve = new THREE.Line( geometry, material );
  var curve2 = new THREE.Line( geometry2, material2 );

    for ( let i = -30; i < 32; i+=2 ){
      axespoints = [];
      axespoints.push( new THREE.Vector3( -30,i,0) );
      axespoints.push( new THREE.Vector3( 30,i,0) );
      const geometry3 = new THREE.BufferGeometry().setFromPoints( axespoints );
      const material3 = new THREE.LineBasicMaterial({color: 0xFFFFFF});
      const line3 = new THREE.Line( geometry3, material3 );
      scene.add(line3);
      axespoints = [];
      axespoints.push( new THREE.Vector3( i,-30,0) );
      axespoints.push( new THREE.Vector3( i,30,0) );
      const geometry4 = new THREE.BufferGeometry().setFromPoints( axespoints );
      const material4 = new THREE.LineBasicMaterial({color: 0xFFFFFF});
      const line4 = new THREE.Line( geometry4, material4 );
      scene.add( line4 );
    }
    axespoints = [];
    axespoints.push( new THREE.Vector3( 0,0,0) );
    axespoints.push( new THREE.Vector3( 0,0,60) );
    const geometry5 = new THREE.BufferGeometry().setFromPoints( axespoints );
    const material5 = new THREE.LineBasicMaterial({color: 0xFFFFFF});
    const line5 = new THREE.Line( geometry5, material5 );
    scene.add( line5 );


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

let previousCurve, previousCurve2, previousSphere;

// Animation loop
const rendering = function() {
  requestAnimationFrame(rendering);

  if (previousCurve) {
      previousCurve.geometry.dispose();
      previousCurve.material.dispose();
      scene.remove(previousCurve);
  }
  if (previousCurve2) {
      previousCurve2.geometry.dispose();
      previousCurve2.material.dispose();
      scene.remove(previousCurve2);
  }
  if (previousSphere) {
    previousSphere.geometry.dispose();
    previousSphere.material.dispose();
    scene.remove(previousSphere);
}
  
  // Update the TrackballControls
  controls.update();

      dx1 = params.sigma * (y - x);
    dy1 = x * (params.rho - z) - y;
    dz1 = x * y - params.beta * z;

    x1 = x + dx1 * dt;
    y1 = y + dy1 * dt;
    z1 = z + dz1 * dt;

    dx = params.sigma * (y1 - x1);
    dy = x1 * (params.rho - z1) - y1;
    dz = x1 * y1 - params.beta * z1;

    x +=0.5*(dx1 + dx)*dt;
    y +=0.5*(dy1 + dy)*dt;
    z +=0.5*(dz1 + dz)*dt;

  renderer.render(scene, camera);

const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const curve = new THREE.Line( geometry, material );
    scene.add( curve );

    const geometry2 = new THREE.BufferGeometry().setFromPoints( points2 );
    const curve2 = new THREE.Line( geometry2, material2 );
    scene.add( curve2 );

    points.push( new THREE.Vector3( x,y,z) );
    if (points.length > params.tail) {
                    points.splice(0,points.length-params.tail);
                }

    points2.push( new THREE.Vector3( x,y,z) );
    if (points2.length > 50) {
                    points2.shift();
    }

        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial); // Build sphere
        sphere.position.set(x, y, z);
        scene.add(sphere); // Add sphere to canvas
    
            previousCurve = curve;
        previousCurve2 = curve2;
        previousSphere = sphere;

renderer.render(scene, camera);

scene.remove(sphere);
scene.remove(curve);
scene.remove(curve2);
geometry.dispose();
material.dispose();
geometry2.dispose();
material2.dispose();

//sphere.dispose();
//curve.dispose();
//curve2.dispose();

renderer.deallocateObject(curve);
renderer.deallocateObject(curve2);
renderer.deallocateObject(sphere);
renderer.deallocateGeometry(geometry);
renderer.deallocateMaterial(material);
renderer.deallocateGeometry(geometry2);
renderer.deallocateMaterial(material2);
}

rendering();

const actions = {
  changeColor: function() {
    // Change the color of the sphere when the button is clicked
    material.color.set(Math.random() * 0xffffff);
  }
};

gui.add(actions, 'changeColor').name('Change Sphere Color');


// Adjust the scene size when the window is resized
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
})

