<template>
  <div ref="threeCanvas" class="w-full h-full relative">
    <div class="absolute top-4 left-4 bg-white p-2 rounded shadow z-10">
      <label>Select Floor:</label>
      <select v-model="activeFloorIndex" @change="zoomToFloor">
        <option v-for="(floor, index) in floors" :key="index" :value="index">Floor {{ index + 1 }}</option>
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
const activeFloorIndex = ref(0)
const floors = []
let scene, camera, renderer, controls
let raycaster, mouse, selectedObject = null
let draggableObject
const floorHeight = 10
const numFloors = 3

const initScene = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(30, 30, 30)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  threeCanvas.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 1)
  dirLight.position.set(20, 50, 10)
  dirLight.castShadow = true
  scene.add(dirLight)

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  // Add Floors
  for (let i = 0; i < numFloors; i++) {
    const geometry = new THREE.PlaneGeometry(50, 50)
    const material = new THREE.MeshStandardMaterial({ color: 0xcccccc, side: THREE.DoubleSide })
    const floor = new THREE.Mesh(geometry, material)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = i * floorHeight
    floor.receiveShadow = true
    floors.push(floor)
    scene.add(floor)
  }

  // Add Draggable Block
  const boxGeo = new THREE.BoxGeometry(3, 3, 3)
  const boxMat = new THREE.MeshStandardMaterial({ color: 0x0077ff })
  draggableObject = new THREE.Mesh(boxGeo, boxMat)
  draggableObject.castShadow = true
  setObjectOnFloor(draggableObject, 0)
  scene.add(draggableObject)

  window.addEventListener('resize', onResize)
  renderer.domElement.addEventListener('pointerdown', onPointerDown)
  renderer.domElement.addEventListener('pointermove', onPointerMove)
  renderer.domElement.addEventListener('pointerup', onPointerUp)

  animate()
}

function setObjectOnFloor(object, floorIndex) {
  object.position.set(0, floorIndex * floorHeight + 1.5, 0) // box height/2 = 1.5
  object.userData.floorIndex = floorIndex
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function zoomToFloor() {
  const targetY = activeFloorIndex.value * floorHeight + 10
  const targetLookAtY = activeFloorIndex.value * floorHeight

  // Animate camera position
  gsap.to(camera.position, {
    y: targetY,
    duration: 1,
    ease: "power2.out"
  })

  // Animate controls target
  gsap.to(controls.target, {
    y: targetLookAtY,
    duration: 1,
    ease: "power2.out",
    onUpdate: () => controls.update()
  })

  // Snap object to the selected floor
  setObjectOnFloor(draggableObject, activeFloorIndex.value)
}

function onPointerDown(event) {
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObject(draggableObject)
  if (intersects.length > 0) {
    selectedObject = intersects[0].object
    controls.enabled = false
  }
}

function onPointerMove(event) {
  if (!selectedObject) return

  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
  raycaster.setFromCamera(mouse, camera)

  const floor = floors[activeFloorIndex.value]
  const intersects = raycaster.intersectObject(floor)
  if (intersects.length > 0) {
    const point = intersects[0].point
    selectedObject.position.x = point.x
    selectedObject.position.z = point.z
    selectedObject.position.y = activeFloorIndex.value * floorHeight + 1.5 // stay on top of floor
  }
}

function onPointerUp() {
  selectedObject = null
  controls.enabled = true
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

onMounted(() => {
  initScene()
})
</script>

<style scoped>
canvas {
  display: block;
}
</style>
