import assert from 'node:assert/strict';
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

function publicFile(path, label) {
  assert.ok(typeof path === 'string' && path.startsWith('/images/'), `${label}: use a public image path`);
  const file = resolve(publicRoot, `.${path}`);
  assert.ok(file.startsWith(`${imageRoot}${sep}`), `${label}: path must stay inside public/images/`);
  assert.ok(existsSync(file) && statSync(file).isFile(), `${label}: missing ${path}`);
}

const imageCredits = new Map();
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
  uniqueIds(trip.checklist ?? [], `${folder} checklist`);
  for (const place of trip.destinations) {
    assert.ok(Number.isFinite(place.lat) && Math.abs(place.lat) <= 90 && Number.isFinite(place.lng) && Math.abs(place.lng) <= 180, `${folder}/${place.id}: invalid coordinates`);
  }
  for (const id of trip.mapRoute ?? []) assert.ok(destinations.has(id), `${folder} route: unknown destination ${id}`);
  const checkSources = (ids, label) => {
    for (const id of ids ?? []) assert.ok(sources.has(id), `${label}: unknown source ${id}`);
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
    for (const item of day.schedule ?? []) checkSources(item.sourceIds, `${folder}/${date} schedule`);
  }
  for (const stay of trip.stays ?? []) {
    for (const period of stay.checkIns) {
      const checkIn = calendarDate(period.checkIn, `${folder}/${stay.id} check-in`);
      const checkOut = calendarDate(period.checkOut, `${folder}/${stay.id} check-out`);
      assert.ok(checkOut > checkIn, `${folder}/${stay.id}: check-out must follow check-in`);
    }
  }
  for (const item of trip.checklist ?? []) checkSources(item.sourceIds, `${folder}/${item.id}`);
  dated++;
}

console.log(`Content checked: ${dated} dated trip${dated === 1 ? '' : 's'}, ${placeholders} placeholder${placeholders === 1 ? '' : 's'}.`);
