# Three.js 几何体系统

## 1. 基础几何体类型

Three.js 提供了多种内置的几何体类型，每种几何体都有其特定的参数和用途。

### 1.1 立方体（BoxGeometry）
```typescript
const boxGeometry = new THREE.BoxGeometry(
  width,    // 宽度
  height,   // 高度
  depth     // 深度
);
```
最基本的立方体形状，可用于创建方块、建筑等。

### 1.2 球体（SphereGeometry）
```typescript
const sphereGeometry = new THREE.SphereGeometry(
  radius,           // 半径
  widthSegments,    // 水平分段数
  heightSegments    // 垂直分段数
);
```
用于创建球形物体，分段数越高越平滑，但性能消耗也越大。

### 1.3 圆锥体（ConeGeometry）
```typescript
const coneGeometry = new THREE.ConeGeometry(
  radius,    // 底部半径
  height,    // 高度
  segments   // 圆周分段数
);
```
创建圆锥形状，可用于制作尖塔、箭头等。

### 1.4 圆柱体（CylinderGeometry）
```typescript
const cylinderGeometry = new THREE.CylinderGeometry(
  radiusTop,     // 顶部半径
  radiusBottom,  // 底部半径
  height,        // 高度
  segments       // 圆周分段数
);
```
用于创建圆柱形状，可以通过调整顶部和底部半径创建不同的形状。

### 1.5 圆环（TorusGeometry）
```typescript
const torusGeometry = new THREE.TorusGeometry(
  radius,        // 环半径
  tubeRadius,    // 管道半径
  radialSegments,// 管道分段数
  tubularSegments// 环周分段数
);
```
创建圆环（甜甜圈）形状。

## 2. 多面体系列

### 2.1 四面体（TetrahedronGeometry）
```typescript
const tetrahedronGeometry = new THREE.TetrahedronGeometry(
  radius    // 外接球半径
);
```

### 2.2 八面体（OctahedronGeometry）
```typescript
const octahedronGeometry = new THREE.OctahedronGeometry(
  radius    // 外接球半径
);
```

### 2.3 十二面体（DodecahedronGeometry）
```typescript
const dodecahedronGeometry = new THREE.DodecahedronGeometry(
  radius    // 外接球半径
);
```

### 2.4 二十面体（IcosahedronGeometry）
```typescript
const icosahedronGeometry = new THREE.IcosahedronGeometry(
  radius    // 外接球半径
);
```

## 3. 材质系统

### 3.1 基础材质（MeshBasicMaterial）
```typescript
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,    // 颜色
  wireframe: true,     // 线框模式
  transparent: false,  // 透明度
  opacity: 1.0        // 不透明度
});
```

### 3.2 物理材质（MeshPhongMaterial）
```typescript
const material = new THREE.MeshPhongMaterial({
  color: 0x00ff00,     // 颜色
  shininess: 100,      // 高光度
  specular: 0xffffff   // 高光颜色
});
```

## 4. 几何体操作

### 4.1 位置设置
```typescript
mesh.position.set(x, y, z);  // 设置位置
mesh.position.x = x;         // 单独设置 x 坐标
```

### 4.2 旋转设置
```typescript
mesh.rotation.set(x, y, z);  // 设置旋转
mesh.rotation.x += 0.01;     // 绕 x 轴旋转
```

### 4.3 缩放设置
```typescript
mesh.scale.set(x, y, z);     // 设置缩放
```

## 5. 性能优化

1. **几何体优化**：
   - 使用适当的分段数
   - 复用几何体和材质
   - 使用 BufferGeometry 而不是 Geometry

2. **渲染优化**：
   - 适当使用 wireframe 模式进行调试
   - 注意材质的复杂度
   - 合理设置光照和阴影

3. **内存管理**：
   - 及时释放不需要的几何体
   - 使用 dispose() 方法清理内存
   - 注意大量几何体的性能影响 