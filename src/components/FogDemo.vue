<template>
  <div class="relative w-full h-full">
    <div ref="container" class="w-full h-full bg-gray-900"></div>

    <!-- 控制面板 -->
    <div class="absolute top-4 left-4 p-4 bg-gray-800/80 rounded-lg text-white">
      <h3 class="text-lg mb-4">雾效果演示</h3>

      <!-- 雾类型选择 -->
      <div class="mb-4">
        <label class="block mb-2">雾类型</label>
        <select
          v-model="fogType"
          @change="updateFog"
          class="w-full bg-gray-700 rounded px-2 py-1"
        >
          <option value="none">无雾效果</option>
          <option value="linear">线性雾 (Fog)</option>
          <option value="exp">指数雾 (FogExp2)</option>
        </select>
      </div>

      <!-- 线性雾参数 -->
      <div v-if="fogType === 'linear'" class="space-y-4">
        <div>
          <label class="block mb-2">起始距离</label>
          <input
            type="range"
            v-model="linearFogNear"
            min="0"
            max="50"
            step="0.1"
            @input="updateFog"
            class="w-full bg-gray-700"
          />
          <span class="text-sm">{{ linearFogNear }}</span>
        </div>
        <div>
          <label class="block mb-2">结束距离</label>
          <input
            type="range"
            v-model="linearFogFar"
            min="0"
            max="100"
            step="0.1"
            @input="updateFog"
            class="w-full bg-gray-700"
          />
          <span class="text-sm">{{ linearFogFar }}</span>
        </div>
      </div>

      <!-- 指数雾参数 -->
      <div v-if="fogType === 'exp'" class="space-y-4">
        <div>
          <label class="block mb-2">密度</label>
          <input
            type="range"
            v-model="expFogDensity"
            min="0"
            max="0.1"
            step="0.001"
            @input="updateFog"
            class="w-full bg-gray-700"
          />
          <span class="text-sm">{{ expFogDensity }}</span>
        </div>
      </div>

      <!-- 通用参数 -->
      <div class="mt-4 space-y-4">
        <div>
          <label class="block mb-2">雾的颜色</label>
          <input
            type="color"
            v-model="fogColor"
            @input="updateFog"
            class="w-full bg-gray-700 h-8 rounded"
          />
        </div>
        <div>
          <label class="block mb-2">物体数量</label>
          <input
            type="range"
            v-model="objectCount"
            min="1"
            max="100"
            step="1"
            @input="updateObjects"
            class="w-full bg-gray-700"
          />
          <span class="text-sm">{{ objectCount }}</span>
        </div>
        <div>
          <label class="block mb-2">物体间距</label>
          <input
            type="range"
            v-model="objectSpacing"
            min="1"
            max="10"
            step="0.1"
            @input="updateObjects"
            class="w-full bg-gray-700"
          />
          <span class="text-sm">{{ objectSpacing }}</span>
        </div>
      </div>

      <!-- 动画控制 -->
      <div class="mt-4">
        <label class="inline-flex items-center">
          <input
            type="checkbox"
            v-model="isAnimating"
            class="form-checkbox bg-gray-700"
          />
          <span class="ml-2">启用动画</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const container = ref<HTMLDivElement>();
const fogType = ref("none");
const fogColor = ref("#cccccc");
const linearFogNear = ref(1);
const linearFogFar = ref(50);
const expFogDensity = ref(0.02);
const objectCount = ref(20);
const objectSpacing = ref(2);
const isAnimating = ref(true);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let objects: THREE.Mesh[] = [];

// 更新雾效果
const updateFog = () => {
  switch (fogType.value) {
    case "none":
      scene.fog = null;
      break;
    case "linear":
      scene.fog = new THREE.Fog(
        new THREE.Color(fogColor.value),
        linearFogNear.value,
        linearFogFar.value
      );
      break;
    case "exp":
      scene.fog = new THREE.FogExp2(
        new THREE.Color(fogColor.value),
        expFogDensity.value
      );
      break;
  }
};

// 创建演示物体
const createObjects = () => {
  // 清除现有物体
  objects.forEach((obj) => scene.remove(obj));
  objects = [];

  // 创建新物体
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  for (let i = 0; i < objectCount.value; i++) {
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(Math.random() * 0xffffff),
    });
    const cube = new THREE.Mesh(geometry, material);

    // 随机位置
    cube.position.set(
      (Math.random() - 0.5) * objectCount.value * objectSpacing.value,
      (Math.random() - 0.5) * objectCount.value * objectSpacing.value,
      (Math.random() - 0.5) * objectCount.value * objectSpacing.value
    );

    // 随机旋转
    cube.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    objects.push(cube);
    scene.add(cube);
  }
};

// 初始化场景
const initScene = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);

  camera = new THREE.PerspectiveCamera(
    75,
    container.value!.clientWidth / container.value!.clientHeight,
    0.1,
    1000
  );
  camera.position.set(20, 20, 20);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.value!.clientWidth, container.value!.clientHeight);
  container.value!.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 10);
  scene.add(directionalLight);

  // 创建地面网格
  const gridHelper = new THREE.GridHelper(50, 50);
  scene.add(gridHelper);

  // 创建物体
  createObjects();
  updateFog();
};

// 动画循环
const animate = () => {
  requestAnimationFrame(animate);

  if (isAnimating.value) {
    objects.forEach((obj) => {
      obj.rotation.x += 0.01;
      obj.rotation.y += 0.01;
    });
  }

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

// 监听参数变化
watch([objectCount, objectSpacing], createObjects);
watch(
  [fogType, fogColor, linearFogNear, linearFogFar, expFogDensity],
  updateFog
);

onMounted(() => {
  initScene();
  animate();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});
</script>
