import { DeliveryAddress } from "@/types/orders";
import { type Location, PropertyType } from "@/types/locations";

export function toDeliveryLocation(address: DeliveryAddress): Location {
    return {
        name: address.name,
        address: address.address,
        city: address.city,
        country: address.country,
        floor: address.floor ?? "",
        comment: address.comment ?? "",
        coordinates: address.coordinates,
        propertyType: "house" as PropertyType,
    } as unknown as Location;
}
