# Three.js 相机系统详解

在 Three.js 中，相机定义了场景中的观察点和投影方式。它决定了场景中哪些内容会被渲染到屏幕上，以及如何渲染。

## 相机类型

Three.js 主要提供两种类型的相机：

### 1. 透视相机（PerspectiveCamera）

透视相机模拟人眼或传统相机的视觉效果，远处的物体看起来比近处的小。

```javascript
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
```

参数说明：
- `fov`（Field of View）：视野角度，通常在 45-75 度之间
- `aspect`：视口宽高比（width/height）
- `near`：近平面距离，小于此距离的物体不会被渲染
- `far`：远平面距离，大于此距离的物体不会被渲染

特点：
- 产生透视效果，远小近大
- 适合大多数 3D 场景
- 更接近人眼视觉

### 2. 正交相机（OrthographicCamera）

正交相机不会产生透视效果，物体无论远近大小保持不变。

```javascript
const camera = new THREE.OrthographicCamera(
  left, right,
  top, bottom,
  near, far
);
```

参数说明：
- `left`：左平面位置
- `right`：右平面位置
- `top`：上平面位置
- `bottom`：下平面位置
- `near`：近平面距离
- `far`：远平面距离

特点：
- 没有透视效果，物体大小不随距离变化
- 适合 2D 场景或等轴测图
- 常用于建筑或工程制图

## 相机属性和方法

### 1. 基本属性

```javascript
// 位置
camera.position.set(x, y, z);

// 旋转
camera.rotation.set(x, y, z);

// 缩放
camera.scale.set(x, y, z);

// 上方向
camera.up.set(x, y, z);
```

### 2. 常用方法

```javascript
// 看向某点
camera.lookAt(x, y, z);
// 或
camera.lookAt(new THREE.Vector3(x, y, z));

// 更新投影矩阵（修改相机参数后必须调用）
camera.updateProjectionMatrix();
```

## 视锥体（Frustum）

### 1. 透视相机视锥体

- 形状为金字塔形
- 由近平面（near）和远平面（far）切割
- 视野角度（FOV）决定开口大小
- 宽高比（aspect）决定近平面形状

### 2. 正交相机视锥体

- 形状为长方体
- 由六个平面围成
- 大小由 left、right、top、bottom 决定
- 深度由 near、far 决定

## 相机控制

### 1. 基本控制

```javascript
// 直接设置位置
camera.position.set(x, y, z);

// 设置观察目标
camera.lookAt(target);

// 更新相机
camera.updateProjectionMatrix();
```

### 2. 轨道控制器（OrbitControls）

```javascript
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 启用阻尼效果
controls.dampingFactor = 0.05; // 阻尼系数
controls.screenSpacePanning = true; // 平移模式
```

## 最佳实践

1. **选择合适的相机类型**
   - 3D 场景通常使用透视相机
   - 2D/等轴测场景使用正交相机
   - 特殊效果可能需要自定义相机

2. **设置合理的视锥体参数**
   - FOV 通常设置在 45-75 度之间
   - near 和 far 不要相差太大
   - 根据场景大小调整参数

3. **相机位置和朝向**
   - 确保相机能看到所有重要内容
   - 避免极端角度
   - 考虑用户体验

4. **性能优化**
   - 适当调整 near 和 far 值
   - 不要频繁更改投影矩阵
   - 使用 frustumCulling 优化渲染

## 常见问题

1. **物体不可见**
   - 检查相机位置和朝向
   - 验证 near/far 平面设置
   - 确认物体在视锥体内

2. **透视效果异常**
   - 检查 FOV 值是否合理
   - 验证宽高比计算
   - 确认相机类型是否正确

3. **控制器问题**
   - 确保正确初始化控制器
   - 检查事件监听器
   - 验证更新循环

## 示例应用

我们的 `CameraDemo.vue` 组件展示了：

1. 不同类型相机的效果对比
2. 相机参数的动态调整
3. 相机位置和目标点的控制
4. 视锥体参数的可视化

通过这个演示，你可以：
- 理解不同相机类型的特点
- 体验各种参数对视觉效果的影响
- 学习如何正确配置和控制相机
``` 