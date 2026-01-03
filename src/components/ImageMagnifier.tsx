import { useState } from 'react';

interface ImageMagnifierProps {
    src: string;
    alt: string;
    width?: string;
    height?: string;
    magnifierHeight?: number;
    magnifieWidth?: number;
    zoomLevel?: number;
}

export default function ImageMagnifier({
    src,
    alt,
    width = '100%',
    height = 'auto',
    magnifierHeight = 200,
    magnifieWidth = 200,
    zoomLevel = 2.5
}: ImageMagnifierProps) {
    const [showMagnifier, setShowMagnifier] = useState(false);
    const [[x, y], setXY] = useState([0, 0]);
    const [[imgWidth, imgHeight], setSize] = useState([0, 0]);

    return (
        <div
            style={{
                position: 'relative',
                height: height,
                width: width,
                cursor: 'crosshair' // Kullanıcıya zoom yapılabileceğini hissettirir
            }}
        >
            <img
                src={src}
                alt={alt}
                style={{ height: height, width: width, objectFit: 'contain' }}
                onMouseEnter={(e) => {
                    // Resim boyutlarını al
                    const elem = e.currentTarget;
                    const { width, height } = elem.getBoundingClientRect();
                    setSize([width, height]);
                    setShowMagnifier(true);
                }}
                onMouseMove={(e) => {
                    // Farenin resim üzerindeki konumunu hesapla
                    const elem = e.currentTarget;
                    const { top, left } = elem.getBoundingClientRect();

                    // Mouse pozisyonu (resme göre)
                    const x = e.pageX - left - window.pageXOffset;
                    const y = e.pageY - top - window.pageYOffset;
                    setXY([x, y]);
                }}
                onMouseLeave={() => {
                    setShowMagnifier(false);
                }}
            />

            {showMagnifier && (
                <div
                    style={{
                        display: "none", // Mobil cihazlarda veya küçük ekranlarda sorun çıkarmaması için default gizli, style ile açacağız ama aşağıda logic var.
                        // Aslında burada "lens" mantığı yerine "Inner Zoom" veya "Side Zoom" daha modern.
                        // Ancak kullanıcının isteği Trendyol tarzı. Trendyol "Side Zoom" kullanır (yanda açılır).
                        // Fakat layout'u bozmamak için "Inner Zoom" (Resmin yerinde büyümesi) daha güvenlidir.
                        // Ama ben burada "Lens Zoom" yerine "Mouse Follower Zoom" yapacağım.
                        // Hata düzeltme: Kullanıcının attığı görselde "Lens" var.
                        // Biz en kullanışlı olan "Inner Zoom" (Overlay) yapalım, görselin kendisi büyüsün.
                    }}
                >
                </div>
            )}

            {/* Basit ve Etkili Inner Zoom Yaklaşımı */}
            {showMagnifier && (
                <div
                    style={{
                        position: "absolute",
                        pointerEvents: "none",
                        height: `${magnifierHeight}px`,
                        width: `${magnifieWidth}px`,
                        // Büyüteç farenin yanında dursun
                        top: `${y - magnifierHeight / 2}px`,
                        left: `${x - magnifieWidth / 2}px`,
                        opacity: "1",
                        border: "1px solid lightgray",
                        backgroundColor: "white",
                        backgroundImage: `url('${src}')`,
                        backgroundRepeat: "no-repeat",
                        // Arkaplan boyutu: Resim boyutu * Zoom seviyesi
                        backgroundSize: `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`,
                        // Arkaplan pozisyonu: Farenin olduğu yerin tersine doğru kaydır
                        backgroundPositionX: `${-x * zoomLevel + magnifieWidth / 2}px`,
                        backgroundPositionY: `${-y * zoomLevel + magnifierHeight / 2}px`,
                        borderRadius: '50%', // Yuvarlak büyüteç efekti
                        boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                        zIndex: 100
                    }}
                />
            )}
        </div>
    );
}
