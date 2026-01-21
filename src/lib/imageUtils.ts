/**
 * Image utility functions for compression and optimization
 */

export interface CompressImageOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
}

/**
 * Compress an image file before upload
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed blob
 */
export const compressImage = async (
  file: File,
  options: CompressImageOptions = {}
): Promise<Blob> => {
  const {
    maxSizeMB = 5,
    maxWidthOrHeight = 1920,
    quality = 0.8
  } = options;

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

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = (height * maxWidthOrHeight) / width;
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = (width * maxWidthOrHeight) / height;
            height = maxWidthOrHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with quality compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Check if compressed size is within limit
            const sizeMB = blob.size / 1024 / 1024;
            if (sizeMB > maxSizeMB) {
              // If still too large, reduce quality further
              const newQuality = quality * (maxSizeMB / sizeMB);
              canvas.toBlob(
                (newBlob) => {
                  if (!newBlob) {
                    reject(new Error('Failed to compress image'));
                    return;
                  }
                  resolve(newBlob);
                },
                file.type,
                Math.max(0.1, newQuality)
              );
            } else {
              resolve(blob);
            }
          },
          file.type,
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

/**
 * Validate image file
 * @param file - The file to validate
 * @param maxSizeMB - Maximum size in MB
 * @returns Validation result
 */
export const validateImageFile = (
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF images.'
    };
  }

  // Check file size
  const sizeMB = file.size / 1024 / 1024;
  if (sizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB. Current size: ${sizeMB.toFixed(2)}MB`
    };
  }

  return { valid: true };
};

/**
 * Generate a unique filename with timestamp
 * @param originalName - Original file name
 * @returns Unique filename
 */
export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const sanitizedName = nameWithoutExt.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  return `${sanitizedName}-${timestamp}-${random}.${extension}`;
};

/**
 * Extract filename from Supabase storage URL
 * @param url - Full storage URL
 * @returns Filename or null
 */
export const extractFileNameFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.length - 1];
  } catch {
    return null;
  }
};

/**
 * Extract bucket name from Supabase storage URL
 * @param url - Full storage URL
 * @returns Bucket name or null
 */
export const extractBucketFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // Path format: /storage/v1/object/public/{bucket}/{filename}
    const publicIndex = pathParts.indexOf('public');
    if (publicIndex !== -1 && pathParts.length > publicIndex + 1) {
      return pathParts[publicIndex + 1];
    }
    return null;
  } catch {
    return null;
  }
};
