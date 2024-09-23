//import * as THREE from '../node_modules/three/build/three.module.js';
//<script type="module"
//src="https://cdn.jsdelivr.net/npm/lil-gui@0.17/dist/lil-gui.min.js">
//</script>



import * as THREE from  src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.17.1/dist/lil-gui.esm.js';
import { TrackballControls } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/controls/TrackballControls.js';


//import { TrackballControls } from '../node_modules/three/examples/jsm/controls/TrackballControls.js';
//import { GUI } from 'lil-gui'

// Scene
const scene = new THREE.Scene();
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




renderer.setClearColor("#000000"); // Set background colour
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // Add renderer to HTML as a canvas element
// Make Canvas Responsive
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight); // Update size
    camera.aspect = window.innerWidth / window.innerHeight; // Update aspect ratio
    camera.updateProjectionMatrix(); // Apply changes
})


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

//Trackball Controls for Camera
const controls = new TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 4;
controls.dynamicDampingFactor = 0.15;
// Axes Helper
 const axesHelper = new THREE.AxesHelper(5);
//scene.add( axesHelper ); // X axis = red, Y axis = green, Z axis = blue
// Trigonometry Constants for Orbital Paths
// Angle increment on each render
  const points = [];
  const points2 = [];

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
