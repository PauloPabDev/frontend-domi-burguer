type FirestoreTimestamp = { _seconds: number; _nanoseconds: number };

const toDate = (d: string | FirestoreTimestamp): Date =>
    typeof d === 'string' ? new Date(d) : new Date(d._seconds * 1000);

const formatTime = (d: string | FirestoreTimestamp) =>
    toDate(d).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

const formatDateTime = (d: string | FirestoreTimestamp) =>
    toDate(d).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export { formatTime, formatDateTime };