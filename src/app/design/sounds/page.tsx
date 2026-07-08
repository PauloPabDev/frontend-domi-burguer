"use client";

import { useState } from "react";
import {
  playOrderNotification,
  playKitchenNotification,
  playSuccessNotification,
  playCourierNotification,
  playAlertNotification,
} from "@/utils/notificationSound";
import { Volume2, ChefHat, CheckCircle, Bike, AlertTriangle } from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SoundEntry {
  id: string;
  label: string;
  fn: string;
  description: string;
  usedIn: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  play: () => void;
}

// ─── Componente de tarjeta ────────────────────────────────────────────────────

function SoundCard({ sound }: { sound: SoundEntry }) {
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    if (playing) return;
    sound.play();
    setPlaying(true);
    setTimeout(() => setPlaying(false), 1200);
  };

  return (
    <div
      className={`rounded-2xl border bg-white p-6 flex flex-col gap-4 shadow-sm transition-all ${
        playing ? "ring-2 ring-offset-2 " + sound.color.replace("text-", "ring-") : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sound.bg}`}>
          <span className={sound.color}>{sound.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-neutral-900 text-sm leading-tight">{sound.label}</p>
          <code className="text-xs text-neutral-400 font-mono">{sound.fn}()</code>
        </div>
      </div>

      {/* Descripción */}
      <p className="text-sm text-neutral-500 leading-relaxed">{sound.description}</p>

      {/* Usado en */}
      <div className="text-xs text-neutral-400">
        <span className="font-medium text-neutral-500">Usado en:</span> {sound.usedIn}
      </div>

      {/* Botón */}
      <button
        onClick={handlePlay}
        disabled={playing}
        className={`mt-auto w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
          playing
            ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
            : `${sound.bg} ${sound.color} hover:opacity-80 active:scale-95`
        }`}
      >
        {playing ? "Reproduciendo…" : "▶  Probar"}
      </button>
    </div>
  );
}

// ─── Visualizador de onda mini (decorativo) ───────────────────────────────────

function WaveIcon({ active }: { active: boolean }) {
  return (
    <div className={`flex items-end gap-[3px] h-5 ${active ? "opacity-100" : "opacity-30"}`}>
      {[3, 6, 10, 6, 3].map((h, i) => (
        <div
          key={i}
          className={`w-1 rounded-full bg-orange-400 transition-all duration-150 ${active ? "animate-bounce" : ""}`}
          style={{ height: `${h * (active ? 1 : 0.6)}px`, animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function SoundsTestPage() {
  const [anyPlaying, setAnyPlaying] = useState(false);

  const wrap = (fn: () => void) => () => {
    setAnyPlaying(true);
    fn();
    setTimeout(() => setAnyPlaying(false), 1500);
  };

  const sounds: SoundEntry[] = [
    {
      id: "order",
      label: "Recepción — Campana suave",
      fn: "playOrderNotification",
      description:
        "Tres tonos sine ascendentes (A5 → C#6 → E6). Campana de restaurante. Para notificaciones de nuevas órdenes en recepción.",
      usedIn: "SocketContext · notifyReception",
      icon: <Volume2 size={18} />,
      color: "text-amber-600",
      bg: "bg-amber-50",
      play: wrap(playOrderNotification),
    },
    {
      id: "kitchen",
      label: "Cocina — Alarma agresiva",
      fn: "playKitchenNotification",
      description:
        "Triple doble-pulso sawtooth (máximos armónicos) en 1100 Hz y 1320 Hz. Diseñado para cortar el ruido de cocina. Ganancia 0.65.",
      usedIn: "SocketContext · notifyNewKitchenOrder",
      icon: <ChefHat size={18} />,
      color: "text-red-600",
      bg: "bg-red-50",
      play: wrap(playKitchenNotification),
    },
    {
      id: "success",
      label: "Éxito — Acorde mayor",
      fn: "playSuccessNotification",
      description:
        "Acorde Do mayor arpegiado (Do4 → Mi4 → Sol4 → Do5). Tono amigable para confirmar acciones exitosas.",
      usedIn: "Disponible — aún sin asignar",
      icon: <CheckCircle size={18} />,
      color: "text-green-600",
      bg: "bg-green-50",
      play: wrap(playSuccessNotification),
    },
    {
      id: "courier",
      label: "Courier — Patrón de salida",
      fn: "playCourierNotification",
      description:
        "Dos tonos triangle descendentes con rebote (880 → 660 → 880 Hz). Patrón único e identificable para eventos de domiciliario.",
      usedIn: "Disponible — aún sin asignar",
      icon: <Bike size={18} />,
      color: "text-blue-600",
      bg: "bg-blue-50",
      play: wrap(playCourierNotification),
    },
    {
      id: "alert",
      label: "Alerta urgente — Pulso triple",
      fn: "playAlertNotification",
      description:
        "Tres pulsos square en 950 Hz. Alarma de estado crítico o error. Alta percepción incluso a volumen bajo.",
      usedIn: "Disponible — aún sin asignar",
      icon: <AlertTriangle size={18} />,
      color: "text-orange-600",
      bg: "bg-orange-50",
      play: wrap(playAlertNotification),
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 px-6 py-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10 border-b border-neutral-200 pb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Sound Notifications</h1>
          <p className="text-neutral-500 mt-1 text-sm">
            Todos los tonos disponibles en{" "}
            <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs font-mono">
              src/utils/notificationSound.ts
            </code>
          </p>
        </div>
        <WaveIcon active={anyPlaying} />
      </div>

      {/* Aviso de AudioContext */}
      <div className="mb-8 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
        Los sonidos usan <strong>Web Audio API</strong> — no se necesitan archivos de audio.
        El navegador puede requerir interacción previa (click) para reproducir.
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sounds.map((s) => (
          <SoundCard key={s.id} sound={s} />
        ))}
      </div>

      {/* Tabla de referencia técnica */}
      <section className="mt-14">
        <h2 className="text-lg font-bold text-neutral-900 mb-4">Referencia técnica</h2>
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Función</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Onda</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Frecuencias</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Ganancia</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Duración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {[
                { fn: "playOrderNotification", wave: "sine", freq: "880 / 1108 / 1320 Hz", gain: "0.28", dur: "~1.0s" },
                { fn: "playKitchenNotification", wave: "sawtooth", freq: "1100 / 1320 Hz × 3 bursts", gain: "0.65", dur: "~1.0s" },
                { fn: "playSuccessNotification", wave: "sine", freq: "523 / 659 / 784 / 1046 Hz", gain: "0.30", dur: "~0.8s" },
                { fn: "playCourierNotification", wave: "triangle", freq: "880 / 660 / 880 Hz", gain: "0.30", dur: "~0.7s" },
                { fn: "playAlertNotification", wave: "square", freq: "950 Hz × 3 pulsos", gain: "0.45", dur: "~0.6s" },
              ].map((row) => (
                <tr key={row.fn} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-neutral-700">{row.fn}()</td>
                  <td className="px-4 py-3 text-neutral-500">{row.wave}</td>
                  <td className="px-4 py-3 text-neutral-500 font-mono text-xs">{row.freq}</td>
                  <td className="px-4 py-3 text-neutral-500">{row.gain}</td>
                  <td className="px-4 py-3 text-neutral-500">{row.dur}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
