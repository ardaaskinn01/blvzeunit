import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import type { Tables } from '../../types/database.types';
import './AdminDashboard.css';
import type { OrderWithItems } from '../../types/order.types';

// Types
type Product = Tables<'products'>;
type ProductVariant = Tables<'product_variants'>;
type Category = Tables<'categories'>;
interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  role: 'customer' | 'admin';
  created_at: string;
}

type Tab = 'stats' | 'products' | 'categories' | 'users' | 'discounts' | 'orders' | 'settings';

export default function AdminDashboard() {
  const { isAdmin, user, loading: authLoading, profile: _profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const initialLoadRef = useRef(false);

  // Debug: Component mount ve render'ları takip et (sadece önemli değişiklikler)
  if (initialLoadRef.current === false || authLoading) {
    console.log('🎯 [AdminDashboard]', {
      isAdmin,
      authLoading,
      initialLoadRefCurrent: initialLoadRef.current,
      timestamp: new Date().toISOString()
    });
  }

  // Stats
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  // Tip hatasını geçmek için any, normalde Discount.
  // Gerçek tip: import { Discount } from '../../utils/discount-utils';
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [shippingSettings, setShippingSettings] = useState({
    cost: 85,
    freeThreshold: 800
  });
  const [editingShipping, setEditingShipping] = useState(false);
  const [tempShippingSettings, setTempShippingSettings] = useState({
    cost: 85,
    freeThreshold: 800
  });

  // Site Settings
  const [contactSettings, setContactSettings] = useState({
    contact_email: '',
    contact_phone: '',
    contact_address: ''
  });

  // Loading & Error states
  const [loading, setLoading] = useState(false); // Başlangıçta false, sadece fetchAllData çağrıldığında true olacak
  const [error, setError] = useState('');
  const [hasFetched, setHasFetched] = useState(false);

  // Ref ile aynı anda sadece bir fetch işleminin çalışmasını garanti et
  const isFetchingRef = useRef(false);
  const isMounted = useRef(true);

  // Image upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  // Additional images upload states
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);

  // 2. Cleanup useEffect: Bileşen kaldırıldığında bayrağı false yap
  useEffect(() => {
    return () => {
      isMounted.current = false; // Bileşen kaldırılınca false yap
    };
  }, []);

  // Component mount olduğunda stale state'leri temizle
  useEffect(() => {
    // Eğer component mount olduğunda loading true ama hasFetched false ise,
    // önceki fetch işlemi tamamlanmamış demektir, reset et
    if (loading && !hasFetched) {
      console.log('⚠️ [DEBUG] Stale loading state detected, resetting...');
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, []); // Sadece mount'ta çalış

  // Product editing
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    category_id: null as number | null,
    color: '',
    shipping_info: '',
    tags: [] as string[],
    size_options: [] as string[],
    desi: null as number | null,
    weight_kg: null as number | null,
    additional_images: [] as string[],
    features: [] as { label: string; value: string }[],
  });

  // Category editing
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: ''
  });
  const [sizeInput, setSizeInput] = useState('');

  // Discount editing
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [newDiscount, setNewDiscount] = useState({
    name: '',
    discount_type: 'product', // 'product' | 'bulk'
    discount_value: '',
    product_id: '',
    category: '',
    start_date: '',
    end_date: '',
    is_active: true
  });

  // Manual Shipping State
  const [trackingInputs, setTrackingInputs] = useState<Record<string, { carrier: string, trackingNumber: string }>>({});

  const handleShipOrder = async (orderId: string) => {
    const input = trackingInputs[orderId];
    if (!input || !input.trackingNumber) {
      alert('Lütfen takip numarası giriniz.');
      return;
    }

    if (!confirm('Siparişi kargolanmış olarak işaretlemek istiyor musunuz?')) return;

    try {
      // Fixed tracking URL for DHL Ecommerce
      const trackingUrl = `https://www.dhl.com/tr-tr/home/tracking.html?tracking-id=${input.trackingNumber}`;
      const carrier = 'DHL Ecommerce';

      const { error } = await supabase
        .from('orders')
        .update({
          status: 'shipped',
          cargo_tracking_number: input.trackingNumber,
          cargo_tracking_url: trackingUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Send Email Notification
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetch('/.netlify/functions/notify-shipping', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              orderId,
              trackingNumber: input.trackingNumber,
              trackingUrl,
              carrier: carrier
            })
          });
        }
      } catch (notifyError) {
        console.error('Bildirim gönderilemedi:', notifyError);
        // Ana işlem başarılı olduğu için kullanıcıyı korkutmaya gerek yok, sadece logluyoruz.
      }

      // Refresh local state
      setOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        status: 'shipped',
        cargo_tracking_number: input.trackingNumber,
        cargo_tracking_url: trackingUrl
      } : o));

      alert('Sipariş başarıyla kargolandı olarak güncellendi.');
    } catch (err: any) {
      console.error('Kargo güncelleme hatası:', err);
      alert('Hata: ' + err.message);
    }
  };

  const handleResetShipping = async (orderId: string) => {
    if (!confirm('Kargo bilgilerini sıfırlamak ve siparişi tekrar hazırlanıyor durumuna almak istiyor musunuz?')) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'preparing',
          cargo_tracking_number: null,
          cargo_tracking_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Refresh local state
      setOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        status: 'preparing',
        cargo_tracking_number: null,
        cargo_tracking_url: null
      } : o));

      // Clear tracking inputs for this order
      setTrackingInputs(prev => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });

      alert('Kargo bilgileri sıfırlandı. Sipariş tekrar hazırlanıyor durumuna alındı.');
    } catch (err: any) {
      console.error('Kargo sıfırlama hatası:', err);
      alert('Hata: ' + err.message);
    }
  };

  // Fetch shipping settings from database
  const fetchShippingSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings' as any)
        .select('setting_value')
        .eq('setting_key', 'shipping')
        .single();

      if (error) {
        console.error('Failed to fetch shipping settings:', error);
        return;
      }

      const settingData = data as any;
      if (settingData?.setting_value) {
        const settings = {
          cost: settingData.setting_value.cost || 85,
          freeThreshold: settingData.setting_value.freeThreshold || 800
        };
        setShippingSettings(settings);
        setTempShippingSettings(settings);
      }
    } catch (error) {
      console.error('Error fetching shipping settings:', error);
    }
  };

  // Update shipping settings
  const handleUpdateShipping = async () => {
    try {
      const { error } = await supabase
        .from('site_settings' as any)
        .update({
          setting_value: {
            cost: tempShippingSettings.cost,
            freeThreshold: tempShippingSettings.freeThreshold
          },
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'shipping');

      if (error) throw error;

      setShippingSettings(tempShippingSettings);
      setEditingShipping(false);
      alert('Kargo ayarları başarıyla güncellendi!');
    } catch (err: any) {
      console.error('Kargo ayarları güncelleme hatası:', err);
      alert('Hata: ' + err.message);
    }
  };

  // Image upload function
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);

      console.log('📤 Görsel yükleniyor...', {
        name: file.name,
        type: file.type,
        size: file.size,
        isImage: file.type.startsWith('image/')
      });

      // Dosya tipini kontrol et
      if (!file.type.startsWith('image/')) {
        throw new Error('Sadece resim dosyaları yüklenebilir');
      }

      // Dosya boyutunu kontrol et (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Dosya boyutu 10MB\'dan küçük olmalı');
      }

      // Create a unique file name - EXTENSION'ı koru
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      // const filePath removed here, defined below

      // ÖNEMLİ: Content-Type'ı extension'dan belirle (file.type güvenilir değil)
      const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',
        'bmp': 'image/bmp',
        'ico': 'image/x-icon'
      };

      // Extension'dan MIME type belirle
      let contentType = mimeTypes[fileExt];
      if (!contentType) {
        if (file.type && file.type.startsWith('image/')) {
          contentType = file.type;
        } else {
          contentType = 'image/jpeg';
        }
      }

      // DOSYA YOLUNU AYARLA
      // products bucket'ı içinde product-images klasörüne kaydedelim
      const filePath = `product-images/${fileName}`;

      console.log('📁 Dosya bilgileri:', {
        fileExt,
        fileName,
        filePath,
        originalType: file.type,
        forcedType: contentType
      });

      // ÖNEMLİ: File -> ArrayBuffer dönüşümü (Binary Safe Upload)
      // Bu yöntem en güvenilir olanıdır, tarayıcının yanlış tip/encoding eklemesini engeller
      const fileData = await file.arrayBuffer();

      // Session kontrolü
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Oturum kapalı');

      // Upload with ArrayBuffer
      const { error: uploadError, data } = await supabase.storage
        .from('products')
        .upload(filePath, fileData, { // ArrayBuffer kullanıyoruz
          cacheControl: '3600',
          upsert: true,
          contentType: contentType // Kesinlikle bu type kullanılacak
        });

      if (uploadError) {
        console.error('❌ Storage yükleme hatası detayları:', {
          message: uploadError.message,
          name: uploadError.name,
          stack: uploadError.stack
        });

        // JSON hatası kontrolü
        if (uploadError.message.includes('JSON') || uploadError.message.includes('application/json')) {
          throw new Error('Sunucu JSON döndürüyor. Bu genellikle CORS veya yetkilendirme hatasıdır.');
        }

        throw uploadError;
      }

      console.log('✅ Upload başarılı:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products') // Bucket adını geri al: products
        .getPublicUrl(filePath);

      console.log('🔗 Public URL oluşturuldu:', publicUrl);

      // URL'yi test et
      const testResponse = await fetch(publicUrl, { method: 'HEAD' });
      console.log('🔍 URL test sonucu:', {
        ok: testResponse.ok,
        status: testResponse.status,
        contentType: testResponse.headers.get('content-type')
      });

      if (!testResponse.ok) {
        console.warn('⚠️ Public URL test başarısız, ancak devam ediliyor...');
      }

      return publicUrl;
    } catch (error: any) {
      console.error('🔥 Image upload CRITICAL error:', error);

      let errorMessage = 'Görsel yüklenemedi: ';

      if (error.message.includes('JSON')) {
        errorMessage += 'Sunucu yanıt vermedi. Lütfen: 1) RLS politikalarını kontrol edin 2) Bucket public mi? 3) CORS ayarlarını kontrol edin';
      } else if (error.message.includes('session')) {
        errorMessage += 'Oturum bulunamadı. Lütfen sayfayı yenileyin ve tekrar deneyin.';
      } else {
        errorMessage += error.message;
      }

      setError(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDiscount = async () => {
    try {
      const discountPayload = {
        name: newDiscount.name,
        discount_type: newDiscount.discount_type,
        discount_value: parseFloat(newDiscount.discount_value),
        product_id: newDiscount.discount_type === 'product' ? newDiscount.product_id : null,
        category: newDiscount.discount_type === 'bulk' ? newDiscount.category : null,
        start_date: new Date(newDiscount.start_date).toISOString(),
        end_date: new Date(newDiscount.end_date).toISOString(),
        is_active: newDiscount.is_active
      };

      const { error } = await supabase
        .from('discounts')
        .insert(discountPayload);

      if (error) throw error;

      // Refresh data
      await fetchAllData();
      setShowDiscountForm(false);
      // Reset form
      setNewDiscount({
        name: '',
        discount_type: 'product',
        discount_value: '',
        product_id: '',
        category: '',
        start_date: '',
        end_date: '',
        is_active: true
      });

    } catch (err: any) {
      setError(err.message || 'İndirim kaydedilemedi. Lütfen tarihleri ve değerleri kontrol edin.');
    }
  };

  const handleDeleteDiscount = async (id: string) => {
    if (!confirm('İndirimi SİLmek istediğinizden emin misiniz?')) return;
    try {
      const { error } = await supabase.from('discounts').delete().eq('id', id);
      if (error) throw error;
      setDiscounts(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchContactSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings' as any)
        .select('setting_value')
        .eq('setting_key', 'contact')
        .single();

      if (error) {
        console.warn('Could not fetch site settings:', error.message);
        return;
      }

      if (data && 'setting_value' in data) {
        const value = data.setting_value as any;
        if (value) {
          setContactSettings({
            contact_email: value.contact_email || '',
            contact_phone: value.contact_phone || '',
            contact_address: value.contact_address || ''
          });
        }
      }
    } catch (err: any) {
      console.error('Error fetching contact settings:', err);
    }
  };

  const handleUpdateContactSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Upsert: Try to update, if not found (because of RLS or non-existence), it inserts? 
      // Actually standard upsert in Supabase works with primary key or unique constraint.
      // Since we don't know the ID, we first check if it exists.

      // Let's rely on a simpler approach: Delete first then Insert is risky if deletion works and insertion fails.
      // Better: Check existence -> Update or Insert.

      const { data: existing } = await supabase
        .from('site_settings' as any)
        .select('id')
        .eq('setting_key', 'contact')
        .single();

      let error;

      if (existing) {
        const { error: updError } = await supabase
          .from('site_settings' as any)
          .update({ setting_value: contactSettings, updated_at: new Date().toISOString() })
          .eq('setting_key', 'contact');
        error = updError;
      } else {
        const { error: insError } = await supabase
          .from('site_settings' as any)
          .insert({
            setting_key: 'contact',
            setting_value: contactSettings
          });
        error = insError;
      }

      if (error) throw error;

      alert('İletişim bilgileri güncellendi.');
    } catch (err: any) {
      alert('Hata: ' + err.message);
    }
  };

  // Fetch all data - useCallback ile sarmalayalım ki dependency array'de kullanabilelim
  // fetchAllData fonksiyonunu bu şekilde değiştirin:
  // Fetch all data
  const fetchAllData = useCallback(async () => {
    // isAdmin kontrolü zaten useEffect'te yapılıyor, ama defensive programlama için eklenebilir.
    if (!isAdmin) return;

    setLoading(true);
    setError('');

    try {
      // 1. Kullanıcıları çekme
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setProfiles(usersData as ProfileRow[]);

      // 2. Ürünleri çekme (Kendi çekme fonksiyonlarınızı buraya entegre edin)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) throw productsError;
      setProducts(productsData);

      // 3. Kategorileri çekme (Kendi çekme fonksiyonlarınızı buraya entegre edin)
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData);

      // 4. İndirimleri çekme
      const { data: discountData, error: discountError } = await supabase
        .from('discounts') // Tablo adı 'discounts' olmalı
        .select('*')
        .order('created_at', { ascending: false });

      if (!discountError) {
        setDiscounts(discountData || []);
      }

      // 5. Siparişleri çekme
      const { data: ordersData, error: ordersError } = await (supabase as any)
        .from('orders')
        .select(`
              *,
              items:order_items(*)
          `)
        .order('created_at', { ascending: false });

      if (!ordersError) {
        setOrders(ordersData as OrderWithItems[]);
      }

      // 6. Kargo ayarlarını çekme
      await fetchShippingSettings();

      // 7. İletişim ayarlarını çekme
      await fetchContactSettings();


      setHasFetched(true); // ✅ Başarılıysa bu bayrağı ayarla!
    } catch (err: any) {
      console.error('🔥 Admin Panel Veri Çekme Hatası:', err);
      setError(err.message || 'Veriler çekilirken bir hata oluştu.');
      setHasFetched(false); // Hata durumunda tekrar denenebilsin.
    } finally {
      setLoading(false); // Yükleme bitti
    }
  }, [isAdmin]);

  // Main Effect - Sadece ilk mount'ta veri çek
  useEffect(() => {
    // 1. Auth yüklenene kadar bekle
    if (authLoading) return;

    // 2. Admin kontrolü ve yönlendirme
    if (!isAdmin) {
      navigate('/', { replace: true });
      return;
    }

    // 3. ✅ KRİTİK KONTROL: Eğer veri daha önce çekilmişse, çık (refreshlemeyi engelle)
    if (initialLoadRef.current) {
      console.log("Admin Dashboard: Veri zaten çekilmiş, tekrar çekim engellendi.");
      return;
    }

    // Veri çekme işleminin başladığını işaretle
    initialLoadRef.current = true; // Sadece bir kere çalışmasını garantiler

    // 4. Veri Çekme - Sadece ilk kez ve eğer veri yoksa
    if (!hasFetched) {
      console.log('Fetching Admin Dashboard Data (first time only)...');
      fetchAllData();
    }

    // NOT: fetchAllData dependency array'den çıkarıldı - sadece ilk mount'ta çalışır
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAdmin, hasFetched]);

  // 3. Component Gövdesindeki Ön Kontroller (Conditional Rendering / Guard Clauses)

  // Auth verileri hâlâ yükleniyorsa veya user henüz yüklenmemişse
  if (authLoading || !user) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Yetki Kontrolü yapılıyor...</div>;
  }

  // User yüklendi ama admin değilse (navigate çalıştıktan sonra burası devreye girer)
  if (!isAdmin) {
    return null; // Yönlendirme zaten yapıldığı için bileşenin render edilmesini durdur
  }

  // Dashboard verileri yükleniyorsa (fetchData çalıştıktan sonra)
  // Not: loading sadece fetchAllData içinde true yapılıyor
  if (loading && !hasFetched) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Dashboard verileri yükleniyor...</div>;
  }

  // Hata varsa
  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>Hata: {error}. Lütfen RLS ayarlarınızı ve konsolu kontrol edin.</div>;
  }

  // Product functions
  const fetchProductVariants = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('size', { ascending: true });

      if (error) throw error;
      setProductVariants(data || []);
    } catch (err: any) {
      setError(err.message || 'Varyantlar yüklenemedi');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Lütfen sadece resim dosyası seçin');
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Dosya boyutu 10MB\'dan küçük olmalı');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Lütfen sadece resim dosyaları seçin');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Dosya boyutu 10MB\'dan küçük olmalı');
        return;
      }
    }

    setAdditionalImageFiles(files);

    // Create previews
    const previews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === files.length) {
          setAdditionalImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleEditProduct = async (product: Product) => {
    setEditingProduct(product);
    const sizeOptions = product.size_options || [];
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image_url: product.image_url || '',
      category: product.category,
      category_id: product.category_id,
      color: product.color || '',
      shipping_info: product.shipping_info || '',
      tags: product.tags || [],
      size_options: sizeOptions,
      desi: (product as any).desi || null,
      weight_kg: (product as any).weight_kg || null,
      additional_images: (product as any).additional_images || [],
      features: (product as any).features || [],
    });

    // Set image preview if exists
    if (product.image_url) {
      setImagePreview(product.image_url);
    }

    // Set additional image previews if exist
    if ((product as any).additional_images) {
      setAdditionalImagePreviews((product as any).additional_images);
    }

    setSizeInput(sizeOptions.join(','));
    await fetchProductVariants(product.id);
    setShowProductForm(true);
  };

  const handleSaveProduct = async () => {
    try {
      let imageUrl = newProduct.image_url;

      // If there's a new image file, upload it
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      // Upload additional images if any
      let additionalImagesUrls = newProduct.additional_images;
      if (additionalImageFiles.length > 0) {
        const uploadedUrls: string[] = [];
        for (const file of additionalImageFiles) {
          const uploadedUrl = await uploadImage(file);
          if (uploadedUrl) {
            uploadedUrls.push(uploadedUrl);
          }
        }
        additionalImagesUrls = [...additionalImagesUrls, ...uploadedUrls];
      }

      if (!editingProduct) {
        // Create new product
        const slug = newProduct.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        const { data: newProductData, error: insertError } = await supabase
          .from('products')
          .insert({
            name: newProduct.name,
            description: newProduct.description,
            price: parseFloat(newProduct.price),
            image_url: imageUrl || null,
            category: newProduct.category,
            category_id: newProduct.category_id,
            color: newProduct.color || null,
            shipping_info: newProduct.shipping_info || null,
            tags: newProduct.tags.length > 0 ? newProduct.tags : null,
            size_options: newProduct.size_options.length > 0 ? newProduct.size_options : null,
            desi: newProduct.desi,
            weight_kg: newProduct.weight_kg,
            additional_images: additionalImagesUrls.length > 0 ? additionalImagesUrls : null,
            features: newProduct.features.length > 0 ? newProduct.features : null,
            slug: slug,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Create variants if size_options provided
        if (newProduct.size_options.length > 0 && newProductData) {
          const variants = newProduct.size_options.map(size => ({
            product_id: newProductData.id,
            size: size,

          }));

          const { error: variantsError } = await supabase
            .from('product_variants')
            .insert(variants);

          if (variantsError) throw variantsError;
        }
      } else {
        // Update existing product
        const { error: updateError } = await supabase
          .from('products')
          .update({
            name: newProduct.name,
            description: newProduct.description,
            price: parseFloat(newProduct.price),
            image_url: imageUrl || null,
            category: newProduct.category,
            category_id: newProduct.category_id,
            color: newProduct.color || null,
            shipping_info: newProduct.shipping_info || null,
            tags: newProduct.tags.length > 0 ? newProduct.tags : null,
            size_options: newProduct.size_options.length > 0 ? newProduct.size_options : null,
            desi: newProduct.desi,
            additional_images: additionalImagesUrls.length > 0 ? additionalImagesUrls : null,
            features: newProduct.features.length > 0 ? newProduct.features : null
          })
          .eq('id', editingProduct.id);

        if (updateError) throw updateError;
      }

      await fetchAllData();
      setShowProductForm(false);
      setEditingProduct(null);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        image_url: '',
        category: '',
        category_id: null,
        color: '',
        shipping_info: '',
        tags: [],
        size_options: [],
        desi: null,
        weight_kg: null,
        additional_images: [],
        features: [],
      });
      setImageFile(null);
      setImagePreview('');
      setAdditionalImageFiles([]);
      setAdditionalImagePreviews([]);
      setSizeInput('');
      setProductVariants([]);
    } catch (err: any) {
      setError(err.message || 'Ürün kaydedilemedi');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Bu ürünü SİLmek istediğinizden emin misiniz?')) return;

    try {
      // Delete variants first
      await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', productId);

      // Delete product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      await fetchAllData();
    } catch (err: any) {
      setError(err.message || 'Ürün SİLinemedi');
    }
  };

  const handleAddVariant = async (productId: string, size: string) => {
    // productId kullanılıyor - insert işleminde
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .insert({
          product_id: productId,
          size: size,
        })
        .select()
        .single();

      if (error) throw error;

      // Sadece local state'i güncelle, gereksiz yenileme yapma
      if (data) {
        setProductVariants(prevVariants => [...prevVariants, data].sort((a, b) =>
          a.size.localeCompare(b.size)
        ));
      }
    } catch (err: any) {
      setError(err.message || 'Beden eklenemedi');
    }
  };

  const handleRemoveVariant = async (variantId: string) => {
    try {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId);

      if (error) throw error;

      // Sadece local state'i güncelle, gereksiz yenileme yapma
      setProductVariants(prevVariants =>
        prevVariants.filter(v => v.id !== variantId)
      );
    } catch (err: any) {
      setError(err.message || 'Beden SİLinemedi');
    }
  };



  // Category functions
  const handleSaveCategory = async () => {
    try {
      const slug = newCategory.slug || newCategory.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { error } = await supabase
        .from('categories')
        .insert({
          name: newCategory.name,
          slug: slug,
          description: newCategory.description || null,
          image_url: newCategory.image_url || null,
          is_active: true
        });

      if (error) throw error;

      await fetchAllData();
      setShowCategoryForm(false);
      setNewCategory({
        name: '',
        slug: '',
        description: '',
        image_url: ''
      });
    } catch (err: any) {
      setError(err.message || 'Kategori eklenemedi');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Bu kategoriyi SİLmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      await fetchAllData();
    } catch (err: any) {
      setError(err.message || 'Kategori SİLinemedi');
    }
  };

  // User functions
  const handleRoleChange = async (userId: string, newRole: 'customer' | 'admin') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setProfiles(profiles.map(p =>
        p.id === userId ? { ...p, role: newRole } : p
      ));
    } catch (err: any) {
      setError(err.message || 'Rol güncellenemedi');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı SİLmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setProfiles(profiles.filter(p => p.id !== userId));
    } catch (err: any) {
      setError(err.message || 'Kullanıcı SİLinemedi');
    }
  };

  // Helper function to get category name from slug
  const getCategoryName = (categorySlug: string | null): string => {
    if (!categorySlug) return '-';
    const category = categories.find(c => c.slug === categorySlug || c.name === categorySlug);
    return category ? category.name : categorySlug;
  };


  if (!isAdmin) {
    return null;
  }

  const guestCount = profiles.filter(p => p.role !== 'admin').length;

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <h1>Admin Dashboard</h1>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            İstatİstİkler
          </button>
          <button
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Ürünler
          </button>
          <button
            className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Koleksİyonlar
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Kullanıcılar
          </button>
          <button
            className={`tab-btn ${activeTab === 'discounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('discounts')}
          >
            İndirİmler
          </button>
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Sİparİşler
          </button>
          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Sİte Ayarları
          </button>
        </div>

        {error && <div className="admin-error">{error}</div>}

        {activeTab === 'stats' && (
          <div className="admin-stats">
            <div className="stat-card">
              <h3>Toplam Kullanıcı</h3>
              <p className="stat-number">{profiles.length}</p>
            </div>
            <div className="stat-card">
              <h3>Sİte Üyelerİ</h3>
              <p className="stat-number">{guestCount}</p>
            </div>
            <div className="stat-card">
              <h3>Admİn</h3>
              <p className="stat-number">{profiles.filter(p => p.role === 'admin').length}</p>
            </div>
            <div className="stat-card">
              <h3>Toplam Ürün</h3>
              <p className="stat-number">{products.length}</p>
            </div>
            <div className="stat-card">
              <h3>Toplam Kategorİ</h3>
              <p className="stat-number">{categories.length}</p>
            </div>

            {/* Kargo Ayarları Kartı */}
            <div className="stat-card" style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Kargo Ayarları</h3>
                {!editingShipping ? (
                  <button
                    onClick={() => setEditingShipping(true)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Düzenle
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={handleUpdateShipping}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={() => {
                        setTempShippingSettings(shippingSettings);
                        setEditingShipping(false);
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      İptal
                    </button>
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Kargo Ücretİ (TL)
                  </label>
                  {editingShipping ? (
                    <input
                      type="number"
                      value={tempShippingSettings.cost}
                      onChange={(e) => setTempShippingSettings({
                        ...tempShippingSettings,
                        cost: Number(e.target.value)
                      })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  ) : (
                    <p className="stat-number" style={{ fontSize: '1.5rem', margin: 0 }}>
                      ₺{shippingSettings.cost}
                    </p>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Ücretsİz Kargo Limitİ (TL)
                  </label>
                  {editingShipping ? (
                    <input
                      type="number"
                      value={tempShippingSettings.freeThreshold}
                      onChange={(e) => setTempShippingSettings({
                        ...tempShippingSettings,
                        freeThreshold: Number(e.target.value)
                      })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  ) : (
                    <p className="stat-number" style={{ fontSize: '1.5rem', margin: 0 }}>
                      ₺{shippingSettings.freeThreshold}+
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Ürün Yönetİmİ</h2>
              <button
                className="add-btn"
                onClick={() => {
                  setEditingProduct(null);
                  setNewProduct({
                    name: '',
                    description: '',
                    price: '',
                    image_url: '',
                    category: '',
                    category_id: null,
                    color: '',
                    shipping_info: '',
                    tags: [],
                    size_options: [],
                    desi: null,
                    weight_kg: null,
                    additional_images: [],
                    features: [],
                  });
                  setImageFile(null);
                  setImagePreview('');
                  setAdditionalImageFiles([]);
                  setAdditionalImagePreviews([]);
                  setSizeInput('');
                  setProductVariants([]);
                  setShowProductForm(true);
                }}
              >
                + Yeni Ürün Ekle
              </button>
            </div>

            {showProductForm && (
              <div className="product-form">
                <h3>{editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Ürün Adı *</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Ürün adı"
                    />
                  </div>
                  <div className="form-group">
                    <label>Fİyat *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Kategorİ</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => {
                        const selectedCat = categories.find(c => c.name === e.target.value);
                        setNewProduct({
                          ...newProduct,
                          category: e.target.value,
                          category_id: selectedCat?.id || null
                        });
                      }}
                    >
                      <option value="">Kategori Seçin</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Renk</label>
                    <input
                      type="text"
                      value={newProduct.color}
                      onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })}
                      placeholder="Renk"
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div className="form-group full-width">
                    <label>Ürün Görselİ</label>
                    <div className="image-upload-container">
                      {imagePreview ? (
                        <div className="image-preview">
                          <img src={imagePreview} alt="Preview" className="preview-image" />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => {
                              setImagePreview('');
                              setImageFile(null);
                              setNewProduct({ ...newProduct, image_url: '' });
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="image-upload-area">
                          <label className="file-input-label">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="file-input"
                            />
                            <span className="upload-icon">📁</span>
                            <span>Dosya Seç veya Sürükle</span>
                            <small>PNG, JPG, GIF (max 10MB)</small>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Images Upload Section */}
                  <div className="form-group full-width">
                    <label>Ek Görseller (Galerİ)</label>
                    <div className="image-upload-container">
                      <div className="image-upload-area">
                        <label className="file-input-label">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleAdditionalImagesChange}
                            className="file-input"
                          />
                          <span className="upload-icon">📸</span>
                          <span>Birden Fazla Görsel Seç</span>
                          <small>PNG, JPG, GIF (max 10MB her biri)</small>
                        </label>
                      </div>
                      {additionalImagePreviews.length > 0 && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                          {additionalImagePreviews.map((preview, index) => (
                            <div key={index} className="image-preview" style={{ position: 'relative', width: '100px', height: '100px' }}>
                              <img src={preview} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button
                                type="button"
                                className="remove-image-btn"
                                onClick={() => {
                                  const newPreviews = additionalImagePreviews.filter((_, i) => i !== index);
                                  const newFiles = additionalImageFiles.filter((_, i) => i !== index);
                                  setAdditionalImagePreviews(newPreviews);
                                  setAdditionalImageFiles(newFiles);
                                  // Also remove from newProduct if it's an existing URL
                                  if (newProduct.additional_images[index]) {
                                    const newUrls = newProduct.additional_images.filter((_, i) => i !== index);
                                    setNewProduct({ ...newProduct, additional_images: newUrls });
                                  }
                                }}
                                style={{ position: 'absolute', top: '5px', right: '5px' }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label style={{ fontFamily: "'Segoe UI', sans-serif", textTransform: 'none' }}>Açıklama *</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Ürün açıklaması"
                      rows={4}
                      style={{ fontFamily: "'Segoe UI', sans-serif", textTransform: 'none' }}
                    />
                  </div>

                  {/* Ürün Özellikleri Bölümü */}
                  <div className="form-group full-width">
                    <label style={{ fontFamily: "'Segoe UI', sans-serif", textTransform: 'none' }}>Ürün Özellikleri</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {newProduct.features.map((feature, index) => (
                        <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="Özellik adı (örn: Kumaş)"
                            value={feature.label}
                            onChange={(e) => {
                              const updated = [...newProduct.features];
                              updated[index].label = e.target.value;
                              setNewProduct({ ...newProduct, features: updated });
                            }}
                            style={{ flex: 1, fontFamily: "'Segoe UI', sans-serif", textTransform: 'none' }}
                          />
                          <input
                            type="text"
                            placeholder="Değer (örn: %100 Pamuk)"
                            value={feature.value}
                            onChange={(e) => {
                              const updated = [...newProduct.features];
                              updated[index].value = e.target.value;
                              setNewProduct({ ...newProduct, features: updated });
                            }}
                            style={{ flex: 1, fontFamily: "'Segoe UI', sans-serif", textTransform: 'none' }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = newProduct.features.filter((_, i) => i !== index);
                              setNewProduct({ ...newProduct, features: updated });
                            }}
                            style={{
                              padding: '0.5rem 0.75rem',
                              background: '#ff4444',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setNewProduct({
                            ...newProduct,
                            features: [...newProduct.features, { label: '', value: '' }]
                          });
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          alignSelf: 'flex-start'
                        }}
                      >
                        + Özellik Ekle
                      </button>
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Bedenler (vİrgülle ayırın, örn: S,M,L,XL)</label>
                    <input
                      type="text"
                      // 💡 Değeri string state'ten çek
                      value={sizeInput}
                      onChange={(e) => {
                        // Sadece girdi metnini güncelle, dönüşümü yapma
                        setSizeInput(e.target.value);

                        // Aynı anda newProduct'ı da güncelleyebiliriz, ancak daha basitleştirilmiş bir yaklaşımla
                        // newProduct.size_options'ı her tuş vuruşunda güncelleyelim, böylece dönüşüm sadece bir yerde kalır:
                        const sizes = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setNewProduct(prev => ({
                          ...prev,
                          size_options: sizes
                        }));
                      }}
                      placeholder="S, M, L, XL"
                    />
                  </div>
                  <div className="form-group">
                    <label>Desİ (Hacİm)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newProduct.desi === null ? '' : newProduct.desi}
                      onChange={(e) => setNewProduct({
                        ...newProduct,
                        desi: e.target.value ? parseFloat(e.target.value) : null
                      })}
                      placeholder="Örn: 2.5"
                    />
                    <small className="form-hint">Ürünün hacİmsel büyüklüğü</small>
                  </div>

                  <div className="form-group">
                    <label>Ağırlık (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newProduct.weight_kg === null ? '' : newProduct.weight_kg}
                      onChange={(e) => setNewProduct({
                        ...newProduct,
                        weight_kg: e.target.value ? parseFloat(e.target.value) : null
                      })}
                      placeholder="Örn: 0.8"
                    />
                    <small className="form-hint">Kargo ağırlığı kİlogram cİnsİnden</small>
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    className="save-btn"
                    onClick={handleSaveProduct}
                    disabled={uploading}
                  >
                    {uploading ? 'Yükleniyor...' : (editingProduct ? 'Güncelle' : 'Kaydet')}
                  </button>
                  <button className="cancel-btn" onClick={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                    setImageFile(null);
                    setImagePreview('');
                    setSizeInput('');
                  }}>
                    İptal
                  </button>
                </div>
              </div>
            )}

            {editingProduct && showProductForm && (
              <div className="variants-section">
                <h4>Beden Yönetİmİ</h4>
                <div className="variants-list">
                  {productVariants.map(variant => (
                    <div key={variant.id} className="variant-item">
                      <span className="variant-size">{variant.size}</span>

                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveVariant(variant.id)}
                      >
                        Sİl
                      </button>
                    </div>
                  ))}
                  <div className="add-variant">
                    <input
                      type="text"
                      placeholder="Yeni beden (örn: XXL)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          handleAddVariant(editingProduct.id, e.currentTarget.value.trim());
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <p>Yükleniyor...</p>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Görsel</th>
                      <th>Ürün Adı</th>
                      <th>Koleksiyon</th>
                      <th>Fiyat</th>
                      <th>Desi</th>
                      <th>Ağırlık (kg)</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="product-thumb" />
                          ) : (
                            <span className="no-image">Görsel Yok</span>
                          )}
                        </td>
                        <td>{product.name}</td>
                        <td>{getCategoryName(product.category)}</td>
                        <td>{product.price} ₺</td>
                        <td>{(product as any).desi || '-'}</td>
                        <td>{(product as any).weight_kg || '-'}</td>
                        <td>
                          <button
                            className="edit-btn"
                            onClick={() => handleEditProduct(product)}
                          >
                            Düzenle
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Sİl
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Koleksiyon Yönetİmİ</h2>
              <button
                className="add-btn"
                onClick={() => setShowCategoryForm(true)}
              >
                + Yeni Koleksiyon Ekle
              </button>
            </div>

            {showCategoryForm && (
              <div className="category-form">
                <h3>Yeni Koleksiyon Ekle</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Koleksiyon Adı *</label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="Kategori adı"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Açıklama</label>
                    <textarea
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      placeholder="Kategori açıklaması"
                      rows={3}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Görsel URL</label>
                    <input
                      type="url"
                      value={newCategory.image_url}
                      onChange={(e) => setNewCategory({ ...newCategory, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button className="save-btn" onClick={handleSaveCategory}>
                    Kaydet
                  </button>
                  <button className="cancel-btn" onClick={() => {
                    setShowCategoryForm(false);
                    setNewCategory({
                      name: '',
                      slug: '',
                      description: '',
                      image_url: ''
                    });
                  }}>
                    İptal
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <p>Yükleniyor...</p>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Koleksiyon Adı</th>
                      <th>Açıklama</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td>{category.name}</td>
                        <td>{category.description || '-'}</td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            SİL
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-section">
            <h2>Kullanıcı Yönetİmİ</h2>

            {loading ? (
              <p>Yükleniyor...</p>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>E-posta</th>
                      <th>Ad Soyad</th>
                      <th>Rol</th>
                      <th>Kayıt Tarihi</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((profile) => (
                      <tr key={profile.id} className={profile.id === user?.id ? 'current-user' : ''}>
                        <td>{profile.email}</td>
                        <td>{profile.full_name || '-'}</td>
                        <td>
                          <select
                            value={profile.role}
                            onChange={(e) => handleRoleChange(profile.id, e.target.value as 'customer' | 'admin')}
                            className={`role-select role-${profile.role}`}
                            disabled={profile.id === user?.id}
                          >
                            <option value="customer">Müşteri</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>{new Date(profile.created_at).toLocaleDateString('tr-TR')}</td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteUser(profile.id)}
                            disabled={profile.id === user?.id}
                            title={profile.id === user?.id ? 'Kendi hesabınızı SİLemezsiniz' : 'SİL'}
                          >
                            SİL
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'discounts' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>İndirim Yönetİmİ</h2>
              <button
                className="add-btn"
                onClick={() => setShowDiscountForm(true)}
              >
                + Yeni İndirim Oluştur
              </button>
            </div>

            {showDiscountForm && (
              <div className="category-form" style={{ maxWidth: '800px' }}>
                <h3>Yeni İndirim Kampanyası</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Kampanya Adı</label>
                    <input
                      value={newDiscount.name}
                      onChange={e => setNewDiscount({ ...newDiscount, name: e.target.value })}
                      placeholder="Örn: Yaz İndirimi"
                    />
                  </div>

                  <div className="form-group">
                    <label>İndirim Tipi</label>
                    <select
                      value={newDiscount.discount_type}
                      onChange={e => setNewDiscount({ ...newDiscount, discount_type: e.target.value })}
                    >
                      <option value="product">Tek Ürün</option>
                      <option value="bulk">Koleksiyonlar</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>İndİrİm Oranı (%)</label>
                    <input
                      type="number"
                      value={newDiscount.discount_value}
                      onChange={e => setNewDiscount({ ...newDiscount, discount_value: e.target.value })}
                      placeholder="20"
                    />
                  </div>

                  {newDiscount.discount_type === 'product' ? (
                    <div className="form-group full-width">
                      <label>Ürün Seçİn</label>
                      <select
                        value={newDiscount.product_id}
                        onChange={e => setNewDiscount({ ...newDiscount, product_id: e.target.value })}
                      >
                        <option value="">Seçiniz...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.price} TL)</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="form-group full-width">
                      <label>Koleksİyon Seçİn</label>
                      <select
                        value={newDiscount.category}
                        onChange={e => setNewDiscount({ ...newDiscount, category: e.target.value })}
                      >
                        <option value="">Seçiniz...</option>
                        <option value="all">TÜM ÜRÜNLER (Genel İndİrim)</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Başlangıç Tarİhİ</label>
                    <input
                      type="datetime-local"
                      value={newDiscount.start_date}
                      onChange={e => setNewDiscount({ ...newDiscount, start_date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Bitiş Tarİhi</label>
                    <input
                      type="datetime-local"
                      value={newDiscount.end_date}
                      onChange={e => setNewDiscount({ ...newDiscount, end_date: e.target.value })}
                    />
                  </div>

                </div>
                <div className="form-actions">
                  <button className="save-btn" onClick={handleSaveDiscount}>Kaydet</button>
                  <button className="cancel-btn" onClick={() => setShowDiscountForm(false)}>İptal</button>
                </div>
              </div>
            )}

            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ad</th>
                    <th>Tip</th>
                    <th>Değer</th>
                    <th>Hedef</th>
                    <th>Tarih Aralığı</th>
                    <th>Durum</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map(d => (
                    <tr key={d.id}>
                      <td>{d.name}</td>
                      <td>{d.discount_type === 'product' ? 'Ürün' : 'Kategori'}</td>
                      <td>%{d.discount_value}</td>
                      <td>
                        {d.discount_type === 'product'
                          ? (products.find(p => p.id === d.product_id)?.name || 'Bilinmeyen Ürün')
                          : (d.category === 'all' ? 'TÜM SİTE' : d.category)
                        }
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem' }}>
                          {new Date(d.start_date).toLocaleDateString()} - <br />
                          {new Date(d.end_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        {new Date() > new Date(d.end_date)
                          ? <span style={{ color: 'red' }}>Süresi Doldu</span>
                          : (d.is_active ? <span style={{ color: 'green' }}>Aktif</span> : 'Pasif')
                        }
                      </td>
                      <td>
                        <button className="delete-btn" onClick={() => handleDeleteDiscount(d.id)}>SİL</button>
                      </td>
                    </tr>
                  ))}
                  {discounts.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center' }}>Henüz indirim bulunmuyor.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'orders' && (
          <div className="admin-orders">
            <div className="section-header">
              <h2>Sipariş Yönetİmİ</h2>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                Toplam {orders.length} sipariş
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="no-data">Henüz sipariş bulunmuyor.</div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card" style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    border: '1px solid #eee',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                      <div>
                        <strong>Sipariş No:</strong> #{order.id.slice(0, 8)}
                        <span style={{ marginLeft: '1rem', color: '#666', fontSize: '0.9rem' }}>
                          {new Date(order.created_at).toLocaleString('tr-TR')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          backgroundColor: order.status === 'pending' ? '#fff3cd' : '#d4edda',
                          color: order.status === 'pending' ? '#856404' : '#155724'
                        }}>
                          {order.status === 'pending' ? 'Hazırlanıyor' : order.status}
                        </span>
                        <strong style={{ fontSize: '1.1rem' }}>{order.total_amount} TL</strong>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                      <div>
                        <h4 style={{ marginBottom: '0.5rem', color: '#444' }}>Müşteri Bilgileri</h4>
                        <p><strong>Ad:</strong> {order.shipping_address.full_name}</p>
                        <p><strong>Tel:</strong> {order.contact_info.phone}</p>
                        <p><strong>Adres:</strong> {order.shipping_address.address} {order.shipping_address.city}/{order.shipping_address.country}</p>
                        {order.shipping_address.zip_code && <p><strong>Posta Kodu:</strong> {order.shipping_address.zip_code}</p>}
                      </div>

                      <div>
                        <h4 style={{ marginBottom: '0.5rem', color: '#444' }}>Ürünler</h4>
                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                              {item.image_url && (
                                <img src={item.image_url} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                              )}
                              <div>
                                <div>{item.product_name}</div>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                  {item.size} - {item.quantity} adet
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    </div>

                    {/* Manual Shipping Form */}
                    {(order.status === 'preparing' || order.status === 'pending') && (
                      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Kargo Girişi (DHL Ecommerce)</h4>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: '200px' }}>
                            <input
                              type="text"
                              placeholder="DHL Takip Numarası"
                              value={trackingInputs[order.id]?.trackingNumber || ''}
                              onChange={e => setTrackingInputs(prev => ({ ...prev, [order.id]: { ...prev[order.id] || {}, trackingNumber: e.target.value } }))}
                              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                          </div>
                          <button
                            onClick={() => handleShipOrder(order.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Kargoladım
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Shipped Order Info with Reset Option */}
                    {order.status === 'shipped' && order.cargo_tracking_number && (
                      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eee', backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '4px' }}>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#28a745' }}>✓ Kargolandı</h4>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                          <div>
                            <strong>Takip No:</strong> {order.cargo_tracking_number}
                          </div>
                          {order.cargo_tracking_url && (
                            <a
                              href={order.cargo_tracking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#007bff', textDecoration: 'underline' }}
                            >
                              Kargo Takip Et
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => handleResetShipping(order.id)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            marginTop: '0.5rem'
                          }}
                        >
                          ↺ Kargo Bilgilerini Sıfırla
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="admin-section">
            <h2>Sİte İletİşİm Ayarları</h2>
            <div className="contact-settings-form" style={{ maxWidth: '600px', backgroundColor: 'white', padding: '2rem', borderRadius: '8px' }}>
              <form onSubmit={handleUpdateContactSettings}>
                <div className="form-group">
                  <label>İletİşİm E-posta</label>
                  <input
                    type="email"
                    value={contactSettings.contact_email}
                    onChange={e => setContactSettings({ ...contactSettings, contact_email: e.target.value })}
                    className="styled-input"
                    placeholder="ornek@site.com"
                  />
                </div>

                <div className="form-group">
                  <label>İletİşİm Telefon</label>
                  <input
                    type="text"
                    value={contactSettings.contact_phone}
                    onChange={e => setContactSettings({ ...contactSettings, contact_phone: e.target.value })}
                    className="styled-input"
                    placeholder="+90 555 555 55 55"
                  />
                </div>

                <div className="form-group">
                  <label>Adres</label>
                  <textarea
                    value={contactSettings.contact_address}
                    onChange={e => setContactSettings({ ...contactSettings, contact_address: e.target.value })}
                    className="styled-input"
                    rows={4}
                    placeholder="Adres bilgisi"
                    style={{ width: '100%', minHeight: '100px' }}
                  />
                </div>

                <button type="submit" className="save-btn" style={{ marginTop: '1rem' }}>
                  Ayarları Kaydet
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}