import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MAINTENANCE, SESSION_ENDED, __test, api, buildUrl, sessionEvents } from './client';
import { ApiError } from './errors';

const ok = (data: unknown = null, meta: object = {}) =>
  new Response(JSON.stringify({ success: true, data, message: 'OK', meta }), { status: 200 });
const fail = (status: number, code: string, details: object = {}) =>
  new Response(JSON.stringify({ success: false, error: { code, message: code, details } }), { status });

let fetchMock: ReturnType<typeof vi.fn>;
let ended: number;
const onEnded = () => { ended++; };

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
  __test.reset();
  ended = 0;
  sessionEvents.removeEventListener(SESSION_ENDED, onEnded);
  sessionEvents.addEventListener(SESSION_ENDED, onEnded);
});

const refreshCalls = () => fetchMock.mock.calls.filter(([u]) => String(u).endsWith('/auth/refresh')).length;

/** Har URL birinchi marta 401 TOKEN_EXPIRED, keyin muvaffaqiyat; refresh `refresh()` natijasini beradi. */
function expiringApi(refresh: () => Response | Promise<Response> = () => ok()) {
  const seen = new Set<string>();
  fetchMock.mockImplementation(async (url: string) => {
    if (String(url).endsWith('/auth/refresh')) return refresh();
    if (!seen.has(String(url))) { seen.add(String(url)); return fail(401, 'TOKEN_EXPIRED'); }
    return ok({ url });
  });
}

describe('api client', () => {
  it('data ni ochib beradi va cookie yuboradi', async () => {
    fetchMock.mockResolvedValueOnce(ok({ a: 1 }));
    expect(await api.get('/x')).toEqual({ a: 1 });
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/x', expect.objectContaining({ method: 'GET', credentials: 'include' }));
  });

  it('getPage items va meta ni qaytaradi', async () => {
    fetchMock.mockResolvedValueOnce(ok([{ id: 1 }], { page: 2, total: 5 }));
    expect(await api.getPage('/list')).toEqual({ items: [{ id: 1 }], meta: { page: 2, total: 5 } });
  });

  it('buildUrl: bo‘sh qiymatlarni tashlaydi, massivlarni vergul bilan beradi', () => {
    expect(buildUrl('/s', { q: 'kasr', types: ['LESSON', 'QUIZ'], empty: '', none: undefined, nul: null, zero: 0, off: false, arr: [] }))
      .toBe('/api/v1/s?q=kasr&types=LESSON%2CQUIZ&zero=0&off=false');
  });

  it('TOKEN_EXPIRED: bir marta yangilab, so‘rovni qayta yuboradi', async () => {
    expiringApi();
    expect(await api.get('/lessons')).toEqual({ url: '/api/v1/lessons' });
    expect(refreshCalls()).toBe(1);
    expect(ended).toBe(0);
  });

  it('parallel 401 lar uchun bitta refresh', async () => {
    expiringApi(async () => { await new Promise((r) => setTimeout(r, 15)); return ok(); });
    const res = await Promise.all([api.get('/a'), api.get('/b'), api.get('/c')]);
    expect(res).toHaveLength(3);
    expect(refreshCalls()).toBe(1);
  });

  it('REFRESH_RACE muvaffaqiyat hisoblanadi', async () => {
    expiringApi(() => fail(401, 'REFRESH_RACE'));
    await expect(api.get('/lessons')).resolves.toBeTruthy();
    expect(ended).toBe(0);
  });

  it('refresh yaroqsiz bo‘lsa: sessiya tugadi hodisasi va 401 xato', async () => {
    expiringApi(() => fail(401, 'INVALID_REFRESH_TOKEN'));
    await expect(api.get('/lessons')).rejects.toMatchObject({ status: 401, code: 'TOKEN_EXPIRED' });
    expect(ended).toBe(1);
  });

  it('bloklangan foydalanuvchi (refresh 403): sessiya tugaydi', async () => {
    expiringApi(() => fail(403, 'ACCOUNT_BANNED'));
    await expect(api.get('/lessons')).rejects.toBeInstanceOf(ApiError);
    expect(ended).toBe(1);
  });

  it('SESSION_REVOKED: refresh urinmaydi, darhol tugaydi', async () => {
    fetchMock.mockResolvedValue(fail(401, 'SESSION_REVOKED'));
    await expect(api.get('/lessons')).rejects.toMatchObject({ code: 'SESSION_REVOKED' });
    expect(refreshCalls()).toBe(0);
    expect(ended).toBe(1);
  });

  it('login xatosi (401) refresh va hodisani ishga tushirmaydi', async () => {
    fetchMock.mockResolvedValue(fail(401, 'INVALID_CREDENTIALS'));
    await expect(api.post('/auth/login', { identifier: 'a', password: 'b' })).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(ended).toBe(0);
  });

  it('tarmoq xatosi: NETWORK_ERROR, sessiya saqlanadi', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(api.get('/x')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' });
    expect(ended).toBe(0);
  });

  it('refresh paytida tarmoq yoki 5xx xatosi sessiyani tugatmaydi', async () => {
    expiringApi(() => fail(500, 'INTERNAL_ERROR'));
    await expect(api.get('/lessons')).rejects.toMatchObject({ status: 500 });
    expect(ended).toBe(0);
  });

  it('JSON bo‘lmagan javob (proxy 502): HTTP_502', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Bad Gateway</html>', { status: 502 }));
    await expect(api.get('/x')).rejects.toMatchObject({ status: 502, code: 'HTTP_502' });
  });

  it('MAINTENANCE hodisasini yuboradi', async () => {
    const spy = vi.fn();
    sessionEvents.addEventListener(MAINTENANCE, spy);
    fetchMock.mockResolvedValue(fail(503, 'MAINTENANCE'));
    await expect(api.get('/x')).rejects.toMatchObject({ code: 'MAINTENANCE' });
    expect(spy).toHaveBeenCalledTimes(1);
    sessionEvents.removeEventListener(MAINTENANCE, spy);
  });

  it('FormData uchun Content-Type o‘rnatilmaydi (brauzer boundary qo‘shadi)', async () => {
    fetchMock.mockResolvedValueOnce(ok({ id: 1 }));
    const form = new FormData();
    form.append('purpose', 'HOMEWORK');
    await api.upload('/files', form);
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.body).toBe(form);
    expect((init.headers as Record<string, string>)['Content-Type']).toBeUndefined();
  });
});
