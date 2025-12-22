/**
 * Retry Utility with Exponential Backoff
 * 
 * Geçici network hatalarında API çağrılarını otomatik olarak yeniden dener.
 * Exponential backoff stratejisi kullanır: 1s, 2s, 4s
 */

interface RetryOptions {
    maxRetries?: number;
    initialDelay?: number;
    retryableErrors?: string[];
}

const DEFAULT_RETRYABLE_ERRORS = [
    'ETIMEDOUT',
    'ECONNRESET',
    'ECONNREFUSED',
    'ENOTFOUND',
    'ENETUNREACH',
];

/**
 * Verilen fonksiyonu retry logic ile çalıştırır
 * 
 * @param fn - Çalıştırılacak async fonksiyon
 * @param options - Retry ayarları
 * @returns Promise<T> - Fonksiyonun sonucu
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxRetries = 3,
        initialDelay = 1000,
        retryableErrors = DEFAULT_RETRYABLE_ERRORS,
    } = options;

    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const result = await fn();

            if (attempt > 0) {
                console.log(`✅ Retry successful on attempt ${attempt + 1}`);
            }

            return result;
        } catch (error: any) {
            lastError = error;

            // Son deneme ise hata fırlat
            if (attempt === maxRetries - 1) {
                console.error(`❌ All ${maxRetries} retry attempts failed`);
                throw error;
            }

            // Retry yapılabilir hata mı kontrol et
            const isRetryable = retryableErrors.some(
                code => error.code === code || error.message?.includes(code)
            );

            if (!isRetryable) {
                console.log(`⚠️ Non-retryable error, failing immediately:`, error.code || error.message);
                throw error;
            }

            // Exponential backoff: 1s, 2s, 4s
            const delay = initialDelay * Math.pow(2, attempt);
            console.log(`⏳ Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms (Error: ${error.code || error.message})`);

            await sleep(delay);
        }
    }

    throw lastError;
}

/**
 * Promise-based sleep utility
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
