import { ErrorCard } from "./ErrorCard";

interface FormHeaderProps {
    error?: string | null;
    onClearError?: () => void;
}

export function FormHeader({ error, onClearError }: FormHeaderProps) {
    return (
        <div className="inline-flex gap-4 flex-col">
            <h2 className="items-start">INFORMACIÓN DE COMPRA</h2>
            <p className="body-font">
                Completa el siguiente formulario con tu información.
            </p>

            {error && (
                <ErrorCard error={error} onClose={onClearError} />
            )}
        </div>
    );
}