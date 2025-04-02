<template>
  <div class="relative w-full h-full">
    <div ref="container" class="w-full h-full bg-gray-900"></div>

    <!-- 加载状态显示 -->
    <div
      v-if="isLoading"
      class="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded"
    >
      加载中...
    </div>

    <!-- 错误提示 -->
    <div
      v-if="loadingError"
      class="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded"
    >
      {{ loadingError }}
    </div>

    <!-- 控制面板 -->
    <div class="absolute top-4 left-4 p-4 bg-gray-800/80 rounded-lg text-white">
      <h3 class="text-lg mb-4">材质系统演示</h3>

      <!-- 材质类型选择 -->
      <div class="mb-4">
        <label class="block mb-2">材质类型</label>
        <select
          v-model="selectedMaterial"
          class="w-full bg-gray-700 p-2 rounded"
        >
          <option value="basic">基础材质 (MeshBasicMaterial)</option>
          <option value="lambert">兰伯特材质 (MeshLambertMaterial)</option>
          <option value="phong">冯氏材质 (MeshPhongMaterial)</option>
          <option value="standard">标准材质 (MeshStandardMaterial)</option>
          <option value="physical">物理材质 (MeshPhysicalMaterial)</option>
          <option value="toon">卡通材质 (MeshToonMaterial)</option>
        </select>
      </div>

      <!-- 通用材质属性 -->
      <div class="mb-4">
        <label class="block mb-2">颜色</label>
        <input
          type="color"
          v-model="materialColor"
          class="w-full h-8 bg-gray-700 rounded"
        />
      </div>

      <div class="mb-4">
        <label class="block mb-2">透明度</label>
        <input
          type="range"
          v-model="opacity"
          min="0"
          max="1"
          step="0.01"
          class="w-full bg-gray-700"
        />
        <span class="text-sm">{{ opacity }}</span>
      </div>

      <div class="mb-4">
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="wireframe" class="bg-gray-700" />
          <span>线框模式</span>
        </label>
      </div>

      <!-- 高级材质属性 -->
      <div v-if="showAdvancedProperties" class="space-y-4">
        <div v-if="hasMetalnessProperty">
          <label class="block mb-2">金属度</label>
          <input
            type="range"
            v-model="metalness"
            min="0"
            max="1"
            step="0.01"
            class="w-full bg-gray-700"
          />
          <span class="text-sm">{{ metalness }}</span>
        </div>

        <div v-if="hasRoughnessProperty">
          <label class="block mb-2">粗糙度</label>
          <input
            type="range"
            v-model="roughness"
            min="0"
            max="1"
            step="0.01"
            class="w-full bg-gray-700"
          />
          <span class="text-sm">{{ roughness }}</span>
        </div>

        <div v-if="hasSpecularProperty">
          <label class="block mb-2">镜面反射强度</label>
          <input
            type="range"
            v-model="shininess"
            min="0"
            max="100"
            step="1"
            class="w-full bg-gray-700"
          />
          <span class="text-sm">{{ shininess }}</span>
        </div>

        <div v-if="hasClearcoatProperty">
          <label class="block mb-2">清漆层强度</label>
          <input
            type="range"
            v-model="clearcoat"
            min="0"
            max="1"
            step="0.01"
            class="w-full bg-gray-700"
          />
          <span class="text-sm">{{ clearcoat }}</span>
        </div>

        <div v-if="hasEmissiveProperty">
          <label class="block mb-2">自发光颜色</label>
          <input
            type="color"
            v-model="emissiveColor"
            class="w-full h-8 bg-gray-700 rounded"
          />
          <label class="block mt-2 mb-2">自发光强度</label>
          <input
            type="range"
            v-model="emissiveIntensity"
            min="0"
            max="2"
            step="0.1"
            class="w-full bg-gray-700"
          />
          <span class="text-sm">{{ emissiveIntensity }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const container = ref<HTMLDivElement>();
const selectedMaterial = ref("standard");
const materialColor = ref("#049ef4");
const opacity = ref(1);
const wireframe = ref(false);
const metalness = ref(0.5);
const roughness = ref(0.5);
const shininess = ref(30);
const clearcoat = ref(0.5);
const emissiveColor = ref("#000000");
const emissiveIntensity = ref(1);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let mesh: THREE.Mesh;
let envMap: THREE.Texture;

// 添加加载状态ref
const isLoading = ref(false);
const loadingError = ref<string | null>(null);

// 计算属性：根据材质类型显示不同的属性控制
const showAdvancedProperties = computed(() => {
  return ["phong", "standard", "physical"].includes(selectedMaterial.value);
});

const hasMetalnessProperty = computed(() => {
  return ["standard", "physical"].includes(selectedMaterial.value);
});

const hasRoughnessProperty = computed(() => {
  return ["standard", "physical"].includes(selectedMaterial.value);
});

const hasSpecularProperty = computed(() => {
  return selectedMaterial.value === "phong";
});

const hasClearcoatProperty = computed(() => {
  return selectedMaterial.value === "physical";
});

const hasEmissiveProperty = computed(() => {
  return ["phong", "standard", "physical"].includes(selectedMaterial.value);
});

// 创建材质
const createMaterial = () => {
  let material: THREE.Material;

  const baseProps = {
    color: new THREE.Color(materialColor.value),
    wireframe: wireframe.value,
    transparent: opacity.value < 1,
    opacity: opacity.value,
  };

  switch (selectedMaterial.value) {
    case "basic":
      material = new THREE.MeshBasicMaterial(baseProps);
      break;
    case "lambert":
      material = new THREE.MeshLambertMaterial(baseProps);
      break;
    case "phong":
      material = new THREE.MeshPhongMaterial({
        ...baseProps,
        shininess: shininess.value,
        emissive: new THREE.Color(emissiveColor.value),
        emissiveIntensity: emissiveIntensity.value,
      });
      break;
    case "standard":
      material = new THREE.MeshStandardMaterial({
        ...baseProps,
        metalness: metalness.value,
        roughness: roughness.value,
        emissive: new THREE.Color(emissiveColor.value),
        emissiveIntensity: emissiveIntensity.value,
        envMap: envMap,
        envMapIntensity: 1.0,
      });
      break;
    case "physical":
      material = new THREE.MeshPhysicalMaterial({
        ...baseProps,
        metalness: metalness.value,
        roughness: roughness.value,
        clearcoat: clearcoat.value,
        emissive: new THREE.Color(emissiveColor.value),
        emissiveIntensity: emissiveIntensity.value,
        envMap: envMap,
        envMapIntensity: 1.0,
      });
      break;
    case "toon":
      material = new THREE.MeshToonMaterial(baseProps);
      break;
    default:
      material = new THREE.MeshStandardMaterial(baseProps);
  }

  return material;
};

// 更新材质
const updateMaterial = () => {
  if (!mesh) return;

  const oldMaterial = mesh.material;
  mesh.material = createMaterial();

  // 清理旧材质
  if (oldMaterial instanceof THREE.Material) {
    oldMaterial.dispose();
  }
};

// 修改环境贴图加载函数
const loadEnvironmentMap = () => {
  isLoading.value = true;
  loadingError.value = null;
  console.log("开始加载环境贴图...");

  // 创建加载管理器
  const manager = new THREE.LoadingManager(
    // onLoad
    () => {
      console.log("✅ 所有贴图加载完成");
      isLoading.value = false;
    },
    // onProgress
    (url, itemsLoaded, itemsTotal) => {
      const progress = Math.round((itemsLoaded / itemsTotal) * 100);
      console.log(`⏳ 正在加载: ${url}`);
      console.log(`📊 进度: ${progress}%`);
    },
    // onError
    (url) => {
      console.error("❌ 加载失败:", url);
      loadingError.value = `加载失败: ${url}`;
      isLoading.value = false;
    }
  );

  const envMapLoader = new THREE.CubeTextureLoader(manager);

  // 添加时间戳避免缓存
  const timestamp = Date.now();
  const urls = [
    `/textures/env/posx.jpg?v=${timestamp}`,
    `/textures/env/negx.jpg?v=${timestamp}`,
    `/textures/env/posy.jpg?v=${timestamp}`,
    `/textures/env/negy.jpg?v=${timestamp}`,
    `/textures/env/posz.jpg?v=${timestamp}`,
    `/textures/env/negz.jpg?v=${timestamp}`,
  ];

  console.log("🔄 准备加载以下贴图:", urls);

  envMap = envMapLoader.load(urls, (texture) => {
    console.log("✨ 贴图加载成功，正在应用到场景...");
    scene.environment = envMap;
    scene.background = envMap; // 同时设置为背景
    updateMaterial();
  });
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
  camera.position.set(2, 2, 4);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.value!.clientWidth, container.value!.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  container.value!.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 加载环境贴图
  loadEnvironmentMap();

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // 创建几何体
  const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
  const material = createMaterial();
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

  if (mesh) {
    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.01;
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

// 监听材质参数变化
watch(
  [
    selectedMaterial,
    materialColor,
    opacity,
    wireframe,
    metalness,
    roughness,
    shininess,
    clearcoat,
    emissiveColor,
    emissiveIntensity,
  ],
  updateMaterial
);

onMounted(() => {
  initScene();
  animate();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);

  // 清理资源
  if (mesh) {
    mesh.geometry.dispose();
    if (mesh.material instanceof THREE.Material) {
      mesh.material.dispose();
    }
  }
  if (envMap) envMap.dispose();
  renderer.dispose();
});
</script>
