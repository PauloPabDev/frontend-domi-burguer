"use client";

import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getMissing } from './utils';
import type { NuevaOrdenForm } from './types';

export function SubmitChecklist({ form }: { form: NuevaOrdenForm }) {
  const missing = getMissing(form);
  if (missing.length === 0) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm font-semibold text-green-800">
        <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
        Todo listo para enviar a cocina
      </p>
    );
  }
  return (
    <div role="status" className="rounded-xl border border-accent-yellow-100 bg-accent-yellow-20 p-4">
      <p className="text-sm font-bold text-neutral-black-80">Falta para crear la orden</p>
      <ul className="mt-2 flex flex-col gap-1">
        {missing.map((m) => (
          <li key={m} className="flex items-center gap-2 text-sm text-neutral-black-80">
            <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}
