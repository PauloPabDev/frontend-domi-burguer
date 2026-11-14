"use client";

import "./globals.css";
import { ErrorScreen } from "@/components/ErrorScreen";

// Se usa solo si falla el layout raíz: debe incluir su propio <html> y <body>
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
    return (
        <html lang="es">
            <body>
                <ErrorScreen digest={error.digest} />
            </body>
        </html>
    );
}
