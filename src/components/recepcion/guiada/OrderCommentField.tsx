"use client";

import { useId } from 'react';
import type { NuevaOrdenForm } from './types';

const QUICK_PHRASES = ['Sin servilletas', 'Salsa aparte', 'Llamar al llegar'];

const chipClass =
  'inline-flex min-h-11 items-center rounded-full border-[1.5px] border-neutral-black-20 bg-white px-4 text-sm font-semibold text-neutral-black-80 hover:border-neutral-black-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-red-100 disabled:opacity-50 disabled:hover:border-neutral-black-20';

export function OrderCommentField({ form }: { form: NuevaOrdenForm }) {
  const id = useId();
  const { comment, setComment } = form;
  const addressNote = form.locations.find((l) => l.id === form.selectedLocationId)?.comment?.trim();
  const phrases = addressNote ? [...QUICK_PHRASES, addressNote] : QUICK_PHRASES;

  const add = (text: string) => setComment(comment.trim() ? `${comment.trimEnd()}. ${text}` : text);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-neutral-black-80">Comentario para cocina y mensajero</label>
      <textarea
        id={id}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-neutral-black-20 bg-white px-3 py-2 text-sm text-neutral-black-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-red-100"
      />
      <div className="flex flex-wrap gap-2">
        {phrases.map((p, i) => (
          <button
            key={p}
            type="button"
            onClick={() => add(p)}
            disabled={comment.includes(p)}
            className={chipClass}
          >
            {i < QUICK_PHRASES.length ? p : 'Nota de la dirección'}
          </button>
        ))}
      </div>
    </div>
  );
}
