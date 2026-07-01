/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Trash2, Search, DollarSign, PieChart as PieIcon, CreditCard, ShoppingBag, Edit2, Check, X } from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { GastoVariable } from '../types';

interface GastosTabProps {
  gastos: GastoVariable[];
  categorias: string[];
  defaultDate?: string;
  selectedMonth?: string;
  onAddGasto: (newGasto: Omit<GastoVariable, 'id'>) => void;
  onDeleteGasto: (id: string) => void;
  onAddCategory: (categoria: string, asignado: number) => void;
  onUpdateGasto: (updated: GastoVariable) => void;
}

export function GastosTab({ 
  gastos, 
  categorias, 
  defaultDate,
  selectedMonth = 'Todos',
  onAddGasto, 
  onDeleteGasto, 
  onAddCategory, 
  onUpdateGasto 
}: GastosTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [valor, setValor] = useState('');
  const [fecha, setFecha] = useState(defaultDate || new Date().toISOString().split('T')[0]);

  React.useEffect(() => {
    if (defaultDate) {
      setFecha(defaultDate);
    }
  }, [defaultDate]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');

  // Editing state variables
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFecha, setEditFecha] = useState('');
  const [editCategoria, setEditCategoria] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editValor, setEditValor] = useState('');

  const startEditing = (item: GastoVariable) => {
    setEditingId(item.id);
    setEditFecha(item.fecha);
    setEditCategoria(item.categoria);
    setEditDescripcion(item.descripcion);
    setEditValor(item.valor.toString());
  };

  const handleSaveEdit = (id: string) => {
    if (!editDescripcion.trim() || !editValor || Number(editValor) <= 0) return;
    onUpdateGasto({
      id,
      fecha: editFecha,
      categoria: editCategoria,
      descripcion: editDescripcion.trim(),
      valor: Number(editValor)
    });
    setEditingId(null);
  };

  const selectCategories = Array.from(new Set([
    'Mercado', 
    'Transporte', 
    'Restaurantes', 
    'Salud', 
    'Entretenimiento', 
    'Educación', 
    'Tecnología', 
    'Otros',
    ...(categorias || [])
  ]));

  const handleSaveCustomCategory = () => {
    if (!customCategoryName.trim()) return;
    const cleanName = customCategoryName.trim();
    onAddCategory(cleanName, 0); // Adds the category to the shared state
    setCategoria(cleanName);
    setCustomCategoryName('');
    setIsCreatingCustom(false);
  };

  // Forms submit handles
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim() || !valor || Number(valor) <= 0) return;

    onAddGasto({
      fecha,
      categoria: categoria || selectCategories[0] || 'Otros',
      descripcion: descripcion.trim(),
      valor: Number(valor)
    });

    setDescripcion('');
    setValor('');
    setFecha(defaultDate || new Date().toISOString().split('T')[0]);
    setIsFormOpen(false);
  };

  // Calculations
  const totalGastado = gastos.reduce((sum, g) => sum + g.valor, 0);

  // Group by category for visual analytics list and charts
  const categorySplit = selectCategories.map(cat => {
    const sum = gastos.filter(g => g.categoria === cat).reduce((s, g) => s + g.valor, 0);
    return {
      category: cat,
      value: sum,
      percentage: totalGastado > 0 ? (sum / totalGastado) * 100 : 0
    };
  }).sort((a, b) => b.value - a.value);

  // Filter items
  const filteredGastos = gastos.filter(g => 
    g.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formataCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  const PIE_COLORS = ['#1F4E5B', '#2A9D8F', '#457B9D', '#E9C46A', '#F4A261', '#E76F51', '#3D5A80', '#98C1D9'];

  const chartData = categorySplit.filter(c => c.value > 0).map(c => ({
    name: c.category,
    value: c.value
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Metric */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-red-50 text-red-650 p-3 rounded-lg border border-red-100">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Total Gastado (Variables)</span>
            <span className="text-2xl font-mono font-bold text-slate-900">{formataCOP(totalGastado)}</span>
          </div>
        </div>

        {/* Action Toggle */}
        <button 
          id="btn-toggle-add-gasto"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="w-full md:w-auto bg-slate-900 text-white rounded-xl py-2 px-4 text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1"
        >
          <Plus size={14} />
          {isFormOpen ? 'OCULTAR FORMULARIO' : 'REGISTRAR GASTO VARIABLE'}
        </button>
      </div>

      {/* Grid: Form/Chart & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Analytics/Form */}
        <div className="lg:col-span-1 space-y-6">
          {/* Form */}
          {isFormOpen && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-fadeIn">
              <h4 className="text-xs font-extrabold text-slate-705 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4 flex items-center gap-1.5">
                <Plus size={14} className="text-green-600" />
                <span>Registrar Gasto Diario</span>
              </h4>

              <form id="form-add-gasto" onSubmit={handleSubmit} className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="fecha-gas" className="text-xxs font-bold uppercase tracking-wider text-slate-450">Fecha</label>
                  <input 
                    id="fecha-gas"
                    type="date"
                    required
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-600"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label htmlFor="cat-gas" className="text-xxs font-bold uppercase tracking-wider text-slate-450">Categoría de Presupuesto</label>
                    <button
                      type="button"
                      onClick={() => setIsCreatingCustom(!isCreatingCustom)}
                      className="text-xxs font-bold text-green-600 hover:text-green-700 hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      {isCreatingCustom ? '✕ Cancelar' : '+ Crear Nueva'}
                    </button>
                  </div>
                  
                  {isCreatingCustom ? (
                    <div className="flex gap-1.5 mt-0.5 animate-fadeIn">
                      <input
                        type="text"
                        placeholder="e.g. Suscripciones, Viajes"
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-green-600 font-sans"
                        value={customCategoryName}
                        onChange={(e) => setCustomCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveCustomCategory();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleSaveCustomCategory}
                        className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <select 
                      id="cat-gas"
                      value={categoria || selectCategories[0] || ''}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-600 font-sans cursor-pointer h-9"
                    >
                      {selectCategories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="desc-gas" className="text-xxs font-bold uppercase tracking-wider text-slate-450">Descripción o Comercio</label>
                  <input 
                    id="desc-gas"
                    type="text"
                    required
                    placeholder="e.g. Almuerzo, Mercado Carulla"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-600"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="val-gas" className="text-xxs font-bold uppercase tracking-wider text-slate-450">Monto pagado (COP)</label>
                  <input 
                    id="val-gas"
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 45000"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-600"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-green-600 text-white rounded-lg py-2 px-4 text-xs font-bold hover:bg-green-700 transition-colors mt-4 cursor-pointer uppercase tracking-wider"
                >
                  Agregar Registro
                </button>
              </form>
            </div>
          )}

          {/* Visual Distribution List */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-150 pb-2">
              <PieIcon size={14} className="text-slate-400" />
              <span>Gastos por Categoría</span>
            </h4>

            {chartData.length > 0 && (
              <div className="h-44 w-full flex items-center justify-center relative border-b border-slate-150 pb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((en, index) => (
                        <Cell key={`c-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formataCOP(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {categorySplit.map((item, idx) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-650">{item.category}</span>
                    <span className="font-mono text-slate-800 font-bold">{formataCOP(item.value)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] 
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block text-right font-medium">{item.percentage.toFixed(1)}% del total</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Table of items */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">Historial de Consumos Diarios</h4>
            
            <div className="relative w-full sm:w-56">
              <input 
                id="search-gasto-tb"
                type="text"
                placeholder="Filtrar descripción..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-green-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={12} />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Categoría</th>
                  <th className="py-2.5 px-3">Descripción</th>
                  <th className="py-2.5 px-3 text-right">Valor</th>
                  <th className="py-2.5 px-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {filteredGastos.length > 0 ? (
                  filteredGastos.map((item) => {
                    const isEditing = editingId === item.id;
                    return (
                      <tr key={item.id} className={`hover:bg-slate-50/20 transition-colors ${isEditing ? 'bg-green-50/20' : ''}`}>
                        <td className="py-2.5 px-3 font-mono text-[11px]">
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
                        <td className="py-2.5 px-3">
                          {isEditing ? (
                            <select 
                              value={editCategoria}
                              onChange={(e) => setEditCategoria(e.target.value)}
                              className="bg-white border border-slate-200 rounded px-1 py-1 text-xs focus:outline-none focus:border-green-600 cursor-pointer font-sans h-7 w-full max-w-[120px]"
                            >
                              {selectCategories.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="px-2 py-0.5 rounded border border-slate-200 font-bold text-[9px] bg-slate-50 text-slate-550 block w-max uppercase tracking-wider">
                              {item.categoria}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800">
                          {isEditing ? (
                            <input 
                              type="text"
                              value={editDescripcion}
                              onChange={(e) => setEditDescripcion(e.target.value)}
                              className="bg-white border border-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-green-600 font-sans w-full"
                            />
                          ) : (
                            <span className="font-bold">{item.descripcion}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-800">
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
                        <td className="py-2.5 px-3 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button 
                                onClick={() => handleSaveEdit(item.id)}
                                className="text-green-600 hover:text-green-705 p-1 rounded hover:bg-green-50 transition-colors cursor-pointer inline-flex items-center font-bold"
                                title="Guardar cambios"
                                id={`btn-save-gasto-${item.id}`}
                              >
                                <Check size={13} />
                              </button>
                              <button 
                                onClick={() => setEditingId(null)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center"
                                title="Cancelar"
                                id={`btn-cancel-gasto-${item.id}`}
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <button 
                                onClick={() => startEditing(item)}
                                className="text-slate-400 hover:text-green-600 p-1 rounded hover:bg-green-50 transition-colors cursor-pointer inline-flex items-center"
                                title="Editar Gasto"
                                id={`btn-edit-gasto-${item.id}`}
                              >
                                <Edit2 size={13} />
                              </button>
                              <button 
                                onClick={() => onDeleteGasto(item.id)}
                                className="text-slate-400 hover:text-red-650 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer inline-flex items-center"
                                id={`btn-delete-gasto-${item.id}`}
                                title="Eliminar Gasto"
                              >
                                <Trash2 size={13} />
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
                      No hay registros para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
