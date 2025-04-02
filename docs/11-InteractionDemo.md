# Three.js 交互系统演示

这个组件展示了 Three.js 中的基础交互功能，包括物体选择、拖拽、悬停效果等。

## 功能特性

### 1. 基础交互
- **物体选择**：点击物体可以选中/取消选中
- **悬停效果**：鼠标悬停在物体上时会产生高亮效果
- **状态显示**：界面左上角显示当前选中物体的名称

### 2. 拖拽功能
- **激活方式**：按住 Shift + 左键点击物体
- **拖拽平面**：自动创建与视角垂直的拖拽平面
- **视觉反馈**：拖拽时物体保持高亮状态
- **位置保持**：释放鼠标后物体保持在新位置

### 3. 场景控制
- **视角旋转**：使用鼠标右键拖拽
- **场景缩放**：使用鼠标滚轮
- **阴影效果**：物体会投射阴影到地面
- **网格参考**：地面显示网格辅助线

### 4. 示例物体
- **立方体**：蓝色，位于左侧
- **球体**：粉色，位于中间
- **圆柱体**：绿色，位于右侧
- **地面**：灰色平面，接收阴影

## 技术实现

### 核心技术
1. **射线拾取（Raycaster）**
   - 用于检测鼠标与3D物体的交互
   - 实时更新鼠标位置和射线方向
   - 处理物体的选择和悬停检测

2. **材质系统**
   - 使用 MeshStandardMaterial 实现物理基础渲染
   - 通过 emissive 属性实现高亮效果
   - 支持阴影的投射和接收

3. **交互控制**
   - 使用 OrbitControls 实现相机控制
   - 自定义拖拽平面实现物体移动
   - 动态切换控制器状态

### 关键代码示例

1. **初始化射线拾取器**
```typescript
raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2();
```

2. **更新射线位置**
```typescript
const updateRaycaster = (event: MouseEvent) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
};
```

3. **处理物体高亮**
```typescript
const material = (mesh as THREE.Mesh).material as THREE.MeshStandardMaterial;
material.emissive.setHex(0x333333); // 悬停高亮
material.emissive.setHex(0x666666); // 选中高亮
```

## 使用说明

1. **基本操作**
   - 点击物体：选中/取消选中
   - 鼠标悬停：物体高亮
   - 右键拖拽：旋转视角
   - 滚轮：缩放场景

2. **拖拽操作**
   - 按住 Shift 键
   - 左键点击要拖拽的物体
   - 保持按住左键进行拖拽
   - 释放鼠标完成拖拽

3. **注意事项**
   - 拖拽时会临时禁用场景旋转
   - 物体可以自由移动，但建议保持在地面以上
   - 可以同时选中一个物体

## 性能优化

1. **渲染优化**
   - 使用 requestAnimationFrame 实现平滑动画
   - 启用抗锯齿提升视觉质量
   - 适配设备像素比例

2. **事件处理**
   - 使用事件委托减少事件监听器
   - 在组件卸载时清理事件监听
   - 优化射线检测频率

## 扩展建议

1. **功能扩展**
   - 添加物体旋转控制
   - 实现多物体同时选择
   - 添加撤销/重做功能
   - 支持物体缩放

2. **视觉增强**
   - 添加选中物体的边框效果
   - 实现拖拽时的网格对齐
   - 添加操作提示和反馈
   - 优化阴影效果

## 依赖项
- Three.js
- Vue 3
- TypeScript 