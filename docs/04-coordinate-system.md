# Three.js 坐标系统

## 1. 坐标系基础

Three.js 使用右手坐标系，包含三个轴：
- X 轴（红色）：向右为正方向
- Y 轴（绿色）：向上为正方向
- Z 轴（蓝色）：向外（朝向屏幕外）为正方向

### 1.1 坐标表示
```typescript
// 使用 Vector3 表示三维坐标
const position = new THREE.Vector3(x, y, z);

// 直接设置坐标
object.position.set(x, y, z);
// 或
object.position.x = x;
object.position.y = y;
object.position.z = z;
```

### 1.2 坐标系可视化
```typescript
// 坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5);  // 参数是轴的长度
scene.add(axesHelper);

// 网格辅助器
const gridHelper = new THREE.GridHelper(10, 10);  // 参数：大小、分段数
scene.add(gridHelper);
```

## 2. 变换操作

### 2.1 位置变换
```typescript
// 绝对位置
object.position.set(x, y, z);

// 相对移动
object.translateX(distance);
object.translateY(distance);
object.translateZ(distance);
```

### 2.2 旋转变换
```typescript
// 欧拉角旋转
object.rotation.set(x, y, z);  // 参数单位为弧度

// 四元数旋转
object.quaternion.setFromEuler(new THREE.Euler(x, y, z));
```

### 2.3 缩放变换
```typescript
// 统一缩放
object.scale.set(s, s, s);

// 不同轴向缩放
object.scale.set(sx, sy, sz);
```

## 3. 坐标空间

### 3.1 局部坐标系
- 相对于物体自身的坐标系
- 随物体变换而变换
- 用于物体自身的变换操作

### 3.2 世界坐标系
- 场景的全局坐标系
- 固定不变
- 用于定位物体在场景中的位置

### 3.3 坐标转换
```typescript
// 局部坐标转世界坐标
const worldPosition = object.localToWorld(new THREE.Vector3(x, y, z));

// 世界坐标转局部坐标
const localPosition = object.worldToLocal(new THREE.Vector3(x, y, z));
```

## 4. 相机视角

### 4.1 相机位置
```typescript
camera.position.set(x, y, z);  // 设置相机位置
camera.lookAt(target);         // 设置相机朝向
```

### 4.2 视锥体
```typescript
const camera = new THREE.PerspectiveCamera(
  fov,      // 视野角度
  aspect,   // 宽高比
  near,     // 近平面
  far       // 远平面
);
```

## 5. 实践应用

### 5.1 物体布局
```typescript
// 网格布局示例
const grid = 4;
for (let i = 0; i < grid; i++) {
  for (let j = 0; j < grid; j++) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(
      (i - grid/2) * 2,  // X 轴均匀分布
      0,                 // Y 轴保持同一高度
      (j - grid/2) * 2   // Z 轴均匀分布
    );
    scene.add(object);
  }
}
```

### 5.2 轨道控制
```typescript
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;  // 启用阻尼效果
controls.dampingFactor = 0.05;  // 阻尼系数
```

## 6. 最佳实践

1. **坐标系统设计**：
   - 合理规划场景原点
   - 使用适当的单位比例
   - 保持坐标系统一致性

2. **变换操作**：
   - 注意变换顺序（位置、旋转、缩放）
   - 合理使用局部/世界坐标系
   - 避免不必要的坐标转换

3. **调试技巧**：
   - 使用辅助器可视化坐标系
   - 分步调试复杂变换
   - 注意观察物体的朝向 