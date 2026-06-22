/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { CalendarRange, Plus, Trash2, Landmark, History } from 'lucide-react';
import { HistorialMensual, FinanzasData } from '../types';

interface HistorialTabProps {
  data: FinanzasData;
  onAddHistorial: (newItem: Omit<HistorialMensual, 'id'>) => void;
  onDeleteHistorial: (id: string) => void;
}

export function HistorialTab({ data, onAddHistorial, onDeleteHistorial }: HistorialTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [mes, setMes] = useState('');
  const [ingresosVal, setIngresosVal] = useState('');
  const [gastosVal, setGastosVal] = useState('');
  const [ahorrosVal, setAhorrosVal] = useState('');

  // June calculations for the LIVE comparative line
  const liveIngresos = data.ingresos.reduce((s, i) => s + i.valor, 0);
  const liveGastos = data.facturas.reduce((s, f) => s + f.valor, 0) + data.gastos.reduce((s, g) => s + g.valor, 0);
  const liveAhorros = data.ahorros.reduce((s, a) => s + a.valor, 0);
  const liveDisponible = liveIngresos - liveGastos - liveAhorros;

  // Combine static and live
  const fullHistorial = [
    ...data.historial,
    {
      id: 'live-june',
      mes: 'Junio 2026 (Live)',
      ingresos: liveIngresos,
      gastos: liveGastos,
      ahorros: liveAhorros,
      disponible: liveDisponible
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mes.trim() || !ingresosVal || !gastosVal || !ahorrosVal) return;

    const ing = Number(ingresosVal);
    const gas = Number(gastosVal);
    const aho = Number(ahorrosVal);
    const disp = ing - gas - aho;

    onAddHistorial({
      mes: mes.trim(),
      ingresos: ing,
      gastos: gas,
      ahorros: aho,
      disponible: disp
    });

    setMes('');
    setIngresosVal('');
    setGastosVal('');
    setAhorrosVal('');
    setIsFormOpen(false);
  };

  const formataCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Triple Column Evolution Bar Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="mb-4">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
            <History size={14} className="text-green-600" />
            <span>Comparativa Mensual de Rubros</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Analiza la correspondencia entre lo recaudado, consumido y reservado mes a mes.</p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fullHistorial} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="mes" fontSize={10} stroke="#94A3B8" tickLine={false} />
              <YAxis 
                fontSize={9} 
                stroke="#94A3B8" 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`} 
              />
              <Tooltip 
                formatter={(val) => [formataCOP(Number(val)), '']}
                contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', border: 'none' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              <Bar dataKey="ingresos" name="Ingresos" fill="#475569" radius={[2, 2, 0, 0]} maxBarSize={24} />
              <Bar dataKey="gastos" name="Gastos Fijos/Var" fill="#ea580c" radius={[2, 2, 0, 0]} maxBarSize={24} />
              <Bar dataKey="ahorros" name="Ahorros" fill="#16a34a" radius={[2, 2, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Seeding & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table representation */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div>
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">Cierre de Periodos</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Resumen histórico almacenado que sustenta las proyecciones anuales.</p>
            </div>

            <button 
              id="btn-toggle-add-historial"
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 text-xxs font-extrabold uppercase px-3 py-2 rounded-lg transition-all cursor-pointer"
            >
              Cerrar Periodo Anterior
            </button>
          </div>

          {/* Form */}
          {isFormOpen && (
            <form id="form-add-historial" onSubmit={handleSubmit} className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-fadeIn">
              <h4 className="text-xs font-bold text-slate-800">Registrar cierre de mes anterior</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="mes-hist" className="text-xxs font-bold uppercase tracking-wider text-slate-455">Mes / Año</label>
                  <input 
                    id="mes-hist"
                    type="text"
                    required
                    placeholder="e.g. Diciembre 2025"
                    className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none"
                    value={mes}
                    onChange={(e) => setMes(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="ing-hist" className="text-xxs font-bold uppercase tracking-wider text-slate-455">Ingresos Totales</label>
                  <input 
                    id="ing-hist"
                    type="number"
                    required
                    placeholder="e.g. 4800000"
                    className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none"
                    value={ingresosVal}
                    onChange={(e) => setIngresosVal(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="gas-hist" className="text-xxs font-bold uppercase tracking-wider text-slate-455">Gastos Totales</label>
                  <input 
                    id="gas-hist"
                    type="number"
                    required
                    placeholder="e.g. 3100000"
                    className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none"
                    value={gastosVal}
                    onChange={(e) => setGastosVal(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="aho-hist" className="text-xxs font-bold uppercase tracking-wider text-slate-455">Ahorro Neto</label>
                  <input 
                    id="aho-hist"
                    type="number"
                    required
                    placeholder="e.g. 500000"
                    className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none"
                    value={ahorrosVal}
                    onChange={(e) => setAhorrosVal(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-1.5 pt-1">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="bg-white text-slate-550 border border-slate-200 rounded-lg px-3 py-1 text-xxs cursor-pointer font-bold uppercase"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="bg-green-600 text-white rounded-lg px-3.5 py-1 text-xxs font-bold hover:bg-green-700 cursor-pointer uppercase"
                >
                  Confirmar
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  <th className="py-2.5 px-3">Mes del Periodo</th>
                  <th className="py-2.5 px-3 text-right">Ingresos</th>
                  <th className="py-2.5 px-3 text-right">Gastos Fijos/Var</th>
                  <th className="py-2.5 px-3 text-right">Ahorros</th>
                  <th className="py-2.5 px-3 text-right">Disponible</th>
                  <th className="py-2.5 px-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {fullHistorial.map((item) => {
                  const isLive = item.id === 'live-june';
                  return (
                    <tr key={item.id} className={isLive ? 'bg-green-50/20 font-bold' : 'hover:bg-slate-50/10'}>
                      <td className="py-2.5 px-3">
                        <span className="flex items-center gap-1.5">
                          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-green-550 animate-ping shrink-0" />}
                          {item.mes}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-650">{formataCOP(item.ingresos)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-650">{formataCOP(item.gastos)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-650">{formataCOP(item.ahorros)}</td>
                      <td className={`py-2.5 px-3 text-right font-mono font-bold ${item.disponible >= 0 ? 'text-slate-800' : 'text-red-650'}`}>
                        {formataCOP(item.disponible)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {!isLive ? (
                          <button 
                            onClick={() => onDeleteHistorial(item.id)}
                            className="text-slate-400 hover:text-red-650 p-0.5 rounded transition-all cursor-pointer align-middle"
                            id={`btn-delete-historial-${item.id}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        ) : (
                          <span className="text-[10px] text-green-700 font-bold uppercase">En Curso</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Informational sidebar column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 text-white p-5 rounded-xl flex flex-col justify-between border border-slate-800">
            <div>
              <CalendarRange className="text-green-400 mb-2" size={20} />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Resumen de Periodos Cerrados</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-2.5">
                Mantener un histórico fidedigno de los meses consolidados nos permite calcular un promedio mensual representativo. De este modo, la hoja de proyección anual estimará tus finanzas bajo un modelo de regresión media ajustado a tu vida real.
              </p>
            </div>
            
            <div className="mt-5 border-t border-slate-800 pt-4 text-[10px] text-slate-450">
              💡 <strong>Consejo Financiero:</strong> Intenta cerrar los periodos los fines de semana de corte de mes conciliando los extractos bancarios.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
