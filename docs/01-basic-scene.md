# Three.js 基础场景

## 1. 场景基本组成

Three.js 场景由三个基本要素组成：
- 场景（Scene）
- 相机（Camera）
- 渲染器（Renderer）

### 1.1 场景（Scene）
```typescript
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);  // 设置背景色
```
场景是所有 3D 对象的容器，类似于一个虚拟的舞台。

### 1.2 相机（Camera）
```typescript
const camera = new THREE.PerspectiveCamera(
  75,                // 视野角度（FOV）
  width / height,    // 宽高比
  0.1,              // 近平面
  1000              // 远平面
);
camera.position.z = 5;  // 设置相机位置
```
- FOV（Field of View）：视野角度，类似人眼视野范围
- 宽高比：保持渲染图像不变形
- 近平面和远平面：定义可见范围

### 1.3 渲染器（Renderer）
```typescript
const renderer = new THREE.WebGLRenderer({
  antialias: true,  // 抗锯齿
  alpha: true       // 透明背景
});
renderer.setSize(width, height);  // 设置渲染尺寸
```
渲染器负责将 3D 场景绘制到 HTML 画布上。

## 2. 基本形状创建

```typescript
// 创建几何体
const geometry = new THREE.BoxGeometry(1, 1, 1);

// 创建材质
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true
});

// 创建网格
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);  // 添加到场景
```

## 3. 动画实现

```typescript
function animate() {
  requestAnimationFrame(animate);  // 请求下一帧动画
  
  // 更新物体
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  
  // 渲染场景
  renderer.render(scene, camera);
}
```

## 4. 响应式处理

```typescript
function handleResize() {
  // 更新相机
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  
  // 更新渲染器
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', handleResize);
```

## 5. 最佳实践

1. **性能优化**：
   - 使用 `requestAnimationFrame` 而不是 `setInterval`
   - 适当使用抗锯齿
   - 注意清理事件监听器

2. **代码组织**：
   - 将初始化逻辑分离
   - 使用类或模块管理场景
   - 保持动画循环简洁

3. **内存管理**：
   - 及时释放不需要的资源
   - 移除场景时清理内存
   - 注意纹理和几何体的复用
``` 