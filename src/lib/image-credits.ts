interface ImageCreditRecord {
  file: string;
  kind?: 'photo' | 'illustration';
  source?: string;
  originalUrl?: string;
  author?: string;
  authorUrl?: string;
  license?: string;
  licenseUrl?: string;
  credit?: string;
  changes?: string;
  alt?: string;
  width?: number;
  height?: number;
  objectPosition?: string;
  attributionRequired?: boolean;
  caption?: string;
}

interface ImageCreditManifest {
  images: ImageCreditRecord[];
}

export interface ImageCredit extends ImageCreditRecord {
  imagePath: string;
  creditsPath: string;
}

export type LicensedImageCredit = ImageCredit & Required<Pick<ImageCredit, 'source' | 'license' | 'licenseUrl'>>;

const manifests = import.meta.glob<ImageCreditManifest>([
  '../../public/images/trips/*/credits.json',
  '../../public/images/shared/credits.json',
], { eager: true, import: 'default' });

const creditsByPath = new Map<string, ImageCredit>();

for (const [manifestPath, manifest] of Object.entries(manifests)) {
  if (!manifest || !Array.isArray(manifest.images)) {
    throw new Error(`Image manifest "${manifestPath}" must contain an images array.`);
  }
  const creditsPath = manifestPath.replace('../../public', '');
  const directory = creditsPath.slice(0, creditsPath.lastIndexOf('/'));
  for (const record of manifest.images) {
    if (!record.file || record.file.includes('\\') || record.file.split('/').some(part => !part || part === '.' || part === '..')) {
      throw new Error(`Image manifest "${manifestPath}" contains an invalid relative filename.`);
    }
    const imagePath = `${directory}/${record.file}`;
    if (creditsByPath.has(imagePath)) throw new Error(`Duplicate image credit: "${imagePath}".`);
    creditsByPath.set(imagePath, { ...record, imagePath, creditsPath });
  }
}

/** Credits use full public paths so identical basenames in different trips stay distinct. */
export function getImageCredit(imagePath: string): ImageCredit | undefined {
  return creditsByPath.get(`/${imagePath.replace(/^\/+/, '')}`);
}

/** Original illustrations can supply dimensions without implying an external photo license. */
export function getLicensedImageCredit(imagePath: string): LicensedImageCredit | undefined {
  const credit = getImageCredit(imagePath);
  return credit?.source && credit.license && credit.licenseUrl
    ? credit as LicensedImageCredit
    : undefined;
}
