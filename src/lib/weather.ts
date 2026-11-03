export const FORECAST_DAYS = 16;
export const WEATHER_CACHE_MS = 30 * 60 * 1000;
export const WEATHER_STALE_MS = 24 * 60 * 60 * 1000;

export interface WeatherLocation {
  placeId: string;
  label: string;
  lat: number;
  lng: number;
}

export interface WeatherRequest {
  lat: number;
  lng: number;
  timeZone: string;
}

export interface WeatherForecastDay {
  date: string;
  code: number | null;
  minimumC: number | null;
  maximumC: number | null;
  rainProbability: number | null;
  precipitationMm: number | null;
  windMps: number | null;
}

export interface WeatherSnapshot {
  fetchedAt: number;
  timeZone: string;
  days: WeatherForecastDay[];
}

type WeatherLocale = 'zh-CN' | 'en';
type WeatherIcon = 'sun' | 'partly-cloudy' | 'cloud' | 'fog' | 'rain' | 'snow' | 'storm';

/** Local stroke illustrations; descriptions follow the provider's WMO code table. */
export const weatherIconPaths: Record<WeatherIcon, string> = {
  sun: 'M12 2v2M12 20v2M2 12h2M20 12h2m-3-7-1.4 1.4M6.4 17.6 5 19M5 5l1.4 1.4m11.2 11.2L19 19M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  'partly-cloudy': 'M8 2v2M2 8h2m.5-4.5L6 5m6-1.5L10.5 5M5.5 11a4 4 0 1 1 6-5M7 20a4 4 0 0 1-.4-8 6 6 0 0 1 11.8 1 3.5 3.5 0 0 1-.9 7H7Z',
  cloud: 'M6 19a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.7-1.3A5 5 0 1 1 18 19H6Z',
  fog: 'M5 13a4 4 0 0 1 .4-8 5.5 5.5 0 0 1 10.7 1.7A3.3 3.3 0 0 1 19 13M3 17h18M6 21h12',
  rain: 'M5 14a4 4 0 0 1 .4-8 5.5 5.5 0 0 1 10.7 1.7A3.3 3.3 0 0 1 19 14M8 17l-1 3M13 17l-1 3M18 17l-1 3',
  snow: 'M5 13a4 4 0 0 1 .4-8 5.5 5.5 0 0 1 10.7 1.7A3.3 3.3 0 0 1 19 13M8 17v4M6 18l4 2M6 20l4-2M17 17v4M15 18l4 2M15 20l4-2',
  storm: 'M5 14a4 4 0 0 1 .4-8 5.5 5.5 0 0 1 10.7 1.7A3.3 3.3 0 0 1 19 14M13 12l-4 6h4l-2 5',
};

const descriptions: Record<number, [string, string, WeatherIcon]> = {
  0: ['晴', 'Clear', 'sun'],
  1: ['大致晴朗', 'Mainly clear', 'sun'],
  2: ['多云', 'Partly cloudy', 'partly-cloudy'],
  3: ['阴', 'Overcast', 'cloud'],
  45: ['雾', 'Fog', 'fog'],
  48: ['雾凇', 'Rime fog', 'fog'],
  51: ['小毛毛雨', 'Light drizzle', 'rain'],
  53: ['毛毛雨', 'Moderate drizzle', 'rain'],
  55: ['强毛毛雨', 'Dense drizzle', 'rain'],
  56: ['小冻毛毛雨', 'Light freezing drizzle', 'rain'],
  57: ['强冻毛毛雨', 'Dense freezing drizzle', 'rain'],
  61: ['小雨', 'Light rain', 'rain'],
  63: ['中雨', 'Moderate rain', 'rain'],
  65: ['大雨', 'Heavy rain', 'rain'],
  66: ['小冻雨', 'Light freezing rain', 'rain'],
  67: ['强冻雨', 'Heavy freezing rain', 'rain'],
  71: ['小雪', 'Light snow', 'snow'],
  73: ['中雪', 'Moderate snow', 'snow'],
  75: ['大雪', 'Heavy snow', 'snow'],
  77: ['雪粒', 'Snow grains', 'snow'],
  80: ['小阵雨', 'Light showers', 'rain'],
  81: ['阵雨', 'Moderate showers', 'rain'],
  82: ['强阵雨', 'Heavy showers', 'rain'],
  85: ['小阵雪', 'Light snow showers', 'snow'],
  86: ['强阵雪', 'Heavy snow showers', 'snow'],
  95: ['雷雨', 'Thunderstorm', 'storm'],
  96: ['雷雨伴冰雹', 'Thunderstorm with hail', 'storm'],
  99: ['强雷雨伴冰雹', 'Thunderstorm with heavy hail', 'storm'],
};

export function describeWeather(code: number | null, locale: WeatherLocale) {
  const description = code === null ? undefined : descriptions[code];
  return {
    label: description?.[locale === 'zh-CN' ? 0 : 1] ?? (locale === 'zh-CN' ? '天气概况待更新' : 'Conditions unavailable'),
    icon: description?.[2] ?? 'cloud' as WeatherIcon,
  };
}

export function localWeatherDate(timeZone: string, timestamp = Date.now()): string {
  const parts = new Intl.DateTimeFormat('en', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(timestamp);
  const value = (type: string) => parts.find(part => part.type === type)!.value;
  return value('year') + '-' + value('month') + '-' + value('day');
}

export function forecastDateState(date: string, timeZone: string, now = Date.now()): 'past' | 'future' | 'available' {
  const today = localWeatherDate(timeZone, now);
  if (date < today) return 'past';
  // This is calendar arithmetic, independent of daylight-saving day lengths.
  const lastDate = new Date(Date.parse(today + 'T00:00:00Z') + (FORECAST_DAYS - 1) * 86_400_000).toISOString().slice(0, 10);
  return date > lastDate ? 'future' : 'available';
}

export function forecastUrl(request: WeatherRequest): string {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({
    latitude: String(request.lat),
    longitude: String(request.lng),
    timezone: request.timeZone,
    forecast_days: String(FORECAST_DAYS),
    daily: 'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max,precipitation_sum,wind_speed_10m_max',
    temperature_unit: 'celsius',
    precipitation_unit: 'mm',
    wind_speed_unit: 'ms',
  }).toString();
  return url.href;
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function calendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const timestamp = Date.parse(value + 'T00:00:00Z');
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
}

function numberOrNull(value: unknown, minimum: number, maximum: number): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum ? value : null;
}

export function parseWeatherResponse(value: unknown, timeZone: string, fetchedAt: number): WeatherSnapshot {
  const response = record(value);
  const daily = record(response?.daily);
  const units = record(response?.daily_units);
  const times = daily?.time;
  if (!daily || !units || !Array.isArray(times) || !times.length || times.length > FORECAST_DAYS || !times.every(calendarDate)) {
    throw new Error('Weather provider did not return daily calendar dates');
  }
  if (new Set(times).size !== times.length || times.some((date, index) => index > 0 && date <= times[index - 1])) {
    throw new Error('Weather provider returned duplicate or unordered dates');
  }
  const fields = {
    weather_code: 'wmo code',
    temperature_2m_min: '°C',
    temperature_2m_max: '°C',
    precipitation_probability_max: '%',
    precipitation_sum: 'mm',
    wind_speed_10m_max: 'm/s',
  };
  for (const [field, unit] of Object.entries(fields)) {
    if (units[field] !== unit || !Array.isArray(daily[field]) || daily[field].length !== times.length) {
      throw new Error('Weather provider returned incomplete values or unexpected units');
    }
  }
  const at = (field: string, index: number, minimum: number, maximum: number) =>
    numberOrNull((daily[field] as unknown[])[index], minimum, maximum);
  return {
    fetchedAt,
    timeZone,
    days: times.map((date, index) => ({
      date,
      code: at('weather_code', index, 0, 999),
      minimumC: at('temperature_2m_min', index, -100, 100),
      maximumC: at('temperature_2m_max', index, -100, 100),
      rainProbability: at('precipitation_probability_max', index, 0, 100),
      precipitationMm: at('precipitation_sum', index, 0, 2000),
      windMps: at('wind_speed_10m_max', index, 0, 150),
    })),
  };
}

export function hasWeatherValues(day: WeatherForecastDay): boolean {
  return [day.code, day.minimumC, day.maximumC, day.rainProbability, day.precipitationMm, day.windMps].some(value => value !== null);
}

export function isFreshWeather(snapshot: WeatherSnapshot, now = Date.now()): boolean {
  return now >= snapshot.fetchedAt && now - snapshot.fetchedAt < WEATHER_CACHE_MS
    && localWeatherDate(snapshot.timeZone, snapshot.fetchedAt) === localWeatherDate(snapshot.timeZone, now);
}

export function readWeatherSnapshot(value: unknown, timeZone: string, now = Date.now()): WeatherSnapshot | undefined {
  const snapshot = record(value);
  if (!snapshot || snapshot.timeZone !== timeZone || typeof snapshot.fetchedAt !== 'number'
    || !Number.isFinite(snapshot.fetchedAt) || snapshot.fetchedAt > now || now - snapshot.fetchedAt > WEATHER_STALE_MS
    || !Array.isArray(snapshot.days) || !snapshot.days.length || snapshot.days.length > FORECAST_DAYS) return;
  const fields = ['code', 'minimumC', 'maximumC', 'rainProbability', 'precipitationMm', 'windMps'];
  if (!snapshot.days.every(day => {
    const item = record(day);
    return item && calendarDate(item.date) && fields.every(field => item[field] === null || typeof item[field] === 'number' && Number.isFinite(item[field]));
  })) return;
  const normalized = snapshot as unknown as WeatherSnapshot;
  if (new Set(normalized.days.map(day => day.date)).size !== normalized.days.length) return;
  return normalized;
}
