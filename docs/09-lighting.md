# Three.js 光照系统详解

## 1. 概述

光照系统是 Three.js 中实现真实感渲染的核心组件。通过不同类型的光源和阴影效果，可以为 3D 场景增添深度感和真实感。

## 2. 基本光源类型

### 2.1 环境光（AmbientLight）
- 全局照亮场景中的所有物体
- 没有特定方向，不产生阴影
- 用于模拟环境反射光
- 示例：
```typescript
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
```

### 2.2 平行光（DirectionalLight）
- 模拟远处光源（如太阳）
- 光线平行，强度不衰减
- 可产生阴影
- 示例：
```typescript
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);
```

### 2.3 点光源（PointLight）
- 从一个点向所有方向发射光线
- 光照强度随距离衰减
- 可产生阴影
- 示例：
```typescript
const pointLight = new THREE.PointLight(0xff9900, 1, 100);
pointLight.position.set(0, 10, 0);
pointLight.castShadow = true;
scene.add(pointLight);
```

### 2.4 聚光灯（SpotLight）
- 圆锥形光束
- 可调节光束角度和半影
- 可产生阴影
- 示例：
```typescript
const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(0, 10, 0);
spotLight.angle = Math.PI / 4;
spotLight.penumbra = 0.1;
spotLight.castShadow = true;
scene.add(spotLight);
```

## 3. 光源属性

### 3.1 基础属性
```typescript
{
  color: THREE.Color;        // 光源颜色
  intensity: number;         // 光照强度
  visible: boolean;          // 是否可见
}
```

### 3.2 位置相关属性
```typescript
{
  position: THREE.Vector3;   // 光源位置
  target: THREE.Object3D;    // 目标点（平行光和聚光灯）
}
```

### 3.3 阴影相关属性
```typescript
{
  castShadow: boolean;       // 是否产生阴影
  shadow: {
    mapSize: THREE.Vector2;  // 阴影贴图尺寸
    camera: THREE.Camera;    // 阴影相机
    bias: number;           // 阴影偏差
    radius: number;         // 阴影模糊半径
  }
}
```

## 4. 阴影渲染

### 4.1 启用阴影
```typescript
// 渲染器启用阴影
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// 光源启用阴影
light.castShadow = true;

// 物体设置
mesh.castShadow = true;      // 产生阴影
mesh.receiveShadow = true;   // 接收阴影
```

### 4.2 优化阴影质量
```typescript
// 提高阴影贴图分辨率
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;

// 调整阴影相机参数
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 50;

// 平行光特有设置
if (light instanceof THREE.DirectionalLight) {
  light.shadow.camera.left = -10;
  light.shadow.camera.right = 10;
  light.shadow.camera.top = 10;
  light.shadow.camera.bottom = -10;
}
```

## 5. 最佳实践

### 5.1 性能优化
- 合理使用阴影（消耗性能较大）
- 适当调整阴影贴图尺寸
- 使用合适的阴影类型
- 限制产生阴影的光源数量

### 5.2 视觉效果
- 组合使用多种光源
- 调整光照强度和颜色
- 使用半影提升真实感
- 注意光源位置和方向

### 5.3 调试技巧
```typescript
// 添加光源辅助对象
const helper = new THREE.DirectionalLightHelper(directionalLight);
scene.add(helper);

// 显示阴影相机范围
const shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(shadowHelper);
```

## 6. 常见问题

### 6.1 阴影问题
- 检查是否启用阴影渲染
- 确认物体的阴影设置
- 调整阴影相机参数
- 验证光源位置是否合适

### 6.2 光照效果问题
- 检查光源强度和颜色
- 确认光源位置和方向
- 验证材质对光照的响应
- 考虑添加环境光

## 7. 进阶主题

### 7.1 光照探针
- 使用光照探针改善光照效果
- 烘焙光照贴图
- 实时全局光照

### 7.2 自定义光照
- 使用着色器实现自定义光照
- 体积光效果
- 因果光照

### 7.3 动态光照
- 光源动画
- 光照强度变化
- 颜色过渡效果

## 8. 相关资源

- [Three.js 光照文档](https://threejs.org/docs/#api/zh/lights/Light)
- [实时阴影指南](https://threejs.org/docs/#api/zh/lights/shadows/LightShadow)
- [光照示例](https://threejs.org/examples/?q=light) 