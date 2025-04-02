<template>
  <div class="relative w-full h-full">
    <div ref="container" class="w-full h-full bg-gray-900"></div>

    <!-- 状态提示 -->
    <div class="absolute top-4 left-4 bg-white/80 p-4 rounded shadow space-y-2">
      <div class="text-sm text-gray-600">
        <span class="font-medium">操作说明：</span>
        <ul class="list-disc list-inside mt-1">
          <li>点击物体可以选中</li>
          <li>鼠标悬停时物体会高亮</li>
          <li>按住 Shift + 左键可以拖拽物体</li>
          <li>滚轮缩放视图</li>
          <li>右键旋转视角</li>
        </ul>
      </div>
      <div v-if="selectedObject" class="text-sm">
        <span class="font-medium">已选中：</span>
        <span class="text-blue-600">{{ selectedObject.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// 场景相关变量
const container = ref<HTMLDivElement>();
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let raycaster: THREE.Raycaster;
let mouse: THREE.Vector2;

// 交互状态
const selectedObject = ref<THREE.Object3D | null>(null);
let hoveredObject: THREE.Object3D | null = null;
let isDragging = false;
let dragStartPosition = new THREE.Vector3();
let dragPlane = new THREE.Plane();

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
  camera.position.set(5, 5, 5);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.value!.clientWidth, container.value!.clientHeight);
  renderer.shadowMap.enabled = true;
  container.value!.appendChild(renderer.domElement);

  // 初始化射线拾取器和鼠标位置
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // 添加轨道控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // 添加地面
  const groundGeometry = new THREE.PlaneGeometry(10, 10);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x808080,
    roughness: 0.8,
    metalness: 0.2,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = "地面";
  scene.add(ground);

  // 添加一些可交互的物体
  addInteractiveObjects();

  // 添加网格辅助线
  const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper);
};

// 添加可交互物体
const addInteractiveObjects = () => {
  // 立方体
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshStandardMaterial({
    color: 0x4477aa,
    roughness: 0.7,
    metalness: 0.3,
  });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.set(-2, 0.5, 0);
  cube.castShadow = true;
  cube.name = "立方体";
  scene.add(cube);

  // 球体
  const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xaa4477,
    roughness: 0.7,
    metalness: 0.3,
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.set(0, 0.5, 0);
  sphere.castShadow = true;
  sphere.name = "球体";
  scene.add(sphere);

  // 圆柱体
  const cylinderGeometry = new THREE.CylinderGeometry(0.3, 0.5, 1, 32);
  const cylinderMaterial = new THREE.MeshStandardMaterial({
    color: 0x44aa77,
    roughness: 0.7,
    metalness: 0.3,
  });
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.position.set(2, 0.5, 0);
  cylinder.castShadow = true;
  cylinder.name = "圆柱体";
  scene.add(cylinder);
};

// 更新射线拾取器
const updateRaycaster = (event: MouseEvent) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
};

// 处理鼠标移动
const onMouseMove = (event: MouseEvent) => {
  updateRaycaster(event);

  if (isDragging && selectedObject.value) {
    // 拖拽物体
    const intersects = raycaster.ray.intersectPlane(
      dragPlane,
      new THREE.Vector3()
    );
    if (intersects) {
      selectedObject.value.position.copy(intersects.sub(dragStartPosition));
    }
    return;
  }

  // 处理悬停效果
  const intersects = raycaster.intersectObjects(scene.children);
  const intersected = intersects.length > 0 ? intersects[0].object : null;

  if (hoveredObject) {
    const material = (hoveredObject as THREE.Mesh)
      .material as THREE.MeshStandardMaterial;
    material.emissive.setHex(0x000000);
  }

  if (
    intersected &&
    intersected.type === "Mesh" &&
    intersected !== selectedObject.value
  ) {
    hoveredObject = intersected;
    const material = (hoveredObject as THREE.Mesh)
      .material as THREE.MeshStandardMaterial;
    material.emissive.setHex(0x333333);
  } else {
    hoveredObject = null;
  }
};

// 处理鼠标点击
const onClick = (event: MouseEvent) => {
  if (event.shiftKey) {
    // 开始拖拽
    if (hoveredObject) {
      selectedObject.value = hoveredObject;
      isDragging = true;
      controls.enabled = false;

      // 创建拖拽平面
      const normal = camera.position.clone().normalize();
      dragPlane.setFromNormalAndCoplanarPoint(
        normal,
        selectedObject.value.position
      );

      const intersection = raycaster.ray.intersectPlane(
        dragPlane,
        new THREE.Vector3()
      );
      if (intersection) {
        dragStartPosition.copy(intersection).sub(selectedObject.value.position);
      }
    }
  } else {
    // 普通选择
    if (hoveredObject) {
      if (selectedObject.value) {
        const material = (selectedObject.value as THREE.Mesh)
          .material as THREE.MeshStandardMaterial;
        material.emissive.setHex(0x000000);
      }
      selectedObject.value = hoveredObject;
      const material = (selectedObject.value as THREE.Mesh)
        .material as THREE.MeshStandardMaterial;
      material.emissive.setHex(0x666666);
    } else {
      if (selectedObject.value) {
        const material = (selectedObject.value as THREE.Mesh)
          .material as THREE.MeshStandardMaterial;
        material.emissive.setHex(0x000000);
      }
      selectedObject.value = null;
    }
  }
};

// 处理鼠标释放
const onMouseUp = () => {
  if (isDragging) {
    isDragging = false;
    controls.enabled = true;
  }
};

// 动画循环
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

// 处理窗口大小变化
const onWindowResize = () => {
  if (container.value) {
    camera.aspect = container.value.clientWidth / container.value.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  }
};

// 生命周期钩子
onMounted(() => {
  initScene();
  animate();

  window.addEventListener("resize", onWindowResize);
  renderer.domElement.addEventListener("mousemove", onMouseMove);
  renderer.domElement.addEventListener("click", onClick);
  renderer.domElement.addEventListener("mouseup", onMouseUp);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onWindowResize);
  renderer.domElement.removeEventListener("mousemove", onMouseMove);
  renderer.domElement.removeEventListener("click", onClick);
  renderer.domElement.removeEventListener("mouseup", onMouseUp);

  renderer.dispose();
});
</script>
