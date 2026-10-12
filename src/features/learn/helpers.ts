export const percentOf = (done: number, total: number) => (total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0);

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** "2026-09-30" -> "30.09" (satr bo'yicha kesiladi: vaqt zonasiga bog'liq emas) */
export const dateKeyLabel = (key: string) => `${key.slice(8, 10)}.${key.slice(5, 7)}`;

export interface TreeNode<T> { node: T; children: TreeNode<T>[] }

/** Tekis ro'yxatdan daraxt quradi; har darajada `order`, keyin nom bo'yicha tartiblanadi. */
export function buildTree<T extends { id: string; parentTopicId: string | null; order: number; title: string }>(items: T[]): TreeNode<T>[] {
  const map = new Map<string, TreeNode<T>>(items.map((i) => [i.id, { node: i, children: [] }]));
  const roots: TreeNode<T>[] = [];
  for (const n of map.values()) {
    const parent = n.node.parentTopicId ? map.get(n.node.parentTopicId) : undefined;
    (parent ? parent.children : roots).push(n);
  }
  const sort = (list: TreeNode<T>[]) => {
    list.sort((a, b) => a.node.order - b.node.order || a.node.title.localeCompare(b.node.title));
    list.forEach((x) => sort(x.children));
  };
  sort(roots);
  return roots;
}

/** Tugun va uning barcha ichki mavzulari bo'yicha darslar yig'indisi. */
export function sumLessons(n: TreeNode<{ lessons: { total: number; completed: number } }>): { total: number; completed: number } {
  return n.children.reduce(
    (acc, c) => { const s = sumLessons(c); return { total: acc.total + s.total, completed: acc.completed + s.completed }; },
    { total: n.node.lessons.total, completed: n.node.lessons.completed },
  );
}
