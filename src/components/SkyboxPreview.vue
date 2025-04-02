<template>
  <div class="relative w-full h-full">
    <div ref="container" class="w-full h-full bg-gray-900"></div>

    <!-- 控制面板 -->
    <div class="absolute top-4 left-4 p-4 bg-gray-800/80 rounded-lg text-white">
      <h3 class="text-lg mb-4">天空盒预览工具</h3>

      <!-- 预设天空盒选择 -->
      <div class="mb-4">
        <label class="block mb-2">预设天空盒</label>
        <select
          v-model="selectedPreset"
          @change="applyPreset"
          class="w-full bg-gray-700 rounded px-2 py-1"
        >
          <option value="">-- 选择预设 --</option>
          <option value="bridge">桥梁场景</option>
          <option value="park">公园场景</option>
          <option value="space">太空场景</option>
        </select>
      </div>

      <!-- 图片上传区域 -->
      <div class="space-y-4">
        <div
          v-for="(face, index) in skyboxFaces"
          :key="face.name"
          class="flex items-center gap-4"
        >
          <span class="w-20">{{ face.label }}</span>
          <input
            type="file"
            accept="image/*"
            class="text-sm text-gray-300"
            @change="(e) => handleFileUpload(e, face.name)"
          />
          <div v-if="face.preview" class="w-12 h-12 rounded overflow-hidden">
            <img :src="face.preview" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <!-- 预览控制 -->
      <div class="mt-4 space-y-2">
        <button
          @click="applyTextures"
          class="w-full px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
        >
          应用预览
        </button>
        <button
          @click="resetScene"
          class="w-full px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
        >
          重置场景
        </button>
      </div>

      <!-- 提示信息 -->
      <div class="mt-4 text-sm text-gray-400">
        <p>建议图片尺寸：1024x1024 或 2048x2048</p>
        <p>支持格式：jpg, png</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const container = ref<HTMLDivElement>();
const selectedPreset = ref("");

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;

// 预设天空盒资源
const presets = {
  bridge: {
    name: "桥梁场景",
    urls: [
      "https://threejs.org/examples/textures/cube/Bridge2/posx.jpg",
      "https://threejs.org/examples/textures/cube/Bridge2/negx.jpg",
      "https://threejs.org/examples/textures/cube/Bridge2/posy.jpg",
      "https://threejs.org/examples/textures/cube/Bridge2/negy.jpg",
      "https://threejs.org/examples/textures/cube/Bridge2/posz.jpg",
      "https://threejs.org/examples/textures/cube/Bridge2/negz.jpg",
    ],
  },
  park: {
    name: "公园场景",
    urls: [
      "https://threejs.org/examples/textures/cube/Park2/posx.jpg",
      "https://threejs.org/examples/textures/cube/Park2/negx.jpg",
      "https://threejs.org/examples/textures/cube/Park2/posy.jpg",
      "https://threejs.org/examples/textures/cube/Park2/negy.jpg",
      "https://threejs.org/examples/textures/cube/Park2/posz.jpg",
      "https://threejs.org/examples/textures/cube/Park2/negz.jpg",
    ],
  },
  space: {
    name: "太空场景",
    urls: [
      "https://threejs.org/examples/textures/cube/MilkyWay/dark-s_px.jpg",
      "https://threejs.org/examples/textures/cube/MilkyWay/dark-s_nx.jpg",
      "https://threejs.org/examples/textures/cube/MilkyWay/dark-s_py.jpg",
      "https://threejs.org/examples/textures/cube/MilkyWay/dark-s_ny.jpg",
      "https://threejs.org/examples/textures/cube/MilkyWay/dark-s_pz.jpg",
      "https://threejs.org/examples/textures/cube/MilkyWay/dark-s_nz.jpg",
    ],
  },
};

// 天空盒面的配置
const skyboxFaces = ref([
  { name: "px", label: "右面 (+X)", preview: "", texture: null },
  { name: "nx", label: "左面 (-X)", preview: "", texture: null },
  { name: "py", label: "上面 (+Y)", preview: "", texture: null },
  { name: "ny", label: "下面 (-Y)", preview: "", texture: null },
  { name: "pz", label: "前面 (+Z)", preview: "", texture: null },
  { name: "nz", label: "后面 (-Z)", preview: "", texture: null },
]);

// 应用预设天空盒
const applyPreset = async () => {
  if (!selectedPreset.value) return;

  const preset = presets[selectedPreset.value as keyof typeof presets];
  if (!preset) return;

  // 加载预设贴图
  const loader = new THREE.CubeTextureLoader();
  const texture = await loader.loadAsync(preset.urls);
  scene.background = texture;
};

// 处理文件上传
const handleFileUpload = (event: Event, faceName: string) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const face = skyboxFaces.value.find((f) => f.name === faceName);
    if (face) {
      face.preview = e.target?.result as string;
      // 创建纹理
      const texture = new THREE.TextureLoader().load(face.preview);
      face.texture = texture;
    }
  };
  reader.readAsDataURL(file);
};

// 应用纹理到天空盒
const applyTextures = () => {
  // 检查是否所有面都已上传
  const isComplete = skyboxFaces.value.every((face) => face.texture);
  if (!isComplete) {
    alert("请上传所有六个面的图片");
    return;
  }

  // 创建立方体纹理
  const textures = [
    skyboxFaces.value.find((f) => f.name === "px")?.texture,
    skyboxFaces.value.find((f) => f.name === "nx")?.texture,
    skyboxFaces.value.find((f) => f.name === "py")?.texture,
    skyboxFaces.value.find((f) => f.name === "ny")?.texture,
    skyboxFaces.value.find((f) => f.name === "pz")?.texture,
    skyboxFaces.value.find((f) => f.name === "nz")?.texture,
  ];

  // 应用到场景
  scene.background = new THREE.CubeTexture(textures as any);
};

// 重置场景
const resetScene = () => {
  scene.background = new THREE.Color(0x333333);
  skyboxFaces.value.forEach((face) => {
    face.preview = "";
    face.texture = null;
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
  camera.position.set(0, 0, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.value!.clientWidth, container.value!.clientHeight);
  container.value!.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // 添加参考物体（可选）
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
  });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
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

onMounted(() => {
  initScene();
  animate();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});
</script>
