import {
  describeWeather, forecastDateState, forecastUrl, hasWeatherValues, isFreshWeather,
  parseWeatherResponse, readWeatherSnapshot, weatherIconPaths,
  hourlyForecastUrl, parseHourlyWeatherResponse, hasHourlyWeatherValues, hourlyWeatherCoverage, readHourlyWeatherSnapshot,
  type WeatherLocation, type WeatherRequest, type WeatherSnapshot,
  type WeatherHourlyRequest, type WeatherHourlySnapshot, type WeatherForecastHour,
} from '../lib/weather';

interface DayWeatherConfig {
  date: string;
  timeZone: string;
  locale: 'zh-CN' | 'en';
  locations: WeatherLocation[];
}

const CACHE_PREFIX = 'journeyAtlas.weather.v1.';
const memory = new Map<string, WeatherSnapshot>();
const pending = new Map<string, Promise<WeatherSnapshot>>();
const failures = new Map<string, number>();
const lastRequests = new Map<string, number>();
const HOURLY_CACHE_PREFIX = 'journeyAtlas.weather.hourly.v1.';
const hourlyMemory = new Map<string, WeatherHourlySnapshot>();
const hourlyPending = new Map<string, Promise<WeatherHourlySnapshot>>();
const hourlyFailures = new Map<string, number>();
const lastHourlyRequests = new Map<string, number>();
let printing = false;

const keyFor = (request: WeatherRequest) => CACHE_PREFIX + request.lat + ',' + request.lng + '.' + request.timeZone;

function cachedForecast(request: WeatherRequest): WeatherSnapshot | undefined {
  const key = keyFor(request);
  const existing = readWeatherSnapshot(memory.get(key), request.timeZone);
  if (existing) return existing;
  memory.delete(key);
  try {
    const stored = readWeatherSnapshot(JSON.parse(localStorage.getItem(key) ?? 'null'), request.timeZone);
    if (stored) { memory.set(key, stored); return stored; }
    localStorage.removeItem(key);
  } catch { /* Storage may be unavailable; the current page still uses memory. */ }
}

function storeForecast(request: WeatherRequest, snapshot: WeatherSnapshot) {
  const key = keyFor(request);
  memory.set(key, snapshot);
  try {
    localStorage.setItem(key, JSON.stringify(snapshot));
    const ownedKeys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .filter((item): item is string => Boolean(item?.startsWith(CACHE_PREFIX)));
    for (const item of ownedKeys) {
      if (item === key) continue;
      const cached: unknown = JSON.parse(localStorage.getItem(item) ?? 'null');
      const zone = cached && typeof cached === 'object' ? (cached as Record<string, unknown>).timeZone : undefined;
      if (typeof zone !== 'string' || !readWeatherSnapshot(cached, zone)) localStorage.removeItem(item);
    }
  } catch { /* Forecasts work without persistent browser storage. */ }
}

async function fetchForecast(request: WeatherRequest, force: boolean): Promise<WeatherSnapshot> {
  const key = keyFor(request);
  const cached = cachedForecast(request);
  if (cached && isFreshWeather(cached) && !failures.has(key) && !force) return cached;
  const current = pending.get(key);
  if (current) return current;
  if (!force && (failures.get(key) ?? 0) > Date.now()) throw new Error('Weather retry is cooling down');
  if (cached && !failures.has(key) && Date.now() - (lastRequests.get(key) ?? 0) < 10_000) return cached;
  lastRequests.set(key, Date.now());
  const promise = (async () => {
    const abort = new AbortController();
    const timeout = window.setTimeout(() => abort.abort(), 12_000);
    try {
      // Send public coordinates and forecast options only, without cookies or a trip-page referrer.
      const response = await fetch(forecastUrl(request), {
        mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store',
        headers: { Accept: 'application/json' }, signal: abort.signal,
      });
      if (!response.ok) throw new Error('Weather request failed');
      const snapshot = parseWeatherResponse(await response.json(), request.timeZone, Date.now());
      storeForecast(request, snapshot);
      failures.delete(key);
      return snapshot;
    } catch (error) {
      failures.set(key, Date.now() + 60_000);
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  })();
  pending.set(key, promise);
  try { return await promise; }
  finally { pending.delete(key); }
}

const hourlyKeyFor = (request: WeatherHourlyRequest) =>
  HOURLY_CACHE_PREFIX + request.lat + ',' + request.lng + '.' + request.timeZone + '.' + request.date;

function cachedHourlyForecast(request: WeatherHourlyRequest): WeatherHourlySnapshot | undefined {
  const key = hourlyKeyFor(request);
  const existing = readHourlyWeatherSnapshot(hourlyMemory.get(key), request);
  if (existing) return existing;
  hourlyMemory.delete(key);
  try {
    const stored = readHourlyWeatherSnapshot(JSON.parse(localStorage.getItem(key) ?? 'null'), request);
    if (stored) { hourlyMemory.set(key, stored); return stored; }
    localStorage.removeItem(key);
  } catch { /* Hourly forecasts also work when persistent storage is unavailable. */ }
}

function storeHourlyForecast(request: WeatherHourlyRequest, snapshot: WeatherHourlySnapshot) {
  const key = hourlyKeyFor(request);
  hourlyMemory.set(key, snapshot);
  try {
    localStorage.setItem(key, JSON.stringify(snapshot));
    const ownedKeys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .filter((item): item is string => Boolean(item?.startsWith(HOURLY_CACHE_PREFIX)));
    for (const item of ownedKeys) {
      if (item === key) continue;
      const stored: unknown = JSON.parse(localStorage.getItem(item) ?? 'null');
      const metadata = stored && typeof stored === 'object' ? stored as Record<string, unknown> : undefined;
      if (typeof metadata?.timeZone !== 'string' || typeof metadata.date !== 'string'
        || !readHourlyWeatherSnapshot(stored, { lat: 0, lng: 0, timeZone: metadata.timeZone, date: metadata.date })) localStorage.removeItem(item);
    }
  } catch { /* Purge only this feature's cache; other browser storage stays untouched. */ }
}

async function fetchHourlyForecast(request: WeatherHourlyRequest, force: boolean): Promise<WeatherHourlySnapshot> {
  const key = hourlyKeyFor(request);
  const cached = cachedHourlyForecast(request);
  if (cached && isFreshWeather(cached) && !hourlyFailures.has(key) && !force) return cached;
  const current = hourlyPending.get(key);
  if (current) return current;
  if (!force && (hourlyFailures.get(key) ?? 0) > Date.now()) throw new Error('Hourly weather retry is cooling down');
  if (cached && !hourlyFailures.has(key) && Date.now() - (lastHourlyRequests.get(key) ?? 0) < 10_000) return cached;
  lastHourlyRequests.set(key, Date.now());
  const promise = (async () => {
    const abort = new AbortController();
    const timeout = window.setTimeout(() => abort.abort(), 12_000);
    try {
      // Hourly data is requested separately, only after opening that location's disclosure.
      const response = await fetch(hourlyForecastUrl(request), {
        mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store',
        headers: { Accept: 'application/json' }, signal: abort.signal,
      });
      if (!response.ok) throw new Error('Hourly weather request failed');
      const snapshot = parseHourlyWeatherResponse(await response.json(), request, Date.now());
      storeHourlyForecast(request, snapshot);
      hourlyFailures.delete(key);
      return snapshot;
    } catch (error) {
      hourlyFailures.set(key, Date.now() + 60_000);
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  })();
  hourlyPending.set(key, promise);
  try { return await promise; }
  finally { hourlyPending.delete(key); }
}

class WeatherReading {
  private request: WeatherRequest;
  private condition: HTMLElement;
  private temperature: HTMLElement;
  private metrics: HTMLElement;
  private icon: SVGElement;
  private symbol: HTMLElement;
  private notice: HTMLElement;
  private retrieved: HTMLElement;
  private updated: HTMLTimeElement;
  private precipitation?: HTMLElement;
  private precipitationLine?: HTMLElement;

  constructor(private element: HTMLElement, panel: HTMLElement, private config: DayWeatherConfig, location: WeatherLocation, primary: boolean) {
    this.request = { lat: location.lat, lng: location.lng, timeZone: config.timeZone };
    this.condition = element.querySelector('[data-weather-condition]')!;
    this.temperature = element.querySelector('[data-weather-temperature]')!;
    this.metrics = element.querySelector('[data-weather-metrics]')!;
    this.icon = element.querySelector('[data-weather-icon]')!;
    this.symbol = element.querySelector('[data-weather-symbol]')!;
    this.notice = element.querySelector('[data-weather-notice]')!;
    this.retrieved = (primary ? panel.querySelector('.weather-credit [data-weather-retrieved]') : element.querySelector('[data-weather-retrieved]'))!;
    this.updated = this.retrieved.querySelector('[data-weather-updated]')!;
    this.precipitationLine = primary ? panel.querySelector<HTMLElement>('[data-weather-total-rain]') ?? undefined : undefined;
    this.precipitation = (primary ? this.precipitationLine?.querySelector<HTMLElement>('[data-weather-precipitation]') : element.querySelector<HTMLElement>('[data-weather-precipitation]')) ?? undefined;
    this.showCalendarState();
  }

  private text(zh: string, en: string) { return this.config.locale === 'zh-CN' ? zh : en; }
  private number(value: number, maximumFractionDigits = 1) {
    const normalized = Math.abs(value) < 0.5 / 10 ** maximumFractionDigits ? 0 : value;
    return new Intl.NumberFormat(this.config.locale, { maximumFractionDigits }).format(normalized);
  }

  private empty(state: string, message: string) {
    this.element.dataset.weatherState = state;
    this.element.setAttribute('aria-busy', 'false');
    this.condition.textContent = message;
    this.temperature.hidden = true;
    this.metrics.hidden = true;
    this.symbol.hidden = true;
    this.notice.hidden = true;
    this.retrieved.hidden = true;
    if (this.precipitationLine) this.precipitationLine.hidden = true;
  }

  showCalendarState(): boolean {
    const state = forecastDateState(this.config.date, this.config.timeZone);
    if (state === 'past') {
      this.empty('past', this.text('此日期已过去，不再显示实时预报。', 'This date has passed; live forecasts are no longer shown.'));
    } else if (state === 'future') {
      this.empty('future', this.text('尚未进入16天预报范围，临近时自动显示。', 'Outside the 16-day forecast window. It will appear closer to the date.'));
    }
    return state === 'available';
  }

  private render(snapshot: WeatherSnapshot, state: 'fresh' | 'refreshing' | 'stale') {
    const day = snapshot.days.find(item => item.date === this.config.date);
    if (!day || !hasWeatherValues(day)) {
      this.empty('unavailable', this.text('这一天的预报暂未提供，稍后再查看。', 'The forecast for this date is not available yet. Check again later.'));
      return;
    }
    this.element.dataset.weatherState = state;
    this.element.setAttribute('aria-busy', state === 'refreshing' ? 'true' : 'false');
    const weather = describeWeather(day.code, this.config.locale);
    this.condition.textContent = weather.label;
    this.icon.querySelector('path')!.setAttribute('d', weatherIconPaths[weather.icon]);
    this.icon.dataset.weatherKind = weather.icon;
    this.symbol.hidden = day.code === null;
    const low = day.minimumC === null ? undefined : this.number(Math.round(day.minimumC), 0);
    const high = day.maximumC === null ? undefined : this.number(Math.round(day.maximumC), 0);
    this.temperature.textContent = low !== undefined && high !== undefined ? low + '–' + high + ' °C'
      : low !== undefined ? this.text('最低 ', 'Low ') + low + ' °C'
      : high !== undefined ? this.text('最高 ', 'High ') + high + ' °C' : '';
    this.temperature.hidden = !this.temperature.textContent;
    this.temperature.setAttribute('aria-label', this.text('当天最低和最高气温：', 'Daily low and high: ') + this.temperature.textContent);
    this.metrics.hidden = false;
    this.element.querySelector('[data-weather-rain]')!.textContent = day.rainProbability === null ? this.text('暂无', 'Unavailable') : this.number(day.rainProbability, 0) + '%';
    this.element.querySelector('[data-weather-wind]')!.textContent = day.windMps === null ? this.text('暂无', 'Unavailable') : this.number(day.windMps) + ' m/s';
    if (this.precipitation) this.precipitation.textContent = day.precipitationMm === null ? this.text('暂无', 'Unavailable') : this.number(day.precipitationMm) + ' mm';
    if (this.precipitationLine) this.precipitationLine.hidden = day.precipitationMm === null;
    const formatter = new Intl.DateTimeFormat(this.config.locale === 'zh-CN' ? 'zh-CN' : 'en', {
      timeZone: this.config.timeZone, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
      ...(this.config.timeZone === 'Asia/Tokyo' ? {} : { timeZoneName: 'short' as const }),
    });
    this.updated.textContent = formatter.format(snapshot.fetchedAt)
      + (this.config.timeZone === 'Asia/Tokyo' ? this.text(' 日本时间', ' JST') : '');
    this.updated.dateTime = new Date(snapshot.fetchedAt).toISOString();
    this.retrieved.hidden = false;
    this.notice.textContent = state === 'stale'
      ? this.text('暂时无法更新，显示上次获取的缓存预报。', 'Unable to update; showing the previously retrieved cached forecast.')
      : state === 'refreshing' ? this.text('正在获取最新预报…', 'Updating the forecast…') : '';
    this.notice.hidden = state === 'fresh';
  }

  async update(force: boolean) {
    if (!this.showCalendarState()) return;
    const cached = cachedForecast(this.request);
    if (cached && isFreshWeather(cached) && !failures.has(keyFor(this.request)) && !force) { this.render(cached, 'fresh'); return; }
    const previousDay = cached?.days.find(day => day.date === this.config.date);
    if (cached && previousDay && hasWeatherValues(previousDay)) this.render(cached, 'refreshing');
    else this.empty('loading', this.text('正在获取天气预报…', 'Loading the weather forecast…'));
    this.element.setAttribute('aria-busy', 'true');
    try {
      const snapshot = await fetchForecast(this.request, force);
      if (isPrinting()) return;
      // A destination-local midnight may have passed while the request was in flight.
      if (this.showCalendarState()) this.render(snapshot, 'fresh');
    } catch {
      if (isPrinting()) return;
      if (!this.showCalendarState()) return;
      const fallback = cachedForecast(this.request);
      const fallbackDay = fallback?.days.find(day => day.date === this.config.date);
      if (fallback && fallbackDay && hasWeatherValues(fallbackDay)) this.render(fallback, 'stale');
      else this.empty('error', this.text('暂时无法获取预报，可点击刷新重试。', 'Unable to load the forecast. Use refresh to retry.'));
    } finally {
      if (!isPrinting()) this.element.setAttribute('aria-busy', 'false');
    }
  }
}

class HourlyWeatherReading {
  private request: WeatherHourlyRequest;
  private element: HTMLElement;
  private status: HTMLElement;
  private notice: HTMLElement;
  private scroll: HTMLElement;
  private scrollHint: HTMLElement;
  private rows: HTMLTableSectionElement;
  private retrieved: HTMLElement;
  private updated: HTMLTimeElement;
  private renderedAt?: number;

  constructor(readonly details: HTMLDetailsElement, private config: DayWeatherConfig, location: WeatherLocation, private canRefresh: () => boolean) {
    this.request = { lat: location.lat, lng: location.lng, timeZone: config.timeZone, date: config.date };
    this.element = details.querySelector('[data-weather-hourly-reading]')!;
    this.status = details.querySelector('[data-weather-hourly-status]')!;
    this.notice = details.querySelector('[data-weather-hourly-notice]')!;
    this.scroll = details.querySelector('[data-weather-hourly-scroll]')!;
    this.scrollHint = details.querySelector('[data-weather-hourly-scroll-hint]')!;
    this.rows = details.querySelector('[data-weather-hourly-rows]')!;
    this.retrieved = details.querySelector('[data-weather-hourly-retrieved]')!;
    this.updated = details.querySelector('[data-weather-hourly-updated]')!;
    this.showCalendarState();
  }

  private text(zh: string, en: string) { return this.config.locale === 'zh-CN' ? zh : en; }
  private number(value: number, maximumFractionDigits = 1) {
    const normalized = Math.abs(value) < 0.5 / 10 ** maximumFractionDigits ? 0 : value;
    return new Intl.NumberFormat(this.config.locale, { maximumFractionDigits }).format(normalized);
  }
  private isActive() { return this.details.open && this.canRefresh() && !isPrinting(); }

  private empty(state: string, message: string) {
    this.element.dataset.weatherHourlyState = state;
    this.element.setAttribute('aria-busy', 'false');
    this.status.textContent = message;
    this.notice.hidden = true;
    this.scroll.hidden = true;
    this.scrollHint.hidden = true;
    this.retrieved.hidden = true;
    this.renderedAt = undefined;
  }

  private showCalendarState(): boolean {
    const state = forecastDateState(this.config.date, this.config.timeZone);
    if (state === 'past') this.empty('past', this.text('此日期已过去，不再显示逐小时预报。', 'This date has passed; hourly forecasts are no longer shown.'));
    else if (state === 'future') this.empty('future', this.text('尚未进入16天预报范围；临近时展开即可查看。', 'Outside the 16-day forecast window. Open closer to the date to check.'));
    return state === 'available';
  }

  private makeRow(hour: WeatherForecastHour, formatter: Intl.DateTimeFormat) {
    const row = document.createElement('tr');
    const timeCell = document.createElement('td');
    const time = document.createElement('time');
    time.dateTime = new Date(hour.timestamp).toISOString();
    const parts = formatter.formatToParts(hour.timestamp);
    const clock = document.createElement('span');
    clock.textContent = parts.find(part => part.type === 'hour')!.value + ':' + parts.find(part => part.type === 'minute')!.value;
    const offset = document.createElement('small');
    offset.textContent = parts.find(part => part.type === 'timeZoneName')!.value;
    time.append(clock, offset);
    timeCell.append(time);
    row.append(timeCell);
    const conditionCell = document.createElement('td');
    const condition = document.createElement('span');
    condition.className = 'hourly-condition';
    const weather = describeWeather(hour.code, this.config.locale);
    if (weather.known) {
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      for (const [attribute, value] of Object.entries({ width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' })) icon.setAttribute(attribute, value);
      icon.dataset.weatherKind = weather.icon;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', weatherIconPaths[weather.icon]);
      icon.append(path);
      condition.append(icon);
    }
    const label = document.createElement('span');
    label.textContent = weather.known ? weather.label : this.text('暂无概况', 'Unavailable');
    condition.append(label);
    conditionCell.append(condition);
    row.append(conditionCell);
    const measurements: [number | null, string, number][] = [
      [hour.temperatureC, ' °C', 0], [hour.rainProbability, '%', 0],
      [hour.precipitationMm, ' mm', 1], [hour.windMps, ' m/s', 1],
    ];
    for (const [value, unit, digits] of measurements) {
      const cell = document.createElement('td');
      cell.textContent = value === null ? '—' : this.number(value, digits) + unit;
      if (value === null) cell.setAttribute('aria-label', this.text('暂无数据', 'Data unavailable'));
      row.append(cell);
    }
    return row;
  }

  private render(snapshot: WeatherHourlySnapshot, state: 'fresh' | 'refreshing' | 'stale') {
    const coverage = hourlyWeatherCoverage(snapshot);
    if (!coverage.availableHours) {
      this.empty('unavailable', this.text('这一天的逐小时预报暂未提供，稍后再查看。', 'Hourly data for this date is not available yet. Check again later.'));
      return;
    }
    this.element.dataset.weatherHourlyState = state;
    this.element.setAttribute('aria-busy', state === 'refreshing' ? 'true' : 'false');
    this.status.textContent = coverage.complete
      ? this.text('全天 ' + coverage.suppliedHours + ' 个小时，时间均为当地时间。', coverage.suppliedHours + ' hours for the full day, in destination-local time.')
      : coverage.suppliedHours < coverage.expectedHours
        ? this.text('已提供 ' + coverage.suppliedHours + '/' + coverage.expectedHours + ' 个时段，其他时段暂缺。', coverage.suppliedHours + '/' + coverage.expectedHours + ' periods available; other periods are missing.')
        : this.text('目前提供 ' + coverage.suppliedHours + ' 个时段，尚未覆盖完整当地当天。', coverage.suppliedHours + ' periods available; coverage of the destination-local day is incomplete.');
    if (this.renderedAt !== snapshot.fetchedAt) {
      const formatter = new Intl.DateTimeFormat(this.config.locale, {
        timeZone: this.config.timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZoneName: 'shortOffset',
      });
      const fragment = document.createDocumentFragment();
      snapshot.hours.forEach(hour => fragment.append(this.makeRow(hour, formatter)));
      this.rows.replaceChildren(fragment);
      this.renderedAt = snapshot.fetchedAt;
    }
    this.scroll.hidden = false;
    this.scrollHint.hidden = false;
    const formatter = new Intl.DateTimeFormat(this.config.locale, {
      timeZone: this.config.timeZone, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
      ...(this.config.timeZone === 'Asia/Tokyo' ? {} : { timeZoneName: 'short' as const }),
    });
    this.updated.textContent = formatter.format(snapshot.fetchedAt) + (this.config.timeZone === 'Asia/Tokyo' ? this.text(' 日本时间', ' JST') : '');
    this.updated.dateTime = new Date(snapshot.fetchedAt).toISOString();
    this.retrieved.hidden = false;
    this.notice.textContent = state === 'stale'
      ? this.text('暂时无法更新，显示上次获取的逐小时缓存预报（不超过24小时）。', 'Unable to update; showing the previously retrieved hourly cache, at most 24 hours old.')
      : state === 'refreshing' ? this.text('正在获取最新逐小时预报…', 'Updating the hourly forecast…') : '';
    this.notice.hidden = state === 'fresh';
  }

  async update(force: boolean) {
    if (!this.isActive() || !this.showCalendarState()) return;
    const key = hourlyKeyFor(this.request);
    const cached = cachedHourlyForecast(this.request);
    if (cached && isFreshWeather(cached) && !hourlyFailures.has(key) && !force) { this.render(cached, 'fresh'); return; }
    if (cached?.hours.some(hasHourlyWeatherValues)) this.render(cached, 'refreshing');
    else this.empty('loading', this.text('正在获取逐小时预报…', 'Loading the hourly forecast…'));
    this.element.setAttribute('aria-busy', 'true');
    try {
      const snapshot = await fetchHourlyForecast(this.request, force);
      // Closed days, closed disclosures and printing retain their current snapshot.
      if (!this.isActive()) return;
      if (this.showCalendarState()) this.render(snapshot, 'fresh');
    } catch {
      if (!this.isActive() || !this.showCalendarState()) return;
      const fallback = cachedHourlyForecast(this.request);
      if (fallback?.hours.some(hasHourlyWeatherValues)) this.render(fallback, 'stale');
      else this.empty('error', this.text('暂时无法获取逐小时预报，可用上方刷新按钮重试。', 'Unable to load hourly data. Use the refresh button above to retry.'));
    } finally {
      if (this.isActive()) this.element.setAttribute('aria-busy', 'false');
    }
  }
}

function isPrinting() {
  return printing || window.matchMedia('print').matches || Boolean(document.querySelector('[data-itinerary-printing]'));
}

class DailyWeather {
  private readings: WeatherReading[] = [];
  private hourlyReadings: HourlyWeatherReading[] = [];
  private details: HTMLDetailsElement;
  private refreshButton: HTMLButtonElement;
  private busy = false;
  private queued = false;
  private queuedForce = false;

  constructor(readonly element: HTMLElement, private config: DayWeatherConfig) {
    this.details = element.querySelector('[data-weather-details]')!;
    this.refreshButton = element.querySelector('[data-weather-refresh]')!;
    const elements = [...element.querySelectorAll<HTMLElement>('[data-weather-reading]')];
    this.readings = config.locations.map((location, index) => {
      const reading = elements.find(item => item.dataset.weatherReading === location.placeId)!;
      return new WeatherReading(reading, element, config, location, index === 0);
    });
    const hourlyDetails = [...element.querySelectorAll<HTMLDetailsElement>('[data-weather-hourly]')];
    this.hourlyReadings = config.locations.map((location, index) => {
      const details = hourlyDetails.find(item => item.dataset.weatherHourly === location.placeId)!;
      details.addEventListener('toggle', () => { if (details.open) void this.refresh(); });
      return new HourlyWeatherReading(details, config, location, () => this.canRefresh() && (index === 0 || this.details.open));
    });
    this.refreshButton.hidden = forecastDateState(config.date, config.timeZone) !== 'available';
    this.refreshButton.addEventListener('click', () => { void this.refresh(true); });
    this.details.addEventListener('toggle', () => { if (this.details.open) void this.refresh(); });
    element.dataset.weatherReady = 'true';
  }

  private canRefresh(): boolean {
    if (isPrinting() || document.hidden) return false;
    // Let focused-day/history restoration finish before loading the initial server-rendered day.
    if (!this.element.closest('[data-itinerary-ready]')) return false;
    const day = this.element.closest<HTMLDetailsElement>('.itinerary-day');
    const bounds = this.element.getBoundingClientRect();
    return Boolean(day?.open && !day.hidden && bounds.width > 0 && bounds.height > 0 && bounds.bottom > 0 && bounds.top < window.innerHeight);
  }

  async refresh(force = false) {
    if (!this.canRefresh()) return;
    if (this.busy) { this.queued = true; this.queuedForce ||= force; return; }
    this.refreshButton.hidden = forecastDateState(this.config.date, this.config.timeZone) !== 'available';
    this.busy = true;
    this.refreshButton.disabled = true;
    try {
      await Promise.all([
        ...this.readings.filter((_, index) => index === 0 || this.details.open).map(reading => reading.update(force)),
        ...this.hourlyReadings.filter((reading, index) => reading.details.open && (index === 0 || this.details.open)).map(reading => reading.update(force)),
      ]);
    } finally {
      this.refreshButton.disabled = false;
      this.busy = false;
      if (this.queued) {
        const queuedForce = this.queuedForce;
        this.queued = false;
        this.queuedForce = false;
        void this.refresh(queuedForce);
      }
    }
  }
}

const controllers: DailyWeather[] = [];
document.querySelectorAll<HTMLElement>('[data-day-weather]').forEach(element => {
  try {
    const config = JSON.parse(element.dataset.dayWeather!) as DayWeatherConfig;
    if (config.date && config.timeZone && config.locations?.length) controllers.push(new DailyWeather(element, config));
  } catch { /* Keep the native reading/source fallback if configuration cannot be read. */ }
});

if (controllers.length) {
  const refreshVisible = (force = false) => controllers.forEach(controller => { void controller.refresh(force); });
  let frame: number | undefined;
  const scheduleRefresh = () => {
    if (frame !== undefined) return;
    frame = window.requestAnimationFrame(() => { frame = undefined; refreshVisible(); });
  };
  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) void controllers.find(controller => controller.element === entry.target)?.refresh(); });
    });
    controllers.forEach(controller => observer.observe(controller.element));
  } else window.addEventListener('scroll', scheduleRefresh, { passive: true });
  const mutations = new MutationObserver(scheduleRefresh);
  document.querySelectorAll('.itinerary-day').forEach(day => mutations.observe(day, { attributes: true, attributeFilter: ['open', 'hidden'] }));
  document.querySelectorAll('[data-trip-itinerary]').forEach(itinerary => mutations.observe(itinerary, {
    attributes: true, attributeFilter: ['data-itinerary-ready', 'data-itinerary-mode', 'data-itinerary-printing'],
  }));
  window.addEventListener('resize', scheduleRefresh);
  window.addEventListener('pageshow', scheduleRefresh);
  window.addEventListener('online', () => refreshVisible(true));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleRefresh(); });
  window.setInterval(() => { if (!document.hidden && !isPrinting()) refreshVisible(); }, 60_000);
  window.addEventListener('beforeprint', () => { printing = true; });
  window.addEventListener('afterprint', () => { printing = false; scheduleRefresh(); });
  scheduleRefresh();
}
