# Three.js 场景类型详解

## 1. 基础场景（Basic Scene）

基础场景是 Three.js 中最简单的场景类型，适合入门学习和简单的 3D 展示。

### 关键特性
- 简单的几何体展示
- 基础光照系统
- 单一背景色

### 代码示例
```typescript
// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);

// 添加几何体
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 添加光源
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
scene.add(ambientLight);
scene.add(directionalLight);
```

## 2. 雾效果场景（Fog Scene）

雾效果可以为场景添加深度感和氛围感，常用于创建特殊的视觉效果。

### 类型
1. 线性雾（Fog）
   - 从起始点到结束点线性变化
   - 适合精确控制雾效范围

2. 指数雾（FogExp2）
   - 基于距离指数计算雾的浓度
   - 更接近自然效果

### 代码示例
```typescript
// 线性雾
scene.fog = new THREE.Fog(0xcccccc, 1, 100);

// 指数雾
scene.fog = new THREE.FogExp2(0xcccccc, 0.02);

// 动态调整雾效果
const updateFog = (color: string, density: number) => {
  scene.fog = new THREE.FogExp2(
    new THREE.Color(color).getHex(),
    density
  );
};
```

## 3. 天空盒场景（Skybox Scene）

天空盒用于创建环境背景，可以显著提升场景的真实感和沉浸感。

### 实现方式
1. 立方体贴图
2. 全景图
3. 渐变天空

### 代码示例
```typescript
// 使用立方体贴图
const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  'right.jpg',  // px
  'left.jpg',   // nx
  'top.jpg',    // py
  'bottom.jpg', // ny
  'front.jpg',  // pz
  'back.jpg'    // nz
]);
scene.background = texture;

// 使用全景图
const loader = new THREE.TextureLoader();
const texture = loader.load('panorama.jpg');
const geometry = new THREE.SphereGeometry(500, 60, 40);
const material = new THREE.MeshBasicMaterial({ 
  map: texture, 
  side: THREE.BackSide 
});
const skybox = new THREE.Mesh(geometry, material);
scene.add(skybox);
```

## 4. 粒子系统场景（Particle Scene）

粒子系统用于创建大量的小型物体，适合实现星空、烟雾、火花等效果。

### 特点
- 高效渲染大量物体
- 可实现动态效果
- 支持自定义形状和材质

### 代码示例
```typescript
// 创建粒子系统
const createParticles = (count: number, size: number) => {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 20;
    positions[i + 1] = (Math.random() - 0.5) * 20;
    positions[i + 2] = (Math.random() - 0.5) * 20;
  }

  geometry.setAttribute('position', 
    new THREE.BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    size: size,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  return new THREE.Points(geometry, material);
};
```

## 5. 性能优化

### 场景管理
1. 对象池
   - 重复使用对象
   - 避免频繁创建销毁

2. 层级结构
   - 使用 Group 组织对象
   - 批量处理相似对象

### 渲染优化
1. 视锥体剔除
   - 设置合适的视距
   - 及时移除不可见物体

2. 材质优化
   - 合并相似材质
   - 使用合适的混合模式

### 代码示例
```typescript
// 对象池示例
class ObjectPool {
  private pool: THREE.Mesh[] = [];
  private active: THREE.Mesh[] = [];

  constructor(private scene: THREE.Scene) {}

  acquire() {
    let object = this.pool.pop();
    if (!object) {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshPhongMaterial();
      object = new THREE.Mesh(geometry, material);
    }
    this.active.push(object);
    this.scene.add(object);
    return object;
  }

  release(object: THREE.Mesh) {
    const index = this.active.indexOf(object);
    if (index !== -1) {
      this.active.splice(index, 1);
      this.pool.push(object);
      this.scene.remove(object);
    }
  }
}
```

## 6. 调试技巧

### 辅助工具
1. AxesHelper：显示坐标轴
2. GridHelper：显示网格
3. BoxHelper：显示物体边界

### 性能监控
1. Stats.js：监控帧率
2. 场景图层分析
3. 内存使用监控

### 代码示例
```typescript
// 添加辅助工具
const axesHelper = new THREE.AxesHelper(5);
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(axesHelper);
scene.add(gridHelper);

// 添加性能监控
import Stats from 'three/examples/jsm/libs/stats.module';
const stats = Stats();
document.body.appendChild(stats.dom);

function animate() {
  requestAnimationFrame(animate);
  stats.begin();
  renderer.render(scene, camera);
  stats.end();
}
``` 