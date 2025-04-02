<template>
  <div class="relative w-full h-full">
    <div ref="container" class="w-full h-full bg-gray-900"></div>

    <!-- 控制面板 -->
    <div class="absolute top-4 left-4 p-4 bg-gray-800/80 rounded-lg text-white">
      <h3 class="text-lg mb-4">相机类型演示</h3>

      <!-- 相机类型选择 -->
      <div class="mb-4">
        <label class="block mb-2">相机类型</label>
        <select
          v-model="cameraType"
          @change="switchCamera"
          class="w-full bg-gray-700 rounded px-2 py-1"
        >
          <option value="perspective">透视相机 (PerspectiveCamera)</option>
          <option value="orthographic">正交相机 (OrthographicCamera)</option>
        </select>
      </div>

      <!-- 透视相机参数 -->
      <div v-if="cameraType === 'perspective'" class="space-y-4">
        <div>
          <label class="block mb-2">视野角度 (FOV)</label>
          <input
            type="range"
            v-model="fov"
            min="30"
            max="120"
            step="1"
            @input="updateCamera"
            class="w-full bg-gray-700"
          />
          <span class="text-sm">{{ fov }}°</span>
        </div>
      </div>

      <!-- 正交相机参数 -->
      <div v-if="cameraType === 'orthographic'" class="space-y-4">
        <div>
          <label class="block mb-2">视口大小</label>
          <input
            type="range"
            v-model="orthoSize"
            min="1"
            max="20"
            step="0.5"
            @input="updateCamera"
            class="w-full bg-gray-700"
          />
          <span class="text-sm">{{ orthoSize }}</span>
        </div>
      </div>

      <!-- 相机位置控制 -->
      <div class="mt-6">
        <h4 class="text-md mb-3">相机位置</h4>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm mb-1">X</label>
            <input
              type="range"
              v-model="cameraX"
              min="-20"
              max="20"
              step="0.5"
              @input="updateCameraPosition"
              class="w-full bg-gray-700"
            />
            <span class="text-sm">{{ cameraX }}</span>
          </div>
          <div>
            <label class="block text-sm mb-1">Y</label>
            <input
              type="range"
              v-model="cameraY"
              min="-20"
              max="20"
              step="0.5"
              @input="updateCameraPosition"
              class="w-full bg-gray-700"
            />
            <span class="text-sm">{{ cameraY }}</span>
          </div>
          <div>
            <label class="block text-sm mb-1">Z</label>
            <input
              type="range"
              v-model="cameraZ"
              min="-20"
              max="20"
              step="0.5"
              @input="updateCameraPosition"
              class="w-full bg-gray-700"
            />
            <span class="text-sm">{{ cameraZ }}</span>
          </div>
        </div>
      </div>

      <!-- 目标点控制 -->
      <div class="mt-6">
        <h4 class="text-md mb-3">观察目标点</h4>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm mb-1">X</label>
            <input
              type="range"
              v-model="targetX"
              min="-10"
              max="10"
              step="0.5"
              @input="updateCameraTarget"
              class="w-full bg-gray-700"
            />
            <span class="text-sm">{{ targetX }}</span>
          </div>
          <div>
            <label class="block text-sm mb-1">Y</label>
            <input
              type="range"
              v-model="targetY"
              min="-10"
              max="10"
              step="0.5"
              @input="updateCameraTarget"
              class="w-full bg-gray-700"
            />
            <span class="text-sm">{{ targetY }}</span>
          </div>
          <div>
            <label class="block text-sm mb-1">Z</label>
            <input
              type="range"
              v-model="targetZ"
              min="-10"
              max="10"
              step="0.5"
              @input="updateCameraTarget"
              class="w-full bg-gray-700"
            />
            <span class="text-sm">{{ targetZ }}</span>
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
const cameraType = ref("perspective");
const fov = ref(75);
// 使用固定的近平面和远平面距离
const NEAR = 1;
const FAR = 1000;
const orthoSize = ref(5);
const cameraX = ref(10);
const cameraY = ref(10);
const cameraZ = ref(10);
const targetX = ref(0);
const targetY = ref(0);
const targetZ = ref(0);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let objects: THREE.Mesh[] = [];

// 创建示例场景
const createScene = () => {
  // 创建一些示例物体
  const geometries = [
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.ConeGeometry(1, 2, 32),
    new THREE.TorusGeometry(1, 0.4, 16, 32),
  ];

  const materials = [
    new THREE.MeshPhongMaterial({ color: 0xff4444 }),
    new THREE.MeshPhongMaterial({ color: 0x44ff44 }),
    new THREE.MeshPhongMaterial({ color: 0x4444ff }),
    new THREE.MeshPhongMaterial({ color: 0xffff44 }),
  ];

  // 清除现有物体
  objects.forEach((obj) => scene.remove(obj));
  objects = [];

  // 创建新物体
  for (let i = 0; i < geometries.length; i++) {
    const mesh = new THREE.Mesh(geometries[i], materials[i]);
    mesh.position.set((i - 1.5) * 3, 0, 0);
    objects.push(mesh);
    scene.add(mesh);
  }

  // 添加网格地面
  const gridHelper = new THREE.GridHelper(20, 20);
  scene.add(gridHelper);

  // 添加坐标轴
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
};

// 切换相机类型
const switchCamera = () => {
  const aspect = container.value!.clientWidth / container.value!.clientHeight;

  if (cameraType.value === "perspective") {
    camera = new THREE.PerspectiveCamera(fov.value, aspect, NEAR, FAR);
  } else {
    const size = orthoSize.value;
    camera = new THREE.OrthographicCamera(
      -size * aspect,
      size * aspect,
      size,
      -size,
      NEAR,
      FAR
    );
  }

  camera.position.set(cameraX.value, cameraY.value, cameraZ.value);
  camera.lookAt(targetX.value, targetY.value, targetZ.value);

  // 更新控制器
  controls.dispose();
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
};

// 更新相机参数
const updateCamera = () => {
  const aspect = container.value!.clientWidth / container.value!.clientHeight;

  if (cameraType.value === "perspective") {
    // 透视相机参数更新
    const perspCamera = camera as THREE.PerspectiveCamera;
    perspCamera.fov = fov.value;
    perspCamera.aspect = aspect;
  } else {
    // 正交相机参数更新
    const orthoCamera = camera as THREE.OrthographicCamera;
    const size = orthoSize.value;
    orthoCamera.left = -size * aspect;
    orthoCamera.right = size * aspect;
    orthoCamera.top = size;
    orthoCamera.bottom = -size;
  }

  camera.updateProjectionMatrix();
  controls.update();
};

// 修改相机位置更新逻辑
const updateCameraPosition = () => {
  const newPosition = new THREE.Vector3(
    cameraX.value,
    cameraY.value,
    cameraZ.value
  );

  camera.position.copy(newPosition);
  controls.update();
};

// 更新相机目标点
const updateCameraTarget = () => {
  camera.lookAt(targetX.value, targetY.value, targetZ.value);
};

// 初始化场景
const initScene = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);

  const aspect = container.value!.clientWidth / container.value!.clientHeight;
  camera = new THREE.PerspectiveCamera(fov.value, aspect, NEAR, FAR);
  camera.position.set(cameraX.value, cameraY.value, cameraZ.value);
  camera.lookAt(targetX.value, targetY.value, targetZ.value);

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

  createScene();
};

// 动画循环
const animate = () => {
  requestAnimationFrame(animate);

  // 旋转物体
  objects.forEach((obj) => {
    obj.rotation.x += 0.01;
    obj.rotation.y += 0.01;
  });

  controls.update();
  renderer.render(scene, camera);
};

// 处理窗口大小变化
const handleResize = () => {
  if (!container.value) return;

  const aspect = container.value.clientWidth / container.value.clientHeight;

  if (camera instanceof THREE.PerspectiveCamera) {
    camera.aspect = aspect;
  } else {
    const size = orthoSize.value;
    camera.left = -size * aspect;
    camera.right = size * aspect;
    camera.top = size;
    camera.bottom = -size;
  }

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
  objects.forEach((obj) => {
    obj.geometry.dispose();
    (obj.material as THREE.Material).dispose();
  });
});
</script>
