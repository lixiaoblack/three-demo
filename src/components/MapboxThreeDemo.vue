// 添加类型声明 declare module 'threebox-plugin';

<template>
  <div class="map-container">
    <div ref="mapContainer" class="map"></div>
    <!-- 添加控制面板 -->
    <div class="control-panel">
      <div class="control-item">
        <label>旋转速度</label>
        <input
          type="range"
          v-model="rotationSpeed"
          min="0"
          max="2"
          step="0.1"
        />
        <span>{{ rotationSpeed }}</span>
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

// 扩展 CustomLayerInterface 类型
interface CustomLayer extends CustomLayerInterface {
  scene?: THREE.Scene;
  camera?: THREE.PerspectiveCamera;
  renderer?: THREE.WebGLRenderer;
  cube?: THREE.Mesh;
  time?: number;
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

        // 初始化渲染器
        this.renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
          antialias: true,
        });
        this.renderer.autoClear = false;
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // 创建立方体
        const geometry = new THREE.BoxGeometry(50, 50, 50);
        const material = new THREE.MeshPhongMaterial({
          color: 0xff0000,
          side: THREE.DoubleSide,
        });
        this.cube = new THREE.Mesh(geometry, material);

        // 添加光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, -70, 100).normalize();
        this.scene.add(directionalLight);

        // 将立方体添加到场景
        this.scene.add(this.cube);
      },
      render: function (
        this: CustomLayer,
        gl: WebGLRenderingContext,
        matrix: number[]
      ) {
        if (!this.scene || !this.camera || !this.renderer || !this.cube) return;

        // 更新时间和旋转
        this.time = (this.time || 0) + rotationSpeed.value * 0.02;
        this.cube.rotation.x = this.time;
        this.cube.rotation.y = this.time * 0.5;

        const rotationX = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(1, 0, 0),
          Math.PI / 2
        );

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
          )
          .multiply(rotationX);

        this.camera.projectionMatrix.copy(m.multiply(l));
        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);

        // 请求下一帧更新
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
