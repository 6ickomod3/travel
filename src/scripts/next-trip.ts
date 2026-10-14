import { displayStatus, formatDateRange, placeholderStatusLabel, selectNextTrip, statusLabel } from '../lib/trips';
import type { TripStatus } from '../data/trips';
import type { TripPreview } from '../lib/trip-previews';
import { withBase } from '../lib/urls';

const payload = document.querySelector<HTMLScriptElement>('[data-next-trip-candidates]');
const candidates: TripPreview[] = JSON.parse(payload?.textContent ?? '[]');
let refreshTimer: ReturnType<typeof setTimeout>;

function setText(selector: string, value: string) {
  const element = document.querySelector<HTMLElement>(selector);
  if (element) element.textContent = value;
}

function refreshNextTrip() {
  const now = new Date();
  document.querySelectorAll<HTMLElement>('[data-trip-status]').forEach(element => {
    const label = element.querySelector('[data-status-label]');
    if (label) label.textContent = element.dataset.placeholder === 'true'
      ? placeholderStatusLabel(element.dataset.locale)
      : statusLabel(displayStatus({ startDate: element.dataset.startDate!, endDate: element.dataset.endDate!, status: element.dataset.status as TripStatus }, now), element.dataset.locale);
  });
  const trip = selectNextTrip(candidates, now);
  const today = now.toISOString().slice(0, 10);
  const current = trip && trip.startDate <= today && trip.endDate >= today;
  const header = document.querySelector<HTMLAnchorElement>('[data-next-trip-header]');
  if (header) {
    header.hidden = !trip;
    if (trip) {
      header.href = withBase(`trips/${trip.slug}/`);
      header.setAttribute('aria-label', `View ${trip.title}`);
      const isZh = document.documentElement.lang === 'zh-CN';
      setText('[data-next-trip-header-label]', `${trip.country} ${isZh ? trip.startDate.slice(0, 4) : `’${trip.startDate.slice(2, 4)}`}`);
    }
  }

  const feature = document.querySelector<HTMLElement>('[data-next-trip-feature]');
  const empty = document.querySelector<HTMLElement>('[data-next-trip-empty]');
  if (feature) feature.hidden = !trip;
  if (empty) empty.hidden = Boolean(trip);
  const region = document.querySelector<HTMLElement>('[data-next-trip-region]');
  if (region) region.setAttribute('aria-label', current ? 'Current trip' : 'Next trip');
  if (trip && feature) {
    const locale = trip.language ?? 'en';
    setText('[data-next-trip-heading]', current ? 'CURRENT TRIP' : 'NEXT TRIP');
    setText('[data-next-trip-country]', trip.country);
    setText('[data-next-trip-status]', statusLabel(displayStatus(trip, now), locale));
    const title = document.querySelector<HTMLElement>('[data-next-trip-title]');
    if (title) {
      title.lang = locale;
      const comma = trip.title.search(/[，,]/);
      const parts = comma >= 0 ? [trip.title.slice(0, comma + 1), trip.title.slice(comma + 1).trim()] : [trip.title];
      const fragment = document.createDocumentFragment();
      parts.forEach((part, index) => {
        if (index) fragment.append(document.createElement('wbr'));
        const span = document.createElement('span');
        span.className = 'next-trip-title-part';
        span.textContent = part;
        fragment.append(span);
      });
      title.replaceChildren(fragment);
    }
    const meta = document.querySelector<HTMLElement>('[data-next-trip-meta]');
    if (meta) meta.lang = locale;
    const dates = document.querySelector<HTMLTimeElement>('[data-next-trip-dates]');
    if (dates) {
      dates.dateTime = trip.startDate;
      dates.textContent = formatDateRange(trip, locale === 'zh-CN' ? 'zh-CN' : 'en-US');
    }
    document.querySelectorAll<HTMLAnchorElement>('[data-next-trip-open]').forEach(link => {
      link.href = withBase(`trips/${trip.slug}/`);
      link.setAttribute('aria-label', `View ${trip.title}`);
    });
    const image = document.querySelector<HTMLImageElement>('[data-next-trip-image]');
    if (image) {
      const src = withBase(trip.cover);
      if (image.getAttribute('src') !== src) image.src = src;
      image.alt = trip.coverAlt;
      image.lang = locale;
      image.width = trip.imageWidth;
      image.height = trip.imageHeight;
    }
    const credit = document.querySelector<HTMLElement>('[data-next-trip-credit]');
    if (credit) {
      credit.lang = trip.language ?? 'en';
      credit.replaceChildren();
      if (trip.imageCredit) {
        const author = document.createElement('a');
        author.href = trip.imageCredit.source;
        author.textContent = trip.imageCredit.author ?? 'Photo source';
        const license = document.createElement('a');
        license.href = trip.imageCredit.licenseUrl;
        license.textContent = trip.imageCredit.license;
        for (const link of [author, license]) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
        credit.append(author, document.createTextNode(' · '), license);
        if (trip.imageCredit.changes) credit.append(document.createTextNode(` · ${trip.imageCredit.changes}`));
      } else credit.textContent = trip.coverCredit;
    }
  }

  clearTimeout(refreshTimer);
  const nextDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  refreshTimer = setTimeout(refreshNextTrip, nextDay - now.getTime() + 1000);
}

refreshNextTrip();
window.addEventListener('pageshow', refreshNextTrip);
window.addEventListener('pagehide', () => clearTimeout(refreshTimer));
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshNextTrip(); });
