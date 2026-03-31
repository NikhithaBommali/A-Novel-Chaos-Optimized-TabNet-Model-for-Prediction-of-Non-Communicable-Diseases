/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/auth/user/signup',
        permanent: false,
      },
    ]
  },
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
}

export default nextConfig
