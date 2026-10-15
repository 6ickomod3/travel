import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = join(root, 'public');
const imageRoot = join(publicRoot, 'images');
const tripRoot = join(root, 'itineraries');
const folders = readdirSync(tripRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && existsSync(join(tripRoot, entry.name, 'trip.ts')))
  .map(entry => entry.name).sort();

function calendarDate(value, label) {
  assert.match(value, /^\d{4}-\d{2}-\d{2}$/, `${label}: use YYYY-MM-DD`);
  const date = new Date(`${value}T00:00:00.000Z`);
  assert.ok(Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value, `${label}: invalid date`);
  return value;
}

function uniqueIds(entries, label) {
  const ids = new Set();
  for (const { id } of entries) {
    assert.ok(typeof id === 'string' && id.trim(), `${label}: missing ID`);
    assert.ok(!ids.has(id), `${label}: duplicate ID ${id}`);
    ids.add(id);
  }
  return ids;
}

function clockTime(value, label) {
  assert.match(value, /^(?:[01]\d|2[0-3]):[0-5]\d$/, `${label}: use a valid HH:MM local time`);
}

function publicFile(path, label) {
  assert.ok(typeof path === 'string' && path.startsWith('/images/'), `${label}: use a public image path`);
  const file = resolve(publicRoot, `.${path}`);
  assert.ok(file.startsWith(`${imageRoot}${sep}`), `${label}: path must stay inside public/images/`);
  assert.ok(existsSync(file) && statSync(file).isFile(), `${label}: missing ${path}`);
}

const imageCredits = new Map();
const brandManifestPath = join(imageRoot, 'brands', 'provenance.json');
const brandManifest = JSON.parse(readFileSync(brandManifestPath, 'utf8'));
assert.ok(Array.isArray(brandManifest.brands), `${brandManifestPath}: add a brands array`);
const brandIds = uniqueIds(brandManifest.brands, 'Shared brands');
for (const brand of brandManifest.brands) {
  assert.ok(brand.name && ['image', 'text'].includes(brand.status), `${brand.id}: name the brand and identify its image or text fallback`);
  if (brand.status === 'image') {
    assert.ok(brand.asset, `${brand.id}: record the logo asset`);
    if (brand.sourceKind === 'user-supplied-file') {
      assert.match(brand.sourceFile, /^[^/\\\r\n]+\.(?:svg|png|webp)$/i, `${brand.id}: record the supplied image filename`);
      assert.match(brand.sourcePage, /^https:\/\//, `${brand.id}: record the supplied public source page`);
      calendarDate(brand.providedOn, `${brand.id} supplied date`);
      assert.match(brand.sha256, /^[a-f0-9]{64}$/, `${brand.id}: record the supplied file hash`);
    } else {
      assert.ok(brand.sourceUrl && /^https:\/\//.test(brand.sourceUrl), `${brand.id}: record the public logo asset URL`);
    }
  }
  if (brand.asset) {
    assert.match(brand.asset.file, /^[a-z0-9][a-z0-9.-]*\.(?:svg|png|webp)$/, `${brand.id}: use a local brand image filename`);
    publicFile(`/images/brands/${brand.asset.file}`, `${brand.id} logo`);
    for (const dimension of ['width', 'height']) assert.ok(Number.isFinite(brand.asset[dimension]) && brand.asset[dimension] > 0, `${brand.id}: invalid logo ${dimension}`);
    if (brand.sourceKind === 'user-supplied-file') {
      const digest = createHash('sha256').update(readFileSync(join(imageRoot, 'brands', brand.asset.file))).digest('hex');
      assert.equal(digest, brand.sha256, `${brand.id}: supplied logo bytes differ from the recorded hash`);
    }
  }
}
const imageTripRoot = join(imageRoot, 'trips');
const manifests = [join(imageRoot, 'shared', 'credits.json'), ...readdirSync(imageTripRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && existsSync(join(imageTripRoot, entry.name, 'credits.json')))
  .map(entry => join(imageTripRoot, entry.name, 'credits.json'))];
for (const file of manifests) {
  const manifest = JSON.parse(readFileSync(file, 'utf8'));
  assert.ok(Array.isArray(manifest.images), `${file}: add an images array`);
  const directory = dirname(file).slice(publicRoot.length).split(sep).join('/');
  for (const record of manifest.images) {
    assert.ok(typeof record.file === 'string' && record.file && !record.file.includes('\\') && !record.file.split('/').some(part => !part || part === '.' || part === '..'), `${file}: use a relative image filename`);
    const imagePath = `${directory}/${record.file}`;
    assert.ok(!imageCredits.has(imagePath), `${file}: duplicate image credit ${imagePath}`);
    publicFile(imagePath, file);
    for (const dimension of ['width', 'height']) if (record[dimension] !== undefined) assert.ok(Number.isInteger(record[dimension]) && record[dimension] > 0, `${imagePath}: invalid ${dimension}`);
    if (record.attributionRequired) assert.ok(record.author && record.source && record.license && record.licenseUrl, `${imagePath}: complete the required image attribution`);
    imageCredits.set(imagePath, record);
  }
}

const slugs = new Set();
let dated = 0;
let placeholders = 0;
for (const folder of folders) {
  const trip = (await import(pathToFileURL(join(tripRoot, folder, 'trip.ts')).href)).default;
  assert.ok(trip && typeof trip === 'object', `${folder}: default-export a trip object`);
  assert.equal(trip.slug, folder, `${folder}: folder name and slug must match`);
  assert.match(trip.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${folder}: use a lowercase URL slug`);
  assert.ok(!slugs.has(trip.slug), `Duplicate trip slug: ${trip.slug}`);
  slugs.add(trip.slug);
  assert.ok(existsSync(join(tripRoot, folder, 'history.md')), `${folder}: add history.md`);
  assert.ok(existsSync(join(tripRoot, folder, 'inputs')) && statSync(join(tripRoot, folder, 'inputs')).isDirectory(), `${folder}: add inputs/`);
  assert.ok(trip.title && trip.country && trip.coverAlt && trip.coverCredit, `${folder}: complete the trip and cover descriptions`);
  assert.match(trip.countryCode, /^[A-Z]{2}$/, `${folder}: use a two-letter country code`);
  publicFile(trip.cover, `${folder} cover`);
  assert.ok(imageCredits.has(trip.cover), `${folder}: add cover metadata to a per-trip or shared credits.json`);

  const manifest = join(publicRoot, 'images', 'trips', folder, 'credits.json');
  assert.ok(existsSync(manifest), `${folder}: add the image credits.json`);

  if (trip.kind === 'placeholder') {
    assert.ok(Number.isInteger(trip.year) && trip.year > 0 && trip.year <= 9999, `${folder}: add a valid year`);
    assert.equal(trip.status, 'planning', `${folder}: placeholders stay in planning`);
    assert.ok(!('startDate' in trip) && !('endDate' in trip), `${folder}: do not give placeholders invented dates`);
    placeholders++;
    continue;
  }

  const start = calendarDate(trip.startDate, `${folder} start`);
  const end = calendarDate(trip.endDate, `${folder} end`);
  assert.ok(end >= start, `${folder}: end date precedes start`);
  assert.ok(['planning', 'upcoming', 'completed'].includes(trip.status), `${folder}: invalid trip status`);
  const destinations = uniqueIds(trip.destinations, `${folder} destinations`);
  const sources = uniqueIds(trip.sources ?? [], `${folder} sources`);
  const stays = uniqueIds(trip.stays ?? [], `${folder} stays`);
  const photos = uniqueIds(trip.gallery ?? [], `${folder} gallery photos`);
  const sights = uniqueIds(trip.sights ?? [], `${folder} sights`);
  uniqueIds(trip.checklist ?? [], `${folder} checklist`);
  uniqueIds(trip.flights ?? [], `${folder} flights`);
  const ticketOptions = uniqueIds(trip.ticketOptions ?? [], `${folder} ticket options`);
  if (trip.selectedTicketOptionId !== undefined) assert.ok(ticketOptions.has(trip.selectedTicketOptionId), `${folder}: selected ticket option must reference an existing option`);
  const bookingWindowIds = uniqueIds(trip.bookingWindows ?? [], `${folder} booking windows`);
  for (const place of trip.destinations) {
    assert.ok(Number.isFinite(place.lat) && Math.abs(place.lat) <= 90 && Number.isFinite(place.lng) && Math.abs(place.lng) <= 180, `${folder}/${place.id}: invalid coordinates`);
  }
  for (const id of trip.mapRoute ?? []) assert.ok(destinations.has(id), `${folder} route: unknown destination ${id}`);
  const checkSources = (ids, label) => {
    for (const id of ids ?? []) assert.ok(sources.has(id), `${label}: unknown source ${id}`);
  };
  const checkSights = (ids, label) => {
    for (const id of ids ?? []) assert.ok(sights.has(id), `${label}: unknown sight ${id}`);
  };
  const dates = new Set();
  for (const day of trip.days) {
    const date = calendarDate(day.date, `${folder} day`);
    assert.ok(date >= start && date <= end, `${folder}: day ${date} is outside the trip`);
    assert.ok(!dates.has(date), `${folder}: duplicate day ${date}`);
    dates.add(date);
    assert.ok(destinations.has(day.destinationId), `${folder}/${date}: unknown destination ${day.destinationId}`);
    if (day.overnightId) assert.ok(stays.has(day.overnightId), `${folder}/${date}: unknown stay ${day.overnightId}`);
    checkSources(day.sourceIds, `${folder}/${date}`);
    checkSights(day.sightIds, `${folder}/${date}`);
    if (day.stamps) {
      assert.ok(day.stamps.title && day.stamps.stops.length, `${folder}/${date}: name the stamp collection and add its stops`);
      for (const stop of day.stamps.stops) {
        assert.ok(typeof stop.name === 'string' && stop.name.trim(), `${folder}/${date}: name each stamp stop`);
        if (stop.number !== undefined) assert.ok(Number.isInteger(stop.number) && stop.number > 0, `${folder}/${date}: invalid official stamp number`);
      }
      checkSources(day.stamps.sourceIds, `${folder}/${date} stamps`);
    }
    for (const item of day.schedule ?? []) checkSources(item.sourceIds, `${folder}/${date} schedule`);
    uniqueIds(day.alternatives ?? [], `${folder}/${date} alternatives`);
    for (const alternative of day.alternatives ?? []) {
      assert.ok(alternative.title && alternative.description && alternative.schedule.length, `${folder}/${date}/${alternative.id}: complete the separate alternative plan`);
      checkSources(alternative.sourceIds, `${folder}/${date}/${alternative.id}`);
      checkSights(alternative.sightIds, `${folder}/${date}/${alternative.id}`);
      for (const item of alternative.schedule) checkSources(item.sourceIds, `${folder}/${date}/${alternative.id} schedule`);
    }
  }
  for (const photo of trip.gallery ?? []) {
    assert.match(photo.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${folder}/${photo.id}: use a gallery fragment ID`);
    publicFile(photo.image, `${folder}/${photo.id}`);
    assert.ok(imageCredits.has(photo.image), `${folder}/${photo.id}: add image credit metadata`);
    assert.ok(photo.title && photo.alt, `${folder}/${photo.id}: add a photo title and description`);
    if (photo.dayDate) {
      calendarDate(photo.dayDate, `${folder}/${photo.id} day`);
      assert.ok(dates.has(photo.dayDate), `${folder}/${photo.id}: unknown itinerary day`);
    }
    if (photo.alternativeId) {
      const day = trip.days.find(item => item.date === photo.dayDate);
      assert.ok(day?.alternatives?.some(item => item.id === photo.alternativeId), `${folder}/${photo.id}: unknown day alternative`);
      assert.equal(photo.optional, true, `${folder}/${photo.id}: label an alternative photo as optional`);
    }
  }
  for (const sight of trip.sights ?? []) {
    assert.ok(sight.name && sight.introduction && sight.photoIds.length, `${folder}/${sight.id}: add a sight introduction and photos`);
    for (const id of sight.photoIds) assert.ok(photos.has(id), `${folder}/${sight.id}: unknown gallery photo ${id}`);
    checkSources(sight.sourceIds, `${folder}/${sight.id} introduction`);
  }
  if (trip.stampGuide) {
    assert.ok(trip.stampGuide.title && trip.stampGuide.sections.length, `${folder}: name the stamp guide and add its sections`);
    for (const section of trip.stampGuide.sections) {
      assert.ok(section.title && section.points.length, `${folder}: complete each stamp-guide section`);
      checkSources(section.sourceIds, `${folder} stamp guide`);
    }
  }
  for (const stay of trip.stays ?? []) {
    if (stay.brandId !== undefined) assert.ok(brandIds.has(stay.brandId), `${folder}/${stay.id}: unknown property brand ${stay.brandId}`);
    for (const period of stay.checkIns) {
      const checkIn = calendarDate(period.checkIn, `${folder}/${stay.id} check-in`);
      const checkOut = calendarDate(period.checkOut, `${folder}/${stay.id} check-out`);
      assert.ok(checkOut > checkIn, `${folder}/${stay.id}: check-out must follow check-in`);
      if (period.cost) {
        assert.match(period.cost.currency, /^[A-Z]{3}$/, `${folder}/${stay.id}/${checkIn}: use an ISO cost currency`);
        assert.ok(Number.isFinite(period.cost.amount) && period.cost.amount >= 0, `${folder}/${stay.id}/${checkIn}: invalid booking amount`);
        for (const extra of period.cost.estimatedAdditional ?? []) {
          assert.ok(typeof extra.label === 'string' && extra.label.trim(), `${folder}/${stay.id}/${checkIn}: label the additional charge`);
          assert.ok(Number.isFinite(extra.amount) && extra.amount >= 0, `${folder}/${stay.id}/${checkIn}: invalid additional charge`);
          assert.ok(extra.kind === undefined || ['accommodation-tax', 'other'].includes(extra.kind), `${folder}/${stay.id}/${checkIn}: invalid additional-charge kind`);
          if (extra.quantity) {
            const { perPersonPerNight, people, nights } = extra.quantity;
            assert.ok(Number.isFinite(perPersonPerNight) && perPersonPerNight >= 0 && Number.isInteger(people) && people > 0 && Number.isInteger(nights) && nights > 0, `${folder}/${stay.id}/${checkIn}: invalid additional-charge calculation`);
            assert.ok(Math.abs(perPersonPerNight * people * nights - extra.amount) < 0.01, `${folder}/${stay.id}/${checkIn}: additional charge disagrees with its calculation`);
          }
        }
        checkSources(period.cost.sourceIds, `${folder}/${stay.id}/${checkIn} cost`);
      }
    }
  }
  for (const item of trip.checklist ?? []) {
    assert.ok(item.kind === undefined || ['todo', 'check'].includes(item.kind), `${folder}/${item.id}: checklist kind must be todo or check`);
    assert.ok(item.priority === undefined || item.priority === 'high', `${folder}/${item.id}: checklist priority must be high or omitted`);
    if (item.priorityReason !== undefined) assert.ok(item.priority === 'high' && typeof item.priorityReason === 'string' && item.priorityReason.trim(), `${folder}/${item.id}: priority reasons belong to important items`);
    if (item.timing) {
      const timing = item.timing;
      assert.ok(['asap', 'reservation-opens', 'deadline', 'trip-date'].includes(timing.kind), `${folder}/${item.id}: invalid checklist timing kind`);
      if (timing.kind === 'reservation-opens') {
        assert.ok(Array.isArray(timing.bookingWindowIds) && timing.bookingWindowIds.length > 0, `${folder}/${item.id}: reference at least one reservation opening`);
        assert.equal(new Set(timing.bookingWindowIds).size, timing.bookingWindowIds.length, `${folder}/${item.id}: duplicate reservation-opening reference`);
        for (const id of timing.bookingWindowIds) assert.ok(bookingWindowIds.has(id), `${folder}/${item.id}: unknown reservation opening ${id}`);
      }
      if (timing.kind === 'deadline' || timing.kind === 'trip-date') {
        const date = calendarDate(timing.date, `${folder}/${item.id} checklist date`);
        if (timing.kind === 'trip-date') assert.ok(date >= start && date <= end, `${folder}/${item.id}: related checklist date is outside the trip`);
      }
    }
    checkSources(item.sourceIds, `${folder}/${item.id}`);
  }
  for (const flight of trip.flights ?? []) {
    for (const id of [flight.brandId, flight.operatedByBrandId].filter(Boolean)) assert.ok(brandIds.has(id), `${folder}/${flight.id}: unknown airline brand ${id}`);
    assert.ok(flight.flightNumber, `${folder}/${flight.id}: add the flight number`);
    assert.ok(['booked', 'planned'].includes(flight.status), `${folder}/${flight.id}: invalid flight status`);
    for (const direction of ['departure', 'arrival']) {
      const endpoint = flight[direction];
      assert.match(endpoint.airportCode, /^[A-Z]{3}$/, `${folder}/${flight.id}: use a three-letter airport code`);
      assert.ok(endpoint.city, `${folder}/${flight.id}: add the airport city`);
      calendarDate(endpoint.date, `${folder}/${flight.id} ${direction}`);
      clockTime(endpoint.time, `${folder}/${flight.id} ${direction}`);
    }
    checkSources(flight.sourceIds, `${folder}/${flight.id}`);
  }
  for (const option of trip.ticketOptions ?? []) {
    const validFrom = calendarDate(option.validFrom, `${folder}/${option.id} validity start`);
    const validThrough = calendarDate(option.validThrough, `${folder}/${option.id} validity end`);
    assert.ok(validThrough >= validFrom, `${folder}/${option.id}: ticket validity ends before it starts`);
    assert.match(option.currency, /^[A-Z]{3}$/, `${folder}/${option.id}: use an ISO currency code`);
    for (const amount of [option.price, ...(option.estimatedTotal === undefined ? [] : [option.estimatedTotal])]) assert.ok(Number.isFinite(amount) && amount >= 0, `${folder}/${option.id}: invalid ticket price`);
    for (const ticket of option.addOnTickets ?? []) {
      assert.ok(typeof ticket.label === 'string' && ticket.label.trim(), `${folder}/${option.id}: label each add-on ticket`);
      assert.ok(Number.isFinite(ticket.price) && ticket.price >= 0, `${folder}/${option.id}: invalid add-on ticket price`);
    }
    if (option.addOnTickets && option.estimatedTotal !== undefined) {
      const estimate = option.price + option.addOnTickets.reduce((total, ticket) => total + ticket.price, 0);
      assert.ok(Math.abs(estimate - option.estimatedTotal) < 0.01, `${folder}/${option.id}: add-on ticket breakdown disagrees with estimated total`);
    }
    checkSources(option.sourceIds, `${folder}/${option.id}`);
  }
  for (const window of trip.bookingWindows ?? []) {
    const travelDate = calendarDate(window.travelDate, `${folder}/${window.id} travel date`);
    assert.ok(travelDate >= start && travelDate <= end, `${folder}/${window.id}: booking travel date is outside the trip`);
    assert.match(window.opensAt, /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?(?:Z|[+-]\d{2}:\d{2})$/, `${folder}/${window.id}: opening time needs an explicit timezone offset`);
    calendarDate(window.opensAt.slice(0, 10), `${folder}/${window.id} opening date`);
    assert.ok(Number.isFinite(Date.parse(window.opensAt)), `${folder}/${window.id}: invalid opening timestamp`);
    new Intl.DateTimeFormat('en', { timeZone: window.timeZone }).format(new Date(window.opensAt));
    checkSources(window.sourceIds, `${folder}/${window.id}`);
  }
  dated++;
}

console.log(`Content checked: ${dated} dated trip${dated === 1 ? '' : 's'}, ${placeholders} placeholder${placeholders === 1 ? '' : 's'}.`);
