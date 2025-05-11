<template>
    <div ref="container" class="w-full h-screen bg-gray-900"></div>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue' //dom access https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction
  import * as THREE from 'three'
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
  import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
  
  const container = ref(null)
  
  onMounted(() => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a1a) //gray bg
  
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000) //https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
    camera.position.set(0, 5, 10)
  
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    container.value.appendChild(renderer.domElement)
  
    const orbitControls = new OrbitControls(camera, renderer.domElement) //cam movements
    orbitControls.enableDamping = true
  
    const transformControls = new TransformControls(camera, renderer.domElement)
    scene.add(transformControls)
  
    
    transformControls.addEventListener('dragging-changed', (event) => {
      orbitControls.enabled = !event.value
    })
  
    
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5)
    light.position.set(0, 20, 0)
    scene.add(light)
  
    
    const floor = new THREE.Mesh( //floor
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: 0x555555 })
    )
    floor.rotation.x = -Math.PI / 2 //wall rotation -> floor
    floor.receiveShadow = true
    scene.add(floor)
  
    // Load 3D model
    const loader = new GLTFLoader()
    loader.load('/src/assets/models/tray.glb', (gltf) => {
      const model = gltf.scene
      model.position.set(0, 0, 0)
      model.scale.set(0.5, 0.5, 0.5)
      scene.add(model)
  
      transformControls.attach(model)
    })
  
    // Resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    })
  
    function animate() {
      requestAnimationFrame(animate)
      orbitControls.update()
      renderer.render(scene, camera)
    }
  
    animate()
  })
  </script>
  
  <style scoped>
  canvas {
    display: block;
  }
  </style>
  