import type { Trip } from '../data/trips';
import { getImageCredit, getLicensedImageCredit } from './image-credits';

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
  const image = getImageCredit(cover);
  const photo = getLicensedImageCredit(cover);
  return {
    slug, title, country, countryCode, startDate, endDate, status, language, cover, coverAlt, coverCredit,
    imageWidth: image?.width ?? 1800,
    imageHeight: image?.height ?? 1200,
    imageCredit: photo ? {
      source: photo.source, license: photo.license, licenseUrl: photo.licenseUrl,
      author: photo.author,
      changes: photo.changes,
    } : undefined,
  };
}
