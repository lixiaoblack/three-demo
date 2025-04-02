<template>
  <div class="relative w-full h-full">
    <div ref="container" class="w-full h-full bg-gray-900"></div>

    <!-- 控制面板 -->
    <div class="absolute top-4 left-4 p-4 bg-gray-800/80 rounded-lg text-white">
      <h3 class="text-lg mb-4">纹理系统演示</h3>

      <!-- 材质类型选择 -->
      <div class="mb-4">
        <label class="block mb-2">材质类型</label>
        <select
          v-model="selectedMaterial"
          class="w-full bg-gray-700 p-2 rounded"
        >
          <option value="brick">砖墙</option>
          <option value="metal">金属板</option>
          <option value="wood">木材</option>
        </select>
      </div>

      <!-- 纹理重复设置 -->
      <div class="mb-4">
        <label class="block mb-2">纹理重复</label>
        <div class="flex gap-2">
          <input
            type="number"
            v-model="repeatX"
            min="1"
            max="10"
            step="1"
            class="w-20 bg-gray-700 p-1 rounded"
          />
          <input
            type="number"
            v-model="repeatY"
            min="1"
            max="10"
            step="1"
            class="w-20 bg-gray-700 p-1 rounded"
          />
        </div>
      </div>

      <!-- 纹理旋转 -->
      <div class="mb-4">
        <label class="block mb-2">纹理旋转 (度)</label>
        <input
          type="range"
          v-model="rotation"
          min="0"
          max="360"
          step="1"
          class="w-full bg-gray-700"
        />
        <span class="text-sm">{{ rotation }}°</span>
      </div>

      <!-- 粗糙度控制 -->
      <div class="mb-4">
        <label class="block mb-2">粗糙度</label>
        <input
          type="range"
          v-model="roughness"
          min="0"
          max="1"
          step="0.1"
          class="w-full bg-gray-700"
        />
        <span class="text-sm">{{ roughness }}</span>
      </div>

      <!-- 金属度控制 -->
      <div class="mb-4">
        <label class="block mb-2">金属度</label>
        <input
          type="range"
          v-model="metalness"
          min="0"
          max="1"
          step="0.1"
          class="w-full bg-gray-700"
        />
        <span class="text-sm">{{ metalness }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  generateBrickTextures,
  generateMetalTextures,
  generateWoodTextures,
} from "../utils/textureGenerator";

const container = ref<HTMLDivElement>();
const selectedMaterial = ref("brick");
const repeatX = ref(1);
const repeatY = ref(1);
const rotation = ref(0);
const roughness = ref(0.5);
const metalness = ref(0.5);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let cube: THREE.Mesh;
let textureLoader: THREE.TextureLoader;
let loadedTextures: Record<string, Record<string, THREE.Texture>> = {};

// 加载纹理
const loadTextures = async (materialType: string) => {
  if (loadedTextures[materialType]) {
    return loadedTextures[materialType];
  }

  let textureData;

  // 根据材质类型生成纹理
  switch (materialType) {
    case "brick":
      textureData = generateBrickTextures();
      break;
    case "metal":
      textureData = generateMetalTextures();
      break;
    case "wood":
      textureData = generateWoodTextures();
      break;
    default:
      textureData = generateBrickTextures();
  }

  // 创建纹理对象
  const textures: Record<string, THREE.Texture> = {};

  // 创建临时图像来加载DataURL
  const loadTextureFromDataUrl = (dataUrl: string): Promise<THREE.Texture> => {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const texture = new THREE.Texture(image);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeatX.value, repeatY.value);
        texture.center.set(0.5, 0.5);
        texture.rotation = (rotation.value * Math.PI) / 180;
        texture.needsUpdate = true;
        resolve(texture);
      };
      image.src = dataUrl;
    });
  };

  // 异步加载所有纹理
  for (const [key, dataUrl] of Object.entries(textureData)) {
    textures[key] = await loadTextureFromDataUrl(dataUrl);
  }

  loadedTextures[materialType] = textures;
  return textures;
};

// 更新材质
const updateMaterial = async () => {
  if (!cube) return;

  const textures = await loadTextures(selectedMaterial.value);
  const material = cube.material as THREE.MeshStandardMaterial;

  // 更新材质的纹理
  material.map = textures.color || null;
  material.normalMap = textures.normal || null;
  material.roughnessMap = textures.roughness || null;
  material.metalnessMap = textures.metalness || null;

  // 更新材质参数
  material.roughness = roughness.value;
  material.metalness = metalness.value;
  material.needsUpdate = true;

  // 更新所有纹理的重复和旋转
  Object.values(textures).forEach((texture) => {
    if (texture) {
      texture.repeat.set(repeatX.value, repeatY.value);
      texture.center.set(0.5, 0.5);
      texture.rotation = (rotation.value * Math.PI) / 180;
      texture.needsUpdate = true;
    }
  });
};

// 创建场景
const initScene = async () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    container.value!.clientWidth / container.value!.clientHeight,
    0.1,
    1000
  );
  camera.position.set(2, 2, 2);
  camera.lookAt(0, 0, 0);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.value!.clientWidth, container.value!.clientHeight);
  container.value!.appendChild(renderer.domElement);

  // 添加轨道控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 创建光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  try {
    // 加载初始纹理
    const textures = await loadTextures(selectedMaterial.value);

    // 创建立方体
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      map: textures.color || null,
      normalMap: textures.normal || null,
      roughnessMap: textures.roughness || null,
      metalnessMap: textures.metalness || null,
      metalness: metalness.value,
      roughness: roughness.value,
    });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
  } catch (error) {
    console.error("Error loading textures:", error);
  }
};

// 监听参数变化
watch([repeatX, repeatY, rotation], () => {
  updateMaterial();
});

// 监听材质类型变化
watch(selectedMaterial, () => {
  updateMaterial();
});

// 监听材质参数变化
watch([roughness, metalness], () => {
  if (!cube) return;
  const material = cube.material as THREE.MeshStandardMaterial;
  material.roughness = roughness.value;
  material.metalness = metalness.value;
});

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

onMounted(async () => {
  await initScene();
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

  // 清理纹理
  Object.values(loadedTextures).forEach((textures) => {
    Object.values(textures).forEach((texture) => {
      texture.dispose();
    });
  });

  renderer.dispose();
});
</script>
