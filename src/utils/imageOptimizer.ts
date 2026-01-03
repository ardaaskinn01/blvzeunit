/**
 * İstemci tarafında görsel optimizasyonu yapan yardımcı fonksiyonlar.
 * Canvas API kullanarak görselleri yeniden boyutlandırır ve sıkıştırır.
 */

interface OptimizationOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0 ile 1 arası (0.8 = %80)
    format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export const optimizeImage = (file: File, options: OptimizationOptions = {}): Promise<File> => {
    return new Promise((resolve, reject) => {
        const {
            maxWidth = 1200, // Web için ideal maksimum genişlik
            maxHeight = 1200,
            quality = 0.8,   // %80 kalite (gözle görülür kayıp olmadan ciddi boyut düşüşü)
            format = 'image/jpeg'
        } = options;

        // 1. Dosya tipini kontrol et
        if (!file.type.startsWith('image/')) {
            reject(new Error('Sadece resim dosyaları optimize edilebilir.'));
            return;
        }

        // SVG dosyaları optimize edilmez
        if (file.type === 'image/svg+xml') {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                // 2. Yeni boyutları hesapla
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                // 3. Canvas oluştur
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context oluşturulamadı.'));
                    return;
                }

                // Daha pürüzsüz çizim için ayarlar
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Resmi çiz
                ctx.drawImage(img, 0, 0, width, height);

                // 4. Blob'a dönüştür
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            // Yeni dosya oluştur
                            const optimizedFile = new File([blob], file.name, {
                                type: format,
                                lastModified: Date.now(),
                            });

                            console.log(`🖼️ Görsel Optimize Edildi:
                            Orijinal: ${(file.size / 1024 / 1024).toFixed(2)} MB
                            Optimize: ${(optimizedFile.size / 1024 / 1024).toFixed(2)} MB
                            Boyutlar: ${img.width}x${img.height} -> ${width}x${height}
                            `);

                            resolve(optimizedFile);
                        } else {
                            reject(new Error('Görsel sıkıştırılamadı.'));
                        }
                    },
                    format,
                    quality
                );
            };

            img.onerror = () => {
                reject(new Error('Görsel yüklenirken hata oluştu.'));
            };
        };

        reader.onerror = () => {
            reject(new Error('Dosya okunamadı.'));
        };
    });
};
