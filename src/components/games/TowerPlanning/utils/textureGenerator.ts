import { createNoise2D } from 'simplex-noise';

export function generateWoodTexture(width: number = 512, height: number = 512): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Create noise function
  const noise2D = createNoise2D();

  // Create wood grain pattern
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      // Generate wood grain pattern using multiple layers of noise
      const scale1 = 0.03;
      const scale2 = 0.1;
      const scale3 = 0.005;

      const nx = x * scale1;
      const ny = y * scale1;

      let value = noise2D(nx, ny) * 0.5;
      value += noise2D(x * scale2, y * scale2) * 0.25;
      value += Math.abs(noise2D(x * scale3, y * scale3)) * 0.5;

      // Add some rings
      const distanceToCenter = Math.sqrt(
        Math.pow((x - width / 2) * 0.01, 2) +
        Math.pow((y - height / 2) * 0.01, 2)
      );
      value += Math.sin(distanceToCenter * 2) * 0.1;

      // Map noise to wood colors
      const baseColor = [139, 69, 19]; // Saddle brown
      const grainColor = [160, 82, 45]; // Sienna

      const mix = (value + 1) / 2; // Map from [-1,1] to [0,1]
      const r = Math.floor(baseColor[0] * (1 - mix) + grainColor[0] * mix);
      const g = Math.floor(baseColor[1] * (1 - mix) + grainColor[1] * mix);
      const b = Math.floor(baseColor[2] * (1 - mix) + grainColor[2] * mix);

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export function createWoodTexture(): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const canvas = generateWoodTexture();
    const image = new Image();
    image.src = canvas.toDataURL('image/jpeg');
    image.onload = () => resolve(image);
  });
} 