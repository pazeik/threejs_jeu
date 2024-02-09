import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.112/examples/jsm/controls/OrbitControls.js";

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

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 0.8);
pointLight.position.set(-10, 10, -10);
scene.add(pointLight);

const geometry = new THREE.SphereGeometry();
const material = new THREE.MeshToonMaterial({ color: 0x00ffff });
const player = new THREE.Mesh(geometry, material);
scene.add(player);

//make a blue sky sphere

const skyGeometry = new THREE.SphereGeometry(1000, 32, 32);
const skyMaterial = new THREE.MeshBasicMaterial({ color: 0x87ceeb });
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
sky.material.side = THREE.BackSide;
scene.add(sky);

camera.position.z = 5;

let groundWidth = 200;

//Add a ground plane and handle collision with the player
const groundGeometry = new THREE.PlaneGeometry(groundWidth, groundWidth);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0xff5733 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.receiveShadow = true;
ground.position.y = -2;
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
player.position.y = ground.position.y + 1;

const controls = new OrbitControls(camera, renderer.domElement);

// Add controls for player with arrow keys
const speed = 0.5;
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

//Make spheres fall around the player from the sky on the ground at random positions

const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
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

//create a list of 10 different markers
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

//create a map between markers and spheres
const markerMap = new Map();

for (let i = 0; i < spheres.length; i++) {
  const markerGeometry = new THREE.SphereGeometry(0.1, 32, 32);
  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const marker = new THREE.Mesh(markerGeometry, markerMaterial);
  marker.position.x = spheres[i].position.x;
  marker.position.z = spheres[i].position.z;
  marker.position.y = -2;
  scene.add(marker);
  markerMap.set(spheres[i], marker);
}

//create a score for each collision
let score = 0;

function animate() {
  updatePlayerPosition();
  updatePlayerVelocity();
  for (let i = 1; i < spheres.length; i++) {
    spheres[i].position.y -= Math.random(0.1, 1) * 0.3;
    //add marker on the ground where the sphere falls
    const marker = markerMap.get(spheres[i]); // Get the assigned marker from the map
    marker.position.x = spheres[i].position.x;
    marker.position.z = spheres[i].position.z;
    marker.position.y = ground.position.y;
    scene.add(marker);
    if (spheres[i].position.y < ground.position.y + 1) {
      spheres[i].position.y = 50;
      spheres[i].position.x = Math.random() * 60 - 5;
      spheres[i].position.z = Math.random() * 60 - 5;
      scene.remove(marker); // Remove the marker from the scene
    } else if (player.position.distanceTo(spheres[i].position) < 1) {
      score += 1;
      const scoreDiv = document.getElementById("score");
      scoreDiv.innerHTML = score;
      spheres[i].position.y = 50;
      spheres[i].position.x = Math.random() * 60 - 5;
      spheres[i].position.z = Math.random() * 60 - 5;
      scene.remove(marker); // Remove the marker from the scene
    }
  }

  requestAnimationFrame(animate);
  updateCamera();
  renderer.render(scene, camera);
}
animate();
