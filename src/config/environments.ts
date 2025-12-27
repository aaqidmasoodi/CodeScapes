import { Globe, Terminal, Blocks } from "lucide-react"
import type { EnvironmentConfig } from "@/types/environment"

export interface EnvironmentCapabilities {
  packages?: boolean
  terminal?: boolean
}

export const ENVIRONMENTS: Record<
  string,
  EnvironmentConfig & { capabilities: EnvironmentCapabilities }
> = {
  flowscape: {
    id: "flowscape",
    name: "FlowScape",
    description: "Block-based coding environment",
    icon: Blocks,
    entryPoint: "project.json",
    allowedExtensions: [".json", ".png", ".svg", ".wav", ".mp3"],
    defaultLayout: "preview",
    runner: "flow-runner",
    capabilities: {
      packages: false,
      terminal: false,
    },
    templates: [
      {
        id: "empty",
        name: "New Flow Project",
        description: "Empty canvas",
        files: [{ name: "project.json", language: "json", content: "{}" }],
      },
    ],
  },
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
  font-family: sans-serif;
  padding: 2rem;
  color: #333;
  background-color: #ffffff;
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
  scene.background = new THREE.Color('rgba(210, 152, 35, 1)'); // Nice warm mustard

  // 2. Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(2, 2, 5); // Offset slightly so we see 3D immediately

  // 3. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); // Smooth edges, allow thumbnail capture
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true; // Enable shadows for extra pop
  document.body.appendChild(renderer.domElement);

  // 4. Object: Cube with Material that reacts to light
  const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const material = new THREE.MeshStandardMaterial({ 
    color: 'rgba(77, 157, 85, 1)', // Deep Indigo contrasting color
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
  background-color: #ffffff;
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
  overflow: hidden;
  background-color: #ffffff;
}
canvas {
  display: block;
}`,
          },
          {
            name: "sketch.js",
            language: "javascript",
            content: `// Particle System - Move your mouse to create particles!
let particles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  background(0);
}

function draw() {
  // Fade background for trail effect
  background(0, 0, 0, 15);
  
  // Add new particles at mouse position
  if (mouseIsPressed || frameCount % 3 === 0) {
    for (let i = 0; i < 3; i++) {
      particles.push(new Particle(mouseX, mouseY));
    }
  }
  
  // Update and display particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    
    // Remove dead particles
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
  
  // Limit particles for performance
  if (particles.length > 500) {
    particles.splice(0, particles.length - 500);
  }
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 4));
    this.acc = createVector(0, 0.05); // Gravity
    this.lifespan = 255;
    this.size = random(5, 15);
    this.hue = (frameCount * 2) % 360; // Rainbow effect
  }
  
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifespan -= 3;
    this.size *= 0.98;
  }
  
  display() {
    noStroke();
    fill(this.hue, 80, 100, this.lifespan / 2.55);
    circle(this.pos.x, this.pos.y, this.size);
  }
  
  isDead() {
    return this.lifespan < 0 || this.size < 0.5;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}`,
          },
        ],
      },
    ],
  },
  python: {
    id: "python",
    name: "Python 3",
    description: "Python runtime with data science support",
    icon: Terminal,
    entryPoint: "main.py",
    allowedExtensions: [".py", ".txt", ".json", ".csv"],
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
        id: "matplotlib",
        name: "Data Visualization",
        description: "Matplotlib & NumPy starter",
        dependencies: ["matplotlib", "numpy"],
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
      {
        id: "data-analysis",
        name: "Data Analysis",
        description: "Pandas & CSV analysis starter",
        dependencies: ["matplotlib", "numpy", "pandas"],
        files: [
          {
            name: "data.csv",
            language: "csv",
            content: `Hospital_Name,County,Specialty,Number_of_Beds,Year
St James Hospital,Dublin,Cardiology,950,2023
Cork University Hospital,Cork,Oncology,820,2022
University Hospital Galway,Galway,Neurology,700,2023
Mater Misericordiae Hospital,Dublin,Emergency Medicine,650,2021
Tallaght University Hospital,Dublin,Orthopedics,580,2022
University Hospital Limerick,Limerick,General Surgery,720,2023
Waterford University Hospital,Waterford,Cardiology,500,2021
Sligo University Hospital,Sligo,Respiratory Medicine,410,2022
Letterkenny University Hospital,Donegal,Pediatrics,390,2023
Naas General Hospital,Kildare,Internal Medicine,360,2021
Portiuncula University Hospital,Roscommon,Endocrinology,340,2022
Mayo University Hospital,Mayo,Radiology,430,2023
Our Lady of Lourdes Hospital,Louth,Gastroenterology,460,2021
St Luke's General Hospital,Kilkenny,Oncology,300,2022
Wexford General Hospital,Wexford,Emergency Medicine,350,2023`,
          },
          {
            name: "main.py",
            language: "python",
            content: `import pandas as pd
import matplotlib.pyplot as plt

# Read the CSV
df = pd.read_csv("data.csv")

# Analysis: total beds per county
beds_by_county = df.groupby("County")["Number_of_Beds"].sum()

# Plot
plt.figure()
beds_by_county.plot(kind="bar")
plt.title("Total Number of Hospital Beds by County")
plt.xlabel("County")
plt.ylabel("Number of Beds")
plt.show()

# Display the dataframe
df`,
          },
        ],
      },
    ],
  },
  r: {
    id: "r",
    name: "R Language",
    description: "Statistical computing and graphics",
    icon: Terminal,
    entryPoint: "main.R",
    allowedExtensions: [".R", ".txt", ".csv", ".json"],
    defaultLayout: "terminal",
    runner: "r-runner",
    capabilities: {
      packages: true,
      terminal: true,
    },
    templates: [
      {
        id: "blank",
        name: "Empty Project",
        description: "A blank R script",
        files: [
          {
            name: "main.R",
            language: "r",
            content: `print("Hello from R!")`,
          },
        ],
      },
      {
        id: "plotting",
        name: "Base Plotting",
        description: "Standard R graphics",
        files: [
          {
            name: "main.R",
            language: "r",
            content: `x <- seq(0, 2*pi, length.out=100)
y <- sin(x)

plot(x, y, type="l", col="blue", main="Sine Wave", lwd=2)
grid()
`,
          },
        ],
      },
    ],
  },
}
