/** @type {import('next').NextConfig} */
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const nextConfig = {
  // Server-side external packages
  serverExternalPackages: [
    "mongodb",
    "mongoose",
    "@mongodb-js/zstd",
    "kerberos",
    "snappy",
    "aws4",
    "bson-ext"
  ],

  webpack: (config, { isServer }) => {
    // Client-side polyfills
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        dns: false,
        tls: false,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        path: false,
        os: false,
        zlib: false,
        http: false,
        https: false
      }

      config.resolve.alias = {
        ...config.resolve.alias,
        'node:process': 'process/browser',
        'node:stream': 'stream-browserify',
        'node:crypto': 'crypto-browserify'
      }
    }

    // External dependencies
    config.externals = [
      ...(config.externals || []),
      {
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
        'supports-color': 'commonjs supports-color',
        'mongodb-client-encryption': 'commonjs mongodb-client-encryption'
      }
    ]

    return config
  },

  // Security headers
  headers: async () => [{
    source: "/(.*)",
    headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
    ]
  }],

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY
  },

  // Optimization settings
  poweredByHeader: false,
  compress: true,
  output: "standalone",

  // Image handling
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"],
    unoptimized: process.env.NODE_ENV === "development"
  },

  // Temporary overrides
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true }
}

export default nextConfig


