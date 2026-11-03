import assert from 'node:assert/strict';
import test from 'node:test';
import {
  describeWeather, forecastDateState, forecastUrl, hasWeatherValues, isFreshWeather,
  localWeatherDate, parseWeatherResponse, readWeatherSnapshot, WEATHER_CACHE_MS, WEATHER_STALE_MS,
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
