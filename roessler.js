// Import Three.js and other modules using CDN links
import * as THREE from 'three';
import { TrackballControls } from 'TrackballControls';
import GUI from 'GUI';

// Three.js Scene Setup //////////////////////////////////////////////////////////////////////////
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene-container').appendChild(renderer.domElement);

// Camera/////////////////////////////////////////////////////////////////////////////////////////
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.6, 1200);
camera.position.x = 35; // Set camera position
camera.position.y = -35; // Set camera position
camera.position.z = 55; // Set camera position
camera.up.set(0, 0, 1); // Set the up direction of the camera

//Material/////////////////////////////////////////////////////////////////////////////////////////
const material = new THREE.LineBasicMaterial({color: 0xFF0000});
const material2 = new THREE.LineBasicMaterial({color: 0xFFFF00});
const materiallog = new THREE.LineBasicMaterial({color: 0x00FF00});   //0xADD8E6
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32); // Define geometry
const sphereMaterial = new THREE.MeshBasicMaterial({color: 0xffff00 }); // Define material

//GUI/////////////////////////////////////////////////////////////////////////////////////////
const gui = new GUI();
const params = {
    a: 0.2,
    b: 0.2,
    c: 5.7,
    tail: 50000,
};
const rhoController = gui.add(params, 'a', 0.05, 0.4).name('rho (press r or e)');
const sigmaController = gui.add(params, 'b', 0.05, 0.4).name('sigma (press s or a)');
const betaController = gui.add(params, 'c', 0.1, 10.0).name('beta (press b or v)');
gui.add(params, 'tail', 51, 10000).name('Red tail length');

const actions2 = {
  changeColor: function() {
    // Change the color of the sphere when the button is clicked
    material.color.set(Math.random() * 0xffffff);
  }
};

// Add the action button to the GUI
gui.add(actions2, 'changeColor').name('Change to random color');

//Trackball Controls for Camera /////////////////////////////////////////////////////////////////////
const controls = new TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 4;
controls.dynamicDampingFactor = 0.15;

//scene.add( axesHelper ); // X axis = red, Y axis = green, Z axis = blue
const axesHelper = new THREE.AxesHelper(5);
const points = [];
const points2 = [];
const pointss = [];
const points2s = [];
let history = [];
let logdiffs = [];
let times = [];
let axespoints;

  //let geometry; /////////////////////////////////////////////////////////////////////
  var geometry = new THREE.BufferGeometry().setFromPoints( points );
  var geometry2 = new THREE.BufferGeometry().setFromPoints( points2 );
  var geometrys = new THREE.BufferGeometry().setFromPoints( pointss );
  var geometry2s = new THREE.BufferGeometry().setFromPoints( points2s );
  var geometrylog = new THREE.BufferGeometry().setFromPoints( logdiffs );
  var curve = new THREE.Line( geometry, material );
  var curve2 = new THREE.Line( geometry2, material2 );
  var curves = new THREE.Line( geometrys, material );
  var curve2s = new THREE.Line( geometry2s, material2 );
  var curvelog = new THREE.Line( geometrylog, materiallog );
  //var curveSteady = new THREE.Line( geometry, material );
  let curveSteady;

// Axes /////////////////////////////////////////////////////////////////////

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
    axespoints.push( new THREE.Vector3( 0,0,40) );
    const geometry5 = new THREE.BufferGeometry().setFromPoints( axespoints );
    const material5 = new THREE.LineBasicMaterial({color: 0xFFFFFF});
    const line5 = new THREE.Line( geometry5, material5 );
    scene.add( line5 );


//Parameters /////////////////////////////////////////////////////////////////////
let lastFrameTime = Date.now();
const fps = 20; // Target frame rate
const interval = 1000 / fps;

let sigma = params.sigma;
let rho = params.rho;
let beta = params.beta;

let x = 8;
let y = 0;
let z = 0.2;

let xs = 8.00000001;
let ys = 0.00000001;
let zs = 0.20000001;

let t = 0;
let dt = 0.04;

let dx, dy, dz;
let x1, y1, z1;
let dx1, dy1, dz1;

let dxs, dys, dzs;
let x1s, y1s, z1s;
let dx1s, dy1s, dz1s;


let aa, bb, cc;

let staticMode  = false; 
let rotationEnabled = false;  // Initial state is false (rotation off)

let previousCurve, previousCurve2, previousSphere, previousSpheret, previousCurves, previousCurve2s ;
let previousCurveSteady, previousCurvelog;

window.addEventListener('keydown', (event) => {
  // Check if the pressed key is "ArrowUp"
  if (event.key === 'r') {
    params.a += 0.01;
    rhoController.updateDisplay();
  }
});
window.addEventListener('keydown', (event) => {
  // Check if the pressed key is "ArrowUp"
  if (event.key === 'e') {
    params.a -= 0.01;
    rhoController.updateDisplay();
  }
});
window.addEventListener('keydown', (event) => {
  // Check if the pressed key is "ArrowUp"
  if (event.key === 'b') {
    params.b += 0.01;
    betaController.updateDisplay();
  }
});
window.addEventListener('keydown', (event) => {
  // Check if the pressed key is "ArrowUp"
  if (event.key === 'v') {
    params.b -= 0.01;
    betaController.updateDisplay();
  }
});
window.addEventListener('keydown', (event) => {
  // Check if the pressed key is "ArrowUp"
  if (event.key === 's') {
    params.c += 0.01;
    sigmaController.updateDisplay();
  }
});
window.addEventListener('keydown', (event) => {
  // Check if the pressed key is "ArrowUp"
  if (event.key === 'a') {
    params.c -= 0.01;
    sigmaController.updateDisplay();
  }
});

// Animation loop /////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

const rendering = function() {
  requestAnimationFrame(rendering);

const geometry = new THREE.BufferGeometry().setFromPoints( points );
    
if(staticMode){
  controls.update();
  scene.remove(curve);
  scene.remove(curves);
    if(Math.abs(aa-params.a)>0.01 || Math.abs(bb-params.b)>0.01 || Math.abs(cc-params.c)>0.01){
    points.splice(0,points.length);
    for(var i=1;i<15000;i++){
    dx1 = -y -z;
    dy1 = x + params.a*y;
    dz1 = params.b + z*(x - params.c);

    x1 = x + dx1 * dt;
    y1 = y + dy1 * dt;
    z1 = z + dz1 * dt; 

    dx = -y1 -z1;
    dy = x1 + params.a*y1;
    dz = params.b + z1*(x1 - params.c);

    x +=0.5*(dx1 + dx)*dt;
    y +=0.5*(dy1 + dy)*dt;
    z +=0.5*(dz1 + dz)*dt;
        
        if(i>500){
            points.push( new THREE.Vector3( x,y,z) );
        }
    }
    }
  const geometry = new THREE.BufferGeometry().setFromPoints( points );
  curveSteady = new THREE.Line( geometry, material );
  scene.add(curveSteady);
  renderer.render(scene, camera);
  previousCurveSteady = curveSteady;
  scene.remove(curveSteady);
  curveSteady.geometry.dispose();
  curveSteady.material.dispose();
}
else{
scene.remove(curveSteady);
if (previousCurveSteady) {  
   previousCurveSteady.geometry.dispose();
   previousCurveSteady.material.dispose();
   scene.remove(previousCurveSteady);
}
  if (previousCurvelog) {
      previousCurvelog.geometry.dispose();
      previousCurvelog.material.dispose();
      scene.remove(previousCurvelog);
  }
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
  if (previousSpheret) {
    previousSpheret.geometry.dispose();
    previousSpheret.material.dispose();
    scene.remove(previousSpheret);
  }
  if (previousCurves) {
    previousCurves.geometry.dispose();
    previousCurves.material.dispose();
    scene.remove(previousCurves);
  }
  if (previousCurve2s) {
      previousCurve2s.geometry.dispose();
      previousCurve2s.material.dispose();
      scene.remove(previousCurve2s);
  }


    dx1 = -y -z;
    dy1 = x + params.a*y;
    dz1 = params.b + z*(x - params.c);

    x1 = x + dx1 * dt;
    y1 = y + dy1 * dt;
    z1 = z + dz1 * dt; 

    dx = -y1 -z1;
    dy = x1 + params.a*y1;
    dz = params.b + z1*(x1 - params.c);

    dx1s = -ys -zs;
    dy1s = xs + params.a*ys;
    dz1s = params.b + zs*(xs - params.c);

    x +=0.5*(dx1 + dx)*dt;
    y +=0.5*(dy1 + dy)*dt;
    z +=0.5*(dz1 + dz)*dt;
    
    x1s = xs + dx1s * dt;
    y1s = ys + dy1s * dt;
    z1s = zs + dz1s * dt; 

    dxs = -y1s -z1s;
    dys = x1s + params.a*y1s;
    dzs = params.b + z1s*(x1s - params.c);

    xs +=0.5*(dx1s + dxs)*dt;
    ys +=0.5*(dy1s + dys)*dt;
    zs +=0.5*(dz1s + dzs)*dt;

    t = t + dt;

    logdiffs.push( new THREE.Vector3( -Math.log10((x-xs)*(x-xs) + (y-ys)*(y-ys)+(z-zs)*(z-zs))/2.0+20,-30+0.05*t,0));
    if (logdiffs.length > 10000){
        logdiffs.splice(0,logdiffs.length - 10000);
    }

    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const curve = new THREE.Line( geometry, material );
    scene.add( curve );

    const geometry2 = new THREE.BufferGeometry().setFromPoints( points2 );
    const curve2 = new THREE.Line( geometry2, material2 );
    scene.add( curve2 );

    const geometrys = new THREE.BufferGeometry().setFromPoints( pointss );
    const curves = new THREE.Line( geometrys, material );
    

    const geometry2s = new THREE.BufferGeometry().setFromPoints( points2s );
    const curve2s = new THREE.Line( geometry2s, material2 );
    

    points.push( new THREE.Vector3( x,y,z) );
    if (points.length > params.tail) {
                    points.splice(0,points.length-params.tail);
                }

    points2.push( new THREE.Vector3( x,y,z) );
    if (points2.length > 50) {
                    points2.shift();
    }

        pointss.push( new THREE.Vector3( xs,ys,zs) );
    if (pointss.length > params.tail) {
                    pointss.splice(0,pointss.length-params.tail);
                }

    points2s.push( new THREE.Vector3( xs,ys,zs) );
    if (points2s.length > 50) {
                    points2s.shift();
    }

        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial); // Build sphere
        sphere.position.set(x, y, z);
        scene.add(sphere); // Add sphere to canvas

        const spheret = new THREE.Mesh(sphereGeometry, sphereMaterial); // Build sphere
        spheret.position.set(xs, ys, zs);
        
        const geometrylog = new THREE.BufferGeometry().setFromPoints( logdiffs );
        const curvelog = new THREE.Line( geometrylog, materiallog );

    //curvelog.visible = false;
    
  if (rotationEnabled) {
      scene.add( curves );
      scene.add( curve2s );
      scene.add(spheret); // Add sphere to canvas
      scene.add( curvelog );
   }
    
        previousCurve = curve;
        previousCurve2 = curve2;
        previousSphere = sphere;
        previousSpheret = spheret;
        previousCurves = curves;
        previousCurve2s = curve2s;
        previousCurvelog = curvelog;
        

    renderer.render(scene, camera);

scene.remove(sphere);
scene.remove(spheret);
scene.remove(curve);
scene.remove(curves);
scene.remove(curve2);
scene.remove(curvelog);
geometry.dispose();
material.dispose();
geometry2.dispose();
material2.dispose();
geometrylog.dispose();
materiallog.dispose();    

scene.remove(curve2s);
geometrys.dispose();
geometry2s.dispose();

//sphere.dispose();
//curve.dispose();
//curve2.dispose();


}// end else loop


    // Update the TrackballControls
    controls.update();
aa = params.a;
bb = params.b;
cc = params.c;


}

rendering();

const actions = {
  restartOrbit: function() {
      x = -1+2*Math.random();
      y = -1+2*Math.random();
      z =  Math.random();
      xs = x + 0.00000001;
      ys = y + 0.00000001;
      zs = z + 0.00000001;
      points.splice(0,points.length);
      points2.splice(0,points2.length);
      pointss.splice(0,pointss.length);
      points2s.splice(0,points2s.length);
  }
};

gui.add(actions, 'restartOrbit').name('Restart Orbit');

// Object to manage the binary button (toggle)
const controlsGUI = {
  rotationEnabled: rotationEnabled
};
// Add a binary button (toggle) to enable/disable rotation
gui.add(controlsGUI, 'rotationEnabled').name('Show twin orbit').onChange(value => {
  // Update the rotationEnabled variable when the toggle is clicked
  rotationEnabled = value;
  console.log("Rotation Enabled:", rotationEnabled);  // Log for debugging
});

// Object to manage the binary button (toggle)
const staticmodeGUI = {
  staticMode: staticMode
};
// Add a binary button (toggle) to enable/disable rotation
gui.add(staticmodeGUI, 'staticMode').name('Static mode (change parameters)').onChange(value => {
  // Update the rotationEnabled variable when the toggle is clicked
   staticMode = value;
  console.log("Static Mode:", staticMode);  // Log for debugging
});

// Adjust the scene size when the window is resized
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
})

