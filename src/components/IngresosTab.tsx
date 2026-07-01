/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Trash2, Search, TrendingUp, Landmark, ShieldCheck, Edit2, Check, X } from 'lucide-react';
import { Ingreso, HistorialMensual } from '../types';

interface IngresosTabProps {
  ingresos: Ingreso[];
  historial: HistorialMensual[];
  defaultDate?: string;
  selectedMonth?: string;
  onAddIngreso: (newIng: Omit<Ingreso, 'id'>) => void;
  onDeleteIngreso: (id: string) => void;
  onUpdateIngreso: (updated: Ingreso) => void;
}

export function IngresosTab({ 
  ingresos, 
  historial, 
  defaultDate,
  selectedMonth = 'Todos',
  onAddIngreso, 
  onDeleteIngreso, 
  onUpdateIngreso 
}: IngresosTabProps) {
  const [concepto, setConcepto] = useState('');
  const [valor, setValor] = useState('');
  const [fecha, setFecha] = useState(defaultDate || new Date().toISOString().split('T')[0]);

  React.useEffect(() => {
    if (defaultDate) {
      setFecha(defaultDate);
    }
  }, [defaultDate]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Editing state variables
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFecha, setEditFecha] = useState('');
  const [editConcepto, setEditConcepto] = useState('');
  const [editValor, setEditValor] = useState('');

  const startEditing = (item: Ingreso) => {
    setEditingId(item.id);
    setEditFecha(item.fecha);
    setEditConcepto(item.concepto);
    setEditValor(item.valor.toString());
  };

  const handleSaveEdit = (id: string) => {
    if (!editConcepto.trim() || !editValor || Number(editValor) <= 0) return;
    onUpdateIngreso({
      id,
      fecha: editFecha,
      concepto: editConcepto.trim(),
      valor: Number(editValor)
    });
    setEditingId(null);
  };

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concepto.trim() || !valor || Number(valor) <= 0) return;

    onAddIngreso({
      concepto: concepto.trim(),
      valor: Number(valor),
      fecha: fecha,
    });

    setConcepto('');
    setValor('');
    setFecha(defaultDate || new Date().toISOString().split('T')[0]);
    setIsFormOpen(false);
  };

  // Calculations
  const isAllTime = selectedMonth === 'Todos';
  const totalMes = ingresos.reduce((sum, item) => sum + item.valor, 0);
  const totalAcumuladoAnual = (historial || []).reduce((sum, item) => sum + item.ingresos, 0);
  const totalHistoricoAnterior = Math.max(0, totalAcumuladoAnual - totalMes);

  // Filter incomes
  const filteredIngresos = ingresos.filter(ing => 
    ing.concepto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formataCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* KPI Cards Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 text-green-600 p-3 rounded-xl border border-green-100/60">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
              {isAllTime ? 'Total Ingresos en Curso (Periodos Activos)' : `Total Ingresos (${selectedMonth})`}
            </span>
            <span className="text-2xl font-mono font-bold text-slate-900">{formataCOP(totalMes)}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl border border-blue-150/50">
            <Landmark size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Total Acumulado (Anual)</span>
            <span className="text-2xl font-mono font-bold text-slate-900">{formataCOP(totalAcumuladoAnual)}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {totalHistoricoAnterior > 0 
                ? `Incluye ${formataCOP(totalHistoricoAnterior)} acumulados de ${isAllTime ? 'Periodos Cerrados' : 'Otros Periodos'}` 
                : 'Sin saldo acumulado de otros periodos'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Block */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-80">
            <input 
              id="search-income"
              type="text"
              placeholder="Buscar concepto..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-green-600 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              id="btn-toggle-add-income"
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="w-full md:w-auto bg-slate-900 border border-slate-800 text-white rounded-xl py-2 px-4 text-xs font-bold hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              {isFormOpen ? 'CERRAR FECHA' : 'REGISTRAR INGRESO'}
            </button>
          </div>
        </div>

        {/* Collapsible Form */}
        {isFormOpen && (
          <form id="form-add-income" onSubmit={handleSubmit} className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-xl animate-fadeIn space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2.5 mb-2">
              <Plus className="text-green-600" size={14} />
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Registrar un nuevo ingreso</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="fecha-inc" className="text-xxs font-bold uppercase tracking-wider text-slate-450">Fecha</label>
                <input 
                  id="fecha-inc"
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="concepto-inc" className="text-xxs font-bold uppercase tracking-wider text-slate-450">Concepto o Fuente</label>
                <input 
                  id="concepto-inc"
                  type="text"
                  placeholder="e.g. Salario principal, Bono, Venta"
                  required
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="valor-inc" className="text-xxs font-bold uppercase tracking-wider text-slate-450">Valor (COP)</label>
                <input 
                  id="valor-inc"
                  type="number"
                  placeholder="e.g. 1500000"
                  required
                  min="1"
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
                <Plus size={12} />
                Agregar Ingreso
              </button>
            </div>
          </form>
        )}

        {/* Table representation */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                <th className="py-2.5 px-4">Fecha</th>
                <th className="py-2.5 px-4">Concepto o Fuente</th>
                <th className="py-2.5 px-4 text-right">Valor</th>
                <th className="py-2.5 px-4 text-center">Filtros Activos</th>
                <th className="py-2.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredIngresos.length > 0 ? (
                filteredIngresos.map((item, idx) => {
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
                          <span className="text-slate-600">{item.fecha}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-800">
                        {isEditing ? (
                          <input 
                            type="text"
                            value={editConcepto}
                            onChange={(e) => setEditConcepto(e.target.value)}
                            className="bg-white border border-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-green-600 font-sans w-full"
                          />
                        ) : (
                          <span className="font-bold">{item.concepto}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-800">
                        {isEditing ? (
                          <input 
                            type="number"
                            value={editValor}
                            onChange={(e) => setEditValor(e.target.value)}
                            className="bg-white border border-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-green-600 font-mono text-right w-24"
                          />
                        ) : (
                          <span className="font-bold">{formataCOP(item.valor)}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isEditing ? (
                          <span className="text-[10px] text-slate-400 italic">Modificando...</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-100 rounded px-2 py-0.5 text-[9px] font-bold">
                            <ShieldCheck size={11} />
                            Establecido
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => handleSaveEdit(item.id)}
                              className="text-green-600 hover:text-green-705 p-1 rounded hover:bg-green-50 transition-colors cursor-pointer inline-flex items-center font-bold"
                              title="Guardar cambios"
                              id={`btn-save-income-${item.id}`}
                            >
                              <Check size={13} />
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center"
                              title="Cancelar"
                              id={`btn-cancel-income-${item.id}`}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => startEditing(item)}
                              className="text-slate-400 hover:text-green-600 p-1 rounded hover:bg-green-50 transition-colors cursor-pointer inline-flex items-center"
                              title="Editar Ingreso"
                              id={`btn-edit-income-${item.id}`}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button 
                              onClick={() => onDeleteIngreso(item.id)}
                              className="text-slate-400 hover:text-red-650 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer inline-flex items-center"
                              title="Borrar Ingreso"
                              id={`btn-delete-income-${item.id}`}
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
                    No se encontraron registros de ingresos matching.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Info label banner */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xxs text-slate-450 flex items-start gap-2 leading-relaxed">
          <Landmark size={14} className="text-slate-400 mt-0.5 shrink-0" />
          <p>
            Al exportar a Excel, esta sección se grabará automáticamente en la pestaña <strong>INGRESOS</strong>. Los cálculos totales y proyecciones de ahorro anuales se basarán enteramente en estos montos reales mediante fórmulas nativas <code>=SUM()</code> de Excel.
          </p>
        </div>
      </div>
    </div>
  );
}
