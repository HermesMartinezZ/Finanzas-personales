/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Target, AlertTriangle, CheckCircle, ShieldAlert, Edit2, Check, Plus, Trash2 } from 'lucide-react';
import { Presupuesto, GastoVariable } from '../types';

interface PresupuestoTabProps {
  presupuestos: Presupuesto[];
  gastos: GastoVariable[];
  onUpdatePresupuesto: (categoria: string, nuevoAsignado: number) => void;
  onAddCategory: (categoria: string, asignado: number) => void;
  onDeleteCategory: (categoria: string) => void;
}

export function PresupuestoTab({ 
  presupuestos, 
  gastos, 
  onUpdatePresupuesto,
  onAddCategory,
  onDeleteCategory
}: PresupuestoTabProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryLimit, setNewCategoryLimit] = useState('');
  const [isAddingOpen, setIsAddingOpen] = useState(false);

  // 1. Common formula values
  const totalGastadoReal = gastos.reduce((sum, g) => sum + g.valor, 0);
  const totalPresupuestado = presupuestos.reduce((sum, p) => sum + p.asignado, 0);
  const cupoDisponibleTotal = totalPresupuestado - totalGastadoReal;

  // Formatting helper
  const formataCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  const startEditing = (p: Presupuesto) => {
    setEditingCategory(p.categoria);
    setTempValue(p.asignado.toString());
  };

  const saveEditing = (categoria: string) => {
    const val = Number(tempValue);
    if (!isNaN(val) && val >= 0) {
      onUpdatePresupuesto(categoria, val);
    }
    setEditingCategory(null);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const limit = Number(newCategoryLimit) || 0;
    onAddCategory(newCategoryName.trim(), limit);
    setNewCategoryName('');
    setNewCategoryLimit('');
    setIsAddingOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* KPI Headers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Budgeted */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Presupuesto Asignado Total</span>
            <span className="text-2xl font-mono font-bold text-slate-900">{formataCOP(totalPresupuestado)}</span>
          </div>
          <div className="bg-slate-50 text-slate-500 p-3 rounded-lg border border-slate-200">
            <Target size={18} />
          </div>
        </div>

        {/* Total Spent Real (Var) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Total Ejecutado (Gastos Var)</span>
            <span className="text-2xl font-mono font-bold text-blue-600">{formataCOP(totalGastadoReal)}</span>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3 rounded-lg border border-blue-100">
            <CheckCircle size={18} />
          </div>
        </div>

        {/* Total Remaining */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Saldo General Disponible</span>
            <span className={`text-2xl font-mono font-bold ${cupoDisponibleTotal >= 0 ? 'text-green-600' : 'text-red-650'}`}>
              {formataCOP(cupoDisponibleTotal)}
            </span>
          </div>
          <div className={`p-3 rounded-lg border ${cupoDisponibleTotal >= 0 ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-650 border-red-100'}`}>
            <ShieldAlert size={18} />
          </div>
        </div>
      </div>

      {/* Main Budget Grid Table wrapper */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
          <div>
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">Presupuesto vs Ejecución en Tiempo Real</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Compara tus límites mensuales contra el gasto registrado. Haz clic en el lápiz para modificar tu límite de cupo.
            </p>
          </div>
          <button 
            onClick={() => setIsAddingOpen(!isAddingOpen)}
            className="self-start sm:self-center bg-slate-900 text-white rounded-xl py-2 px-4 text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <Plus size={14} />
            {isAddingOpen ? 'CERRAR FORMULARIO' : 'NUEVA CATEGORÍA'}
          </button>
        </div>

        {isAddingOpen && (
          <form onSubmit={handleCreateCategory} className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-end gap-3 animate-fadeIn">
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label htmlFor="input-newcat-name" className="text-xxs font-bold uppercase tracking-wider text-slate-500">Nombre de la Categoría</label>
              <input 
                id="input-newcat-name"
                type="text"
                required
                placeholder="e.g. Transporte, Arriendo, Entretenimiento"
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-600"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1 w-full sm:w-44">
              <label htmlFor="input-newcat-limit" className="text-xxs font-bold uppercase tracking-wider text-slate-500">Límite Mensual (COP)</label>
              <input 
                id="input-newcat-limit"
                type="number"
                min="0"
                placeholder="e.g. 500000"
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-600"
                value={newCategoryLimit}
                onChange={(e) => setNewCategoryLimit(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              className="bg-green-600 text-white rounded-lg px-4 py-2 text-xs font-bold hover:bg-green-700 cursor-pointer w-full sm:w-auto h-[34px] flex items-center justify-center"
            >
              Crear Categoría
            </button>
          </form>
        )}

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                <th className="py-2.5 px-4">Categoría de Gasto</th>
                <th className="py-2.5 px-4 text-right">Límite Asignado</th>
                <th className="py-2.5 px-4 text-right">Gasto Real (Consumos Var)</th>
                <th className="py-2.5 px-4 text-right">Disponible Restante</th>
                <th className="py-2.5 px-4 text-center">Progreso / Ejecución</th>
                <th className="py-2.5 px-4 text-center">Semáforo de Alerta</th>
                <th className="py-2.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {presupuestos.map((item) => {
                const gastadoRealVal = gastos
                  .filter((g) => g.categoria === item.categoria)
                  .reduce((sum, g) => sum + g.valor, 0);

                const disponible = item.asignado - gastadoRealVal;
                const ratio = item.asignado > 0 ? gastadoRealVal / item.asignado : 0;
                const pct = ratio * 100;

                // Semaphore condition logic:
                // Verde: menos del 70% usado.
                // Amarillo: entre 70% y 90%.
                // Rojo: más del 90%.
                let alertLabel = "";
                let alertBadge = "";

                if (ratio < 0.70) {
                  alertLabel = "🟢 BAJO (ACEPTABLE)";
                  alertBadge = "bg-green-50 text-green-700 border-green-150";
                } else if (ratio <= 0.90) {
                  alertLabel = "🟡 MEDIO (ALERTA)";
                  alertBadge = "bg-orange-50 text-orange-700 border-orange-150";
                } else {
                  alertLabel = "🔴 CRÍTICO (EXCEDIDO)";
                  alertBadge = "bg-red-50 text-red-700 border-red-150";
                }

                const isEditing = editingCategory === item.categoria;

                return (
                  <tr key={item.categoria} className="hover:bg-slate-50/20 transition-colors">
                    {/* Category Label */}
                    <td className="py-3.5 px-4 font-bold text-slate-700">{item.categoria}</td>

                    {/* Assigned Budget Input */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1 scale-95 origin-right">
                          <input 
                            id={`input-budget-${item.categoria}`}
                            type="number"
                            className="w-24 bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-green-600 text-right"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            autoFocus
                          />
                          <button 
                            onClick={() => saveEditing(item.categoria)}
                            className="bg-green-605 text-white p-1 rounded hover:bg-green-700 cursor-pointer text-xs"
                            id={`btn-save-budget-${item.categoria}`}
                          >
                            <Check size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5 group font-sans">
                          <span className="font-bold text-slate-800 font-mono">{formataCOP(item.asignado)}</span>
                          <button 
                            onClick={() => startEditing(item)}
                            className="text-slate-400 group-hover:text-slate-700 p-0.5 rounded hover:bg-slate-100 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                            title="Editar Límite"
                            id={`btn-edit-budget-${item.categoria}`}
                          >
                            <Edit2 size={11} />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Real Spending */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">{formataCOP(gastadoRealVal)}</td>

                    {/* Disponible Restante */}
                    <td className={`py-3.5 px-4 text-right font-mono font-bold ${disponible >= 0 ? 'text-slate-750' : 'text-red-650 font-extrabold'}`}>
                      {disponible < 0 ? '-' : ''}{formataCOP(Math.abs(disponible))}
                    </td>

                    {/* Progress slider bar */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${pct > 90 ? 'bg-red-500' : pct >= 70 ? 'bg-orange-400' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">{pct.toFixed(0)}%</span>
                      </div>
                    </td>

                    {/* Semaphore alert label */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 text-[9px] font-black rounded border uppercase tracking-wide ${alertBadge}`}>
                        {alertLabel}
                      </span>
                    </td>

                    {/* Delete Action button */}
                    <td className="py-3.5 px-4 text-center">
                      <button 
                        onClick={() => onDeleteCategory(item.categoria)}
                        className="text-slate-400 hover:text-red-650 p-1.5 rounded hover:bg-red-50 hover:border-red-100 transition-all cursor-pointer"
                        title="Eliminar Categoría"
                        id={`btn-delete-cat-${item.categoria}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
