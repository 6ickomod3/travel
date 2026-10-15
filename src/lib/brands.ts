import provenance from '../../public/images/brands/provenance.json';

export interface BrandAsset {
  src: string;
  width: number;
  height: number;
  surface?: 'light' | 'dark';
}

interface BrandIdentity {
  name: string;
  nameZh?: string;
  url?: string;
  initials: string;
}

export interface BrandDefinition extends BrandIdentity {
  id: BrandId;
  asset?: BrandAsset;
}

export const brands = {
  united: {
    name: 'United Airlines',
    nameZh: '美联航',
    url: 'https://www.united.com/',
    initials: 'UA',
  },
  'china-eastern': {
    name: 'China Eastern Airlines',
    nameZh: '中国东方航空',
    url: 'https://www.ceair.com/',
    initials: 'MU',
  },
  'shanghai-airlines': {
    name: 'Shanghai Airlines',
    nameZh: '上海航空',
    url: 'https://www.ceair.com/',
    initials: 'FM',
  },
  'hankyu-respire-osaka': {
    name: 'Hotel Hankyu RESPIRE Osaka',
    url: 'https://www.hankyu-hotel.com/en/hotel/respire/osaka',
    initials: 'HR',
  },
  'granvia-hiroshima-south-gate': {
    name: 'Hotel Granvia Hiroshima South Gate',
    url: 'https://jrwest-hotels.jp/granvia-hiroshima-southgate/en/',
    initials: 'SG',
  },
  'comfort-hotel': {
    name: 'Comfort Hotel',
    url: 'https://www.choice-hotels.jp/',
    initials: 'CH',
  },
  'sen-retreat': {
    name: 'SEN. RETREAT',
    url: 'https://sen-retreat.com/',
    initials: 'SEN',
  },
  'kawayu-matsuya': {
    name: '川湯まつや',
    initials: 'KM',
  },
} as const satisfies Record<string, BrandIdentity>;

export type BrandId = keyof typeof brands;

interface BrandAssetRecord {
  id: string;
  asset?: {
    file: string;
    width: number;
    height: number;
    surface?: 'light' | 'dark';
  };
}

const assetsById = new Map<string, BrandAsset>();

for (const record of provenance.brands as BrandAssetRecord[]) {
  if (!record.asset) continue;
  const { file, width, height, surface } = record.asset;
  if (!/^[a-z0-9][a-z0-9.-]*\.(?:svg|png|webp)$/.test(file) || width <= 0 || height <= 0) {
    throw new Error(`Invalid brand asset metadata for "${record.id}".`);
  }
  if (assetsById.has(record.id)) throw new Error(`Duplicate brand asset for "${record.id}".`);
  assetsById.set(record.id, { src: `/images/brands/${file}`, width, height, surface });
}

/** Known identities stay stable when a verified mark is added to the asset manifest. */
export function getBrand(id: BrandId): BrandDefinition {
  if (!Object.hasOwn(brands, id)) throw new Error(`Unknown brand identifier: "${id}".`);
  return { id, ...brands[id], asset: assetsById.get(id) };
}
