import type { NextConfig } from "next";

// Restrict remote patterns to same-origin paths by default
const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
  {
    protocol: 'http',
    hostname: 'localhost',
  },
  {
    protocol: 'http',
    hostname: '127.0.0.1',
  },
]

// Optionally allow additional hosts via env (e.g. production domain)
const extraRemoteHosts =
  process.env.NEXT_IMAGE_REMOTE_HOSTS?.split(',').map((value) => value.trim()) ??
  []

for (const hostEntry of extraRemoteHosts.filter(
  (value) => value.length > 0,
)) {
    try {
      const parsed =
        hostEntry.startsWith('http://') || hostEntry.startsWith('https://')
          ? new URL(hostEntry)
          : new URL(`https://${hostEntry}`)

      if (
        !remotePatterns.some(
          (pattern) =>
            pattern.hostname === parsed.hostname &&
            pattern.protocol === parsed.protocol.replace(':', ''),
        )
      ) {
        remotePatterns.push({
          protocol: parsed.protocol.replace(':', '') as 'http' | 'https',
          hostname: parsed.hostname,
          ...(parsed.port ? { port: parsed.port } : {}),
        })
      }
    } catch (error) {
      console.warn(
        `Invalid NEXT_IMAGE_REMOTE_HOSTS entry "${hostEntry}" - skipping`,
        error,
      )
    }
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL
if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    'NEXT_PUBLIC_API_URL is not defined. Falling back to Server for image rewrites.',
  )
}

if (apiUrl) {
  try {
    const parsed = new URL(apiUrl);
    const hostname = parsed.hostname;
    const protocol = parsed.protocol.replace(':', '') as 'http' | 'https';
    const port = parsed.port || undefined;

    // Check if already exists
    const exists = remotePatterns.some(
      (pattern) =>
        pattern.hostname === hostname &&
        pattern.protocol === protocol &&
        pattern.port === port,
    );

    if (!exists) {
      remotePatterns.push({
        protocol,
        hostname,
        ...(port && { port }),
      });
    }
  } catch (error) {
    console.warn(
      'Invalid NEXT_PUBLIC_API_URL provided; skipping remotePatterns entry',
      error,
    );
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
  experimental: {
    // serverActions: true,
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${apiUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
