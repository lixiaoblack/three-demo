 # Three.js 纹理系统

## 基础概念

纹理（Texture）是3D图形中用于为物体表面添加细节和真实感的图像。在Three.js中，纹理主要用于以下几个方面：

1. 颜色纹理（Color Map）
   - 定义物体表面的基本颜色
   - 通常是一张RGB图片
   - 用于材质的 `map` 属性

2. 法线纹理（Normal Map）
   - 模拟表面细节的凹凸效果
   - 使用RGB通道表示法线方向
   - 不改变几何形状，只改变光照效果
   - 用于材质的 `normalMap` 属性

3. 粗糙度纹理（Roughness Map）
   - 控制表面的粗糙程度
   - 灰度图像，白色表示粗糙，黑色表示光滑
   - 影响光的散射方式
   - 用于材质的 `roughnessMap` 属性

4. 金属度纹理（Metalness Map）
   - 定义表面的金属特性
   - 灰度图像，白色表示金属，黑色表示非金属
   - 影响材质的反射特性
   - 用于材质的 `metalnessMap` 属性

## 纹理参数

### 1. 重复（Repeat）
```typescript
texture.repeat.set(2, 2); // 在U和V方向上重复2次
texture.wrapS = THREE.RepeatWrapping; // 水平方向重复
texture.wrapT = THREE.RepeatWrapping; // 垂直方向重复
```

### 2. 旋转（Rotation）
```typescript
texture.rotation = Math.PI / 4; // 旋转45度
texture.center.set(0.5, 0.5); // 设置旋转中心点
```

### 3. 偏移（Offset）
```typescript
texture.offset.set(0.5, 0.5); // 在U和V方向上偏移0.5
```

## 纹理加载

### 1. 使用TextureLoader
```typescript
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('path/to/texture.jpg');
```

### 2. 使用LoadingManager
```typescript
const manager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(manager);
manager.onProgress = (url, loaded, total) => {
  console.log(`Loading: ${url}, ${loaded}/${total}`);
};
```

## 纹理生成

可以使用Canvas动态生成纹理：

```typescript
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
// 绘制纹理内容
const texture = new THREE.CanvasTexture(canvas);
```

## 最佳实践

1. 纹理尺寸
   - 使用2的幂次方尺寸（如512x512, 1024x1024）
   - 考虑设备性能和内存限制
   - 根据实际需求选择合适的分辨率

2. 性能优化
   - 预加载重要纹理
   - 合理设置纹理大小
   - 使用纹理压缩格式
   - 及时释放不需要的纹理

3. UV映射
   - 确保模型有正确的UV坐标
   - 避免UV重叠导致的纹理失真
   - 合理规划UV空间的使用

4. 纹理更新
   - 设置 `texture.needsUpdate = true` 更新纹理
   - 动态纹理要注意性能开销
   - 考虑使用 `CanvasTexture` 进行实时更新

## 常见问题

1. 纹理加载失败
   ```typescript
   textureLoader.load(
     'texture.jpg',
     (texture) => {
       // 成功回调
     },
     undefined,
     (error) => {
       console.error('纹理加载失败:', error);
     }
   );
   ```

2. 纹理变形
   - 检查UV映射是否正确
   - 确认纹理尺寸是否合适
   - 验证重复设置是否正确

3. 纹理内存管理
   ```typescript
   // 释放纹理
   texture.dispose();
   material.dispose();
   ```

## 示例代码

```typescript
// 创建标准材质并应用纹理
const material = new THREE.MeshStandardMaterial({
  map: colorTexture,
  normalMap: normalTexture,
  roughnessMap: roughnessTexture,
  metalnessMap: metalnessTexture,
  metalness: 0.5,
  roughness: 0.5
});

// 更新纹理参数
function updateTextureParameters(texture) {
  texture.repeat.set(2, 2);
  texture.rotation = Math.PI / 4;
  texture.offset.set(0.1, 0.1);
  texture.needsUpdate = true;
}
```

## 进阶技巧

1. 多重纹理
   - 使用多个纹理层叠效果
   - 通过着色器混合多个纹理
   - 实现复杂的材质效果

2. 程序化纹理
   - 使用Canvas生成动态纹理
   - 实现特殊效果（如噪声、渐变）
   - 根据需求实时更新纹理

3. 环境贴图
   - 使用立方体贴图
   - 实现反射和折射效果
   - 创建真实的环境照明

## 注意事项

1. 内存管理
   - 及时释放不用的纹理
   - 监控纹理内存使用
   - 避免重复加载相同纹理

2. 兼容性
   - 考虑不同设备的性能限制
   - 提供降级方案
   - 处理加载失败的情况

3. 性能优化
   - 使用合适的纹理格式
   - 实现纹理预加载
   - 控制同时加载的纹理数量