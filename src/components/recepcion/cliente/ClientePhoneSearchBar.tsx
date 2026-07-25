"use client";

import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PhoneNumberInput } from '@/components/ui/inputPhone';

interface ClientePhoneSearchBarProps {
  phone: string;
  onPhoneChange: (phone: string) => void;
  loading: boolean;
  onSearch: () => void;
}

export function ClientePhoneSearchBar({ phone, onPhoneChange, loading, onSearch }: ClientePhoneSearchBarProps) {
  return (
    <div className="flex gap-2 w-full max-w-sm">
      <PhoneNumberInput
        className="flex-1"
        value={phone}
        onChange={(val: string | undefined) => onPhoneChange(val ?? '')}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') { e.preventDefault(); onSearch(); }
        }}
        disabled={loading}
      />
      <Button type="button" onClick={onSearch} disabled={loading || !phone} className="shrink-0">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Search className="w-4 h-4" />
            Buscar
          </>
        )}
      </Button>
    </div>
  );
}
