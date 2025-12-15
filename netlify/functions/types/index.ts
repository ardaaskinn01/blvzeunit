export interface PaymentResult {
    status: 'success' | 'failure';
    paymentId?: string;
    errorMessage?: string;
    paidPrice?: number;
    currency?: string;
}

export interface InvoiceResult {
    id: string;
    invoiceNo: string;
    invoiceUrl: string;
}

export interface ShippingResult {
    trackingNumber: string;
    trackingUrl: string;
    labelUrl?: string;
    carrier: string;
}

export interface IntegrationConfig {
    isTestMode: boolean;
    apiKey?: string;
    secretKey?: string;
    // Others...
}
