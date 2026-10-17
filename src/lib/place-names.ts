import type { TripLocalName } from '../data/types';

/** Keep the local name available in data without repeating an identical label. */
export function distinctLocalName(primaryName: string, localName?: TripLocalName): TripLocalName | undefined {
  if (!localName?.text.trim()) return undefined;
  return localName.text.trim().normalize('NFC') === primaryName.trim().normalize('NFC')
    ? undefined
    : localName;
}
