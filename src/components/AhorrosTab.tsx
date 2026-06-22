/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Trash2, PiggyBank, Sparkles, Check, Bookmark, Edit2, X } from 'lucide-react';
import { Ahorro, HistorialMensual } from '../types';

interface AhorrosTabProps {
  ahorros: Ahorro[];
  historial: HistorialMensual[];
  onAddAhorro: (newAhorro: Omit<Ahorro, 'id'>) => void;
  onDeleteAhorro: (id: string) => void;
  onUpdateAhorro: (updated: Ahorro) => void;
}

export function AhorrosTab({ ahorros, historial, onAddAhorro, onDeleteAhorro, onUpdateAhorro }: AhorrosTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [valor, setValor] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  // Editing state variables
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFecha, setEditFecha] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editValor, setEditValor] = useState('');

  const startEditing = (item: Ahorro) => {
    setEditingId(item.id);
    setEditFecha(item.fecha);
    setEditDescripcion(item.descripcion);
    setEditValor(item.valor.toString());
  };

  const handleSaveEdit = (id: string) => {
    if (!editDescripcion.trim() || !editValor || Number(editValor) <= 0) return;
    onUpdateAhorro({
      id,
      fecha: editFecha,
      descripcion: editDescripcion.trim(),
      valor: Number(editValor)
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim() || !valor || Number(valor) <= 0) return;

    onAddAhorro({
      descripcion: descripcion.trim(),
      valor: Number(valor),
      fecha
    });

    setDescripcion('');
    setValor('');
    setFecha(new Date().toISOString().split('T')[0]);
    setIsFormOpen(false);
  };

  // Calculations
  const ahorroDelMes = ahorros.reduce((sum, item) => sum + item.valor, 0);
  const fondosAnteriores = (historial || []).reduce((sum, item) => sum + item.ahorros, 0);
  const ahorroTotalAcumulado = ahorroDelMes + fondosAnteriores;

  const formataCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Metrics Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cumulative savings */}
        <div className="bg-slate-900 text-white p-5 rounded-xl shadow-sm flex items-center justify-between border border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Total Ahorrado Acumulado</span>
            <span className="text-3xl font-mono font-bold tracking-tight block mt-1">{formataCOP(ahorroTotalAcumulado)}</span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {fondosAnteriores > 0 
                ? `Incluye ${formataCOP(fondosAnteriores)} de Periodos Cerrados` 
                : 'Sin saldo acumulado de meses anteriores'}
            </span>
          </div>
          <div className="bg-white/10 p-3.5 rounded-lg text-green-400">
            <PiggyBank size={24} />
          </div>
        </div>

        {/* Monthly saving */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-450 block">Ahorro del Mes (Junio)</span>
            <span className="text-2xl font-mono font-bold text-slate-900 block mt-1">{formataCOP(ahorroDelMes)}</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Aportaciones registradas hoy</span>
          </div>
          <div className="bg-green-50 text-green-600 p-3 rounded-lg border border-green-100">
            <Sparkles size={18} />
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">Registro de Aportes de Capital</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Bitácora simple de traslados a tus bolsillos de inversión o ahorro.</p>
          </div>

          <button 
            id="btn-toggle-add-savings"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus size={14} />
            {isFormOpen ? 'OCULTAR FORMULARIO' : 'REGISTRAR APORTE DE AHORRO'}
          </button>
        </div>

        {/* Registration Form */}
        {isFormOpen && (
          <form id="form-add-savings" onSubmit={handleSubmit} className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-xl animate-fadeIn space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2.5 mb-2">
              <Sparkles className="text-orange-500" size={14} />
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Registrar un nuevo aporte</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="fecha-aho" className="text-xxs font-bold uppercase tracking-wider text-slate-455">Fecha del Aporte</label>
                <input 
                  id="fecha-aho"
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="desc-aho" className="text-xxs font-bold uppercase tracking-wider text-slate-455">Descripción / Cuenta de Destino</label>
                <input 
                  id="desc-aho"
                  type="text"
                  required
                  placeholder="e.g. Bolsa Vacaciones, Cuenta Alta Rentabilidad"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="val-aho" className="text-xxs font-bold uppercase tracking-wider text-slate-455">Valor transferido (COP)</label>
                <input 
                  id="val-aho"
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 150000"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="bg-white border border-slate-250 text-slate-500 rounded-lg text-xxs font-extrabold uppercase px-4 py-2 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-green-600 text-white rounded-lg text-xxs font-extrabold uppercase px-5 py-2 hover:bg-green-700 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Check size={12} />
                Guardar Aporte
              </button>
            </div>
          </form>
        )}

        {/* Contributions Timeline/List */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Historial de Aportes de este Mes</h4>
          
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  <th className="py-2.5 px-4">Fecha de Depósito</th>
                  <th className="py-2.5 px-4">Detalle / Destino</th>
                  <th className="py-2.5 px-4 text-right">Valor Ahorrado</th>
                  <th className="py-2.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {ahorros.length > 0 ? (
                  ahorros.map((item) => {
                    const isEditing = editingId === item.id;
                    return (
                      <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors ${isEditing ? 'bg-green-50/20' : ''}`}>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          {isEditing ? (
                            <input 
                              type="date"
                              value={editFecha}
                              onChange={(e) => setEditFecha(e.target.value)}
                              className="bg-white border border-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-green-600 font-mono w-28"
                            />
                          ) : (
                            <span className="text-slate-500">{item.fecha}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-700">
                          {isEditing ? (
                            <input 
                              type="text"
                              value={editDescripcion}
                              onChange={(e) => setEditDescripcion(e.target.value)}
                              className="bg-white border border-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-green-600 font-sans w-full"
                            />
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                              {item.descripcion}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-green-700">
                          {isEditing ? (
                            <input 
                              type="number"
                              value={editValor}
                              onChange={(e) => setEditValor(e.target.value)}
                              className="bg-white border border-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-green-600 font-mono text-right w-24"
                            />
                          ) : (
                            formataCOP(item.valor)
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button 
                                onClick={() => handleSaveEdit(item.id)}
                                className="text-green-600 hover:text-green-705 p-1 rounded hover:bg-green-50 transition-colors cursor-pointer inline-flex items-center font-bold"
                                title="Guardar cambios"
                                id={`btn-save-saving-${item.id}`}
                              >
                                <Check size={13} />
                              </button>
                              <button 
                                onClick={() => setEditingId(null)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center"
                                title="Cancelar"
                                id={`btn-cancel-saving-${item.id}`}
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <button 
                                onClick={() => startEditing(item)}
                                className="text-slate-400 hover:text-green-600 p-1 rounded hover:bg-green-50 transition-colors cursor-pointer inline-flex items-center"
                                title="Editar Ahorro"
                                id={`btn-edit-saving-${item.id}`}
                              >
                                <Edit2 size={13} />
                              </button>
                              <button 
                                onClick={() => onDeleteAhorro(item.id)}
                                className="text-slate-400 hover:text-red-650 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer align-middle"
                                id={`btn-delete-saving-${item.id}`}
                                title="Eliminar Ahorro"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No has agregado depósitos de ahorro todavía para este mes de Junio.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info advice box */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xxs text-slate-450 leading-relaxed">
          <p>
            📌 <strong>Aclaración:</strong> Esta sección opera exclusivamente como un diario o registro de aportes de capital. No define metas artificiales difíciles de mantener, ayudándote de forma realista y visual. Los datos agregados alimentarán de forma íntegra las fórmulas consolidadas y las celdas de tu archivo Excel.
          </p>
        </div>
      </div>
    </div>
  );
}
