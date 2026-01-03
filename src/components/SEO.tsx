import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    canonical?: string;
    type?: string;
    image?: string;
}

export default function SEO({
    title,
    description = "Blvzeunit - Premium Streetwear Collection. Discover the latest trends in urban fashion.",
    canonical,
    type = 'website',
    image = '/banner.png'
}: SEOProps) {

    const siteTitle = "BLVZEUNIT";
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const siteUrl = window.location.origin;
    const fullCanonical = canonical ? `${siteUrl}${canonical}` : window.location.href;
    const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

    const HelmetAny = Helmet as any;

    return (
        <HelmetAny>
            {/* Standard Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={fullCanonical} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={fullCanonical} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImage} />
        </HelmetAny>
    );
}
