# Three.js 材质系统详解

## 1. 概述

材质(Material)是Three.js中用于定义物体外观的重要组成部分。它决定了3D对象在不同光照条件下如何呈现，包括颜色、透明度、反射特性等。

## 2. 基本材质类型

### 2.1 MeshBasicMaterial（基础材质）
- 最简单的材质，不考虑光照影响
- 物体总是显示材质的完整颜色
- 适用场景：简单的彩色物体、线框模型
- 性能最好，适合需要大量渲染的场景

### 2.2 MeshLambertMaterial（兰伯特材质）
- 非光泽表面的材质，表现哑光表面
- 只计算漫反射，不计算镜面反射
- 适用场景：木材、未经处理的金属等哑光表面
- 性能较好，视觉效果一般

### 2.3 MeshPhongMaterial（Phong材质）
- 光泽表面材质，具有镜面高光
- 计算漫反射和镜面反射
- 适用场景：塑料、漆面等光泽表面
- 性能和视觉效果均衡

### 2.4 MeshStandardMaterial（标准材质）
- 基于物理的渲染（PBR）材质
- 使用金属度(metalness)和粗糙度(roughness)定义表面特性
- 适用场景：需要真实感渲染的大多数物体
- 性能消耗较大，视觉效果好

### 2.5 MeshPhysicalMaterial（物理材质）
- 扩展自标准材质，提供更多物理特性
- 额外支持清漆层、次表面散射等特性
- 适用场景：汽车漆面、人体皮肤等特殊材质
- 性能消耗最大，视觉效果最好

### 2.6 MeshToonMaterial（卡通材质）
- 卡通渲染风格，具有分层明暗过渡
- 可自定义明暗分层
- 适用场景：卡通风格、动画风格渲染
- 性能消耗适中

## 3. 常用属性

### 3.1 基础属性
```typescript
{
  color: THREE.Color;        // 材质颜色
  transparent: boolean;      // 是否透明
  opacity: number;          // 透明度（0-1）
  side: THREE.Side;         // 渲染面（正面/背面/双面）
  visible: boolean;         // 是否可见
  wireframe: boolean;       // 是否显示线框
}
```

### 3.2 光照相关属性
```typescript
{
  // Phong材质
  shininess: number;        // 光泽度
  specular: THREE.Color;    // 高光颜色

  // Standard/Physical材质
  roughness: number;        // 粗糙度（0-1）
  metalness: number;        // 金属度（0-1）
  
  // Physical材质特有
  clearcoat: number;        // 清漆层强度（0-1）
  clearcoatRoughness: number; // 清漆层粗糙度（0-1）
}
```

## 4. 最佳实践

### 4.1 性能优化
- 根据需求选择合适的材质类型
- 尽可能复用材质实例
- 及时调用 `material.dispose()` 释放资源
- 对于大量重复物体，考虑使用简单材质

### 4.2 视觉效果
- 合理设置材质参数，避免极端值
- 使用合适的光照配合材质效果
- 考虑环境贴图提升真实感
- 注意材质与场景风格的统一

### 4.3 内存管理
```typescript
// 材质释放
material.dispose();

// 贴图释放
material.map?.dispose();
material.normalMap?.dispose();
material.roughnessMap?.dispose();
// ... 其他贴图
```

## 5. 常见问题

### 5.1 材质看不见问题
- 检查是否有光源（Basic材质除外）
- 确认相机位置是否正确
- 检查材质的side属性
- 验证透明度设置

### 5.2 材质表现异常
- 确认法线方向是否正确
- 检查光照强度和位置
- 验证材质参数是否在合理范围
- 考虑是否需要更新材质标记

## 6. 示例代码

### 6.1 基础材质创建
```typescript
// 基础材质
const basicMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  wireframe: true
});

// 标准材质
const standardMaterial = new THREE.MeshStandardMaterial({
  color: 0x049ef4,
  roughness: 0.5,
  metalness: 0.5
});

// 物理材质
const physicalMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x049ef4,
  roughness: 0.5,
  metalness: 0.5,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1
});
```

### 6.2 材质更新
```typescript
// 更新材质属性
material.color.set(0xff0000);
material.needsUpdate = true;

// 更新透明度
material.opacity = 0.5;
material.transparent = true;

// 更新贴图
material.map = new THREE.Texture(image);
material.needsUpdate = true;
```

## 7. 进阶主题

### 7.1 自定义材质
- 通过Shader自定义材质
- 继承现有材质类型
- 材质的动画和过渡效果

### 7.2 材质与光照交互
- 光照模型的选择
- 阴影的生成和接收
- 环境贴图的影响

### 7.3 性能监控
- 使用Three.js Inspector
- 监控渲染调用
- 分析材质性能开销

## 8. 相关资源

- [Three.js材质文档](https://threejs.org/docs/#api/zh/materials/Material)
- [PBR材质介绍](https://marmoset.co/posts/physically-based-rendering-and-you-can-too/)
- [材质示例](https://threejs.org/examples/?q=material) 