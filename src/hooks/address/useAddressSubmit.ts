import { useState } from 'react';
import { Location } from '@/types/locations';
import { LocationService } from '@/services/locationService';
import { track } from '@/utils/analytics';

export const useAddressSubmit = (
  onSuccess: (location: Location) => void,
  onError: (error: Error) => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitAddress = async (locationData: object, token: string | null = null): Promise<Location> => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Solo crear la location, el cálculo del delivery se hace en el contexto
      const { body: location } = await LocationService.addLocation({ token, location: locationData });

      track('address_saved', { property_type: (locationData as { propertyType?: string }).propertyType || 'unknown' });
      onSuccess(location);
      return location;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la dirección';
      setError(errorMessage);
      onError(err instanceof Error ? err : new Error(errorMessage));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    submitAddress,
    isSubmitting,
    error,
  };
};
