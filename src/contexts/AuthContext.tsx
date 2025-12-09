import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import React from 'react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'customer' | 'admin';
  avatar_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>; // Promise<void> olarak kalacak
  signInWithGoogle: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null; success: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef<boolean>(true);

  // 2. Cleanup useEffect
  useEffect(() => {
    return () => {
      // Artık 'current' alanına erişilebilir ve değeri değiştirilebilir.
      isMounted.current = false;
    };
  }, []);

  // Profil verisini çek
  // getProfile fonksiyonunu tamamen yeniden yazın:
  const getProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('🔄 Getting profile for:', userId);

      // Basit ve direk bir query - RLS recursion'dan kaçınmak için
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, avatar_url')
        .eq('id', userId)
        .maybeSingle(); // .single() yerine .maybeSingle()

      if (error) {
        console.log('⚠️ Profile fetch failed, checking if admin via email...');

        // Eğer hata alırsak, admin email kontrolü yap
        const currentUserEmail = (await supabase.auth.getUser()).data.user?.email;

        if (currentUserEmail === 'ardaaskindm@gmail.com') {
          console.log('✅ Admin detected via email, returning admin profile');
          return {
            id: userId,
            email: currentUserEmail || '',
            full_name: 'Admin User',
            role: 'admin' as const,
            avatar_url: null
          };
        }

        return null;
      }

      console.log('✅ Profile fetched successfully:', data?.email);
      return data as UserProfile;
    } catch (err: any) {
      console.error('❌ Unexpected error in getProfile:', err);
      return null;
    }
  }, []);

  // isAdmin hesaplamasını düzelt:
  const isAdmin = React.useMemo(() => {
    // ÖNCE: Email kontrolü (bu her zaman çalışır)
    if (user?.email === 'ardaaskindm@gmail.com') {
      console.log('✅ Admin detected via email');
      return true;
    }

    // SONRA: Profile kontrolü
    if (profile?.role === 'admin') {
      console.log('✅ Admin detected via profile role');
      return true;
    }

    console.log('❌ Not admin');
    return false;
  }, [profile, user]);

  useEffect(() => {
    console.log('🚀 AuthProvider - Initializing auth...');
    let isMountedLocal = true;

    // Helper: Timeout korumalı profil çekme
    const safeGetProfile = async (userId: string, skipTimeout = false): Promise<UserProfile | null> => {
      const profilePromise = getProfile(userId);

      // INITIAL_SESSION için timeout kullanma, gerçek profile'ı bekle
      if (skipTimeout) {
        return profilePromise;
      }

      // Diğer durumlar için 5 saniye timeout (2 saniye çok kısaydı)
      const timeoutPromise = new Promise<UserProfile | null>((resolve) =>
        setTimeout(() => {
          console.warn('⏰ Profile fetch timed out (5s) - continuing without profile');
          resolve(null);
        }, 5000)
      );
      return Promise.race([profilePromise, timeoutPromise]);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMountedLocal) return;

        console.log(`🔔 Auth event: ${event}`);

        // TOKEN_REFRESHED durumunda gereksiz re-render'ları engelle
        if (event === 'TOKEN_REFRESHED') {
          if (currentSession) {
            // Sadece token gerçekten değiştiyse session'ı güncelle
            setSession(prev => {
              // Eğer token aynıysa, state update'i tetikleme (re-render engellenir)
              if (prev?.access_token === currentSession.access_token) {
                console.log('🔄 Token refresh: Same token, skipping state update');
                return prev;
              }
              console.log('🔄 Token refresh: New token detected, updating session');
              return currentSession;
            });
            // User bilgisi token refresh'te değişmez, setUser çağırma
            // Bu sayede user'ı kullanan component'ler re-render olmaz
          }
          return;
        }

        // Diğer durumlar için loading göster (SIGNED_OUT durumunda da göstermek mantıklı)
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
          setLoading(true);
        }

        // 💡 KRİTİK DÜZELTME: Gereksiz state update'leri engelle
        try {
          if (currentSession) {
            // Sadece session gerçekten değiştiyse güncelle
            setSession(prev => {
              if (prev?.access_token === currentSession.access_token &&
                prev?.user?.id === currentSession.user?.id) {
                console.log('🔄 Auth event: Same session, skipping session update');
                return prev;
              }
              console.log('🔄 Auth event: New session detected, updating');
              return currentSession;
            });

            // Sadece user gerçekten değiştiyse güncelle
            setUser(prev => {
              if (prev?.id === currentSession.user?.id &&
                prev?.email === currentSession.user?.email) {
                console.log('🔄 Auth event: Same user, skipping user update');
                return prev;
              }
              console.log('🔄 Auth event: New user detected, updating');
              return currentSession.user;
            });

            // Profil sadece SIGNED_IN, USER_UPDATED veya INITIAL_SESSION'da çek
            // ANCAK: SIGNED_IN'de session/user değişmediyse profil çekme (token refresh olabilir)
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
              const userId = currentSession.user.id;

              // Eğer SIGNED_IN event'i ama session ve user değişmediyse, profil çekme
              // Bu token refresh sırasında SIGNED_IN event'i tetiklendiğinde oluyor
              const shouldFetchProfile = event !== 'SIGNED_IN' ||
                !session ||
                session.access_token !== currentSession.access_token ||
                session.user?.id !== currentSession.user?.id;

              if (!shouldFetchProfile) {
                console.log('🔄 SIGNED_IN event but session unchanged - skipping profile fetch (likely token refresh)');
                // Loading'i kapat ve çık
                if (isMountedLocal) {
                  setLoading(false);
                }
                return;
              }

              // INITIAL_SESSION için timeout kullanma, gerçek profile'ı bekle
              const skipTimeout = event === 'INITIAL_SESSION';
              const userProfile = await safeGetProfile(userId, skipTimeout);

              if (isMountedLocal) {
                // Sadece profil gerçekten değiştiyse güncelle
                setProfile(prev => {
                  // Eğer userProfile null ise ve prev varsa, prev'i koru
                  if (!userProfile && prev) {
                    console.log('🔄 Auth event: Profile fetch returned null, keeping previous profile');
                    return prev;
                  }

                  if (prev?.id === userProfile?.id &&
                    prev?.email === userProfile?.email &&
                    prev?.role === userProfile?.role) {
                    console.log('🔄 Auth event: Same profile, skipping profile update');
                    return prev;
                  }
                  console.log('🔄 Auth event: New profile detected, updating');
                  return userProfile;
                });
              }
            }
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
          }
        } catch (err) {
          console.error('❌ Auth state change processing error:', err);
        } finally {
          // Hata olsa da olmasa da loading'i kapat
          // TOKEN_REFRESHED buraya zaten ulaşamaz, bu yüzden koşula gerek yok.
          if (isMountedLocal) {
            setLoading(false);
          }
        }
      }
    );

    // Cleanup
    return () => {
      isMountedLocal = false;
      subscription.unsubscribe();
    };
  }, [getProfile]);
  // signOut fonksiyonunu Promise<void> dönecek şekilde düzelt
  const signOut = async (): Promise<void> => {
    try {
      console.log('🚪 Signing out...');

      // Promise'i timeout ile sınırla
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('Sign out timeout')), 3000);
      });

      // Hangisi önce biterse onu al
      await Promise.race([signOutPromise, timeoutPromise]);

      console.log('✅ Sign out successful');

      // State'leri hemen temizle
      setSession(null);
      setUser(null);
      setProfile(null);

      // Başarılı - void döndür
      return;

    } catch (error) {
      console.error('❌ Sign out error:', error);

      // Hata olsa bile state'leri temizle
      setSession(null);
      setUser(null);
      setProfile(null);
      localStorage.removeItem('supabase.auth.token');

      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          scope: 'email profile',
        },
      },
    });
    if (error) throw error;
  };

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (user?.id) {
      const userProfile = await getProfile(user.id);
      setProfile(userProfile);
    }
  }, [user?.id, getProfile]);

  const resetPassword = async (email: string): Promise<{ error: string | null; success: boolean }> => {
    try {
      console.log('🔄 Attempting password reset for:', email);

      // 1. Email trim ve lowercase
      const cleanEmail = email.trim().toLowerCase();

      // 2. Direct call - en basit hali
      console.log('📍 Using redirect URL:', `${window.location.origin}/reset-password`);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        cleanEmail,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      // 3. HATA YÖNETİMİ - 500 hatası için özel işlem
      if (resetError) {
        console.error('❌ Supabase resetPasswordForEmail RAW ERROR:', {
          message: resetError.message,
          status: resetError.status,
          name: resetError.name,
        });

        // 500 HATASI İÇİN - SMTP/Email servisi sorunu
        if (resetError.status === 500) {
          console.warn('⚠️ 500 Error detected - likely SMTP/Email service issue');

          // Supabase dashboard'daki SMTP ayarlarını kontrol et
          return {
            error: 'Email servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin veya yöneticinizle iletişime geçin.',
            success: false
          };
        }

        // 429 - Rate limit
        if (resetError.status === 429) {
          return {
            error: 'Çok fazla deneme yaptınız. Lütfen 10 dakika sonra tekrar deneyin.',
            success: false
          };
        }

        // Diğer hatalar
        return {
          error: 'Şifre sıfırlama bağlantısı gönderilemedi. Lütfen e-posta adresinizi kontrol edin.',
          success: false
        };
      }

      console.log('✅ Password reset email sent (or simulated)');

      // HER DURUMDA "başarılı" mesajı göster (güvenlik için)
      return {
        error: null,
        success: true,
        // Ek mesaj
      };

    } catch (err: any) {
      console.error('❌ CATCH BLOCK - Unexpected error:', err);

      // Beklenmeyen hata durumunda da kullanıcıyı "başarılı" gibi hissettir
      return {
        error: null,
        success: true,
      };
    }
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    loading,
    isAdmin,
    signOut,
    signInWithGoogle,
    refreshProfile,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}