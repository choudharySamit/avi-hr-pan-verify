// utils/imagePreprocessing.ts
export async function preprocessImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
  
      img.onload = () => {
        // Create canvas with image size
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
  
        // Draw the image on canvas
        ctx.drawImage(img, 0, 0);
  
        // Get image data for pixel manipulation
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
  
        // Grayscale + increase contrast
        // Simple contrast algorithm from https://stackoverflow.com/a/105074/951754
        const contrast = 40; // 0 to 100, increase for stronger contrast
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  
        for (let i = 0; i < data.length; i += 4) {
          // Convert to grayscale: average of R, G, B
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
  
          // Apply contrast
          const contrasted = factor * (avg - 128) + 128;
  
          // Clamp values 0-255
          const val = Math.min(255, Math.max(0, contrasted));
  
          data[i] = data[i + 1] = data[i + 2] = val;
          // Alpha stays same: data[i + 3]
        }
  
        // Put image data back to canvas
        ctx.putImageData(imageData, 0, 0);
  
        // Export as Blob (PNG)
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/png');
      };
  
      img.onerror = (err) => {
        reject(new Error('Failed to load image for preprocessing'));
      };
  
      img.src = url;
    });
  }
  