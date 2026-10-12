import { describe, expect, it } from 'vitest';
import { format, lookup } from '@/lib/i18n/messages-core';
import { initials, parseUserAgent } from './utils';

describe('initials', () => {
  it.each([['Jasur Karimov', 'JK'], ['jasur', 'J'], ['  Ali   Vali  Soliyev ', 'AS'], ['', '?']])('%s -> %s', (i, o) => expect(initials(i)).toBe(o));
});

describe('parseUserAgent', () => {
  it('brauzer va OT', () => {
    expect(parseUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36')).toEqual({ browser: 'Chrome', os: 'Windows' });
    expect(parseUserAgent('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/126.0 Safari/537.36 Edg/126.0')).toEqual({ browser: 'Edge', os: 'Windows' });
    expect(parseUserAgent('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36')).toEqual({ browser: 'Chrome', os: 'Android' });
    expect(parseUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Version/17.5 Mobile Safari/604.1')).toEqual({ browser: 'Safari', os: 'iOS' });
    expect(parseUserAgent('')).toBeNull();
  });
});

describe('i18n yordamchilari', () => {
  const dict = { a: { b: 'Salom, {name}!' } };
  it('lookup va format', () => {
    expect(lookup(dict, 'a.b')).toBe('Salom, {name}!');
    expect(lookup(dict, 'a.x')).toBeUndefined();
    expect(lookup(dict, 'a')).toBeUndefined(); // oraliq tugun matn emas
    expect(format('Salom, {name}!', { name: 'Ali' })).toBe('Salom, Ali!');
    expect(format('{x}')).toBe('{x}');
  });
});
