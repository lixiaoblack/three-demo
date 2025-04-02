<template>
  <div class="relative w-full h-full">
    <div ref="container" class="w-full h-full bg-gray-900"></div>

    <!-- 控制面板 -->
    <div class="absolute top-4 left-4 p-4 bg-gray-800/80 rounded-lg text-white">
      <h3 class="text-lg mb-4">场景效果演示</h3>
      <div class="space-y-4">
        <div class="flex flex-col gap-2">
          <label>场景类型</label>
          <select v-model="currentScene" class="bg-gray-700 rounded px-2 py-1">
            <option value="basic">基础场景</option>
            <option value="fog">雾效果</option>
            <option value="skybox">天空盒</option>
            <option value="particles">粒子效果</option>
          </select>
        </div>

        <!-- 雾效果控制 -->
        <div v-if="currentScene === 'fog'" class="space-y-2">
          <div>
            <label>雾的浓度</label>
            <input
              type="range"
              v-model="fogDensity"
              min="0"
              max="0.1"
              step="0.001"
              class="w-full bg-gray-700"
            />
          </div>
          <div>
            <label>雾的颜色</label>
            <input type="color" v-model="fogColor" class="bg-gray-700" />
          </div>
        </div>

        <!-- 粒子效果控制 -->
        <div v-if="currentScene === 'particles'" class="space-y-2">
          <div>
            <label>粒子数量</label>
            <input
              type="range"
              v-model="particleCount"
              min="100"
              max="10000"
              step="100"
              class="w-full bg-gray-700"
            />
          </div>
          <div>
            <label>粒子大小</label>
            <input
              type="range"
              v-model="particleSize"
              min="0.001"
              max="0.1"
              step="0.001"
              class="w-full bg-gray-700"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const container = ref<HTMLDivElement>();
const currentScene = ref("basic");
const fogDensity = ref(0.02);
const fogColor = ref("#cccccc");
const particleCount = ref(5000);
const particleSize = ref(0.01);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let particles: THREE.Points;

// 初始化基础场景
const initBasicScene = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);

  // 添加基础几何体
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // 添加环境光和平行光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
};

// 创建雾效果场景
const createFogScene = () => {
  scene.fog = new THREE.FogExp2(
    new THREE.Color(fogColor.value).getHex(),
    fogDensity.value
  );

  // 添加多个立方体以展示雾效果
  for (let i = 0; i < 20; i++) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(Math.random() * 0xffffff),
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20
    );
    scene.add(cube);
  }
};

// 创建天空盒场景
const createSkyboxScene = () => {
  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([
    "https://threejs.org/examples/textures/cube/Park2/posx.jpg",
    "https://threejs.org/examples/textures/cube/Park2/negx.jpg",
    "https://threejs.org/examples/textures/cube/Park2/posy.jpg",
    "https://threejs.org/examples/textures/cube/Park2/negy.jpg",
    "https://threejs.org/examples/textures/cube/Park2/posz.jpg",
    "https://threejs.org/examples/textures/cube/Park2/negz.jpg",
  ]);
  scene.background = texture;
};

// 创建粒子系统
const createParticleScene = () => {
  if (particles) scene.remove(particles);

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount.value * 3);

  for (let i = 0; i < particleCount.value * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 20;
    positions[i + 1] = (Math.random() - 0.5) * 20;
    positions[i + 2] = (Math.random() - 0.5) * 20;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: particleSize.value,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
};

// 初始化场景
const initScene = () => {
  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.value!.clientWidth, container.value!.clientHeight);
  container.value!.appendChild(renderer.domElement);

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    container.value!.clientWidth / container.value!.clientHeight,
    0.1,
    1000
  );
  camera.position.set(10, 10, 10);
  camera.lookAt(0, 0, 0);

  // 添加控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 初始化基础场景
  initBasicScene();
};

// 动画循环
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();

  if (currentScene.value === "particles" && particles) {
    particles.rotation.y += 0.001;
  }

  renderer.render(scene, camera);
};

// 处理窗口大小变化
const handleResize = () => {
  if (!container.value) return;

  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
};

// 监听场景类型变化
watch(currentScene, (newScene) => {
  // 清空当前场景
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }

  // 重置场景属性
  scene.fog = null;
  scene.background = new THREE.Color(0x333333);

  // 初始化新场景
  switch (newScene) {
    case "basic":
      initBasicScene();
      break;
    case "fog":
      initBasicScene();
      createFogScene();
      break;
    case "skybox":
      initBasicScene();
      createSkyboxScene();
      break;
    case "particles":
      initBasicScene();
      createParticleScene();
      break;
  }
});

// 监听雾效果参数变化
watch([fogDensity, fogColor], () => {
  if (currentScene.value === "fog" && scene.fog) {
    scene.fog = new THREE.FogExp2(
      new THREE.Color(fogColor.value).getHex(),
      fogDensity.value
    );
  }
});

// 监听粒子效果参数变化
watch([particleCount, particleSize], () => {
  if (currentScene.value === "particles") {
    createParticleScene();
  }
});

onMounted(() => {
  initScene();
  animate();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});
</script>
