export interface TemplateFile {
    name: string;
    content: string;
    language: string;
}

export type TemplateType = 'blank' | 'three' | 'p5' | 'html';

export const TEMPLATES: Record<TemplateType, { name: string; description: string; files: TemplateFile[] }> = {
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
</html>`
            },
            {
                name: "style.css",
                language: "css",
                content: "/* Your styles here */"
            },
            {
                name: "app.js",
                language: "javascript",
                content: "// Your code here"
            }
        ]
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
</html>`
            },
            {
                name: "style.css",
                language: "css",
                content: "body { margin: 0; }"
            },
            {
                name: "app.js",
                language: "javascript",
                content: `import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshBasicMaterial({ color: 0x6366f1, wireframe: true });
const torus = new THREE.Mesh(geometry, material);

scene.add(torus);
camera.position.z = 30;

function animate() {
  requestAnimationFrame(animate);
  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});`
            }
        ]
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
</html>`
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
}`
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
}`
            }
        ]
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
</html>`
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
}`
            },
            {
                name: "app.js",
                language: "javascript",
                content: `document.getElementById('btn').addEventListener('click', () => {
    alert('Button clicked!');
});`
            }
        ]
    }
};
