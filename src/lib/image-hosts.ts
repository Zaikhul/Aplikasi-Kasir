const DEFAULT_EXTERNAL_IMAGE_HOSTS = [
  'res.cloudinary.com',
  'spark-builder.s3.us-east-1.amazonaws.com',
  'ui-avatars.com',
  'cdn.yummy.co.id',
] as const

type DefaultHost = (typeof DEFAULT_EXTERNAL_IMAGE_HOSTS)[number]

export type ExternalImageHost = DefaultHost | string

export function getDefaultExternalHosts(): readonly DefaultHost[] {
  return DEFAULT_EXTERNAL_IMAGE_HOSTS
}

export function parseHostList(value?: string | null): string[] {
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter((host) => host.length > 0)
}

export function buildAllowedHostSet(
  extraHosts: string[] = [],
): Set<string> {
  return new Set(
    [...DEFAULT_EXTERNAL_IMAGE_HOSTS, ...extraHosts].map((host) =>
      host.toLowerCase(),
    ),
  )
}

