import { Globe, Terminal } from "lucide-react"
import type { EnvironmentConfig } from "@/types/environment"

export interface EnvironmentCapabilities {
  packages?: boolean
  terminal?: boolean
}

export const ENVIRONMENTS: Record<
  string,
  EnvironmentConfig & { capabilities: EnvironmentCapabilities }
> = {
  web: {
    id: "web",
    name: "Web Application",
    description: "HTML, CSS, and JavaScript with live preview",
    icon: Globe,
    entryPoint: "index.html",
    allowedExtensions: [".html", ".css", ".js", ".json"],
    defaultLayout: "preview",
    runner: "web-runner",
    capabilities: {
      packages: false,
      terminal: false,
    },
    templates: [
      {
        id: "blank",
        name: "Blank Project",
        description: "A simple HTML/CSS/JS starter",
        files: [
          {
            name: "index.html",
            language: "html",
            content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Scape</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div id="app">
      <h1>Hello World</h1>
      <p>Start editing to see some magic happen!</p>
    </div>
    <script type="module" src="script.js"></script>
  </body>
</html>`,
          },
          {
            name: "style.css",
            language: "css",
            content: `body {
  font-family: system-ui, sans-serif;
  padding: 2rem;
  color: #333;
}
h1 {
  color: #2563eb;
}`,
          },
          {
            name: "script.js",
            language: "javascript",
            content: `console.log("Hello from CodeScape!");`,
          },
        ],
      },
      {
        id: "threejs",
        name: "Three.js Scene",
        description: "3D graphics with Three.js and OrbitControls",
        files: [
          {
            name: "index.html",
            language: "html",
            content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Three.js Mustard Cube</title>
  <link rel="stylesheet" href="style.css">

  <!-- Import Map: Tells the browser where 'three' lives -->
  <script type="importmap">
    {
      "imports": {
        "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
        "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
      }
    }
  </script>
</head>
<body>
  <!-- Our Module Script -->
  <script type="module" src="script.js"></script>
</body>
</html>`,
          },
          {
            name: "script.js",
            language: "javascript",
            content: `import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, cube, controls;

init();
animate();

function init() {
  // 1. Scene with Mustard Background
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#FFC857'); // Nice warm mustard

  // 2. Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(2, 2, 5); // Offset slightly so we see 3D immediately

  // 3. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true }); // Smooth edges
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true; // Enable shadows for extra pop
  document.body.appendChild(renderer.domElement);

  // 4. Object: Cube with Material that reacts to light
  const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const material = new THREE.MeshStandardMaterial({ 
    color: '#2E4057', // Deep Indigo contrasting color
    roughness: 0.3,   // Slightly shiny
    metalness: 0.1
  });
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // 5. Lighting (Essential for uniform colors)
  // Ambient light (soft fill)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // Directional light (sun-like)
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 10, 7.5);
  scene.add(dirLight);

  // 6. Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Smooth feel
  controls.dampingFactor = 0.05;

  // Handle Resize
  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  // 7. Slow Auto-Rotation
  if (cube) {
    cube.rotation.x += 0.005;
    cube.rotation.y += 0.005;
  }

  // Required for Damping
  controls.update();
  
  renderer.render(scene, camera);
}
`,
          },
          {
            name: "style.css",
            language: "css",
            content: `body {
  margin: 0;
  overflow: hidden;
  font-family: sans-serif;
}

canvas {
  display: block;
}`,
          },
        ],
      },
      {
        id: "p5",
        name: "p5.js Sketch",
        description: "Creative coding with p5.js",
        files: [
          {
            name: "index.html",
            language: "html",
            content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.1/p5.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.1/addons/p5.sound.min.js"></script>
    <link rel="stylesheet" type="text/css" href="style.css">
    <meta charset="utf-8" />
  </head>
  <body>
    <main>
    </main>
    <script src="sketch.js"></script>
  </body>
</html>`,
          },
          {
            name: "style.css",
            language: "css",
            content: `html, body {
  margin: 0;
  padding: 0;
}
canvas {
  display: block;
}`,
          },
          {
            name: "sketch.js",
            language: "javascript",
            content: `function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(20);
  fill(255, 0, 100);
  noStroke();
  circle(mouseX, mouseY, 50);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}`,
          },
        ],
      },
    ],
  },
  python: {
    id: "python",
    name: "Python 3",
    description: "Python runtime with Turtle graphics support",
    icon: Terminal,
    entryPoint: "main.py",
    allowedExtensions: [".py", ".txt", ".json"],
    defaultLayout: "terminal",
    runner: "python-runner",
    capabilities: {
      packages: true,
      terminal: true,
    },
    templates: [
      {
        id: "blank",
        name: "Empty Project",
        description: "A blank Python script",
        files: [
          {
            name: "main.py",
            language: "python",
            content: `print("Hello from Python!")`,
          },
        ],
      },
      {
        id: "turtle",
        name: "Turtle Graphics",
        description: "Classic Turtle drawing example",
        files: [
          {
            name: "main.py",
            language: "python",
            content: `import turtle

t = turtle.Turtle()
t.speed(5)
t.color("blue")

for i in range(4):
    t.forward(100)
    t.right(90)

print("Drawing complete")
turtle.done()`,
          },
        ],
      },
      {
        id: "pong",
        name: "Pong Game",
        description: "Simple Pong game using Turtle",
        files: [
          {
            name: "main.py",
            language: "python",
            content: `import turtle

wn = turtle.Screen()
wn.title("Pong by CodeScape")
wn.bgcolor("black")
wn.setup(width=800, height=600)
wn.tracer(0)

# Paddle A
paddle_a = turtle.Turtle()
paddle_a.speed(0)
paddle_a.shape("square")
paddle_a.color("white")
paddle_a.shapesize(stretch_wid=5, stretch_len=1)
paddle_a.penup()
paddle_a.goto(-350, 0)
paddle_a.visible = True

# Main Game Loop
while True:
    wn.update()
`,
          },
        ],
      },
      {
        id: "matplotlib",
        name: "Data Visualization",
        description: "Matplotlib Example",
        files: [
          {
            name: "main.py",
            language: "python",
            content: `import matplotlib.pyplot as plt
import numpy as np

# 1. Simple Sine Wave
t = np.arange(0.0, 2.0, 0.01)
s = 1 + np.sin(2 * np.pi * t)

plt.figure(1)
plt.plot(t, s, color='blue')
plt.title('Plot 1: Sine Wave')
plt.grid(True)
print("Showing Plot 1...")
plt.show()

# 2. Histogram
plt.figure(2)
data = np.random.randn(1000)
plt.hist(data, bins=30, color='green', alpha=0.7)
plt.title('Plot 2: Histogram')
print("Showing Plot 2...")
plt.show()

print("All Done!")`,
          },
        ],
      },
    ],
  },
}
