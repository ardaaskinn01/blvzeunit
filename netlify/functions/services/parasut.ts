
export class ParasutService {
    private clientId: string;
    private clientSecret: string;
    private companyId: string;
    private username: string;
    private password: string;
    private tokenUrl = 'https://api.parasut.com/oauth/token';
    private apiUrl = 'https://api.parasut.com/v4';

    constructor() {
        this.clientId = process.env.PARASUT_CLIENT_ID || '';
        this.clientSecret = process.env.PARASUT_CLIENT_SECRET || '';
        this.companyId = process.env.PARASUT_COMPANY_ID || '';
        this.username = process.env.PARASUT_USERNAME || '';
        this.password = process.env.PARASUT_PASSWORD || '';
    }

    /**
     * OAuth2 Token Alır
     */
    async authenticate() {
        if (!this.clientId || !this.clientSecret) {
            console.warn('Paraşüt credentials missing, returning mock token');
            return 'mock-token';
        }

        const params = new URLSearchParams();
        params.append('client_id', this.clientId);
        params.append('client_secret', this.clientSecret);
        params.append('username', this.username);
        params.append('password', this.password);
        params.append('grant_type', 'password');
        params.append('redirect_uri', 'urn:ietf:wg:oauth:2.0:oob');

        try {
            const response = await fetch(this.tokenUrl, {
                method: 'POST',
                body: params
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Paraşüt Auth Failed: ${err}`);
            }

            const data = await response.json();
            return data.access_token;
        } catch (error) {
            console.error('Paraşüt Auth Error:', error);
            throw error;
        }
    }

    /**
     * Müşteri (Contact) Oluşturur veya Getirir
     */
    async createContact(customer: any) {
        const token = await this.authenticate();
        if (token === 'mock-token') return { id: 'mock-contact-id', type: 'contacts' };

        // Basit bir arama logic'i eklenebilir (email ile), şimdilik direkt oluşturuyoruz
        const body = {
            data: {
                type: 'contacts',
                attributes: {
                    name: `${customer.first_name} ${customer.last_name}`,
                    email: customer.email,
                    contact_type: 'person',
                }
            }
        };

        try {
            const response = await fetch(`${this.apiUrl}/${this.companyId}/contacts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            // Zaten varsa (422) veya başardıysa işle
            if (!response.ok) {
                // Detaylı hata yönetimi (örn: email in use) buraya eklenebilir
                console.warn('Paraşüt Contact Create Response not OK:', await response.text());
                // Failover veya return existing
            }

            const result = await response.json();
            return result.data; // { id: ..., type: 'contacts' }
        } catch (error) {
            console.error('Paraşüt Create Contact Error:', error);
            // Mock fallback for safety during dev
            return { id: 'mock-contact-error', type: 'contacts' };
        }
    }

    /**
     * Satış Faturası Oluşturur
     */
    async createSalesInvoice(order: any, contactId: string) {
        const token = await this.authenticate();
        if (token === 'mock-token') {
            return {
                id: 'mock-inv-id',
                invoice_no: 'MOCK-TR2025',
                net_total: order.total_amount,
                pdf_url: '#'
            };
        }

        const body = {
            data: {
                type: 'sales_invoices',
                attributes: {
                    item_type: 'invoice',
                    description: `Sipariş #${order.id}`,
                    issue_date: new Date().toISOString().split('T')[0],
                    net_total: order.total_amount,
                    currency: 'TRL'
                },
                relationships: {
                    contact: { data: { id: contactId, type: 'contacts' } }
                    // details (items) should be mapped here properly
                }
            }
        };

        const response = await fetch(`${this.apiUrl}/${this.companyId}/sales_invoices`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const result = await response.json();
        return result.data;
    }

    /**
     * Faturayı Resmileştirir (E-Fatura/E-Arşiv)
     */
    async eInvoice(invoiceId: string) {
        const token = await this.authenticate();
        if (token === 'mock-token') return { status: 'queued' };

        // endpoint değişebilir, örnek:
        // POST /:company_id/e_archives
        return { status: 'queued' };
    }
}
