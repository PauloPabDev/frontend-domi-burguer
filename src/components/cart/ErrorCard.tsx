import { Card, CardContent } from "@/components/ui/card";

interface ErrorCardProps {
  error: string;
  onClose?: () => void;
}

export function ErrorCard({ error, onClose }: ErrorCardProps) {
  return (
    <Card className="bg-red-50 border-red-300 border-2 shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-red-800 font-semibold text-base">
              Error al procesar tu pedido
            </h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
