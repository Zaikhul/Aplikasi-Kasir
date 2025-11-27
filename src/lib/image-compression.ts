/**
 * Compresses and resizes an image file.
 * @param file - The image file to compress.
 * @param maxWidth - The maximum width of the output image.
 * @param quality - The quality of the output image (0 to 1).
 * @returns A Promise that resolves to the compressed Blob.
 */
export async function compressImage(
    file: File,
    maxWidth = 1920,
    quality = 0.8
): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Canvas is empty'));
                            return;
                        }
                        // Create a new File object with .jpg extension to match the JPEG type
                        const originalName = file.name;
                        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
                        const newFileName = `${nameWithoutExt}.jpg`;

                        const newFile = new File([blob], newFileName, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
}
