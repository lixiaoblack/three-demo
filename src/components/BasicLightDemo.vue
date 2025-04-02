<template>
  <div class="relative w-full h-full">
    <div ref="container" class="w-full h-full bg-gray-900"></div>

    <!-- 控制面板 -->
    <div class="absolute top-4 left-4 p-4 bg-gray-800/80 rounded-lg text-white">
      <h3 class="text-lg mb-4">基础光照演示</h3>

      <!-- 环境光控制 -->
      <div class="mb-4">
        <label class="block mb-2">环境光强度</label>
        <input
          type="range"
          v-model="ambientIntensity"
          min="0"
          max="1"
          step="0.1"
          class="w-full bg-gray-700"
        />
        <span class="text-sm">{{ ambientIntensity }}</span>
      </div>

      <!-- 平行光控制 -->
      <div class="mb-4">
        <label class="block mb-2">平行光强度</label>
        <input
          type="range"
          v-model="directionalIntensity"
          min="0"
          max="1"
          step="0.1"
          class="w-full bg-gray-700"
        />
        <span class="text-sm">{{ directionalIntensity }}</span>
      </div>

      <!-- 点光源控制 -->
      <div class="mb-4">
        <label class="block mb-2">点光源强度</label>
        <input
          type="range"
          v-model="pointIntensity"
          min="0"
          max="1"
          step="0.1"
          class="w-full bg-gray-700"
        />
        <span class="text-sm">{{ pointIntensity }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as THREE from "three";

const container = ref<HTMLDivElement>();
const ambientIntensity = ref(0.3);
const directionalIntensity = ref(0.5);
const pointIntensity = ref(0.7);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let ambientLight: THREE.AmbientLight;
let directionalLight: THREE.DirectionalLight;
let pointLight: THREE.PointLight;

// 创建场景
const initScene = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    container.value!.clientWidth / container.value!.clientHeight,
    0.1,
    1000
  );
  camera.position.set(5, 5, 5);
  camera.lookAt(0, 0, 0);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.value!.clientWidth, container.value!.clientHeight);
  container.value!.appendChild(renderer.domElement);

  // 创建光源
  ambientLight = new THREE.AmbientLight(0xffffff, ambientIntensity.value);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(
    0xffffff,
    directionalIntensity.value
  );
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  pointLight = new THREE.PointLight(0xff9900, pointIntensity.value);
  pointLight.position.set(2, 2, 2);
  scene.add(pointLight);

  // 创建物体
  // 地面
  const groundGeometry = new THREE.PlaneGeometry(10, 10);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x808080,
    roughness: 0.8,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // 立方体
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const boxMaterial = new THREE.MeshStandardMaterial({
    color: 0x049ef4,
    roughness: 0.5,
    metalness: 0.5,
  });
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  box.position.y = 0.5;
  scene.add(box);

  // 球体
  const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xff4444,
    roughness: 0.3,
    metalness: 0.7,
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.set(2, 0.5, 0);
  scene.add(sphere);
};

// 动画循环
const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

// 监听光照强度变化
watch(ambientIntensity, (value) => {
  if (ambientLight) {
    ambientLight.intensity = value;
  }
});

watch(directionalIntensity, (value) => {
  if (directionalLight) {
    directionalLight.intensity = value;
  }
});

watch(pointIntensity, (value) => {
  if (pointLight) {
    pointLight.intensity = value;
  }
});

// 处理窗口大小变化
const handleResize = () => {
  if (!container.value) return;

  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
};

onMounted(() => {
  initScene();
  animate();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);

  // 清理场景
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      if (Array.isArray(object.material)) {
        object.material.forEach((m) => m.dispose());
      } else {
        object.material.dispose();
      }
    }
  });

  renderer.dispose();
});
</script>
