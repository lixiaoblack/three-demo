<template>
  <div class="relative w-full h-full">
    <div ref="container" class="w-full h-full bg-gray-900"></div>

    <!-- 控制面板 -->
    <div class="absolute top-4 left-4 p-4 bg-gray-800/80 rounded-lg text-white">
      <h3 class="text-lg mb-4">动画系统演示</h3>

      <!-- 动画类型选择 -->
      <div class="mb-4">
        <label class="block mb-2">动画类型</label>
        <select
          v-model="selectedAnimation"
          class="w-full bg-gray-700 p-2 rounded"
        >
          <option value="basic">基础动画</option>
          <option value="tween">补间动画</option>
          <option value="keyframe">关键帧动画</option>
          <option value="morph">变形动画</option>
        </select>
      </div>

      <!-- 动画控制 -->
      <div class="mb-4">
        <label class="block mb-2">动画速度</label>
        <input
          type="range"
          v-model="animationSpeed"
          min="0.1"
          max="2"
          step="0.1"
          class="w-full bg-gray-700"
        />
        <span class="text-sm">{{ animationSpeed }}x</span>
      </div>

      <!-- 动画暂停/播放 -->
      <div class="mb-4">
        <button
          @click="toggleAnimation"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          {{ isPlaying ? "暂停" : "播放" }}
        </button>
      </div>

      <!-- 补间动画参数 -->
      <div v-if="selectedAnimation === 'tween'" class="space-y-4">
        <div>
          <label class="block mb-2">缓动函数</label>
          <select v-model="easingType" class="w-full bg-gray-700 p-2 rounded">
            <option value="linear">Linear</option>
            <option value="quadratic">Quadratic</option>
            <option value="cubic">Cubic</option>
            <option value="elastic">Elastic</option>
            <option value="bounce">Bounce</option>
          </select>
        </div>
        <div>
          <label class="block mb-2">动画时长 (秒)</label>
          <input
            type="number"
            v-model="duration"
            min="0.1"
            max="10"
            step="0.1"
            class="w-full bg-gray-700 p-2 rounded"
          />
        </div>
      </div>

      <!-- 变形动画参数 -->
      <div v-if="selectedAnimation === 'morph'" class="space-y-4">
        <div>
          <label class="block mb-2">变形程度</label>
          <input
            type="range"
            v-model="morphFactor"
            min="0"
            max="1"
            step="0.01"
            class="w-full bg-gray-700"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import TWEEN from "@tweenjs/tween.js";

const container = ref<HTMLDivElement>();
const selectedAnimation = ref("basic");
const animationSpeed = ref(1);
const isPlaying = ref(true);
const easingType = ref("quadratic");
const duration = ref(2);
const morphFactor = ref(0);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let mesh: THREE.Mesh;
let clock: THREE.Clock;
let mixer: THREE.AnimationMixer;
let currentAnimation: TWEEN.Tween<any> | null = null;
let currentAction: THREE.AnimationAction | null = null;
let tweenGroup = new TWEEN.Group();

// 创建基础几何体
const createBasicMesh = () => {
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const material = new THREE.MeshPhongMaterial({
    color: 0x049ef4,
    wireframe: false,
  });
  return new THREE.Mesh(geometry, material);
};

// 创建变形目标
const createMorphTargets = () => {
  const boxGeometry = new THREE.BoxGeometry(2, 2, 2, 32, 32, 32);
  const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);

  // 将球体顶点数据复制到立方体的变形目标中
  const positionAttribute = sphereGeometry.attributes.position;
  const morphPositions = new Float32Array(positionAttribute.array.length);
  for (let i = 0; i < positionAttribute.array.length; i++) {
    morphPositions[i] = positionAttribute.array[i];
  }

  boxGeometry.morphAttributes.position = [];
  boxGeometry.morphAttributes.position[0] = new THREE.Float32BufferAttribute(
    morphPositions,
    3
  );

  const material = new THREE.MeshStandardMaterial({
    color: 0x049ef4,
    metalness: 0.1,
    roughness: 0.5,
  });

  const mesh = new THREE.Mesh(boxGeometry, material);
  mesh.morphTargetInfluences = [0];
  return mesh;
};

// 创建关键帧动画网格
const createKeyframeMesh = () => {
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const material = new THREE.MeshPhongMaterial({
    color: 0x049ef4,
  });
  const mesh = new THREE.Mesh(geometry, material);

  // 创建动画混合器
  mixer = new THREE.AnimationMixer(mesh);

  // 创建关键帧轨道
  const times = [0, 1, 2];
  const positions = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(2, 2, 0),
    new THREE.Vector3(0, 0, 0),
  ];
  const rotations = [
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)),
  ];
  const scales = [
    new THREE.Vector3(1, 1, 1),
    new THREE.Vector3(1.5, 1.5, 1.5),
    new THREE.Vector3(1, 1, 1),
  ];

  const positionTrack = new THREE.VectorKeyframeTrack(
    ".position",
    times,
    positions.flatMap((p) => [p.x, p.y, p.z])
  );

  const rotationTrack = new THREE.QuaternionKeyframeTrack(
    ".quaternion",
    times,
    rotations.flatMap((q) => [q.x, q.y, q.z, q.w])
  );

  const scaleTrack = new THREE.VectorKeyframeTrack(
    ".scale",
    times,
    scales.flatMap((s) => [s.x, s.y, s.z])
  );

  const clip = new THREE.AnimationClip("animation", 2, [
    positionTrack,
    rotationTrack,
    scaleTrack,
  ]);

  // 播放动画
  const action = mixer.clipAction(clip);
  action.setLoop(THREE.LoopRepeat, Infinity);
  currentAction = action;

  if (isPlaying.value) {
    action.play();
  }

  return mesh;
};

// 基础动画更新
const updateBasicAnimation = (deltaTime: number) => {
  if (!isPlaying.value) return;

  mesh.rotation.x += deltaTime * animationSpeed.value;
  mesh.rotation.y += deltaTime * animationSpeed.value * 0.5;
};

// 创建补间动画
const createTweenAnimation = () => {
  if (currentAnimation) {
    currentAnimation.stop();
  }

  const target = { rotation: 0 };
  const easingFunctions = {
    linear: TWEEN.Easing.Linear.None,
    quadratic: TWEEN.Easing.Quadratic.InOut,
    cubic: TWEEN.Easing.Cubic.InOut,
    elastic: TWEEN.Easing.Elastic.InOut,
    bounce: TWEEN.Easing.Bounce.InOut,
  };

  currentAnimation = new TWEEN.Tween(target, tweenGroup)
    .to({ rotation: Math.PI * 2 }, duration.value * 1000)
    .easing(easingFunctions[easingType.value as keyof typeof easingFunctions])
    .repeat(Infinity)
    .onUpdate(() => {
      if (mesh) {
        mesh.rotation.y = target.rotation;
      }
    });

  if (isPlaying.value) {
    currentAnimation.start(clock.getElapsedTime() * 1000);
  }
};

// 更新动画
const updateAnimation = () => {
  if (!mesh) return;

  const deltaTime = clock.getDelta();
  const time = clock.getElapsedTime() * 1000;

  switch (selectedAnimation.value) {
    case "basic":
      updateBasicAnimation(deltaTime);
      break;
    case "tween":
      if (isPlaying.value) {
        tweenGroup.update(time);
      }
      break;
    case "keyframe":
      if (mixer && isPlaying.value) {
        mixer.update(deltaTime * animationSpeed.value);
      }
      break;
    case "morph":
      if (mesh.morphTargetInfluences && isPlaying.value) {
        // 使用sin函数创建循环变形动画
        const value = (Math.sin(time * animationSpeed.value) + 1) / 2;
        mesh.morphTargetInfluences[0] = value;
        morphFactor.value = value; // 更新滑块值
      }
      break;
  }
};

// 切换动画类型
const switchAnimationType = () => {
  if (!scene || !mesh) return;

  // 停止当前动画
  if (currentAnimation) {
    currentAnimation.stop();
    currentAnimation = null;
  }
  if (currentAction) {
    currentAction.stop();
    currentAction = null;
  }
  if (mixer) {
    mixer.stopAllAction();
  }

  // 清除现有网格
  scene.remove(mesh);
  if (mesh.geometry) mesh.geometry.dispose();
  if (mesh.material instanceof THREE.Material) mesh.material.dispose();

  // 创建新网格
  switch (selectedAnimation.value) {
    case "morph":
      mesh = createMorphTargets();
      if (mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences[0] = morphFactor.value;
      }
      break;
    case "keyframe":
      mesh = createKeyframeMesh();
      break;
    case "tween":
      mesh = createBasicMesh();
      if (isPlaying.value) {
        createTweenAnimation();
      }
      break;
    default:
      mesh = createBasicMesh();
  }

  scene.add(mesh);
};

// 切换动画播放状态
const toggleAnimation = () => {
  isPlaying.value = !isPlaying.value;

  switch (selectedAnimation.value) {
    case "tween":
      if (isPlaying.value) {
        createTweenAnimation();
      } else if (currentAnimation) {
        currentAnimation.stop();
      }
      break;
    case "keyframe":
      if (currentAction) {
        if (isPlaying.value) {
          currentAction.play();
        } else {
          currentAction.stop();
        }
      }
      break;
    case "morph":
      // 变形动画不需要特殊处理，因为它会在动画循环中自动更新
      break;
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
  camera.position.set(4, 4, 4);
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
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  clock = new THREE.Clock();

  // 创建初始网格
  mesh = createBasicMesh();
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
  updateAnimation();
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
watch([selectedAnimation], switchAnimationType);
watch([easingType, duration], () => {
  if (selectedAnimation.value === "tween") {
    createTweenAnimation();
  }
});
watch(animationSpeed, (newSpeed) => {
  if (selectedAnimation.value === "keyframe" && mixer) {
    mixer.timeScale = newSpeed;
  }
});

// 添加对morphFactor的监听
watch(morphFactor, (newValue) => {
  if (
    selectedAnimation.value === "morph" &&
    mesh &&
    mesh.morphTargetInfluences
  ) {
    mesh.morphTargetInfluences[0] = newValue;
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
