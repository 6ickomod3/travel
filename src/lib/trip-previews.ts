import type { Trip } from '../data/trips';
import imageCredits from '../../public/images/credits.json';

export interface PreviewImageCredit {
  source: string;
  license: string;
  licenseUrl: string;
  author?: string;
  changes?: string;
}

export type TripPreview = Pick<Trip,
  'slug' | 'title' | 'country' | 'countryCode' | 'startDate' | 'endDate' |
  'status' | 'language' | 'cover' | 'coverAlt' | 'coverCredit'
> & { imageCredit?: PreviewImageCredit; imageWidth: number; imageHeight: number };

/** Small public metadata payload; itinerary details stay on the trip pages. */
export function toTripPreview(trip: Trip): TripPreview {
  const { slug, title, country, countryCode, startDate, endDate, status, language, cover, coverAlt, coverCredit } = trip;
  const image = imageCredits.images.find(record => `/images/${record.file}` === cover);
  return {
    slug, title, country, countryCode, startDate, endDate, status, language, cover, coverAlt, coverCredit,
    imageWidth: image?.width ?? 1800,
    imageHeight: image?.height ?? 1200,
    imageCredit: image ? {
      source: image.source, license: image.license, licenseUrl: image.licenseUrl,
      author: 'author' in image ? image.author : undefined,
      changes: 'changes' in image ? image.changes : undefined,
    } : undefined,
  };
}
