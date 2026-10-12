'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api/client';
import { errorText } from '@/lib/errors';
import { useT } from '@/lib/i18n';
import { formatDateTime } from '@/lib/utils';
import type { Note } from '../types';

export function NotesPanel({ lessonId }: { lessonId: string }) {
  const { t, te } = useT();
  const qc = useQueryClient();
  const key = ['lesson', lessonId, 'notes'];
  const [text, setText] = useState('');

  const notes = useQuery({ queryKey: key, queryFn: ({ signal }) => api.get<Note[]>(`/lessons/${lessonId}/notes`, { signal }) });
  const add = useMutation({
    mutationFn: (content: string) => api.post<Note>(`/lessons/${lessonId}/notes`, { content }),
    onSuccess: (n) => { qc.setQueryData<Note[]>(key, (old) => [n, ...(old ?? [])]); setText(''); },
    onError: (e) => toast.error(errorText(e, te)),
  });
  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/lessons/notes/${id}`),
    onSuccess: (_, id) => { qc.setQueryData<Note[]>(key, (old) => old?.filter((n) => n.id !== id)); toast.success(t('lesson.notes.deleted')); },
    onError: (e) => toast.error(errorText(e, te)),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (content) add.mutate(content);
  };

  return (
    <Card>
      <CardHeader><CardTitle>{t('lesson.notes.title')}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={submit} className="space-y-2">
          <Textarea aria-label={t('lesson.notes.title')} value={text} maxLength={2000} placeholder={t('lesson.notes.placeholder')} onChange={(e) => setText(e.target.value)} />
          <Button type="submit" size="sm" loading={add.isPending} disabled={!text.trim()}>{t('lesson.notes.add')}</Button>
        </form>
        {notes.data?.length === 0 && <p className="text-sm text-muted-foreground">{t('lesson.notes.empty')}</p>}
        <ul className="space-y-2">
          {notes.data?.map((n) => (
            <li key={n.id} className="flex items-start gap-2 rounded-xl border bg-muted/40 p-3">
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap break-words text-sm">{n.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</p>
              </div>
              <Button variant="ghost" size="icon" className="size-8" aria-label={t('lesson.notes.delete')} onClick={() => del.mutate(n.id)} disabled={del.isPending && del.variables === n.id}>
                <Trash2 aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
