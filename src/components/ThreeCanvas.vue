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
const floorHeight = 15
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

    // Add realistic office room walls
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 }); // Dark gray walls
    for (let x = -1; x <= 1; x++) {
        for (let z = -1; z <= 1; z++) {
            if (x === 0 && z === 0) continue;
            
            const wallThickness = 0.15;
            const roomWidth = 5;
            const roomDepth = 5;
            const roomHeight = 4; // Mid-height walls like office cubicles/partitions
            const baseY = i * floorHeight + 0.5; // Start from floor level
            const wallY = baseY + roomHeight / 2; // Center walls vertically

            const createWall = (width, height, depth, posX, posY, posZ) => {
              const wall = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMaterial);
              wall.position.set(posX, posY, posZ);
              scene.add(wall);
            };

            const cx = x * 7; // Increased spacing for better room separation
            const cz = z * 7;

            // Create room walls with doorway opening in front wall
            // Front Wall (with doorway)
            const doorWidth = 1.5;
            const wallSegmentWidth = (roomWidth - doorWidth) / 2;
            
            // Left segment of front wall
            createWall(wallSegmentWidth, roomHeight, wallThickness, 
                      cx - doorWidth/2 - wallSegmentWidth/2, wallY, cz - roomDepth / 2);
            // Right segment of front wall
            createWall(wallSegmentWidth, roomHeight, wallThickness, 
                      cx + doorWidth/2 + wallSegmentWidth/2, wallY, cz - roomDepth / 2);
            
            // Back Wall (solid)
            createWall(roomWidth, roomHeight, wallThickness, cx, wallY, cz + roomDepth / 2);
            
            // Left Wall (solid)
            createWall(wallThickness, roomHeight, roomDepth, cx - roomWidth / 2, wallY, cz);
            
            // Right Wall (solid)
            createWall(wallThickness, roomHeight, roomDepth, cx + roomWidth / 2, wallY, cz);

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