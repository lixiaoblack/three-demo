<template>
  <div class="relative w-full h-full">
    <div ref="container" class="w-full h-full bg-gray-900"></div>

    <!-- 控制面板 -->
    <div class="absolute top-4 left-4 p-4 bg-gray-800/80 rounded-lg text-white">
      <h3 class="text-lg mb-4">几何体系统演示</h3>

      <!-- 几何体类型选择 -->
      <div class="mb-4">
        <label class="block mb-2">几何体类型</label>
        <select
          v-model="selectedGeometry"
          class="w-full bg-gray-700 p-2 rounded"
        >
          <option value="box">立方体 (BoxGeometry)</option>
          <option value="sphere">球体 (SphereGeometry)</option>
          <option value="cylinder">圆柱体 (CylinderGeometry)</option>
          <option value="cone">圆锥体 (ConeGeometry)</option>
          <option value="torus">圆环 (TorusGeometry)</option>
          <option value="torusKnot">环形结 (TorusKnotGeometry)</option>
        </select>
      </div>

      <!-- 基础参数控制 -->
      <div class="mb-4">
        <label class="block mb-2">缩放</label>
        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="text-xs">X</label>
            <input
              type="number"
              v-model="scale.x"
              min="0.1"
              max="2"
              step="0.1"
              class="w-full bg-gray-700 p-1 rounded"
            />
          </div>
          <div>
            <label class="text-xs">Y</label>
            <input
              type="number"
              v-model="scale.y"
              min="0.1"
              max="2"
              step="0.1"
              class="w-full bg-gray-700 p-1 rounded"
            />
          </div>
          <div>
            <label class="text-xs">Z</label>
            <input
              type="number"
              v-model="scale.z"
              min="0.1"
              max="2"
              step="0.1"
              class="w-full bg-gray-700 p-1 rounded"
            />
          </div>
        </div>
      </div>

      <!-- 旋转控制 -->
      <div class="mb-4">
        <label class="block mb-2">旋转 (度)</label>
        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="text-xs">X</label>
            <input
              type="number"
              v-model="rotation.x"
              min="0"
              max="360"
              step="1"
              class="w-full bg-gray-700 p-1 rounded"
            />
          </div>
          <div>
            <label class="text-xs">Y</label>
            <input
              type="number"
              v-model="rotation.y"
              min="0"
              max="360"
              step="1"
              class="w-full bg-gray-700 p-1 rounded"
            />
          </div>
          <div>
            <label class="text-xs">Z</label>
            <input
              type="number"
              v-model="rotation.z"
              min="0"
              max="360"
              step="1"
              class="w-full bg-gray-700 p-1 rounded"
            />
          </div>
        </div>
      </div>

      <!-- 细分程度控制 -->
      <div class="mb-4">
        <label class="block mb-2">细分程度</label>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-xs">宽度段数</label>
            <input
              type="number"
              v-model="segments.width"
              min="1"
              max="64"
              step="1"
              class="w-full bg-gray-700 p-1 rounded"
            />
          </div>
          <div>
            <label class="text-xs">高度段数</label>
            <input
              type="number"
              v-model="segments.height"
              min="1"
              max="64"
              step="1"
              class="w-full bg-gray-700 p-1 rounded"
            />
          </div>
        </div>
      </div>

      <!-- 线框模式 -->
      <div class="mb-4">
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="wireframe" class="bg-gray-700" />
          <span>线框模式</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const container = ref<HTMLDivElement>();
const selectedGeometry = ref("box");
const scale = ref({ x: 1, y: 1, z: 1 });
const rotation = ref({ x: 0, y: 0, z: 0 });
const segments = ref({ width: 16, height: 16 });
const wireframe = ref(false);

// 转换为数值类型的计算属性
const scaleValues = computed(() => ({
  x: Number(scale.value.x),
  y: Number(scale.value.y),
  z: Number(scale.value.z),
}));

const rotationValues = computed(() => ({
  x: Number(rotation.value.x),
  y: Number(rotation.value.y),
  z: Number(rotation.value.z),
}));

const segmentValues = computed(() => ({
  width: Math.max(1, Math.floor(Number(segments.value.width))),
  height: Math.max(1, Math.floor(Number(segments.value.height))),
}));

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let mesh: THREE.Mesh;

// 创建几何体
const createGeometry = () => {
  let geometry: THREE.BufferGeometry;

  switch (selectedGeometry.value) {
    case "sphere":
      geometry = new THREE.SphereGeometry(
        1, // 半径
        segmentValues.value.width, // 水平段数
        segmentValues.value.height // 垂直段数
      );
      break;
    case "cylinder":
      geometry = new THREE.CylinderGeometry(
        1, // 顶部半径
        1, // 底部半径
        2, // 高度
        segmentValues.value.width, // 径向段数
        segmentValues.value.height // 高度段数
      );
      break;
    case "cone":
      geometry = new THREE.ConeGeometry(
        1, // 底部半径
        2, // 高度
        segmentValues.value.width, // 径向段数
        segmentValues.value.height // 高度段数
      );
      break;
    case "torus":
      geometry = new THREE.TorusGeometry(
        1, // 环面半径
        0.4, // 管道半径
        segmentValues.value.width, // 管道段数
        segmentValues.value.height // 环面段数
      );
      break;
    case "torusKnot":
      geometry = new THREE.TorusKnotGeometry(
        1, // 环面半径
        0.4, // 管道半径
        segmentValues.value.width, // 管道段数
        segmentValues.value.height // 环面段数
      );
      break;
    default:
      geometry = new THREE.BoxGeometry(
        2, // 宽度
        2, // 高度
        2, // 深度
        segmentValues.value.width, // 宽度段数
        segmentValues.value.height, // 高度段数
        segmentValues.value.height // 深度段数
      );
  }

  return geometry;
};

// 更新几何体
const updateGeometry = () => {
  if (!mesh) return;

  // 创建新的几何体
  const newGeometry = createGeometry();

  // 更新网格的几何体
  mesh.geometry.dispose(); // 释放旧的几何体
  mesh.geometry = newGeometry;

  // 更新变换（使用计算属性）
  mesh.scale.set(scaleValues.value.x, scaleValues.value.y, scaleValues.value.z);
  mesh.rotation.set(
    (rotationValues.value.x * Math.PI) / 180,
    (rotationValues.value.y * Math.PI) / 180,
    (rotationValues.value.z * Math.PI) / 180
  );

  // 更新材质
  (mesh.material as THREE.MeshStandardMaterial).wireframe = wireframe.value;
};

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
  camera.position.set(3, 3, 3);
  camera.lookAt(0, 0, 0);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.value!.clientWidth, container.value!.clientHeight);
  container.value!.appendChild(renderer.domElement);

  // 添加轨道控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // 创建网格
  const geometry = createGeometry();
  const material = new THREE.MeshStandardMaterial({
    color: 0x049ef4,
    wireframe: wireframe.value,
  });
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // 添加网格辅助线
  const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper);

  // 添加坐标轴辅助线
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
};

// 动画循环
const animate = () => {
  requestAnimationFrame(animate);
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
watch(
  [selectedGeometry, segments, scale, rotation, wireframe],
  updateGeometry,
  {
    deep: true,
  }
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
