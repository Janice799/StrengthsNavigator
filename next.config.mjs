/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
    basePath: process.env.NODE_ENV === 'production' ? '/StrengthsNavigator' : '',
    assetPrefix: process.env.NODE_ENV === 'production' ? '/StrengthsNavigator/' : '',
};

export default nextConfig;
