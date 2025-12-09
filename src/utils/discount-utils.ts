// Veritabanı tiplerini genişletiyoruz çünkü henüz generate edilmemiş olabilir
export interface Discount {
    id: string;
    name: string;
    discount_type: 'product' | 'bulk';
    discount_value: number;
    product_id: string | null;
    category: string | null;
    start_date: string;
    end_date: string;
    is_active: boolean;
}

export const getActiveDiscounts = (
    discounts: Discount[] | null,
    productId?: string,
    category?: string
): Discount[] => {
    if (!discounts) return [];

    const now = new Date();

    return discounts.filter((discount) => {
        if (!discount.is_active) return false;

        const startDate = new Date(discount.start_date);
        const endDate = new Date(discount.end_date);

        if (now < startDate || now > endDate) return false;

        if (discount.discount_type === 'product' && productId) {
            return discount.product_id === productId;
        }

        if (discount.discount_type === 'bulk' && category) {
            return discount.category === category || discount.category === 'all'; // 'all' might be a convention for site-wide
        }

        return false;
    });
};

export const calculateDiscountedPrice = (
    originalPrice: number,
    activeDiscounts: Discount[]
): { price: number; discount: Discount | null } => {
    if (!activeDiscounts || activeDiscounts.length === 0) {
        return { price: originalPrice, discount: null };
    }

    // En yüksek indirimi bul
    let bestPrice = originalPrice;
    let appliedDiscount: Discount | null = null;

    activeDiscounts.forEach((discount) => {
        // Şimdilik sadece yüzdesel indirim varsayıyoruz
        const discountAmount = (originalPrice * discount.discount_value) / 100;
        const currentPrice = originalPrice - discountAmount;

        if (currentPrice < bestPrice) {
            bestPrice = currentPrice;
            appliedDiscount = discount;
        }
    });

    return { price: bestPrice, discount: appliedDiscount };
};

export const isDiscountActive = (discount: Discount): boolean => {
    const now = new Date();
    const startDate = new Date(discount.start_date);
    const endDate = new Date(discount.end_date);
    return discount.is_active && now >= startDate && now <= endDate;
};

export const formatDiscountLabel = (discount: Discount): string => {
    return `%${discount.discount_value} İNDİRİM`; // "%20 İNDİRİM"
};
