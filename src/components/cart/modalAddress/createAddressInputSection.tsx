import { RefObject } from "react";
import { Input } from "../../ui/input";
import { MapPinIcon } from "../../ui/icons";
import { Autocomplete } from "@react-google-maps/api";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../ui/select";
import { MapComponent } from "../../map/map";
import { AddressFormState, AddressFormErrors } from "@/hooks/address/useAddressForm";

interface CreateAddressInputSectionProps {
    isLoaded: boolean;
    onLoad: (autocomplete: google.maps.places.Autocomplete) => void;
    onPlaceChanged: () => void;
    formState: AddressFormState;
    updateField: <K extends keyof AddressFormState>(field: K, value: AddressFormState[K]) => void;
    errors: AddressFormErrors;
    clearError: (field: keyof AddressFormErrors) => void;
    addressRef: RefObject<HTMLInputElement | null>;
    addressNameRef: RefObject<HTMLInputElement | null>;
    floorRef: RefObject<HTMLInputElement | null>;
    commentRef: RefObject<HTMLTextAreaElement | null>;
}

const CreateAddressInputSection = ({ isLoaded, onLoad, onPlaceChanged, formState, updateField, errors, clearError, addressRef, addressNameRef, floorRef, commentRef }: CreateAddressInputSectionProps) => {
    const DEFAULT_COORDINATES = { lat: 6.3017314, lng: -75.5743796 };

    const centerOrigin = DEFAULT_COORDINATES;

    return <div className="flex flex-col lg:flex-row gap-2 lg:gap-6 h-full">
        <div className="flex flex-1 flex-col px-[20px] lg:pl-[32px] lg:pr-0">

            <div className="flex flex-col gap-2">
                {isLoaded ? (
                    <Autocomplete
                        onLoad={onLoad}
                        onPlaceChanged={onPlaceChanged}
                        fields={[
                            "geometry",
                            "name",
                            "formatted_address",
                            "address_components",
                            "types",
                        ]}
                        options={{
                            componentRestrictions: { country: "co" },
                            bounds: {
                                north: centerOrigin.lat + 0.5,
                                south: centerOrigin.lat - 0.5,
                                east: centerOrigin.lng + 0.5,
                                west: centerOrigin.lng - 0.5,
                            },
                            strictBounds: true,
                        }}
                    >
                        <div className="flex flex-col">
                            <div className="relative">
                                <Input
                                    ref={addressRef}
                                    className={`shadow-none pr-12 ${errors.address || errors.coordinates ? 'border-red-500' : ''}`}
                                    placeholder="Nueva dirección"
                                    value={formState.address}
                                    onChange={(e) => {
                                        updateField("address", e.target.value);
                                        if (errors.address) clearError("address");
                                        if (errors.coordinates) clearError("coordinates");
                                    }} />
                                <MapPinIcon className="w-[22px] h-[22px] absolute right-5 top-1/2 -translate-y-1/2" />
                            </div>
                            {(errors.address || errors.coordinates) && (
                                <span className="text-red-500 text-sm mt-1">{errors.address || errors.coordinates}</span>
                            )}
                        </div>
                    </Autocomplete>
                ) : (
                    <div className="flex flex-col">
                        <div className="relative">
                            <Input
                                ref={addressRef}
                                className={`shadow-none pr-12 ${errors.address || errors.coordinates ? 'border-red-500' : ''}`}
                                placeholder="Nueva dirección"
                                value={formState.address}
                                onChange={(e) => {
                                    updateField("address", e.target.value);
                                    if (errors.address) clearError("address");
                                    if (errors.coordinates) clearError("coordinates");
                                }} />
                            <MapPinIcon className="w-[22px] h-[22px] absolute right-5 top-1/2 -translate-y-1/2" />
                        </div>
                        {(errors.address || errors.coordinates) && (
                            <span className="text-red-500 text-sm mt-1">{errors.address || errors.coordinates}</span>
                        )}
                    </div>
                )}


                <div className="flex gap-2">
                    <div className="flex-1">
                        <Select
                            onValueChange={(value) => updateField("selectedType", value as AddressFormState["selectedType"])}
                            value={formState.selectedType}
                        >
                            <SelectTrigger className="text-neutral-black-50! body-font w-full">
                                <SelectValue defaultValue="house" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="house">Casa</SelectItem>
                                <SelectItem value="building">Edificio</SelectItem>
                                <SelectItem value="urbanization">Urbanización</SelectItem>
                                <SelectItem value="office">Oficina</SelectItem>
                                <SelectItem value="hotel">Hotel</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col flex-1">
                        <Input
                            ref={floorRef}
                            className={`shadow-none ${errors.floor ? 'border-red-500' : ''}`}
                            value={formState.floor}
                            id="floor"
                            name="floor"
                            onChange={(e) => {
                                updateField("floor", e.target.value);
                                if (errors.floor) clearError("floor");
                            }}
                            placeholder="Unidad, piso, apto"
                            required />
                        {errors.floor && (
                            <span className="text-red-500 text-sm mt-1">{errors.floor}</span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col">
                    <div className="relative w-full">
                        <textarea
                            ref={commentRef}
                            placeholder="Alguna referencia?"
                            value={formState.comment}
                            onChange={(e) => {
                                updateField("comment", e.target.value);
                                if (errors.comment) clearError("comment");
                            }}
                            id="comment"
                            name="comment"
                            maxLength={200}
                            className={`body-font w-full placeholder:text-neutral-black-50 h-[100px] shadow-sm px-5 py-4 rounded-2xl border-[1.5px] ${errors.comment ? 'border-red-500' : 'border-[#cccccc]'} resize-none outline-none text-neutral-black-80 text-base!`} />
                        <span className="absolute bottom-3 right-3 text-gray-400 text-sm pointer-events-none">
                            {formState.comment.length}/200
                        </span>
                    </div>
                    {errors.comment && (
                        <span className="text-red-500 text-sm mt-1">{errors.comment}</span>
                    )}
                </div>

                <div className="flex flex-col">
                    <Input
                        ref={addressNameRef}
                        className={`shadow-none ${errors.addressName ? 'border-red-500' : ''}`}
                        placeholder="Opcional nombra tu dirección."
                        value={formState.addressName}
                        onChange={(e) => {
                            updateField("addressName", e.target.value);
                            if (errors.addressName) clearError("addressName");
                        }}
                        id="name"
                        name="name" />
                    {errors.addressName && (
                        <span className="text-red-500 text-sm mt-1">{errors.addressName}</span>
                    )}
                </div>

                <div className="flex items-center justify-between mb-1 lg:mb-6">
                    {/* <label
htmlFor="include-photo"
className="body-font text-[16px]! font-bold"
>
Incluir foto de tu ubicación
</label>
<Switch id="include-photo" /> */}
                </div>
            </div>
        </div>

        <div className="flex-1 min-h-[223px] w-full bg-accent-yellow-40">
            <MapComponent
                coordinates={formState.coordinates}
                minHeight="223px" />
        </div>
    </div>;
}

export default CreateAddressInputSection;