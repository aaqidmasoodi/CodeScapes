export interface TemplateFile {
  name: string
  content: string
  language: string
}

export type TemplateType = "blank" | "three" | "p5" | "html"

export const TEMPLATES: Record<
  TemplateType,
  { name: string; description: string; files: TemplateFile[] }
> = {
  blank: {
    name: "Blank Project",
    description: "Start from scratch with empty files",
    files: [
      {
        name: "index.html",
        language: "html",
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Blank Project</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="app.js"></script>
  </body>
</html>`,
      },
      {
        name: "style.css",
        language: "css",
        content: "/* Your styles here */",
      },
      {
        name: "app.js",
        language: "javascript",
        content: "// Your code here",
      },
    ],
  },
  three: {
    name: "Three.js",
    description: "3D scene with spinning torus",
    files: [
      {
        name: "index.html",
        language: "html",
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Three.js Scape</title>
    <style>body { margin: 0; overflow: hidden; }</style>
  </head>
  <body>
    <script type="module" src="app.js"></script>
  </body>
</html>`,
      },
      {
        name: "style.css",
        language: "css",
        content: "body { margin: 0; }",
      },
      {
        name: "app.js",
        language: "javascript",
        content: `import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color('#ffe291'); // Light background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Objects
// Objects
const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshStandardMaterial({ 
  color: '#f2f2f2',
  roughness: 0.4, // Less sharp reflections, more diffuse
  metalness: 0.1  // Less metallic to avoid dark reflections
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Add outline for character
const edges = new THREE.EdgesGeometry(geometry);
const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: '#000000', linewidth: 2 }));
cube.add(line);

// Lighting
const ambientLight = new THREE.AmbientLight('#ffffff', 0.6); // Soft base
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight('#ffffff', 2); // Strong key light
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Smooth interaction
  controls.update();

  // Gentle auto-rotation
  cube.rotation.x += 0.005;
  cube.rotation.y += 0.005;

  renderer.render(scene, camera);
}

animate();

// Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});`,
      },
    ],
  },
  p5: {
    name: "p5.js",
    description: "Creative coding sketch",
    files: [
      {
        name: "index.html",
        language: "html",
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>p5.js Scape</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.js"></script>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <main></main>
    <script src="app.js"></script>
  </body>
</html>`,
      },
      {
        name: "style.css",
        language: "css",
        content: `body {
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f0f0;
}`,
      },
      {
        name: "app.js",
        language: "javascript",
        content: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  fill(255, 0, 0);
  ellipse(mouseX, mouseY, 50, 50);
}`,
      },
    ],
  },
  html: {
    name: "HTML/JS",
    description: "Standard web project",
    files: [
      {
        name: "index.html",
        language: "html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Hello World</h1>
    <button id="btn">Click Me</button>
    <script type="module" src="app.js"></script>
</body>
</html>`,
      },
      {
        name: "style.css",
        language: "css",
        content: `body {
    font-family: system-ui, sans-serif;
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
}

h1 {
    color: #333;
}`,
      },
      {
        name: "app.js",
        language: "javascript",
        content: `document.getElementById('btn').addEventListener('click', () => {
    alert('Button clicked!');
});`,
      },
    ],
  },
}
