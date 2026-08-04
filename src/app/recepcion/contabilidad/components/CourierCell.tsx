import { Bike } from 'lucide-react';

interface CourierCellProps {
  name: string;
  photoURL?: string;
}

export function CourierCell({ name, photoURL }: CourierCellProps) {
  return (
    <div className="flex items-center gap-2">
      {photoURL ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoURL} alt={name} className="w-7 h-7 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-7 h-7 rounded-full bg-neutral-black-10 flex items-center justify-center shrink-0">
          <Bike size={13} className="text-neutral-black-50" />
        </div>
      )}
      <span className="font-medium">{name}</span>
    </div>
  );
}
