import { Globe, Terminal } from "lucide-react"
import type { EnvironmentConfig } from "@/types/environment"

export interface EnvironmentCapabilities {
  packages?: boolean
  terminal?: boolean
}

// Update EnvironmentConfig interface implied here (referencing types/environment later)
// For now, extending the object literal structure.

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
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Three.js Scape</title>
    <style>body { margin: 0; overflow: hidden; }</style>
  </head>
  <body>
    <script type="importmap">
      {
        "imports": {
          "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
          "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
        }
      }
    </script>
    <script type="module" src="script.js"></script>
  </body>
</html>`,
          },
          {
            name: "script.js",
            language: "javascript",
            content: `import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});`,
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
