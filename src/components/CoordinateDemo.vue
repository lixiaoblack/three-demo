<template>
  <div class="relative w-full h-full">
    <div ref="container" class="w-full h-full bg-gray-900"></div>
    <!-- 坐标说明 -->
    <div class="absolute top-4 left-4 p-4 bg-gray-800/80 rounded-lg text-white">
      <h3 class="text-lg mb-2">Three.js 坐标系统</h3>
      <ul class="space-y-2">
        <li class="flex items-center">
          <div class="w-4 h-4 bg-red-500 mr-2"></div>
          <span>X 轴（红色）：向右为正方向</span>
        </li>
        <li class="flex items-center">
          <div class="w-4 h-4 bg-green-500 mr-2"></div>
          <span>Y 轴（绿色）：向上为正方向</span>
        </li>
        <li class="flex items-center">
          <div class="w-4 h-4 bg-blue-500 mr-2"></div>
          <span>Z 轴（蓝色）：向外为正方向</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const container = ref<HTMLDivElement>();
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;

// 创建网格地面
const createGridFloor = () => {
  const size = 10;
  const divisions = 10;
  const gridHelper = new THREE.GridHelper(size, divisions);
  scene.add(gridHelper);
};

// 创建坐标轴
const createAxes = () => {
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
};

// 创建标签精灵
const createLabelSprite = (
  text: string,
  position: THREE.Vector3,
  color: number = 0xffffff
) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  canvas.width = 128;
  canvas.height = 64;

  // 绘制背景
  context.fillStyle = "rgba(40, 40, 40, 0.9)";
  context.strokeStyle = "#ffffff";
  context.lineWidth = 2;

  // 创建圆角矩形
  const radius = 8;
  context.beginPath();
  context.moveTo(radius, 0);
  context.lineTo(canvas.width - radius, 0);
  context.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
  context.lineTo(canvas.width, canvas.height - radius);
  context.quadraticCurveTo(
    canvas.width,
    canvas.height,
    canvas.width - radius,
    canvas.height
  );
  context.lineTo(radius, canvas.height);
  context.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
  context.lineTo(0, radius);
  context.quadraticCurveTo(0, 0, radius, 0);
  context.closePath();

  // 填充和描边
  context.fill();
  context.stroke();

  // 设置文本样式
  context.fillStyle = "#ffffff";
  context.font = '32px "Helvetica Neue", Arial, sans-serif';
  context.textAlign = "center";
  context.textBaseline = "middle";

  // 添加发光效果
  context.shadowColor = "rgba(255, 255, 255, 0.5)";
  context.shadowBlur = 4;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;

  // 绘制文本
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  // 创建纹理
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    depthTest: false,
    depthWrite: false,
    transparent: true,
    opacity: 1,
  });

  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.position.copy(position);

  // 根据文本内容调整大小
  const scale = 0.8;
  sprite.scale.set(scale, (scale * canvas.height) / canvas.width, 1);
  sprite.center.set(0.5, 0.5);

  return sprite;
};

// 创建示例立方体
const createDemoCubes = () => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  // 创建不同位置的立方体来展示坐标系统
  const positions = [
    { pos: [2, 0, 0], color: 0xff4444, label: "+X" },
    { pos: [-2, 0, 0], color: 0xff9999, label: "-X" },
    { pos: [0, 2, 0], color: 0x44ff44, label: "+Y" },
    { pos: [0, -2, 0], color: 0x99ff99, label: "-Y" },
    { pos: [0, 0, 2], color: 0x4444ff, label: "+Z" },
    { pos: [0, 0, -2], color: 0x9999ff, label: "-Z" },
  ];

  positions.forEach(({ pos, color, label }) => {
    const material = new THREE.MeshPhongMaterial({
      color,
      shininess: 100,
      specular: 0x444444,
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(pos[0], pos[1], pos[2]);
    scene.add(cube);

    // 添加标签，稍微调整位置使其不与立方体重叠
    const labelPos = new THREE.Vector3(
      pos[0] * 1.3,
      pos[1] * 1.3,
      pos[2] * 1.3
    );
    const sprite = createLabelSprite(label, labelPos);
    scene.add(sprite);
  });
};

// 初始化场景
const initScene = () => {
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    container.value!.clientWidth / container.value!.clientHeight,
    0.1,
    1000
  );
  camera.position.set(5, 5, 5);
  camera.lookAt(0, 0, 0);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
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

  // 创建场景内容
  createGridFloor();
  createAxes();
  createDemoCubes();
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
