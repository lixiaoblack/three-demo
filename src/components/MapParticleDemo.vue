// 添加类型声明 declare module 'threebox-plugin';

<template>
  <div class="map-container">
    <div ref="mapContainer" class="map"></div>
    <!-- 添加控制面板 -->
    <div class="control-panel">
      <div class="control-item">
        <label>立方体旋转速度</label>
        <input
          type="range"
          v-model="rotationSpeed"
          min="0"
          max="2"
          step="0.1"
        />
        <span>{{ rotationSpeed }}</span>
      </div>
      <div class="control-item">
        <label>雨滴数量</label>
        <input
          type="range"
          v-model="rainCount"
          min="100"
          max="5000"
          step="100"
        />
        <span>{{ rainCount }}</span>
      </div>
      <div class="control-item">
        <label>雨滴速度</label>
        <input type="range" v-model="rainSpeed" min="0.1" max="5" step="0.1" />
        <span>{{ rainSpeed }}</span>
      </div>
      <div class="control-item">
        <label>雨滴大小</label>
        <input type="range" v-model="rainSize" min="0.1" max="2" step="0.1" />
        <span>{{ rainSize }}</span>
      </div>
      <div class="control-item">
        <label>雨滴透明度</label>
        <input
          type="range"
          v-model="rainOpacity"
          min="0.1"
          max="1"
          step="0.1"
        />
        <span>{{ rainOpacity }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import mapboxgl, { CustomLayerInterface } from "mapbox-gl";
import * as THREE from "three";
import "mapbox-gl/dist/mapbox-gl.css";

// 控制参数
const rotationSpeed = ref(0.5);
const rainCount = ref(1000);
const rainSpeed = ref(1.0);
const rainSize = ref(0.5);
const rainOpacity = ref(0.6);

// 添加常量
const FALL_SPEED = 2;
const RAIN_ALTITUDE = 200;
const RAIN_RADIUS = 100;

// 扩展 CustomLayerInterface 类型
interface CustomLayer extends CustomLayerInterface {
  scene?: THREE.Scene;
  camera?: THREE.PerspectiveCamera;
  renderer?: THREE.WebGLRenderer;
  cube?: THREE.Mesh;
  time?: number;
  rainSystem?: {
    particles: THREE.Points;
    geometry: THREE.BufferGeometry;
    material: THREE.PointsMaterial;
    positions: Float32Array;
    velocities: THREE.Vector3[];
  };
}

// DOM 引用
const mapContainer = ref<HTMLDivElement>();

// 地图和Three.js相关变量
let map: mapboxgl.Map;

// 天安门坐标
const TIANANMEN_COORD: [number, number] = [116.397436, 39.909186];

// Mapbox token
const MAPBOX_TOKEN =
  "pk.eyJ1IjoieXhuMTUzMTU5ODkzIiwiYSI6ImNtNDJjMG9tYjF2amYybHB5dmxtcTA5YmYifQ.zh5zl6lP1KHkSEKB-GxoGQ";

// 计算模型变换
const modelAltitude = 100; // 增加高度，使旋转更容易看到
const modelAsMercator = mapboxgl.MercatorCoordinate.fromLngLat(
  TIANANMEN_COORD,
  modelAltitude
);

const modelTransform = {
  translateX: modelAsMercator.x,
  translateY: modelAsMercator.y,
  translateZ: modelAsMercator.z,
  scale: modelAsMercator.meterInMercatorCoordinateUnits(),
};

// 修改createRainSystem函数
function createRainSystem(layer: CustomLayer) {
  if (layer.rainSystem) {
    layer.scene?.remove(layer.rainSystem.particles);
    layer.rainSystem.geometry.dispose();
    layer.rainSystem.material.dispose();
  }

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(rainCount.value * 3);

  // 修改初始位置：在圆形区域上方生成雨滴
  for (let i = 0; i < rainCount.value; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * RAIN_RADIUS;
    positions[i * 3] = Math.cos(angle) * radius; // X
    positions[i * 3 + 1] = Math.random() * RAIN_RADIUS * 2 - RAIN_RADIUS; // Y（在圆形区域内随机分布）
    positions[i * 3 + 2] = RAIN_ALTITUDE - Math.random() * RAIN_ALTITUDE; // Z（高度，从正值开始）
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: rainSize.value * 2,
    transparent: true,
    opacity: rainOpacity.value,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geometry, material);
  particles.frustumCulled = false;

  layer.scene?.add(particles);

  layer.rainSystem = {
    particles,
    geometry,
    material,
    positions,
    velocities: [],
  };
}

// 修改updateRain函数
function updateRain(layer: CustomLayer) {
  if (!layer.rainSystem) return;

  const positions = layer.rainSystem.geometry.attributes.position.array;

  // 更新雨滴位置：沿Z轴向下落（减小Z值）
  for (let i = 0; i < positions.length; i += 3) {
    positions[i + 2] -= FALL_SPEED * rainSpeed.value; // Z轴方向向下

    // 如果雨滴落到地面以下，重置到顶部
    if (positions[i + 2] < 0) {
      positions[i + 2] = RAIN_ALTITUDE; // 重置到顶部
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * RAIN_RADIUS;
      positions[i] = Math.cos(angle) * radius; // 随机X位置
      positions[i + 1] = Math.random() * RAIN_RADIUS * 2 - RAIN_RADIUS; // 随机Y位置
    }
  }

  layer.rainSystem.geometry.attributes.position.needsUpdate = true;

  // 更新材质参数
  layer.rainSystem.material.size = rainSize.value * 2;
  layer.rainSystem.material.opacity = rainOpacity.value;
}

// 初始化场景
const initScene = () => {
  mapboxgl.accessToken = MAPBOX_TOKEN;
  map = new mapboxgl.Map({
    container: mapContainer.value!,
    style: "mapbox://styles/mapbox/dark-v11",
    center: TIANANMEN_COORD,
    zoom: 17,
    pitch: 60,
    bearing: 0,
    antialias: true,
  });

  map.on("style.load", () => {
    const customLayer: CustomLayer = {
      id: "cube-layer",
      type: "custom",
      renderingMode: "3d",
      onAdd: function (
        this: CustomLayer,
        map: mapboxgl.Map,
        gl: WebGLRenderingContext
      ) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera();
        this.time = 0;

        // 修改渲染器设置
        this.renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
          antialias: true,
          alpha: true,
        });

        this.renderer.autoClear = false;
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // 禁用一些可能导致问题的功能
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
        this.renderer.toneMapping = THREE.NoToneMapping;

        // 创建立方体
        const geometry = new THREE.BoxGeometry(50, 50, 50);
        const material = new THREE.MeshPhongMaterial({
          color: 0xff0000,
          side: THREE.DoubleSide,
        });
        this.cube = new THREE.Mesh(geometry, material);

        // 添加光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // 增加环境光强度
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2); // 增加直射光强度
        directionalLight.position.set(0, -70, 100).normalize();
        this.scene.add(directionalLight);

        // 将立方体添加到场景
        this.scene.add(this.cube);

        // 创建雨滴系统
        createRainSystem(this);
      },
      render: function (gl: WebGLRenderingContext, matrix: number[]) {
        if (!this.scene || !this.camera || !this.renderer || !this.cube) return;

        // 更新立方体旋转
        this.time = (this.time || 0) + rotationSpeed.value * 0.02;
        this.cube.rotation.x = this.time;
        this.cube.rotation.y = this.time * 0.5;

        // 更新雨滴
        updateRain(this);

        // 应用变换矩阵
        const m = new THREE.Matrix4().fromArray(matrix);
        const l = new THREE.Matrix4()
          .makeTranslation(
            modelTransform.translateX,
            modelTransform.translateY,
            modelTransform.translateZ
          )
          .scale(
            new THREE.Vector3(
              modelTransform.scale,
              -modelTransform.scale,
              modelTransform.scale
            )
          );

        this.camera.projectionMatrix.copy(m.multiply(l));

        // 渲染场景
        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);

        // 触发重绘
        map.triggerRepaint();
      },
    };

    // 添加自定义图层
    map.addLayer(customLayer);
  });
};

// 生命周期钩子
onMounted(() => {
  initScene();
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
  }
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
}

.control-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.control-item {
  margin-bottom: 10px;
}

.control-item label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #333;
}

.control-item input {
  width: 200px;
  margin-right: 10px;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}
</style>
