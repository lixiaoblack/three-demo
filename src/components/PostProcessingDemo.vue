<template>
  <div class="relative w-full h-full">
    <div ref="container" class="w-full h-full bg-gray-900"></div>

    <!-- 控制面板 -->
    <div class="absolute top-4 left-4 bg-white/80 p-4 rounded shadow space-y-4">
      <div class="text-sm text-gray-600">
        <span class="font-medium">后期处理效果控制</span>
      </div>

      <!-- 泛光效果控制 -->
      <div class="space-y-2">
        <div class="flex items-center">
          <input type="checkbox" v-model="bloomEnabled" class="mr-2" />
          <span class="text-sm">泛光效果</span>
        </div>
        <div v-if="bloomEnabled" class="pl-6 space-y-2">
          <div>
            <label class="text-sm block">强度</label>
            <input
              type="range"
              v-model="bloomStrength"
              min="0"
              max="3"
              step="0.1"
              class="w-full"
            />
            <span class="text-xs">{{ bloomStrength }}</span>
          </div>
          <div>
            <label class="text-sm block">阈值</label>
            <input
              type="range"
              v-model="bloomThreshold"
              min="0"
              max="1"
              step="0.1"
              class="w-full"
            />
            <span class="text-xs">{{ bloomThreshold }}</span>
          </div>
          <div>
            <label class="text-sm block">半径</label>
            <input
              type="range"
              v-model="bloomRadius"
              min="0"
              max="1"
              step="0.1"
              class="w-full"
            />
            <span class="text-xs">{{ bloomRadius }}</span>
          </div>
        </div>
      </div>

      <!-- 色调映射控制 -->
      <div class="space-y-2">
        <div class="flex items-center">
          <input type="checkbox" v-model="toneEnabled" class="mr-2" />
          <span class="text-sm">色调映射</span>
        </div>
        <div v-if="toneEnabled" class="pl-6 space-y-2">
          <div>
            <label class="text-sm block">曝光</label>
            <input
              type="range"
              v-model="exposure"
              min="0"
              max="2"
              step="0.1"
              class="w-full"
            />
            <span class="text-xs">{{ exposure }}</span>
          </div>
        </div>
      </div>

      <!-- 抗锯齿控制 -->
      <div class="flex items-center">
        <input type="checkbox" v-model="fxaaEnabled" class="mr-2" />
        <span class="text-sm">FXAA 抗锯齿</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";

// 场景相关变量
const container = ref<HTMLDivElement>();
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let composer: EffectComposer;
let bloomPass: UnrealBloomPass;
let fxaaPass: ShaderPass;

// 效果控制变量
const bloomEnabled = ref(true);
const bloomStrength = ref(1.5);
const bloomThreshold = ref(0.4);
const bloomRadius = ref(0.4);
const toneEnabled = ref(true);
const exposure = ref(1);
const fxaaEnabled = ref(true);

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
  camera.position.set(0, 2, 5);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.value!.clientWidth, container.value!.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure.value;
  container.value!.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // 添加发光物体
  addGlowingObjects();

  // 设置后期处理
  setupPostProcessing();
};

// 添加发光物体
const addGlowingObjects = () => {
  // 中心球体
  const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    emissive: 0x00ff00,
    emissiveIntensity: 1,
    metalness: 0.9,
    roughness: 0.1,
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(sphere);

  // 环绕的小球体
  const smallSphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
  const colors = [0xff0000, 0x0000ff, 0xffff00, 0xff00ff];

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const smallSphereMaterial = new THREE.MeshStandardMaterial({
      color: colors[i],
      emissive: colors[i],
      emissiveIntensity: 1,
      metalness: 0.9,
      roughness: 0.1,
    });
    const smallSphere = new THREE.Mesh(
      smallSphereGeometry,
      smallSphereMaterial
    );
    smallSphere.position.x = Math.cos(angle) * 2;
    smallSphere.position.z = Math.sin(angle) * 2;
    smallSphere.position.y = Math.sin(angle) * 0.5;
    scene.add(smallSphere);
  }

  // 添加地面
  const groundGeometry = new THREE.PlaneGeometry(10, 10);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x808080,
    metalness: 0.5,
    roughness: 0.5,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2;
  scene.add(ground);
};

// 设置后期处理
const setupPostProcessing = () => {
  composer = new EffectComposer(renderer);

  // 渲染通道
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // 泛光通道
  const bloomParams = {
    strength: bloomStrength.value,
    radius: bloomRadius.value,
    threshold: bloomThreshold.value,
  };
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(
      container.value!.clientWidth,
      container.value!.clientHeight
    ),
    bloomParams.strength,
    bloomParams.radius,
    bloomParams.threshold
  );
  composer.addPass(bloomPass);

  // FXAA 通道
  fxaaPass = new ShaderPass(FXAAShader);
  const pixelRatio = renderer.getPixelRatio();
  fxaaPass.material.uniforms["resolution"].value.x =
    1 / (container.value!.clientWidth * pixelRatio);
  fxaaPass.material.uniforms["resolution"].value.y =
    1 / (container.value!.clientHeight * pixelRatio);
  composer.addPass(fxaaPass);
};

// 动画循环
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();

  // 更新小球位置
  const time = Date.now() * 0.001;
  scene.children.forEach((child, index) => {
    if (
      child instanceof THREE.Mesh &&
      child.geometry instanceof THREE.SphereGeometry
    ) {
      if (child.geometry.parameters.radius === 0.2) {
        const angle = time + (index * Math.PI) / 2;
        child.position.x = Math.cos(angle) * 2;
        child.position.z = Math.sin(angle) * 2;
        child.position.y = Math.sin(angle * 2) * 0.5;
      }
    }
  });

  composer.render();
};

// 处理窗口大小变化
const onWindowResize = () => {
  if (container.value) {
    camera.aspect = container.value.clientWidth / container.value.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.value.clientWidth, container.value.clientHeight);
    composer.setSize(container.value.clientWidth, container.value.clientHeight);

    // 更新 FXAA 分辨率
    const pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms["resolution"].value.x =
      1 / (container.value.clientWidth * pixelRatio);
    fxaaPass.material.uniforms["resolution"].value.y =
      1 / (container.value.clientHeight * pixelRatio);
  }
};

// 监听效果参数变化
watch([bloomEnabled, bloomStrength, bloomThreshold, bloomRadius], () => {
  if (bloomPass) {
    bloomPass.enabled = bloomEnabled.value;
    bloomPass.strength = bloomStrength.value;
    bloomPass.threshold = bloomThreshold.value;
    bloomPass.radius = bloomRadius.value;
  }
});

watch(toneEnabled, () => {
  renderer.toneMapping = toneEnabled.value
    ? THREE.ACESFilmicToneMapping
    : THREE.NoToneMapping;
});

watch(exposure, () => {
  renderer.toneMappingExposure = exposure.value;
});

watch(fxaaEnabled, () => {
  if (fxaaPass) {
    fxaaPass.enabled = fxaaEnabled.value;
  }
});

// 生命周期钩子
onMounted(() => {
  initScene();
  animate();
  window.addEventListener("resize", onWindowResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onWindowResize);
  renderer.dispose();
  composer.dispose();
});
</script>
