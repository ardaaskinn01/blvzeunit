// contexts/UserContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    addresses: Array<{
        id: string;
        title: string;
        city: string;
        district: string;
        neighborhood: string;
        fullAddress: string;
        zipCode: string;
        phone: string;
        recipientName: string;
        isDefault: boolean;
    }>;
}

interface UserContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (userData: Omit<User, 'id' | 'addresses'> & { password: string }) => Promise<void>;
    addAddress: (address: Omit<User['addresses'][0], 'id'>) => void;
    updateAddress: (id: string, address: Partial<User['addresses'][0]>) => void;
    deleteAddress: (id: string) => void;
    setDefaultAddress: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // LocalStorage'dan kullanıcı bilgilerini yükle
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
    }, []);

    const login = async (email: string, _password: string) => {
        // API çağrısı yapılacak
        // Örnek kullanıcı
        const mockUser: User = {
            id: '1',
            email,
            name: 'Kullanıcı Adı',
            addresses: [
                {
                    id: '1',
                    title: 'Ev Adresi',
                    city: 'İstanbul',
                    district: 'Kadıköy',
                    neighborhood: 'Merkez',
                    fullAddress: 'Atatürk Cad. No:123 Daire:4',
                    zipCode: '34700',
                    phone: '05551234567',
                    recipientName: 'Ahmet Yılmaz',
                    isDefault: true,
                },
            ],
        };

        setUser(mockUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(mockUser));
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
    };

    const register = async (userData: Omit<User, 'id' | 'addresses'> & { password: string }) => {
        // Kayıt işlemi
        console.log('Register:', userData);
        // API çağrısı
    };

    const addAddress = (address: Omit<User['addresses'][0], 'id'>) => {
        if (!user) return;

        const newAddress = {
            ...address,
            id: Date.now().toString(),
        };

        const updatedUser = {
            ...user,
            addresses: [...user.addresses, newAddress],
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const updateAddress = (id: string, address: Partial<User['addresses'][0]>) => {
        if (!user) return;

        const updatedUser = {
            ...user,
            addresses: user.addresses.map(addr =>
                addr.id === id ? { ...addr, ...address } : addr
            ),
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const deleteAddress = (id: string) => {
        if (!user) return;

        const updatedUser = {
            ...user,
            addresses: user.addresses.filter(addr => addr.id !== id),
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const setDefaultAddress = (id: string) => {
        if (!user) return;

        const updatedUser = {
            ...user,
            addresses: user.addresses.map(addr => ({
                ...addr,
                isDefault: addr.id === id,
            })),
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <UserContext.Provider
            value={{
                user,
                isAuthenticated,
                login,
                logout,
                register,
                addAddress,
                updateAddress,
                deleteAddress,
                setDefaultAddress,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}