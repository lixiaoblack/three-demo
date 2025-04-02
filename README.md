# Three.js 学习项目

这是一个使用 Three.js、Vue 3 和 TypeScript 构建的 3D 交互学习项目。项目包含多个演示组件，展示了 Three.js 的各种功能和特性。

## 功能模块

1. **基础场景 (BasicScene)**
   - 3D 场景的基本设置
   - 相机和渲染器配置
   - 基本几何体展示

2. **坐标系统 (CoordinateDemo)**
   - 三维坐标系统展示
   - 坐标轴辅助工具
   - 网格参考系统

3. **场景管理 (SceneDemo)**
   - 场景对象管理
   - 场景树结构
   - 对象组织和层级

4. **相机系统 (CameraDemo)**
   - 透视相机配置
   - 相机控制和动画
   - 视角切换效果

5. **光照系统 (BasicLightDemo)**
   - 环境光和平行光
   - 点光源和聚光灯
   - 阴影效果

6. **材质系统 (MaterialDemo)**
   - 基础材质展示
   - PBR 材质配置
   - 材质属性控制

7. **纹理系统 (TextureDemo)**
   - 纹理加载和映射
   - UV 坐标控制
   - 多重纹理混合

8. **几何体系统 (GeometryDemo)**
   - 基础几何体
   - 自定义几何体
   - 几何体变换

9. **粒子系统 (ParticleDemo)**
   - 粒子效果
   - 粒子动画
   - 粒子控制

10. **交互系统 (InteractionDemo)**
    - 物体选择和拖拽
    - 鼠标事件处理
    - 交互反馈效果

## 技术栈

- Vue 3
- TypeScript
- Three.js
- Vite
- Tailwind CSS

## 开发环境设置

1. 安装依赖：
```bash
pnpm install
```

2. 启动开发服务器：
```bash
pnpm dev
```

3. 构建项目：
```bash
pnpm build
```

## 项目结构

```
src/
  ├── components/        # 演示组件
  ├── utils/            # 工具函数
  ├── types/            # TypeScript 类型定义
  ├── assets/           # 静态资源
  └── App.vue           # 主应用组件

public/
  └── textures/         # 纹理资源
      └── env/          # 环境贴图

docs/                   # 文档
  └── InteractionDemo.md  # 交互系统文档
```

## 文档

每个演示组件都有详细的文档说明，您可以在 `docs` 目录下找到相应的文档文件。

## 注意事项

1. 确保安装了所有必要的依赖
2. 使用现代浏览器以获得最佳体验
3. 建议使用 VSCode 进行开发
4. 启用浏览器的硬件加速

## 贡献

欢迎提交 Issue 和 Pull Request。

## 许可

MIT License
