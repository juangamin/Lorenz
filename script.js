import * as THREE from 'three';
import { TrackballControls } from 'TrackballControls';
import GUI from 'GUI';

const container = document.getElementById('scene-container');
if (!container) throw new Error('Missing #scene-container');

const DT = 0.005;
const CAPACITY = 50000;

const params = {
  rho: 28,
  sigma: 10,
  beta: 8 / 3,
  tail: 10000,
  speed: 1,
  paused: false,
  twin: false,
  staticMode: false,
  color: '#ff675f'
};

// Scene and camera
const scene = new THREE.Scene();
scene.background = new THREE.Color('#080e1b');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.domElement.style.display = 'block';
container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 3000);
camera.up.set(0, 0, 1);
camera.position.set(65, -85, 65);

const controls = new TrackballControls(camera, renderer.domElement);
controls.target.set(0, 0, 25);
controls.rotateSpeed = 3;
controls.dynamicDampingFactor = 0.15;
controls.keys = [];

const grid = new THREE.GridHelper(80, 40, 0x465774, 0x233047);
grid.rotation.x = Math.PI / 2;
scene.add(grid, new THREE.AxesHelper(15));

const primaryMaterial = new THREE.LineBasicMaterial({
  color: params.color
});
const twinMaterial = new THREE.LineBasicMaterial({
  color: '#52d9ef'
});
const headMaterial = new THREE.LineBasicMaterial({
  color: '#ffe898'
});

// Mirrored ring buffer: recent points occupy one contiguous draw range.
class Trail {
  constructor(capacity, material) {
    this.capacity = capacity;
    this.array = new Float32Array(capacity * 6);

    this.attribute = new THREE.BufferAttribute(this.array, 3);
    this.attribute.setUsage(THREE.DynamicDrawUsage);

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', this.attribute);

    this.line = new THREE.Line(this.geometry, material);
    this.line.frustumCulled = false;
    scene.add(this.line);
    this.clear();
  }

  clear() {
    this.next = 0;
    this.count = 0;
    this.geometry.setDrawRange(0, 0);
  }

  push(point) {
    const a = 3 * this.next;
    const b = a + 3 * this.capacity;

    this.array.set(point, a);
    this.array.set(point, b);

    this.next = (this.next + 1) % this.capacity;
    this.count = Math.min(this.count + 1, this.capacity);
    this.attribute.needsUpdate = true;
  }

  draw(limit) {
    const count = Math.min(this.count, Math.floor(limit));
    this.geometry.setDrawRange(
      this.next + this.capacity - count,
      count
    );
  }
}

const trail = new Trail(CAPACITY, primaryMaterial);
const twinTrail = new Trail(CAPACITY, twinMaterial);
const head = new Trail(50, headMaterial);
const twinHead = new Trail(50, headMaterial);
const trails = [trail, twinTrail, head, twinHead];

const sphereGeometry = new THREE.SphereGeometry(0.45, 16, 12);
const sphereMaterial = new THREE.MeshBasicMaterial({
  color: '#ffe898'
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
const twinSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere, twinSphere);

// Double precision for integration; Float32 is used only for rendering.
const state = new Float64Array(3);
const twinState = new Float64Array(3);

let initial = [5, 5, 10];
let t = 0;
let accumulator = 0;
let staticDirty = true;
let failure = '';

const k1 = new Float64Array(3);
const k2 = new Float64Array(3);
const k3 = new Float64Array(3);
const k4 = new Float64Array(3);
const work = new Float64Array(3);

function derivative(p, out) {
  out[0] = params.sigma * (p[1] - p[0]);
  out[1] = p[0] * (params.rho - p[2]) - p[1];
  out[2] = p[0] * p[1] - params.beta * p[2];
}

function rk4(p, h = DT) {
  derivative(p, k1);

  for (let j = 0; j < 3; j++) {
    work[j] = p[j] + h * k1[j] / 2;
  }
  derivative(work, k2);

  for (let j = 0; j < 3; j++) {
    work[j] = p[j] + h * k2[j] / 2;
  }
  derivative(work, k3);

  for (let j = 0; j < 3; j++) {
    work[j] = p[j] + h * k3[j];
  }
  derivative(work, k4);

  for (let j = 0; j < 3; j++) {
    p[j] += h * (
      k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]
    ) / 6;
  }

  return p.every(
    value => Number.isFinite(value) && Math.abs(value) < 1e6
  );
}

// Twin separation plot, independent of the 3D camera.
const plot = document.createElement('canvas');
plot.width = 680;
plot.height = 340;
plot.style.cssText = `
  position: fixed;
  left: 16px;
  bottom: 16px;
  width: min(340px, calc(100vw - 32px));
  height: auto;
  pointer-events: none;
  border: 1px solid #33435c;
  border-radius: 10px;
  z-index: 10;
`;
plot.setAttribute(
  'aria-label',
  'Log10 twin-orbit separation versus simulated time'
);
document.body.appendChild(plot);

const ctx = plot.getContext('2d');
const samples = new Float64Array(2000 * 2);
let sampleNext = 0;
let sampleCount = 0;
let steps = 0;

const status = document.createElement('div');
status.style.cssText = `
  position: fixed;
  top: 16px;
  left: 16px;
  color: #dce6f5;
  font: 13px system-ui;
  pointer-events: none;
  z-index: 10;
  max-width: 45vw;
`;
document.body.appendChild(status);

function sample() {
  const distance = Math.hypot(
    state[0] - twinState[0],
    state[1] - twinState[1],
    state[2] - twinState[2]
  );

  samples[2 * sampleNext] = t;
  samples[2 * sampleNext + 1] =
    Math.log10(Math.max(distance, 1e-16));

  sampleNext = (sampleNext + 1) % 2000;
  sampleCount = Math.min(sampleCount + 1, 2000);
}

function drawPlot() {
  if (!params.twin || params.staticMode || !ctx) return;

  ctx.fillStyle = '#0c1525';
  ctx.fillRect(0, 0, 680, 340);
  ctx.font = '23px system-ui';
  ctx.fillStyle = '#dce6f5';
  ctx.fillText('Twin separation · log₁₀ ‖δ(t)‖', 24, 35);

  const first = (sampleNext - sampleCount + 2000) % 2000;
  const start = sampleCount ? samples[2 * first] : 0;
  const end = Math.max(start + DT, t);

  let low = -9;
  let high = 2;

  for (let i = 0; i < sampleCount; i++) {
    const value = samples[2 * ((first + i) % 2000) + 1];
    low = Math.min(low, Math.floor(value));
    high = Math.max(high, Math.ceil(value));
  }

  for (let j = 0; j <= 4; j++) {
    const y = 65 + j * 52;

    ctx.strokeStyle = '#26354a';
    ctx.beginPath();
    ctx.moveTo(76, y);
    ctx.lineTo(652, y);
    ctx.stroke();

    ctx.fillStyle = '#a6b6cc';
    ctx.fillText(
      (high - (high - low) * j / 4).toFixed(1),
      12,
      y + 7
    );
  }

  ctx.strokeStyle = '#52d9ef';
  ctx.lineWidth = 3;
  ctx.beginPath();

  for (let i = 0; i < sampleCount; i++) {
    const index = 2 * ((first + i) % 2000);
    const x = 76 + 576 * (samples[index] - start) / (end - start);
    const y = 65 + 208 * (high - samples[index + 1]) / (high - low);

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.stroke();
  ctx.fillStyle = '#a6b6cc';
  ctx.fillText(start.toFixed(1), 76, 313);
  ctx.fillText(end.toFixed(1), 580, 313);
  ctx.fillText('simulated time', 265, 313);
}

function reset() {
  state.set(initial);
  twinState.set(initial.map(value => value + 1e-8));

  t = 0;
  accumulator = 0;
  steps = 0;
  failure = '';
  sampleNext = 0;
  sampleCount = 0;

  trails.forEach(item => item.clear());
  sample();
  staticDirty = true;
}

function record() {
  trail.push(state);
  twinTrail.push(twinState);
  head.push(state);
  twinHead.push(twinState);
}

function advance() {
  if (!rk4(state) || !rk4(twinState)) {
    params.paused = true;
    failure = 'Integration stopped: reduce parameters and restart.';
    return false;
  }

  t += DT;
  return true;
}

function buildStatic() {
  reset();

  // Discard a 2.5-unit transient, then record 75 time units.
  for (let i = 0; i < 15500; i++) {
    if (!advance()) break;
    if (i >= 500) record();
  }

  staticDirty = false;
}

// GUI
const gui = new GUI();
const controllers = {};

for (const [key, max, label] of [
  ['rho', 200, 'ρ (r / e)'],
  ['sigma', 100, 'σ (s / a)'],
  ['beta', 100, 'β (b / v)']
]) {
  controllers[key] = gui
    .add(params, key, 0.1, max, 0.01)
    .name(label)
    .onChange(reset);
}

gui.add(params, 'tail', 51, CAPACITY, 1).name('Trail points');
gui.add(params, 'speed', 0.1, 10, 0.1).name('Simulation speed');
gui.add(params, 'paused').name('Pause').listen();
gui.add(params, 'twin').name('Show twin orbit');
gui.add(params, 'staticMode').name('Static mode').onChange(reset);

gui.addColor(params, 'color')
  .name('Orbit color')
  .onChange(value => primaryMaterial.color.set(value));

const actions = {
  restart() {
    reset();
  },

  randomStart() {
    initial = [
      -10 + 20 * Math.random(),
      -10 + 20 * Math.random(),
      10 + 20 * Math.random()
    ];
    reset();
  },

  randomColor() {
    params.color = '#' + Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, '0');

    primaryMaterial.color.set(params.color);
    gui.controllers.forEach(controller => controller.updateDisplay());
  },

  resetCamera() {
    controls.reset();
  }
};

gui.add(actions, 'restart').name('Restart same orbit');
gui.add(actions, 'randomStart').name('Random initial condition');
gui.add(actions, 'randomColor').name('Random color');
gui.add(actions, 'resetCamera').name('Reset camera');

// Keyboard shortcuts
function onKey(event) {
  if (
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    event.target.closest?.(
      'input, textarea, select, [contenteditable="true"]'
    )
  ) return;

  const binding = {
    r: ['rho', 1],
    e: ['rho', -1],
    s: ['sigma', 1],
    a: ['sigma', -1],
    b: ['beta', 1],
    v: ['beta', -1]
  }[event.key.toLowerCase()];

  if (!binding) return;

  const [key, direction] = binding;
  const max = key === 'rho' ? 200 : 100;
  const value = +(params[key] + direction * 0.01).toFixed(2);

  controllers[key].setValue(Math.max(0.1, Math.min(max, value)));
}

window.addEventListener('keydown', onKey);

// Resize
function resize() {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  controls.handleResize();
}

window.addEventListener('resize', resize);

const observer = new ResizeObserver(resize);
observer.observe(container);

// Animation
let previous = null;
let frame = 0;
let disposed = false;
let lastPlot = 0;

function animate(now) {
  if (disposed) return;

  const elapsed = previous === null
    ? 0
    : Math.min((now - previous) / 1000, 0.1);

  previous = now;

  if (params.staticMode) {
    if (staticDirty) buildStatic();
  } else if (!params.paused) {
    accumulator += elapsed * params.speed;

    while (accumulator >= DT) {
      if (!advance()) {
        accumulator = 0;
        break;
      }

      record();

      if (++steps % 10 === 0) sample();

      accumulator -= DT;
    }
  }

  trail.draw(params.tail);
  twinTrail.draw(params.tail);
  head.draw(50);
  twinHead.draw(50);

  sphere.position.fromArray(state);
  twinSphere.position.fromArray(twinState);

  twinTrail.line.visible = params.twin;
  twinHead.line.visible = params.twin && !params.staticMode;
  head.line.visible = !params.staticMode;
  sphere.visible = !params.staticMode;
  twinSphere.visible = params.twin && !params.staticMode;

  plot.style.display = params.twin && !params.staticMode
    ? 'block'
    : 'none';

  const mode = params.staticMode
    ? ' · static'
    : params.paused
      ? ' · paused'
      : '';

  status.textContent =
    failure || `Lorenz system · t = ${t.toFixed(2)}${mode}`;

  if (now - lastPlot > 100) {
    drawPlot();
    lastPlot = now;
  }

  controls.update();
  renderer.render(scene, camera);
  frame = requestAnimationFrame(animate);
}

function onVisibility() {
  previous = null;
  accumulator = 0;
}

document.addEventListener('visibilitychange', onVisibility);

// Call before removing or reinitializing this visualization.
export function disposeLorenz() {
  disposed = true;
  cancelAnimationFrame(frame);
  observer.disconnect();

  window.removeEventListener('resize', resize);
  window.removeEventListener('keydown', onKey);
  document.removeEventListener('visibilitychange', onVisibility);

  controls.dispose();
  gui.destroy();

  const geometries = new Set();
  const materials = new Set();

  scene.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);

    if (object.material) {
      const list = Array.isArray(object.material)
        ? object.material
        : [object.material];

      list.forEach(material => materials.add(material));
    }
  });

  geometries.forEach(geometry => geometry.dispose());
  materials.forEach(material => material.dispose());

  renderer.dispose();
  renderer.domElement.remove();
  plot.remove();
  status.remove();
}

reset();
resize();
frame = requestAnimationFrame(animate);
