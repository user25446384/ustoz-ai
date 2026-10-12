import { describe, expect, it } from 'vitest';
import { buildTree, dateKeyLabel, formatBytes, percentOf, sumLessons } from './helpers';

const t = (id: string, parent: string | null, order: number, total = 0, completed = 0) =>
  ({ id, title: id, parentTopicId: parent, order, lessons: { total, completed } });

describe('buildTree', () => {
  it('ota-bola munosabatini quradi va order bo‘yicha tartiblaydi', () => {
    const tree = buildTree([t('c2', 'a', 2), t('b', null, 2), t('a', null, 1), t('c1', 'a', 1), t('d', 'c1', 1)]);
    expect(tree.map((n) => n.node.id)).toEqual(['a', 'b']);
    expect(tree[0].children.map((n) => n.node.id)).toEqual(['c1', 'c2']);
    expect(tree[0].children[0].children.map((n) => n.node.id)).toEqual(['d']);
  });
  it('order teng bo‘lsa, nom bo‘yicha', () => {
    expect(buildTree([t('b', null, 1), t('a', null, 1)]).map((n) => n.node.id)).toEqual(['a', 'b']);
  });
  it('noma‘lum ota bo‘lsa, render yiqilmaydi', () => {
    expect(() => buildTree([t('x', 'yoq', 1)])).not.toThrow();
  });
  it('bo‘sh ro‘yxat', () => expect(buildTree([])).toEqual([]));
});

describe('sumLessons', () => {
  it('ichki mavzularni ham qo‘shadi', () => {
    const [root] = buildTree([t('a', null, 1, 2, 1), t('b', 'a', 1, 3, 3), t('c', 'b', 1, 1, 0)]);
    expect(sumLessons(root)).toEqual({ total: 6, completed: 4 });
  });
});

describe('yordamchilar', () => {
  it('percentOf', () => { expect(percentOf(1, 3)).toBe(33); expect(percentOf(5, 3)).toBe(100); expect(percentOf(0, 0)).toBe(0); });
  it('formatBytes', () => { expect(formatBytes(512)).toBe('512 B'); expect(formatBytes(2048)).toBe('2 KB'); expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB'); });
  it('dateKeyLabel', () => { expect(dateKeyLabel('2026-09-30')).toBe('30.09'); expect(dateKeyLabel('2026-01-05')).toBe('05.01'); });
});
