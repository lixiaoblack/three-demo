/*
 * @Author: wanglx
 * @Date: 2025-04-07 13:34:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-04-07 15:19:16
 * @Description:
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */

import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  Object3D,
  Material,
  BufferGeometry,
  Texture,
  Mesh,
  Color,
  MeshStandardMaterial,
  MeshBasicMaterial,
  TextureLoader,
  Raycaster,
  Vector2,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// GLTF模型加载器
const gltfLoader = new GLTFLoader();

// 射线投射器，基于鼠标和相机，创建一条射线，用来模拟点击
const raycaster = new Raycaster();

// 鼠标在裁剪空间中的点位
const pointer = new Vector2();
export default class MachineRoom {
  // 渲染器
  renderer: WebGLRenderer;
  // 场景
  scene: Scene;
  // 相机
  camera: PerspectiveCamera;
  // 轨道控制器
  controls: OrbitControls;
  // 模型存放路径
  modelPath: string;

  // 纹理集合
  maps: Map<string, Texture> = new Map();

  // 机柜集合
  cabinets: Mesh[] = [];
  // 鼠标划入的机柜（当前选择的机柜）
  curCabinet: Mesh | null = null;
  // 鼠标划入的机柜（当前选择的机柜）
  onMouseOverCabinet = (cabinet: Mesh) => {};

  // 鼠标在机柜上移动的事件，参数为鼠标在cavas画布上的坐标位置
  onMouseMoveCabinet = (x: number, y: number) => {};

  // 鼠标划出机柜的事件
  onMouseOutCabinet = () => {};

  // 初始化场景
  constructor(canvas: HTMLCanvasElement, modelPath: string = "./models/") {
    this.renderer = new WebGLRenderer({ canvas });
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      45,
      canvas.width / canvas.height,
      0.1,
      1000
    );

    this.camera.position.set(0, 10, 15);
    this.camera.lookAt(0, 0, 0);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.modelPath = modelPath;
    this.createTexture("cabinet-hover.jpg");
  }

  // 加载gltf模型
  loadGLTF(modelName: string) {
    gltfLoader.load(
      this.modelPath + modelName,
      ({ scene: { children } }) => {
        children.forEach((obj: Mesh) => {
          const { map, color } = obj.material as MeshStandardMaterial;
          this.changeMet(obj, map, color);
          // 判断是否是机柜，如果是的话将数组放到数组中
          if (obj.name.includes("cabinet")) {
            this.cabinets.push(obj);
          }
        });
        this.scene.add(...children);
      },
      (progress) => {
        console.log(
          "Loading progress:",
          (progress.loaded / progress.total) * 100 + "%"
        );
      },
      (error) => {
        console.error("Error loading GLTF:", error);
      }
    );
  }

  // 修改材质
  changeMet(obj: Mesh, map: Texture, color: Color) {
    if (map) {
      obj.material = new MeshBasicMaterial({
        map: this.createTexture(map.name),
      });
    } else {
      obj.material = new MeshBasicMaterial({ color });
    }
  }

  // 创建纹理对象
  createTexture(imgName: string) {
    let curTexture = this.maps.get(imgName);
    if (!curTexture) {
      curTexture = new TextureLoader().load(this.modelPath + imgName);
      curTexture.flipY = false;
      curTexture.wrapS = 1000;
      curTexture.wrapT = 1000;
      this.maps.set(imgName, curTexture);
    }
    return curTexture;
  }

  // 调整大小
  resize = () => {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width || canvas.height !== height) {
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  };

  // 选择机柜
  selectCabinet(x: number, y: number) {
    const { cabinets, renderer, camera, maps, curCabinet } = this;
    const { width, height } = renderer.domElement;
    // 将鼠标坐标转换为裁剪空间坐标(这里涉及到两个坐标体系不同，需要了解的话需要去看一下矩阵变换)
    pointer.set((x / width) * 2 - 1, -(y / height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    // 选择机柜
    const intersect = raycaster.intersectObjects(cabinets);

    const cabinet = intersect[0] ? (intersect[0].object as Mesh) : null;
    // 如果已经有机柜了，并且不等于当前机柜，清理掉已选机柜的高亮

    if (curCabinet && curCabinet !== cabinet) {
      const material = curCabinet.material as MeshBasicMaterial;
      material.setValues({
        map: maps.get("cabinet.jpg"),
      });
    }
    if (!cabinet) {
      // 当前没有选中的机柜
      this.curCabinet = null;
      this.onMouseOutCabinet();
      return;
    }

    this.onMouseMoveCabinet(x, y);
    if (cabinet !== curCabinet) {
      // 不是同一个机柜
      this.curCabinet = cabinet;
      const material = cabinet.material as MeshBasicMaterial;
      material.setValues({
        map: maps.get("cabinet-hover.jpg"),
      });
      this.onMouseOverCabinet(cabinet);
    }
  }

  // 连续渲染
  animate = () => {
    this.resize();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  };

  // 清理资源
  dispose() {
    this.renderer.dispose();
    this.scene.traverse((object: Object3D) => {
      const obj = object as any;
      if ("geometry" in obj && obj.geometry instanceof BufferGeometry) {
        obj.geometry.dispose();
      }
      if ("material" in obj) {
        const material = obj.material as Material | Material[];
        if (Array.isArray(material)) {
          material.forEach((m) => m.dispose());
        } else {
          material?.dispose();
        }
      }
    });
  }
}
