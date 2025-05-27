
<template>
  <div ref="threeCanvas" class="w-full h-full relative">
    <div class="absolute top-4 left-4 bg-white p-2 rounded shadow z-10">
      <label>Select Floor:</label>
      <select v-model="selectedFloor" @change="zoomToSelectedFloor">
        <option disabled value="">Select a floor</option>
        <option v-for="floor in floors" :key="floor.id" :value="floor.id">{{ floor.name }}</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { onMounted, ref } from 'vue'
import gsap from 'gsap'

const threeCanvas = ref(null)
const selectedFloor = ref('')
const floors = ref([
  { id: 'floor0', name: 'Floor 1' },
  { id: 'floor1', name: 'Floor 2' },
  { id: 'floor2', name: 'Floor 3' }
])
const floorMeshes = {}

let scene, camera, renderer, controls
const floorHeight = 10
const numFloors = 3

const initScene = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(20, 20, 20)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  threeCanvas.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(10, 20, 10)
  scene.add(light)

  const ambient = new THREE.AmbientLight(0x404040)
  scene.add(ambient)

  const geometry = new THREE.BoxGeometry(5, 1, 5)
  const material = new THREE.MeshStandardMaterial({ color: 0x0077ff })

  
for (let i = 0; i < numFloors; i++) {
    const baseGeometry = new THREE.BoxGeometry(20, 1, 20);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = i * floorHeight;
    base.name = `floor${i}`;
    scene.add(base);
    floorMeshes[base.name] = base;

    // Add rooms on top of the base
    const roomMaterial = new THREE.MeshStandardMaterial({ color: 0x00cc99 });
    for (let x = -1; x <= 1; x++) {
        for (let z = -1; z <= 1; z++) {
            if (x === 0 && z === 0) continue;
            
            const wallThickness = 0.2;
            const roomWidth = 4;
            const roomDepth = 4;
            const roomHeight = 2.5;
            const baseY = i * floorHeight + 0.5 + roomHeight / 2;

            const createWall = (width, height, depth, posX, posY, posZ) => {
              const wall = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), roomMaterial);
              wall.position.set(posX, posY, posZ);
              scene.add(wall);
            };

            const cx = x * 6;
            const cz = z * 6;

            // Front Wall
            createWall(roomWidth, roomHeight, wallThickness, cx, baseY, cz - roomDepth / 2);
            // Back Wall
            createWall(roomWidth, roomHeight, wallThickness, cx, baseY, cz + roomDepth / 2);
            // Left Wall
            createWall(wallThickness, roomHeight, roomDepth, cx - roomWidth / 2, baseY, cz);
            // Right Wall
            createWall(wallThickness, roomHeight, roomDepth, cx + roomWidth / 2, baseY, cz);

        }
    }

    const floor = new THREE.Mesh(geometry, material.clone())
    floor.position.y = i * floorHeight
    floor.name = `floor${i}`
    scene.add(floor)
    floorMeshes[floor.name] = floor
  }

  animate()
}

const animate = () => {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

const zoomToSelectedFloor = () => {
  const mesh = floorMeshes[selectedFloor.value]
  if (mesh) {
    const box = new THREE.Box3().setFromObject(mesh)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())

    const maxDim = Math.max(size.x, size.y, size.z)
    const distance = maxDim * 3

    const direction = new THREE.Vector3(1, 1, 1).normalize()
    const newPos = center.clone().add(direction.multiplyScalar(distance))

    gsap.to(camera.position, {
      x: newPos.x,
      y: newPos.y,
      z: newPos.z,
      duration: 1,
      onUpdate: () => {
        camera.lookAt(center)
        controls.target.copy(center)
        controls.update()
      }
    })
  }
}

onMounted(() => {
  initScene()
})
</script>

<style scoped>
select {
  width: 150px;
  padding: 4px;
}
</style>
