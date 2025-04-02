<!--
 * @Author: wanglx
 * @Date: 2025-04-02 09:38:07
 * @LastEditors: wanglx
 * @LastEditTime: 2025-04-02 13:36:02
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div ref="container" class="w-full h-full bg-gray-900"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as THREE from "three";

const container = ref<HTMLDivElement>();
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let cube: THREE.Mesh;

// 初始化场景
const initScene = () => {
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a); // 设置深色背景

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    container.value!.clientWidth / container.value!.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.value!.clientWidth, container.value!.clientHeight);
  container.value!.appendChild(renderer.domElement);

  // 创建一个立方体
  const geometry = new THREE.BoxGeometry(2, 2, 2); // 增大立方体尺寸
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true, // 添加线框效果
  });
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
};

// 动画循环
const animate = () => {
  requestAnimationFrame(animate);

  // 旋转立方体
  if (cube) {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
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

onMounted(() => {
  initScene();
  animate();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});
</script>
