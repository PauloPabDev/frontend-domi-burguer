import type { useNuevaOrden } from '@/hooks/recepcion/useNuevaOrden';
import type { Note } from '@/types/notes';

/** Todo el estado y las acciones del formulario: se crea UNA vez en NuevaOrdenGuiada y se pasa a cada paso. */
export type NuevaOrdenForm = ReturnType<typeof useNuevaOrden>;

export type StepId = 1 | 2 | 3 | 4;

export interface ClientNotesState {
  /** Notas del personal sobre el cliente (fijadas primero). Se piden una sola vez en NuevaOrdenGuiada. */
  notes: Note[];
  loading: boolean;
}

export interface StepProps {
  form: NuevaOrdenForm;
  clientNotes: ClientNotesState;
}

export interface GoToStepProps {
  onGoToStep: (step: StepId) => void;
}
