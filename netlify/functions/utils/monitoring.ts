/**
 * Error Monitoring & Alerting Utility
 * 
 * Logs critical errors and optionally sends alerts to external services.
 * Supports console logging and webhook notifications (Slack/Discord).
 */

export enum ErrorSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
}

export interface ErrorContext {
    service: string;
    function: string;
    userId?: string;
    orderId?: string;
    paymentId?: string;
    metadata?: Record<string, any>;
}

export interface MonitoringConfig {
    webhookUrl?: string;
    enableWebhook: boolean;
    minSeverity: ErrorSeverity;
}

const DEFAULT_CONFIG: MonitoringConfig = {
    enableWebhook: process.env.NODE_ENV === 'production',
    minSeverity: ErrorSeverity.HIGH,
    webhookUrl: process.env.ALERT_WEBHOOK_URL,
};

/**
 * Log and optionally alert on errors
 */
export async function logError(
    error: Error | string,
    severity: ErrorSeverity,
    context: ErrorContext,
    config: MonitoringConfig = DEFAULT_CONFIG
): Promise<void> {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    // Console logging (always)
    const logPrefix = `[${severity.toUpperCase()}] [${context.service}/${context.function}]`;
    console.error(logPrefix, errorMessage, {
        context,
        stack: errorStack,
    });

    // Webhook alert (if enabled and severity is high enough)
    if (
        config.enableWebhook &&
        config.webhookUrl &&
        shouldAlert(severity, config.minSeverity)
    ) {
        await sendWebhookAlert(errorMessage, severity, context, config.webhookUrl, errorStack);
    }
}

/**
 * Check if error severity warrants an alert
 */
function shouldAlert(severity: ErrorSeverity, minSeverity: ErrorSeverity): boolean {
    const severityLevels = {
        [ErrorSeverity.LOW]: 1,
        [ErrorSeverity.MEDIUM]: 2,
        [ErrorSeverity.HIGH]: 3,
        [ErrorSeverity.CRITICAL]: 4,
    };

    return severityLevels[severity] >= severityLevels[minSeverity];
}

/**
 * Send alert to webhook (Slack/Discord)
 */
async function sendWebhookAlert(
    message: string,
    severity: ErrorSeverity,
    context: ErrorContext,
    webhookUrl: string,
    stack?: string
): Promise<void> {
    try {
        const emoji = {
            [ErrorSeverity.LOW]: '⚠️',
            [ErrorSeverity.MEDIUM]: '🟡',
            [ErrorSeverity.HIGH]: '🔴',
            [ErrorSeverity.CRITICAL]: '🚨',
        };

        // Slack/Discord compatible payload
        const payload = {
            text: `${emoji[severity]} **${severity.toUpperCase()} ERROR**`,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*${emoji[severity]} ${severity.toUpperCase()} ERROR*\n\`\`\`${message}\`\`\``,
                    },
                },
                {
                    type: 'section',
                    fields: [
                        { type: 'mrkdwn', text: `*Service:*\n${context.service}` },
                        { type: 'mrkdwn', text: `*Function:*\n${context.function}` },
                        ...(context.orderId ? [{ type: 'mrkdwn', text: `*Order ID:*\n${context.orderId}` }] : []),
                        ...(context.paymentId ? [{ type: 'mrkdwn', text: `*Payment ID:*\n${context.paymentId}` }] : []),
                    ],
                },
                ...(stack ? [{
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Stack Trace:*\n\`\`\`${stack.substring(0, 500)}\`\`\``,
                    },
                }] : []),
            ],
        };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error('Failed to send webhook alert:', response.statusText);
        }
    } catch (webhookError) {
        // Don't let webhook failures break the main flow
        console.error('Webhook alert failed:', webhookError);
    }
}

/**
 * Track payment metrics (for monitoring dashboard)
 */
export function trackPaymentMetric(
    event: 'payment_initiated' | 'payment_success' | 'payment_failed',
    metadata: Record<string, any>
): void {
    // Log for Netlify Analytics
    console.log(`[METRIC] ${event}`, metadata);

    // In production, you could send to analytics service
    // e.g., Google Analytics, Mixpanel, etc.
}
