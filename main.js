import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { zzfx } from './ZzFX/ZzFX.js';

// Set up the scene, camera, and renderer

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Add ambient light and directional light with shadow

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 100, 0);
directionalLight.castShadow = true; // Ensure this property is set to true

// Increase shadow map resolution
directionalLight.shadow.mapSize.width = 2048 * 2; // Adjust these values as needed
directionalLight.shadow.mapSize.height = 2048 * 2;

// Adjust shadow camera parameters
const shadowCameraSize = 100;
directionalLight.shadow.camera.left = -shadowCameraSize;
directionalLight.shadow.camera.right = shadowCameraSize;
directionalLight.shadow.camera.top = shadowCameraSize;
directionalLight.shadow.camera.bottom = -shadowCameraSize;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 1000;

scene.add(directionalLight);

const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(helper);

// Add a player sphere

const geometry = new THREE.SphereGeometry();
const material = new THREE.MeshToonMaterial({ color: 0x00ffff });
const player = new THREE.Mesh(geometry, material);
player.castShadow = true;
scene.add(player);

//make a blue sky sphere

const skyGeometry = new THREE.SphereGeometry(1000, 32, 32);
const skyMaterial = new THREE.MeshBasicMaterial({ color: 0x87ceeb });
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
sky.material.side = THREE.BackSide;
scene.add(sky);

let groundWidth = 200;

//Add a ground plane and handle collision with the player
const groundGeometry = new THREE.PlaneGeometry(groundWidth, groundWidth);
const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x38761d });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);

ground.receiveShadow = true;
ground.position.y = -2;
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
player.position.y = ground.position.y + 1;

// Add controls for player with arrow keys
const speed = 0.1;
const arrowKeys = { left: 37, up: 38, right: 39, down: 40 };
const keysPressed = {};

// Define player velocity
const playerVelocity = new THREE.Vector3();

// Add event listeners for keydown and keyup
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

function onKeyDown(event) {
  keysPressed[event.keyCode] = true;
}

function onKeyUp(event) {
  keysPressed[event.keyCode] = false;
}

// Update player velocity based on pressed keys
function updatePlayerVelocity() {
  playerVelocity.set(0, 0, 0); // Reset velocity

  if (keysPressed[arrowKeys.left] || keysPressed[81]) {
    playerVelocity.x -= speed;
  }

  if (keysPressed[arrowKeys.up] || keysPressed[90]) {
    playerVelocity.z -= speed;
  }

  if (keysPressed[arrowKeys.right] || keysPressed[68]) {
    playerVelocity.x += speed;
  }

  if (keysPressed[arrowKeys.down] || keysPressed[83]) {
    playerVelocity.z += speed;
  }
}

// Update player position based on velocity
function updatePlayerPosition() {
  player.position.add(playerVelocity);
}

const spheres = [];

const sphereType = [
  "Sphere",
  "Box",
  "Cone",
  "Cylinder",
  "Dodecahedron",
  "Torus",
  "Tetrahedron",
  "Octahedron",
  "Icosahedron",
  "Ring",
];

const color = [
  0x0000ff, 0xff0000, 0x00ff00, 0xffff00, 0xff00ff, 0x00ffff, 0xffffff,
  0x000000, 0x800000, 0x808000,
];

const spheresType = [];

for (let i = 0; i < 10; i++) {
  const sphereGeometry = new THREE[sphereType[i] + "Geometry"]();
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: color[i] });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  sphere.position.x = Math.random() * groundWidth - groundWidth / 2;
  sphere.position.z = Math.random() * groundWidth - groundWidth / 2;
  sphere.position.y = -2;
  spheresType.push(sphere);
}

//Falling spheres

for (let i = 0; i < 10; i++) {
  //select random sphere from spheresType
  const sphere = spheresType[Math.floor(Math.random() * 10)];
  sphere.position.z = Math.random() * groundWidth - groundWidth / 2;
  sphere.position.y = Math.random() * groundWidth - groundWidth / 2;
  scene.add(sphere);
  spheres.push(sphere);
}

window.addEventListener("keyup", (event) => {
  keysPressed[event.keyCode] = false;
});

function updateCamera() {
  camera.position.copy(player.position).add(new THREE.Vector3(0, 5, 10));
  camera.lookAt(player.position);
}

// Adding decorations to the scene

function loadModel(position, path, scale) {
  const loader = new GLTFLoader();
  loader.load(path, function (gltf) {
    let model = gltf.scene;
    model.scale.set(scale, scale, scale);
    model.position.copy(position);
    model.castShadow = true;
    scene.add(model);
  });
}

const treePath = '/assets/Tree.glb';
const rockPath = '/assets/SRock.glb';

const treePositions = [];
const rockPositions = [];

function generatePositions(positions, numPositions, minDistance, maxDistance) {
  for (let i = 0; i < numPositions; i++) {
    let position;
    let isOverlapping;

    do {
      position = new THREE.Vector3(
        Math.random() * groundWidth - groundWidth / 2,
        ground.position.y + 0.0000001,
        Math.random() * groundWidth - groundWidth / 2
      );

      isOverlapping = false;
      for (let j = 0; j < positions.length; j++) {
        const distance = position.distanceTo(positions[j]);
        if (distance < minDistance) {
          isOverlapping = true;
          break;
        }
      }
    } while (isOverlapping);

    positions.push(position);

    const scale = Math.random() * 20 + 20; // Random scale between 20 and 40

    if (positions === treePositions) {
      loadModel(position, treePath, scale);
    } else if (positions === rockPositions) {
      const rockScale = Math.random() * 10 + 10; // Random scale between 10 and 20 for rocks
      loadModel(position, rockPath, rockScale);
    }
  }
}

generatePositions(treePositions, 40, 10, 20);
generatePositions(rockPositions, 40, 10, 20);

//create a score for each collision
let score = 0;

function animate() {
  updatePlayerPosition();
  updatePlayerVelocity();

  for (let i = 1; i < spheres.length; i++) {
    spheres[i].position.y -= Math.random(0.1, 1) * 0.3;
    if (spheres[i].position.y < ground.position.y + 1) {
      spheres[i].position.y = 50;
      spheres[i].position.x = Math.random() * 60 - 5;
      spheres[i].position.z = Math.random() * 60 - 5;
    } else if (player.position.distanceTo(spheres[i].position) < 2) {
      zzfx(...[2.12, , 119, , .08, .23, , 1.12, , , 156, .1, , .9, , , , .47]);
      score += 1;
      const scoreDiv = document.getElementById("score");
      scoreDiv.innerHTML = score;
      spheres[i].position.y = 50;
      spheres[i].position.x = Math.random() * 60 - 5;
      spheres[i].position.z = Math.random() * 60 - 5;
    }
  }

  requestAnimationFrame(animate);
  updateCamera();
  renderer.render(scene, camera);
}
animate();
