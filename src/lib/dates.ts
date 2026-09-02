type FirestoreTimestamp = { _seconds: number; _nanoseconds: number };

const toDate = (d: string | FirestoreTimestamp): Date =>
    typeof d === 'string' ? new Date(d) : new Date(d._seconds * 1000);

const formatTime = (d: string | FirestoreTimestamp) =>
    toDate(d).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

const formatDateTime = (d: string | FirestoreTimestamp) =>
    toDate(d).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const formatFullDateTime = (d: string | FirestoreTimestamp) =>
    toDate(d).toLocaleString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

/** Medianoche del día dado (o de hoy), para filtros de rango de fecha. */
const getStartOfDay = (date = new Date()) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

/** Último instante del día dado (o de hoy), para filtros de rango de fecha. */
const getEndOfDay = (date = new Date()) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};

/** Formatea una fecha para el valor de un input `datetime-local`, respetando la zona horaria local. */
const formatLocalDateTime = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export { formatTime, formatDateTime, formatFullDateTime, getStartOfDay, getEndOfDay, formatLocalDateTime };