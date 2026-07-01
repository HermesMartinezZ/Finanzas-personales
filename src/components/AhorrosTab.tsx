/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Trash2, PiggyBank, Sparkles, Check, Bookmark, Edit2, X } from 'lucide-react';
import { Ahorro, HistorialMensual } from '../types';

interface AhorrosTabProps {
  ahorros: Ahorro[];
  todosLosAhorros?: Ahorro[];
  historial: HistorialMensual[];
  categoriasAhorro: string[];
  defaultDate?: string;
  selectedMonth?: string;
  onAddAhorro: (newAhorro: Omit<Ahorro, 'id'>) => void;
  onDeleteAhorro: (id: string) => void;
  onUpdateAhorro: (updated: Ahorro) => void;
  onAddCategoriaAhorro: (nueva: string) => void;
  onDeleteCategoriaAhorro: (catName: string) => void;
}

export function AhorrosTab({ 
  ahorros, 
  todosLosAhorros = [],
  historial, 
  categoriasAhorro, 
  defaultDate,
  selectedMonth = 'Todos',
  onAddAhorro, 
  onDeleteAhorro, 
  onUpdateAhorro,
  onAddCategoriaAhorro,
  onDeleteCategoriaAhorro
}: AhorrosTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState(categoriasAhorro[0] || 'Bolsillo General');
  const [valor, setValor] = useState('');
  const [fecha, setFecha] = useState(defaultDate || new Date().toISOString().split('T')[0]);

  React.useEffect(() => {
    if (defaultDate) {
      setFecha(defaultDate);
    }
  }, [defaultDate]);

  // Dynamic category creation state
  const [nuevaCat, setNuevaCat] = useState('');
  const [isNuevaCatOpen, setIsNuevaCatOpen] = useState(false);

  // Editing state variables
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFecha, setEditFecha] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editCategoria, setEditCategoria] = useState('');
  const [editValor, setEditValor] = useState('');

  const startEditing = (item: Ahorro) => {
    setEditingId(item.id);
    setEditFecha(item.fecha);
    setEditDescripcion(item.descripcion);
    setEditCategoria(item.categoria || 'Bolsillo General');
    setEditValor(item.valor.toString());
  };

  const handleSaveEdit = (id: string) => {
    if (!editDescripcion.trim() || !editValor || Number(editValor) <= 0) return;
    onUpdateAhorro({
      id,
      fecha: editFecha,
      descripcion: editDescripcion.trim(),
      categoria: editCategoria || 'Bolsillo General',
      valor: Number(editValor)
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim() || !valor || Number(valor) <= 0) return;

    onAddAhorro({
      descripcion: descripcion.trim(),
      categoria: categoria || 'Bolsillo General',
      valor: Number(valor),
      fecha
    });

    setDescripcion('');
    setValor('');
    setFecha(defaultDate || new Date().toISOString().split('T')[0]);
    setIsFormOpen(false);
  };

  const handleAddCategoryLocal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaCat.trim()) return;
    onAddCategoriaAhorro(nuevaCat.trim());
    setCategoria(nuevaCat.trim()); // Auto-select newly created pocket
    setNuevaCat('');
    setIsNuevaCatOpen(false);
  };

  // Calculations
  const ahorroDelMes = ahorros.reduce((sum, item) => sum + item.valor, 0);
  // Sum only the static (archived historical) months savings, since we already sum all detailed active savings in todosLosAhorros
  const fondosAnteriores = (historial || [])
    .filter(h => !h.id.startsWith('dynamic-') && h.id !== 'live-june' && !h.id.startsWith('live-'))
    .reduce((sum, item) => sum + item.ahorros, 0);
  const ahorroTotalAcumulado = todosLosAhorros.reduce((sum, item) => sum + item.valor, 0) + fondosAnteriores;

  const formataCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Calculate sum per pocket across ALL time
  const getPocketTotal = (catName: string) => {
    return todosLosAhorros
      .filter(item => (item.categoria || 'Bolsillo General').toLowerCase() === catName.toLowerCase())
      .reduce((sum, item) => sum + item.valor, 0);
  };

  // Check if pocket can be deleted (no items assigned to it across ALL time)
  const isPocketDeletable = (catName: string) => {
    return !todosLosAhorros.some(item => (item.categoria || 'Bolsillo General').toLowerCase() === catName.toLowerCase());
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
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-450 block">Ahorro del Periodo Seleccionado</span>
            <span className="text-2xl font-mono font-bold text-slate-900 block mt-1">{formataCOP(ahorroDelMes)}</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Suma de depósitos en {selectedMonth === 'Todos' ? 'todos los meses' : selectedMonth}</span>
          </div>
          <div className="bg-green-50 text-green-600 p-3 rounded-lg border border-green-100">
            <Sparkles size={18} />
          </div>
        </div>
      </div>

      {/* Pockets Section (Bolsillos) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
              <PiggyBank size={14} className="text-green-600" />
              <span>Mis Bolsillos y Cuentas de Ahorro</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Tu dinero separado según tus propósitos y metas personales.</p>
          </div>

          <button
            onClick={() => setIsNuevaCatOpen(!isNuevaCatOpen)}
            className="w-full sm:w-auto text-xxs font-extrabold text-green-700 hover:text-green-800 flex items-center justify-center gap-1 uppercase bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 cursor-pointer"
          >
            <Plus size={11} />
            {isNuevaCatOpen ? 'Cerrar Registro' : 'Crear Nuevo Bolsillo'}
          </button>
        </div>

        {/* Create Pocket Form */}
        {isNuevaCatOpen && (
          <form onSubmit={handleAddCategoryLocal} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex gap-2 items-center animate-fadeIn">
            <input
              type="text"
              required
              placeholder="e.g. Fondo Vehículo, Viaje Europa, Tecnología"
              value={nuevaCat}
              onChange={(e) => setNuevaCat(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-green-600 flex-1"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-xxs px-4 py-2 rounded-lg cursor-pointer shrink-0 transition-colors"
            >
              Crear Bolsillo
            </button>
          </form>
        )}

        {/* Pockets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {categoriasAhorro.map((catName) => {
            const pocketTotal = getPocketTotal(catName);
            const deletable = isPocketDeletable(catName);
            return (
              <div key={catName} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-300 transition-all relative group">
                {deletable && (
                  <button
                    onClick={() => onDeleteCategoriaAhorro(catName)}
                    className="absolute top-2 right-2 text-slate-300 hover:text-red-600 transition-colors p-0.5 rounded cursor-pointer opacity-0 group-hover:opacity-100"
                    title={`Eliminar bolsillo "${catName}"`}
                  >
                    <X size={12} />
                  </button>
                )}
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block truncate pr-4">{catName}</span>
                  <span className="text-base font-mono font-bold text-slate-800 block mt-1">{formataCOP(pocketTotal)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Separado</span>
                  <span className="text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wide">Activo</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">Registro de Depósitos</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Bitácora de traslados dirigidos a tus bolsillos financieros {selectedMonth === 'Todos' ? '(Historial Completo)' : `en ${selectedMonth}`}.</p>
          </div>

          <button 
            id="btn-toggle-add-savings"
            onClick={() => {
              setIsFormOpen(!isFormOpen);
              // reset to first category when opening
              if (categoriasAhorro.length > 0) setCategoria(categoriasAhorro[0]);
            }}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <label htmlFor="cat-aho" className="text-xxs font-bold uppercase tracking-wider text-slate-455">Bolsillo de Destino</label>
                <select
                  id="cat-aho"
                  required
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-600"
                >
                  {categoriasAhorro.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="desc-aho" className="text-xxs font-bold uppercase tracking-wider text-slate-455">Detalle o Nota</label>
                <input 
                  id="desc-aho"
                  type="text"
                  required
                  placeholder="e.g. Traspaso quincena, Ahorro extra"
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
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Historial de Aportes Activos</h4>
          
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  <th className="py-2.5 px-4">Fecha</th>
                  <th className="py-2.5 px-4">Bolsillo de Destino</th>
                  <th className="py-2.5 px-4">Nota / Detalle</th>
                  <th className="py-2.5 px-4 text-right">Valor Ahorrado</th>
                  <th className="py-2.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {ahorros.length > 0 ? (
                  ahorros.map((item) => {
                    const isEditing = editingId === item.id;
                    const itemCat = item.categoria || 'Bolsillo General';
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
                        <td className="py-3 px-4">
                          {isEditing ? (
                            <select
                              value={editCategoria}
                              onChange={(e) => setEditCategoria(e.target.value)}
                              className="bg-white border border-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-green-600 font-sans"
                            >
                              {categoriasAhorro.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="inline-block bg-green-50 text-green-700 border border-green-100 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                              {itemCat}
                            </span>
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
                            item.descripcion
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
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No has agregado depósitos de ahorro todavía para este mes.
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
            📌 <strong>Aclaración:</strong> Esta sección opera como un organizador de bolsillos de ahorro. Puedes crear múltiples bolsillos y destinar tus aportes para separar tu dinero de forma segura. Tus saldos y totales acumulados se actualizan automáticamente en tiempo real.
          </p>
        </div>
      </div>
    </div>
  );
}
