<!--
 * @Author: wanglx
 * @Date: 2025-03-13 20:40:21
 * @LastEditors: wanglx
 * @LastEditTime: 2025-04-07 13:33:46
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div class="w-screen h-screen flex">
    <!-- 侧边栏 -->
    <div class="w-64 bg-gray-900 border-r border-gray-800">
      <div class="p-4">
        <h1 class="text-xl font-bold text-white mb-4">Three.js 学习</h1>
      </div>
      <el-menu
        :default-active="activeIndex"
        class="!border-none menu-container"
        background-color="var(--el-bg-color-overlay)"
        text-color="var(--el-text-color-primary)"
        active-text-color="var(--el-color-primary)"
        @select="handleSelect"
      >
        <el-menu-item
          v-for="(route, index) in routes"
          :key="route.name"
          :index="String(index)"
          class="menu-item"
        >
          <el-icon><Monitor /></el-icon>
          <span>{{ route.name }}</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主内容区 -->
    <div class="flex-1 bg-black">
      <component :is="currentComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Monitor } from "@element-plus/icons-vue";
import BasicScene from "./components/BasicScene.vue";
import GeometryDemo from "./components/GeometryDemo.vue";
import CoordinateDemo from "./components/CoordinateDemo.vue";
import SceneDemo from "./components/SceneDemo.vue";
import SkyboxPreview from "./components/SkyboxPreview.vue";
import FogDemo from "./components/FogDemo.vue";
import ParticleDemo from "./components/ParticleDemo.vue";
import CameraDemo from "./components/CameraDemo.vue";
import MaterialDemo from "./components/MaterialDemo.vue";
import BasicLightDemo from "./components/BasicLightDemo.vue";
import TextureDemo from "./components/TextureDemo.vue";
import AnimationDemo from "./components/AnimationDemo.vue";
import InteractionDemo from "./components/InteractionDemo.vue";
import PostProcessingDemo from "./components/PostProcessingDemo.vue";
import MapboxThreeDemo from "./components/MapboxThreeDemo.vue";
import MapParticleDemo from "./components/MapParticleDemo.vue";
import MachineRoom from "./components/MachineRoom/MachineRoom.vue";

// 定义路由配置
const routes = [
  {
    name: "基础场景",
    component: BasicScene,
  },
  {
    path: "/geometry",
    name: "几何体演示",
    component: GeometryDemo,
    meta: {
      title: "几何体系统",
    },
  },
  {
    name: "坐标系统",
    component: CoordinateDemo,
  },
  {
    name: "场景类型",
    component: SceneDemo,
  },
  {
    name: "天空盒预览",
    component: SkyboxPreview,
  },
  {
    name: "雾效果",
    component: FogDemo,
  },
  {
    name: "粒子效果",
    component: ParticleDemo,
  },
  {
    name: "相机系统",
    component: CameraDemo,
  },
  {
    name: "灯光系统",
    component: BasicLightDemo,
  },
  {
    name: "纹理系统",
    component: TextureDemo,
  },
  {
    name: "动画系统",
    component: AnimationDemo,
  },
  {
    name: "材质系统",
    component: MaterialDemo,
  },
  {
    path: "/interaction",
    name: "交互系统",
    component: InteractionDemo,
    meta: {
      title: "交互系统",
    },
  },
  {
    path: "/post-processing",
    name: "后期处理",
    component: PostProcessingDemo,
    meta: {
      title: "后期处理",
    },
  },
  {
    path: "/mapbox-three",
    name: "地理信息",
    component: MapboxThreeDemo,
    meta: {
      title: "地理信息系统",
    },
  },
  {
    path: "/map-particle",
    name: "地图特效",
    component: MapParticleDemo,
    meta: {
      title: "地图特效演示",
    },
  },
  {
    path: "/machine-room",
    name: "虚拟机房",
    component: MachineRoom,
    meta: {
      title: "虚拟机房",
    },
  },
];

// 当前激活的菜单项
const activeIndex = ref("0");

// 当前显示的组件
const currentComponent = computed(
  () => routes[parseInt(activeIndex.value)].component
);

// 处理菜单选择
const handleSelect = (index: string) => {
  activeIndex.value = index;
};
</script>

<style scoped>
:root {
  color-scheme: dark;
}

.menu-container {
  --el-menu-bg-color: var(--el-bg-color-overlay);
  --el-menu-hover-bg-color: var(--el-fill-color-light);
  --el-menu-active-color: var(--el-color-primary);
}

.menu-item {
  height: 45px !important;
  line-height: 45px !important;
}

:deep(.el-menu-item.is-active) {
  background-color: var(--el-color-primary-light-9) !important;
}

:deep(.el-menu-item:hover) {
  background-color: var(--el-fill-color-light) !important;
}
</style>
