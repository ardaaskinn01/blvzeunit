

const REQUIRED_ENV_VARS = [
    'IYZICO_API_KEY',
    'IYZICO_SECRET_KEY',
    'IYZICO_BASE_URL',
    'VITE_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'RESEND_API_KEY',
    // SITE_URL and PAYMENT_CALLBACK_URL are optional in development
    // but required in production (checked separately)
];

export function validateEnvironment(): void {
    const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);

    if (missing.length > 0) {
        const errorMessage = `Missing required environment variables: ${missing.join(', ')}`;
        console.error('❌ CRITICAL:', errorMessage);
        throw new Error(errorMessage);
    }

    // Production-specific validation
    if (process.env.NODE_ENV === 'production') {
        const productionVars = ['SITE_URL'];
        const missingProd = productionVars.filter(key => !process.env[key]);

        if (missingProd.length > 0) {
            const errorMessage = `Missing production environment variables: ${missingProd.join(', ')}`;
            console.error('❌ CRITICAL:', errorMessage);
            throw new Error(errorMessage);
        }
    }

    console.log('✅ All required environment variables are present');
}

/**
 * Belirli bir environment variable'ı kontrol eder
 */
export function requireEnvVar(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Required environment variable missing: ${key}`);
    }
    return value;
}
