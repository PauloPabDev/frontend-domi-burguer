import * as React from "react";
import "react-phone-number-input/style.css";
import PhoneInput, { type Country } from "react-phone-number-input";
import { Input, type InputProps } from "./input"; // tu Input
import { cn } from "../../lib/utils";

// Tipo de props del PhoneInput inferido directamente
type PhoneInputPropsFromLib = React.ComponentProps<typeof PhoneInput>;

// Nuestro tipo público: omitimos lo que manejamos internamente
export interface CustomPhoneInputProps
  extends Omit<PhoneInputPropsFromLib, "inputComponent" | "className"> {
  className?: string;
  inputClassName?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

// Props que la librería `react-phone-number-input` pasa a `inputComponent`
interface InternalInputProps extends InputProps {
  country?: Country;
  international?: boolean;
  withCountryCallingCode?: boolean;
  "aria-label"?: string;
  className?: string;
}

const PhoneNumberInput = React.forwardRef<HTMLDivElement, CustomPhoneInputProps>(
  ({ className, inputClassName, onKeyDown, ...props }, ref) => {
    // Wrapper que recibe las props del PhoneInput y las reenvía a tu Input
    const InternalInput = React.useMemo(() => {
      const InputComponent = React.forwardRef<HTMLInputElement, InternalInputProps>(
        (inputProps, inputRef) => {
          const { className: innerClassName, ...rest } = inputProps;
          return (
            <Input
              ref={inputRef}
              className={cn(innerClassName, inputClassName)}
              {...rest}
            />
          );
        }
      );
      InputComponent.displayName = "InternalInput";
      return InputComponent;
    }, [inputClassName]);

    return (
      <div className={cn("phone-input-container", className)} ref={ref}>
        <PhoneInput
          {...props}
          // La librería sobrescribe el onKeyDown del input; solo respeta el que recibe aquí
          onKeyDown={onKeyDown}
          defaultCountry="CO"
          inputComponent={InternalInput}
          onChange={props.onChange}
        />
      </div>
    );
  }
);

PhoneNumberInput.displayName = "PhoneNumberInput";
export { PhoneNumberInput };
