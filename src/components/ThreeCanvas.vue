<template>
  <div ref="threeCanvas" class="three-canvas"></div>
</template>

<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DragControls } from 'three/examples/jsm/controls/DragControls.js'

const threeCanvas = ref(null)

onMounted(() => {
  const scene = new THREE.Scene() //3d scene
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  threeCanvas.value.appendChild(renderer.domElement)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight) //shadows ambient

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 10, 7.5)
  scene.add(directionalLight)

  // controls camera
  const orbitControls = new OrbitControls(camera, renderer.domElement)

  // layers
  const material1 = new THREE.MeshStandardMaterial({ color: '#808080' })
  const material2 = new THREE.MeshStandardMaterial({ color: '#404040' })

  const pavement1 = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), material1) //base01 bigger
  pavement1.rotation.x = -Math.PI / 2
  pavement1.position.y = 0
  scene.add(pavement1)

  const pavement2 = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), material2) //base02 smaller
  pavement2.rotation.x = -Math.PI / 2
  pavement2.position.y = 0.01
  pavement2.position.set(5, 0.01, 5)
  scene.add(pavement2)

  
  const wallMaterial = new THREE.MeshStandardMaterial({ color: '#cccccc', side: THREE.DoubleSide }) // structure of thee rooms
  const floorMaterial = new THREE.MeshStandardMaterial({ color: '#999999' })

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = 0.02
  scene.add(floor)

  const wall1 = new THREE.Mesh(new THREE.PlaneGeometry(10, 3), wallMaterial)  //wall structures
  wall1.position.set(0, 1.5, -5)
  scene.add(wall1)

  const wall2 = new THREE.Mesh(new THREE.PlaneGeometry(10, 3), wallMaterial) //02
  wall2.rotation.y = Math.PI
  wall2.position.set(0, 1.5, 5)
  scene.add(wall2)

  const wall3 = new THREE.Mesh(new THREE.PlaneGeometry(10, 3), wallMaterial) //03
  wall3.rotation.y = Math.PI / 2
  wall3.position.set(-5, 1.5, 0)
  scene.add(wall3)

  const wall4 = new THREE.Mesh(new THREE.PlaneGeometry(10, 3), wallMaterial) //04
  wall4.rotation.y = -Math.PI / 2
  wall4.position.set(5, 1.5, 0)
  scene.add(wall4)

  // object motion
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
  const boxMaterial = new THREE.MeshStandardMaterial({ color: '#00ff00' }) //green box square
  const box = new THREE.Mesh(boxGeometry, boxMaterial)
  box.position.set(0, 0.5, 0)
  scene.add(box)

  const draggableObjects = [box]
  const dragControls = new DragControls(draggableObjects, camera, renderer.domElement) //drag box around

  dragControls.addEventListener('dragstart', () => {
    orbitControls.enabled = false
  })

  dragControls.addEventListener('dragend', () => {
    orbitControls.enabled = true
  })

  camera.position.set(10, 10, 10)
  camera.lookAt(0, 0, 0)

  const animate = () => {
    requestAnimationFrame(animate) //to update the scene every movement
    renderer.render(scene, camera)
  }

  animate()
})
</script>

<style scoped>
.three-canvas {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
