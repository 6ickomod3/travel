import assert from 'node:assert/strict';
import test from 'node:test';
import {
  describeWeather, forecastDateState, forecastUrl, hasWeatherValues, isFreshWeather,
  localWeatherDate, parseWeatherResponse, readWeatherSnapshot, WEATHER_CACHE_MS, WEATHER_STALE_MS,
  hourlyForecastUrl, parseHourlyWeatherResponse, hasHourlyWeatherValues, hourlyWeatherCoverage,
  weatherDayHours, readHourlyWeatherSnapshot,
} from '../src/lib/weather.ts';

const zone = 'Asia/Tokyo';
const now = Date.parse('2026-11-03T00:30:00+09:00');
const response = () => ({
  generationtime_ms: 0.35,
  daily_units: {
    weather_code: 'wmo code', temperature_2m_min: '°C', temperature_2m_max: '°C',
    precipitation_probability_max: '%', precipitation_sum: 'mm', wind_speed_10m_max: 'm/s',
  },
  daily: {
    time: ['2026-11-16', '2026-11-17'],
    weather_code: [0, 61], temperature_2m_min: [10, 7.4], temperature_2m_max: [20, 15.7],
    precipitation_probability_max: [0, null], precipitation_sum: [0, 4.2], wind_speed_10m_max: [1.8, 2.6],
  },
});

test('the request uses the free forecast endpoint, destination timezone and explicit units', () => {
  const url = new URL(forecastUrl({ lat: 33.7942677, lng: 135.5293252, timeZone: zone }));
  assert.equal(url.origin + url.pathname, 'https://api.open-meteo.com/v1/forecast');
  assert.equal(url.searchParams.get('latitude'), '33.7942677');
  assert.equal(url.searchParams.get('timezone'), zone);
  assert.equal(url.searchParams.get('forecast_days'), '16');
  assert.equal(url.searchParams.get('wind_speed_unit'), 'ms');
  assert.equal(url.searchParams.get('temperature_unit'), 'celsius');
  assert.equal(url.searchParams.get('precipitation_unit'), 'mm');
  assert.equal(url.searchParams.has('apikey'), false);
});

test('Japan dates remain local when Los Angeles is still on the previous day', () => {
  assert.equal(localWeatherDate(zone, now), '2026-11-03');
  assert.equal(localWeatherDate('America/Los_Angeles', now), '2026-11-02');
  assert.equal(forecastDateState('2026-11-02', zone, now), 'past');
  assert.equal(forecastDateState('2026-11-03', zone, now), 'available');
  assert.equal(forecastDateState('2026-11-18', zone, now), 'available');
  assert.equal(forecastDateState('2026-11-19', zone, now), 'future');
});

test('the 16-day window counts calendar dates across daylight-saving changes', () => {
  const beforeDstEnds = Date.parse('2026-10-31T23:30:00-04:00');
  assert.equal(forecastDateState('2026-11-15', 'America/New_York', beforeDstEnds), 'available');
  assert.equal(forecastDateState('2026-11-16', 'America/New_York', beforeDstEnds), 'future');
});

test('daily values keep their actual dates and null differs from zero', () => {
  const snapshot = parseWeatherResponse(response(), zone, now);
  const selectedDay = snapshot.days.find(day => day.date === '2026-11-17');
  assert.equal(selectedDay.minimumC, 7.4);
  assert.equal(selectedDay.precipitationMm, 4.2);
  assert.equal(selectedDay.rainProbability, null);
  assert.equal(snapshot.days[0].rainProbability, 0);
  assert.equal(snapshot.days[0].precipitationMm, 0);
  assert.equal(snapshot.fetchedAt, now);
  assert.equal('generationtime_ms' in snapshot, false);
});

test('unexpected wind units and incomplete daily arrays are rejected', () => {
  const wrongUnits = response();
  wrongUnits.daily_units.wind_speed_10m_max = 'km/h';
  assert.throws(() => parseWeatherResponse(wrongUnits, zone, now), /units/);
  const incomplete = response();
  incomplete.daily.temperature_2m_min = [10];
  assert.throws(() => parseWeatherResponse(incomplete, zone, now), /incomplete/);
});

test('invalid and duplicate calendar dates never become forecasts', () => {
  const duplicate = response();
  duplicate.daily.time = ['2026-11-17', '2026-11-17'];
  assert.throws(() => parseWeatherResponse(duplicate, zone, now), /duplicate/);
  const invalid = response();
  invalid.daily.time = ['2026-02-30', '2026-11-17'];
  assert.throws(() => parseWeatherResponse(invalid, zone, now), /calendar dates/);
});

test('a missing forecast stays unavailable while recorded zero values remain valid', () => {
  const unavailable = response();
  for (const field of Object.keys(unavailable.daily).filter(field => field !== 'time')) unavailable.daily[field] = [null, null];
  const empty = parseWeatherResponse(unavailable, zone, now);
  assert.equal(hasWeatherValues(empty.days[0]), false);
  assert.equal(hasWeatherValues(parseWeatherResponse(response(), zone, now).days[0]), true);
});

test('weather labels follow WMO codes and unknown codes do not imply sunshine', () => {
  assert.equal(describeWeather(65, 'zh-CN').label, '大雨');
  assert.equal(describeWeather(95, 'en').icon, 'storm');
  assert.equal(describeWeather(999, 'zh-CN').label, '天气概况待更新');
  assert.equal(describeWeather(null, 'en').label, 'Conditions unavailable');
});

test('cache expiry and destination-local midnight both trigger a refresh', () => {
  const snapshot = parseWeatherResponse(response(), zone, now);
  assert.equal(isFreshWeather(snapshot, now + WEATHER_CACHE_MS - 1), true);
  assert.equal(isFreshWeather(snapshot, now + WEATHER_CACHE_MS), false);
  const beforeMidnight = Date.parse('2026-11-03T23:55:00+09:00');
  const older = { ...snapshot, fetchedAt: beforeMidnight };
  assert.equal(isFreshWeather(older, Date.parse('2026-11-04T00:05:00+09:00')), false);
});

test('stale fallback expires after 24 hours and rejects another timezone or malformed storage', () => {
  const snapshot = parseWeatherResponse(response(), zone, now);
  assert.ok(readWeatherSnapshot(snapshot, zone, now + WEATHER_STALE_MS));
  assert.equal(readWeatherSnapshot(snapshot, zone, now + WEATHER_STALE_MS + 1), undefined);
  assert.equal(readWeatherSnapshot(snapshot, 'Europe/London', now), undefined);
  assert.equal(readWeatherSnapshot({ ...snapshot, days: [{}] }, zone, now), undefined);
});

const hourlyRequest = { lat: 33.7942677, lng: 135.5293252, timeZone: zone, date: '2026-11-17' };
const hourlyResponse = (timestamps = Array.from({ length: 24 }, (_, index) => Date.parse('2026-11-17T00:00:00+09:00') + index * 3_600_000)) => ({
  generationtime_ms: 0.25,
  hourly_units: { time: 'unixtime', temperature_2m: '°C', precipitation_probability: '%', precipitation: 'mm', weather_code: 'wmo code', wind_speed_10m: 'm/s' },
  hourly: {
    time: timestamps.map(timestamp => timestamp / 1000),
    temperature_2m: timestamps.map((_, index) => 7 + index / 10),
    precipitation_probability: timestamps.map(() => 0),
    precipitation: timestamps.map(() => 0),
    weather_code: timestamps.map(() => 0),
    wind_speed_10m: timestamps.map(() => 1.2),
  },
});

test('hourly requests contain only public coordinates and exact date bounds, UTC epochs and explicit units', () => {
  const url = new URL(hourlyForecastUrl(hourlyRequest));
  assert.equal(url.origin + url.pathname, 'https://api.open-meteo.com/v1/forecast');
  assert.equal(url.searchParams.get('latitude'), String(hourlyRequest.lat));
  assert.equal(url.searchParams.get('longitude'), String(hourlyRequest.lng));
  assert.equal(url.searchParams.get('timezone'), zone);
  assert.equal(url.searchParams.get('start_date'), '2026-11-17');
  assert.equal(url.searchParams.get('end_date'), '2026-11-17');
  assert.equal(url.searchParams.get('timeformat'), 'unixtime');
  assert.equal(url.searchParams.has('forecast_days'), false);
  assert.equal(url.searchParams.get('temperature_unit'), 'celsius');
  assert.equal(url.searchParams.get('precipitation_unit'), 'mm');
  assert.equal(url.searchParams.get('wind_speed_unit'), 'ms');
  assert.deepEqual(new Set(url.searchParams.get('hourly').split(',')), new Set(['temperature_2m', 'precipitation_probability', 'precipitation', 'weather_code', 'wind_speed_10m']));
  assert.deepEqual([...url.searchParams.keys()].sort(), ['latitude', 'longitude', 'timezone', 'start_date', 'end_date', 'hourly', 'timeformat', 'temperature_unit', 'precipitation_unit', 'wind_speed_unit'].sort());
  assert.throws(() => hourlyForecastUrl({ ...hourlyRequest, date: '2026-02-30' }), /calendar date/);
});

test('hourly selection includes the complete Tokyo day and excludes adjacent local dates', () => {
  const start = Date.parse('2026-11-17T00:00:00+09:00');
  const timestamps = Array.from({ length: 26 }, (_, index) => start + (index - 1) * 3_600_000);
  const snapshot = parseHourlyWeatherResponse(hourlyResponse(timestamps), hourlyRequest, now);
  assert.equal(snapshot.hours.length, 24);
  assert.equal(snapshot.hours[0].timestamp, start);
  assert.equal(snapshot.hours.at(-1).timestamp, Date.parse('2026-11-17T23:00:00+09:00'));
  assert.equal(localWeatherDate('America/Los_Angeles', snapshot.hours[0].timestamp), '2026-11-16');
  assert.equal(snapshot.date, hourlyRequest.date);
  assert.equal(snapshot.fetchedAt, now);
  assert.equal('generationtime_ms' in snapshot, false);
  assert.deepEqual(hourlyWeatherCoverage(snapshot), { expectedHours: 24, suppliedHours: 24, availableHours: 24, complete: true });
});

test('hourly days respect both DST transitions and keep repeated local hours as distinct instants', () => {
  const dstZone = 'America/New_York';
  const springStart = Date.parse('2026-03-08T00:00:00-05:00');
  const spring = Array.from({ length: 23 }, (_, index) => springStart + index * 3_600_000);
  assert.deepEqual(weatherDayHours('2026-03-08', dstZone), spring);
  const fallStart = Date.parse('2026-11-01T00:00:00-04:00');
  const fall = Array.from({ length: 25 }, (_, index) => fallStart + index * 3_600_000);
  assert.deepEqual(weatherDayHours('2026-11-01', dstZone), fall);
  const request = { ...hourlyRequest, timeZone: dstZone, date: '2026-11-01' };
  const snapshot = parseHourlyWeatherResponse(hourlyResponse(fall), request, now);
  assert.equal(hourlyWeatherCoverage(snapshot).complete, true);
  const formatter = new Intl.DateTimeFormat('en', { timeZone: dstZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZoneName: 'shortOffset' });
  assert.match(formatter.format(snapshot.hours[1].timestamp), /01:00.*GMT-4/);
  assert.match(formatter.format(snapshot.hours[2].timestamp), /01:00.*GMT-5/);
  assert.notEqual(snapshot.hours[1].timestamp, snapshot.hours[2].timestamp);
  const springSnapshot = parseHourlyWeatherResponse(hourlyResponse(spring), { ...request, date: '2026-03-08' }, now);
  assert.equal(hourlyWeatherCoverage(springSnapshot).expectedHours, 23);
  assert.equal(hourlyWeatherCoverage(springSnapshot).complete, true);
});

test('hourly missing periods are reported as partial, and null never becomes a dry zero', () => {
  const data = hourlyResponse();
  for (const values of Object.values(data.hourly)) values.splice(10, 1);
  data.hourly.precipitation_probability[0] = null;
  data.hourly.precipitation[0] = null;
  data.hourly.wind_speed_10m[0] = -3;
  const snapshot = parseHourlyWeatherResponse(data, hourlyRequest, now);
  assert.equal(snapshot.hours[0].rainProbability, null);
  assert.equal(snapshot.hours[0].precipitationMm, null);
  assert.equal(snapshot.hours[0].windMps, null);
  assert.equal(snapshot.hours[1].rainProbability, 0);
  assert.equal(snapshot.hours[1].precipitationMm, 0);
  assert.deepEqual(hourlyWeatherCoverage(snapshot), { expectedHours: 24, suppliedHours: 23, availableHours: 23, complete: false });
  const empty = hourlyResponse();
  for (const field of Object.keys(empty.hourly).filter(field => field !== 'time')) empty.hourly[field].fill(null);
  assert.equal(hasHourlyWeatherValues(parseHourlyWeatherResponse(empty, hourlyRequest, now).hours[0]), false);
  assert.equal(hasHourlyWeatherValues(snapshot.hours[1]), true);
});

test('hourly units, array lengths and absolute timestamp order are validated', () => {
  const units = hourlyResponse();
  units.hourly_units.wind_speed_10m = 'km/h';
  assert.throws(() => parseHourlyWeatherResponse(units, hourlyRequest, now), /units/);
  const incomplete = hourlyResponse();
  incomplete.hourly.temperature_2m.pop();
  assert.throws(() => parseHourlyWeatherResponse(incomplete, hourlyRequest, now), /incomplete/);
  const duplicate = hourlyResponse();
  duplicate.hourly.time[2] = duplicate.hourly.time[1];
  assert.throws(() => parseHourlyWeatherResponse(duplicate, hourlyRequest, now), /duplicate or unordered/);
  const unordered = hourlyResponse();
  [unordered.hourly.time[0], unordered.hourly.time[1]] = [unordered.hourly.time[1], unordered.hourly.time[0]];
  assert.throws(() => parseHourlyWeatherResponse(unordered, hourlyRequest, now), /duplicate or unordered/);
  const iso = hourlyResponse();
  iso.hourly.time[0] = '2026-11-17T00:00';
  assert.throws(() => parseHourlyWeatherResponse(iso, hourlyRequest, now), /Unix timestamps/);
  const milliseconds = hourlyResponse();
  milliseconds.hourly.time = milliseconds.hourly.time.map(seconds => seconds * 1000);
  assert.throws(() => parseHourlyWeatherResponse(milliseconds, hourlyRequest, now), /Unix timestamps/);
});

test('unavailable hourly dates never substitute another date or today’s data', () => {
  const differentDay = Array.from({ length: 24 }, (_, index) => Date.parse('2026-11-16T00:00:00+09:00') + index * 3_600_000);
  const snapshot = parseHourlyWeatherResponse(hourlyResponse(differentDay), hourlyRequest, now);
  assert.equal(snapshot.hours.length, 0);
  assert.equal(hourlyWeatherCoverage(snapshot).availableHours, 0);
  assert.equal(hourlyWeatherCoverage(snapshot).complete, false);
  assert.equal(forecastDateState('2026-11-18', zone, now), 'available');
  assert.equal(forecastDateState('2026-11-19', zone, now), 'future');
});

test('hourly cache freshness expires after 30 minutes or destination-local midnight', () => {
  const snapshot = parseHourlyWeatherResponse(hourlyResponse(), hourlyRequest, now);
  assert.equal(isFreshWeather(snapshot, now + WEATHER_CACHE_MS - 1), true);
  assert.equal(isFreshWeather(snapshot, now + WEATHER_CACHE_MS), false);
  const beforeMidnight = Date.parse('2026-11-03T23:55:00+09:00');
  assert.equal(isFreshWeather({ ...snapshot, fetchedAt: beforeMidnight }, Date.parse('2026-11-04T00:05:00+09:00')), false);
  assert.equal(readHourlyWeatherSnapshot(snapshot, { ...hourlyRequest, date: '2026-11-18' }, now), undefined);
  assert.equal(readHourlyWeatherSnapshot(snapshot, { ...hourlyRequest, timeZone: 'Europe/London' }, now), undefined);
});

test('failed hourly refreshes can reuse at most 24-hour valid cache, preserving retrieval time and rejecting corruption', () => {
  const snapshot = parseHourlyWeatherResponse(hourlyResponse(), hourlyRequest, now);
  const restored = readHourlyWeatherSnapshot(JSON.parse(JSON.stringify(snapshot)), hourlyRequest, now + WEATHER_STALE_MS);
  assert.equal(restored.fetchedAt, now);
  assert.equal(readHourlyWeatherSnapshot(snapshot, hourlyRequest, now + WEATHER_STALE_MS + 1), undefined);
  assert.equal(readHourlyWeatherSnapshot({ ...snapshot, fetchedAt: now + 1 }, hourlyRequest, now), undefined);
  assert.equal(readHourlyWeatherSnapshot({ ...snapshot, hours: [{}] }, hourlyRequest, now), undefined);
  const reversed = { ...snapshot, hours: [...snapshot.hours].reverse() };
  assert.equal(readHourlyWeatherSnapshot(reversed, hourlyRequest, now), undefined);
  const wrongDate = { ...snapshot, hours: [{ ...snapshot.hours[0], timestamp: Date.parse('2026-11-16T23:00:00+09:00') }] };
  assert.equal(readHourlyWeatherSnapshot(wrongDate, hourlyRequest, now), undefined);
  const invalidValues = { ...snapshot, hours: [{ ...snapshot.hours[0], precipitationMm: -1 }] };
  assert.equal(readHourlyWeatherSnapshot(invalidValues, hourlyRequest, now), undefined);
  assert.ok(readHourlyWeatherSnapshot({ ...snapshot, hours: [] }, hourlyRequest, now));
});
