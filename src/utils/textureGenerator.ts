export interface TextureOptions {
  width: number;
  height: number;
}

const defaultOptions: TextureOptions = {
  width: 512,
  height: 512,
};

// 生成噪声
const generateNoise = (
  ctx: CanvasRenderingContext2D,
  intensity: number = 0.5
) => {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * intensity * 255;
    data[i] += noise; // R
    data[i + 1] += noise; // G
    data[i + 2] += noise; // B
  }

  ctx.putImageData(imageData, 0, 0);
};

// 生成砖块图案
const generateBrickPattern = (
  ctx: CanvasRenderingContext2D,
  color: string,
  groutColor: string = "#555555",
  rotation: number = 0
) => {
  const { width, height } = ctx.canvas;
  const brickHeight = height / 8;
  const brickWidth = width / 4;

  // 保存当前上下文状态
  ctx.save();

  // 移动到画布中心并旋转
  ctx.translate(width / 2, height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-width / 2, -height / 2);

  // 填充砖块底色
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  // 绘制砖块图案
  ctx.fillStyle = groutColor;

  // 水平缝隙
  for (let y = -height; y < height * 2; y += brickHeight) {
    ctx.fillRect(-width, y, width * 3, 2);
  }

  // 垂直缝隙
  for (let y = -height; y < height * 2; y += brickHeight * 2) {
    for (let x = -width; x < width * 2; x += brickWidth) {
      const offset = (y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
      ctx.fillRect(x + offset, y, 2, brickHeight);
    }
  }

  // 恢复上下文状态
  ctx.restore();
};

// 生成金属纹理图案
const generateMetalPattern = (
  ctx: CanvasRenderingContext2D,
  baseColor: string,
  rotation: number = 0
) => {
  const { width, height } = ctx.canvas;

  // 保存当前上下文状态
  ctx.save();

  // 移动到画布中心并旋转
  ctx.translate(width / 2, height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-width / 2, -height / 2);

  // 基础金属色
  ctx.fillStyle = baseColor;
  ctx.fillRect(-width, -height, width * 3, height * 3);

  // 添加金属划痕
  for (let i = 0; i < 50; i++) {
    const x = (Math.random() - 0.5) * width * 2;
    const y = (Math.random() - 0.5) * height * 2;
    const length = Math.random() * 100 + 50;
    const angle = Math.random() * Math.PI;

    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(angle);
    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.2})`;
    ctx.lineWidth = Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(-length / 2, 0);
    ctx.lineTo(length / 2, 0);
    ctx.stroke();
    ctx.restore();
  }

  // 恢复上下文状态
  ctx.restore();
};

// 生成木纹理图案
const generateWoodPattern = (
  ctx: CanvasRenderingContext2D,
  baseColor: string,
  rotation: number = 0
) => {
  const { width, height } = ctx.canvas;

  // 保存当前上下文状态
  ctx.save();

  // 移动到画布中心并旋转
  ctx.translate(width / 2, height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-width / 2, -height / 2);

  // 基础木色
  ctx.fillStyle = baseColor;
  ctx.fillRect(-width, -height, width * 3, height * 3);

  // 添加木纹
  for (let i = -height; i < height * 2; i += 4) {
    ctx.strokeStyle = `rgba(0, 0, 0, ${Math.random() * 0.1})`;
    ctx.lineWidth = Math.random() * 3 + 1;
    ctx.beginPath();

    let x = -width;
    ctx.moveTo(x, i);

    while (x < width * 2) {
      x += Math.random() * 20;
      const variance = Math.random() * 10 - 5;
      ctx.lineTo(x, i + variance);
    }

    ctx.stroke();
  }

  // 恢复上下文状态
  ctx.restore();
};

// 生成法线贴图
const generateNormalMap = (
  ctx: CanvasRenderingContext2D,
  strength: number = 1
) => {
  const { width, height } = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const normalData = new Uint8ClampedArray(width * height * 4);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      // 计算高度差
      const left = data[idx - 4];
      const right = data[idx + 4];
      const up = data[idx - width * 4];
      const down = data[idx + width * 4];

      // 计算法线
      const dx = ((left - right) / 255) * strength;
      const dy = ((up - down) / 255) * strength;
      const dz = 1;

      // 归一化
      const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // 转换到 0-255 范围并存储
      normalData[idx] = ((dx / length) * 0.5 + 0.5) * 255; // R
      normalData[idx + 1] = ((dy / length) * 0.5 + 0.5) * 255; // G
      normalData[idx + 2] = ((dz / length) * 0.5 + 0.5) * 255; // B
      normalData[idx + 3] = 255; // A
    }
  }

  return new ImageData(normalData, width, height);
};

// 生成砖墙纹理
export const generateBrickTextures = (
  options: TextureOptions = defaultOptions,
  rotation: number = 0
) => {
  const { width, height } = options;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // 颜色贴图
  generateBrickPattern(ctx, "#8B4513", "#463239", rotation);
  generateNoise(ctx, 0.3);
  const colorMap = canvas.toDataURL();

  // 法线贴图
  const normalMapData = generateNormalMap(ctx, 2);
  ctx.putImageData(normalMapData, 0, 0);
  const normalMap = canvas.toDataURL();

  // 粗糙度贴图
  ctx.fillStyle = "#666666";
  ctx.fillRect(0, 0, width, height);
  generateNoise(ctx, 0.5);
  const roughnessMap = canvas.toDataURL();

  return {
    color: colorMap,
    normal: normalMap,
    roughness: roughnessMap,
  };
};

// 生成金属纹理
export const generateMetalTextures = (
  options: TextureOptions = defaultOptions,
  rotation: number = 0
) => {
  const { width, height } = options;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // 颜色贴图
  generateMetalPattern(ctx, "#A8A8A8", rotation);
  generateNoise(ctx, 0.1);
  const colorMap = canvas.toDataURL();

  // 法线贴图
  const normalMapData = generateNormalMap(ctx, 1.5);
  ctx.putImageData(normalMapData, 0, 0);
  const normalMap = canvas.toDataURL();

  // 金属度贴图
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);
  generateNoise(ctx, 0.1);
  const metalnessMap = canvas.toDataURL();

  // 粗糙度贴图
  ctx.fillStyle = "#222222";
  ctx.fillRect(0, 0, width, height);
  generateNoise(ctx, 0.3);
  const roughnessMap = canvas.toDataURL();

  return {
    color: colorMap,
    normal: normalMap,
    roughness: roughnessMap,
    metalness: metalnessMap,
  };
};

// 生成木材纹理
export const generateWoodTextures = (
  options: TextureOptions = defaultOptions,
  rotation: number = 0
) => {
  const { width, height } = options;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // 颜色贴图
  generateWoodPattern(ctx, "#8B4513", rotation);
  generateNoise(ctx, 0.2);
  const colorMap = canvas.toDataURL();

  // 法线贴图
  const normalMapData = generateNormalMap(ctx, 1.5);
  ctx.putImageData(normalMapData, 0, 0);
  const normalMap = canvas.toDataURL();

  // 粗糙度贴图
  ctx.fillStyle = "#666666";
  ctx.fillRect(0, 0, width, height);
  generateNoise(ctx, 0.4);
  const roughnessMap = canvas.toDataURL();

  return {
    color: colorMap,
    normal: normalMap,
    roughness: roughnessMap,
  };
};
