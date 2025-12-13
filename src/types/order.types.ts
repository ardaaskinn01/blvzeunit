
export interface Order {
    id: string;
    user_id?: string | null;
    status: 'pending' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
    total_amount: number;
    currency: string;
    shipping_address: {
        full_name: string;
        address: string;
        city: string;
        zip_code: string;
        country: string;
    };
    contact_info: {
        email: string;
        phone: string;
    };
    created_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    size: string;
    product_name: string;
    image_url?: string;
}

export interface OrderWithItems extends Order {
    items: OrderItem[];
}
