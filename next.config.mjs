/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverExternalPackages: [
      "mongodb",
      "mongoose",
      "@mongodb-js/zstd",
      "kerberos",
      "snappy",
    ],
  },

  webpack: (config, { isServer }) => {
    // Client-side fallbacks for Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        dns: false,
        child_process: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };

      // Workaround for `node:` scheme (used in `node:process`)
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:process': 'process/browser',
        'node:stream': 'stream-browserify',
        'node:crypto': 'crypto-browserify',
      };
    }

    config.externals = config.externals || [];
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
      'supports-color': 'commonjs supports-color',
      'kerberos': 'commonjs kerberos',
      '@mongodb-js/zstd': 'commonjs @mongodb-js/zstd',
      'snappy': 'commonjs snappy',
      'mongodb-client-encryption': 'commonjs mongodb-client-encryption',
      'aws4': 'commonjs aws4',
      'bson-ext': 'commonjs bson-ext',
    });

    return config;
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  poweredByHeader: false,
  compress: true,

  images: {
    domains: ["localhost"],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  output: "standalone",
};

export default nextConfig;
