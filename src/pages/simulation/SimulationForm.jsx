/* @ts-nocheck */
import React, { useState } from 'react';import { isTauri } from "@/lib/tauriEnv";

export default function SimulationForm() {
  // TODO: implémentation réelle (entrées, calculs)
  const [state] = useState({ ready: false });
  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold">Simulation</h1>
      <p className="text-sm text-gray-600">
        Formulaire de simulation — à implémenter ({state.ready ? 'prêt' : 'en préparation'}).
      </p>
    </div>);

}