<template>
  <div class="relative w-full h-full">
    <div ref="container" class="w-full h-full bg-gray-900"></div>

    <!-- 控制面板 -->
    <div class="absolute top-4 left-4 p-4 bg-gray-800/80 rounded-lg text-white">
      <h3 class="text-lg mb-4">粒子效果演示</h3>

      <!-- 粒子系统类型 -->
      <div class="mb-4">
        <label class="block mb-2">粒子系统类型</label>
        <select
          v-model="particleType"
          @change="updateParticleSystem"
          class="w-full bg-gray-700 rounded px-2 py-1"
        >
          <option value="snow">雪花</option>
          <option value="rain">雨滴</option>
          <option value="stars">星空</option>
          <option value="fire">火焰</option>
        </select>
      </div>

      <!-- 通用参数 -->
      <div class="space-y-4">
        <div>
          <label class="block mb-2">粒子数量</label>
          <input
            type="range"
            v-model="particleCount"
            min="100"
            max="10000"
            step="100"
            @input="updateParticleSystem"
            class="w-full bg-gray-700"
          />
          <span class="text-sm">{{ particleCount }}</span>
        </div>

        <div>
          <label class="block mb-2">粒子大小</label>
          <input
            type="range"
            v-model="particleSize"
            min="0.1"
            max="5"
            step="0.1"
            @input="updateParticleSystem"
            class="w-full bg-gray-700"
          />
          <span class="text-sm">{{ particleSize }}</span>
        </div>

        <div>
          <label class="block mb-2">运动速度</label>
          <input
            type="range"
            v-model="speed"
            min="0.1"
            max="5"
            step="0.1"
            @input="updateParticleSystem"
            class="w-full bg-gray-700"
          />
          <span class="text-sm">{{ speed }}</span>
        </div>

        <div>
          <label class="block mb-2">透明度</label>
          <input
            type="range"
            v-model="opacity"
            min="0"
            max="1"
            step="0.1"
            @input="updateParticleSystem"
            class="w-full bg-gray-700"
          />
          <span class="text-sm">{{ opacity }}</span>
        </div>
      </div>

      <!-- 颜色控制 -->
      <div class="mt-4">
        <label class="block mb-2">粒子颜色</label>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-sm mb-1">起始颜色</label>
            <input
              type="color"
              v-model="startColor"
              @input="updateParticleSystem"
              class="w-full bg-gray-700 h-8 rounded"
            />
          </div>
          <div>
            <label class="block text-sm mb-1">结束颜色</label>
            <input
              type="color"
              v-model="endColor"
              @input="updateParticleSystem"
              class="w-full bg-gray-700 h-8 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const container = ref<HTMLDivElement>();
const particleType = ref("snow");
const particleCount = ref(1000);
const particleSize = ref(0.5);
const speed = ref(1);
const opacity = ref(0.6);
const startColor = ref("#ffffff");
const endColor = ref("#4444ff");

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let particles: THREE.Points;
let particleSystem: {
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
  velocities: THREE.Vector3[];
} | null = null;

// 创建粒子系统
const createParticleSystem = () => {
  // 清除现有粒子系统
  if (particles) {
    scene.remove(particles);
    particleSystem?.geometry.dispose();
    particleSystem?.material.dispose();
  }

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount.value * 3);
  const colors = new Float32Array(particleCount.value * 3);
  const velocities: THREE.Vector3[] = [];

  const startColorObj = new THREE.Color(startColor.value);
  const endColorObj = new THREE.Color(endColor.value);

  for (let i = 0; i < particleCount.value; i++) {
    let x, y, z;

    switch (particleType.value) {
      case "snow":
      case "rain":
        x = Math.random() * 100 - 50;
        y = Math.random() * 100 - 50;
        z = Math.random() * 100 - 50;
        break;
      case "stars":
        const radius = 50;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        x = radius * Math.sin(phi) * Math.cos(theta);
        y = radius * Math.sin(phi) * Math.sin(theta);
        z = radius * Math.cos(phi);
        break;
      case "fire":
        x = Math.random() * 10 - 5;
        y = Math.random() * 20;
        z = Math.random() * 10 - 5;
        break;
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // 颜色渐变
    const color = new THREE.Color().lerpColors(
      startColorObj,
      endColorObj,
      Math.random()
    );
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    // 设置速度
    let velocity;
    switch (particleType.value) {
      case "snow":
        velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          -Math.random() * speed.value,
          (Math.random() - 0.5) * 0.1
        );
        break;
      case "rain":
        velocity = new THREE.Vector3(0, -Math.random() * speed.value * 2, 0);
        break;
      case "stars":
        velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        );
        break;
      case "fire":
        velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          Math.random() * speed.value * 2,
          (Math.random() - 0.5) * 0.5
        );
        break;
      default:
        velocity = new THREE.Vector3(0, 0, 0);
    }
    velocities.push(velocity);
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: particleSize.value,
    vertexColors: true,
    transparent: true,
    opacity: opacity.value,
    blending: THREE.AdditiveBlending,
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  particleSystem = {
    geometry,
    material,
    velocities,
  };
};

// 更新粒子系统
const updateParticleSystem = () => {
  createParticleSystem();
};

// 更新粒子位置
const updateParticles = () => {
  if (!particleSystem) return;

  const positions = particleSystem.geometry.attributes.position
    .array as Float32Array;

  for (let i = 0; i < particleCount.value; i++) {
    positions[i * 3] += particleSystem.velocities[i].x;
    positions[i * 3 + 1] += particleSystem.velocities[i].y;
    positions[i * 3 + 2] += particleSystem.velocities[i].z;

    // 边界检查和重置
    switch (particleType.value) {
      case "snow":
      case "rain":
        if (positions[i * 3 + 1] < -50) {
          positions[i * 3 + 1] = 50;
        }
        break;
      case "fire":
        if (positions[i * 3 + 1] > 30) {
          positions[i * 3 + 1] = 0;
          positions[i * 3] = Math.random() * 10 - 5;
          positions[i * 3 + 2] = Math.random() * 10 - 5;
        }
        break;
    }
  }

  particleSystem.geometry.attributes.position.needsUpdate = true;
};

// 初始化场景
const initScene = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(
    75,
    container.value!.clientWidth / container.value!.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 100);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.value!.clientWidth, container.value!.clientHeight);
  container.value!.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  createParticleSystem();
};

// 动画循环
const animate = () => {
  requestAnimationFrame(animate);
  updateParticles();
  controls.update();
  renderer.render(scene, camera);
};

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
  if (particleSystem) {
    particleSystem.geometry.dispose();
    particleSystem.material.dispose();
  }
});
</script>
