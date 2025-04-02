# Three.js 光照系统

## 1. 光源类型

### 1.1 环境光（AmbientLight）
```typescript
const ambientLight = new THREE.AmbientLight(
  0xffffff,  // 光源颜色
  0.5        // 光照强度
);
```
特点：
- 全局照明，无方向性
- 均匀照亮场景中的所有物体
- 不产生阴影
- 用于模拟环境反射光

### 1.2 平行光（DirectionalLight）
```typescript
const directionalLight = new THREE.DirectionalLight(
  0xffffff,  // 光源颜色
  1.0        // 光照强度
);
directionalLight.position.set(5, 5, 5);  // 设置光源位置
```
特点：
- 模拟远处光源（如太阳）
- 光线平行
- 可产生阴影
- 位置和方向可调

### 1.3 点光源（PointLight）
```typescript
const pointLight = new THREE.PointLight(
  0xffffff,  // 光源颜色
  1.0,       // 光照强度
  100,       // 最大距离
  2          // 衰减系数
);
```
特点：
- 从一个点向四周发射光线
- 光照强度随距离衰减
- 可产生动态阴影
- 适合模拟灯泡、火焰等

### 1.4 聚光灯（SpotLight）
```typescript
const spotLight = new THREE.SpotLight(
  0xffffff,  // 光源颜色
  1.0,       // 光照强度
  100,       // 最大距离
  Math.PI/4, // 光束角度
  0.5,       // 边缘柔化
  2          // 衰减系数
);
```
特点：
- 锥形光束
- 可调节光束角度和范围
- 产生聚焦效果
- 适合模拟探照灯

## 2. 光照效果

### 2.1 阴影设置
```typescript
// 渲染器启用阴影
renderer.shadowMap.enabled = true;

// 光源启用阴影
directionalLight.castShadow = true;

// 物体设置
object.castShadow = true;    // 投射阴影
object.receiveShadow = true; // 接收阴影
```

### 2.2 光照辅助器
```typescript
// 平行光辅助器
const helper = new THREE.DirectionalLightHelper(
  directionalLight,
  5  // 辅助器大小
);

// 点光源辅助器
const pointLightHelper = new THREE.PointLightHelper(
  pointLight,
  1  // 辅助器大小
);
```

## 3. 光照优化

### 3.1 性能优化
1. **合理使用光源**：
   - 限制场景中的光源数量
   - 使用合适的光源类型
   - 适当设置光源范围

2. **阴影优化**：
   - 合理设置阴影贴图大小
   - 使用合适的阴影类型
   - 限制产生阴影的物体数量

### 3.2 效果优化
1. **光照强度**：
   - 环境光通常设置较低强度（0.3-0.5）
   - 主光源强度适中（0.8-1.2）
   - 根据场景需求调整

2. **光源位置**：
   - 主光源位置要合理
   - 避免光源被物体遮挡
   - 考虑光源之间的互补

## 4. 最佳实践

1. **光源组合**：
   - 环境光 + 平行光：基础照明
   - 点光源：局部照明
   - 聚光灯：强调效果

2. **调试技巧**：
   - 使用辅助器可视化光源
   - 分步调试不同光源效果
   - 注意观察阴影效果

3. **常见问题**：
   - 场景过暗：检查光源强度和位置
   - 阴影锯齿：调整阴影贴图大小
   - 性能问题：优化光源和阴影设置 