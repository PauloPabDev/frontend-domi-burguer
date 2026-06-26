import { LocationService } from "@/services/locationService";
import { Location } from "@/types/locations";
import { useEffect, useState } from "react";

export const useGetLocationByUser = (token: string) => {
    const [ locations, setLocations ] = useState<Location[]>([]);
    const [ isLoading, setIsLoading ] = useState<boolean>(true);
    const [ error, setError ] = useState<string | null>(null);

    const fetchLocations = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const {body: locations} = await LocationService.getUserLocations(token);
                setLocations([...locations]);
            } catch (err) {
                console.error("Error fetching user locations", err);
                setError("Could not load your locations");
            } finally {
                setIsLoading(false);
            }
        };
        
    useEffect(() => {
        if (token) {
            fetchLocations();
        } else {
            setIsLoading(false);
            setError("No token provided");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return { locations, isLoading, error , fetchLocations};
}


