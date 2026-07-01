/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Trash2, Search, CheckCircle, Clock, AlertTriangle, ToggleLeft, ToggleRight, Calendar, Edit2, Check, X } from 'lucide-react';
import { Factura } from '../types';

interface FacturasTabProps {
  facturas: Factura[];
  categorias: string[];
  defaultDate?: string;
  selectedMonth?: string;
  onAddFactura: (newBill: Omit<Factura, 'id'>) => void;
  onToggleFacturaEstado: (id: string, paymentDate?: string) => void;
  onDeleteFactura: (id: string) => void;
  onAddCategory: (categoria: string, asignado: number) => void;
  onUpdateFactura: (updated: Factura) => void;
}

export function FacturasTab({ 
  facturas, 
  categorias,
  defaultDate,
  selectedMonth = 'Todos',
  onAddFactura, 
  onToggleFacturaEstado, 
  onDeleteFactura,
  onAddCategory,
  onUpdateFactura
}: FacturasTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [valor, setValor] = useState('');
  const [vencimiento, setVencimiento] = useState(defaultDate || new Date().toISOString().split('T')[0]);

  React.useEffect(() => {
    if (defaultDate) {
      setVencimiento(defaultDate);
    }
  }, [defaultDate]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState<'all' | 'Pagado' | 'Pendiente' | 'Vencida'>('all');
  
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');

  // Editing state variables
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVencimiento, setEditVencimiento] = useState('');
  const [editCategoria, setEditCategoria] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editValor, setEditValor] = useState('');
  const [editEstado, setEditEstado] = useState<'Pagado' | 'Pendiente'>('Pendiente');
  const [editFechaPago, setEditFechaPago] = useState<string | undefined>(undefined);

  const startEditing = (item: Factura) => {
    setEditingId(item.id);
    setEditVencimiento(item.fechaVencimiento);
    setEditCategoria(item.categoria);
    setEditDescripcion(item.descripcion);
    setEditValor(item.valor.toString());
    setEditEstado(item.estado);
    setEditFechaPago(item.fechaPago);
  };

  const handleSaveEdit = (item: Factura) => {
    if (!editDescripcion.trim() || !editValor || Number(editValor) <= 0) return;
    onUpdateFactura({
      ...item,
      fechaVencimiento: editVencimiento,
      categoria: editCategoria,
      descripcion: editDescripcion.trim(),
      valor: Number(editValor),
      estado: editEstado,
      fechaPago: editEstado === 'Pagado' ? (editFechaPago || new Date().toISOString().split('T')[0]) : undefined
    });
    setEditingId(null);
  };

  const selectCategories = Array.from(new Set([
    'Vivienda', 
    'Servicios', 
    'Telecomunicaciones', 
    'Entretenimiento', 
    'Transporte', 
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

  // Submits and registers new bill
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim() || !valor || Number(valor) <= 0) return;

    const chosenCategory = categoria || selectCategories[0] || 'Otros';

    onAddFactura({
      categoria: chosenCategory.trim(),
      descripcion: descripcion.trim(),
      valor: Number(valor),
      fechaVencimiento: vencimiento,
      estado: 'Pendiente'
    });

    setCategoria('');
    setDescripcion('');
    setValor('');
    setVencimiento(defaultDate || new Date().toISOString().split('T')[0]);
    setIsFormOpen(false);
  };

  // State checks for each bill
  const getInvoiceStatus = (fact: Factura) => {
    if (fact.estado === 'Pagado') return 'Pagado';
    
    // Check if overdue or due within 7 days using clear local date matching
    const [y, m, d] = fact.fechaVencimiento.split('-').map(Number);
    const dueTime = new Date(y, m - 1, d).getTime();
    
    const today = new Date();
    const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    
    const diffTime = dueTime - todayTime;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Vencida';
    if (diffDays === 0) return 'VenceHoy';
    if (diffDays > 0 && diffDays <= 7) return 'DueSoon';
    return 'Pendiente';
  };

  // Summary Metrics
  const totalFacturas = facturas.reduce((sum, f) => sum + f.valor, 0);
  const totalPagadas = facturas.filter(f => f.estado === 'Pagado').reduce((sum, f) => sum + f.valor, 0);
  const totalPendientes = facturas.filter(f => f.estado === 'Pendiente').reduce((sum, f) => sum + f.valor, 0);

  // Filters logic
  const filteredFacturas = facturas.filter(fact => {
    // Search match
    const matchSearch = 
      fact.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fact.categoria.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    // Filter tab
    const status = getInvoiceStatus(fact);
    if (stateFilter === 'all') return true;
    if (stateFilter === 'Pagado') return fact.estado === 'Pagado';
    if (stateFilter === 'Pendiente') return fact.estado === 'Pendiente' && status !== 'Vencida';
    if (stateFilter === 'Vencida') return status === 'Vencida';

    return true;
  });

  const formataCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Invoices */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Total Facturas</span>
            <span className="text-2xl font-mono font-bold text-slate-900">{formataCOP(totalFacturas)}</span>
          </div>
          <div className="bg-slate-50 text-slate-500 p-3 rounded-lg border border-slate-200">
            <Calendar size={18} />
          </div>
        </div>

        {/* Paid Invoices */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Facturas Pagadas</span>
            <span className="text-2xl font-mono font-bold text-green-600">{formataCOP(totalPagadas)}</span>
          </div>
          <div className="bg-green-50 text-green-600 p-3 rounded-lg border border-green-100">
            <CheckCircle size={18} />
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Facturas Pendientes</span>
            <span className="text-2xl font-mono font-bold text-orange-600">{formataCOP(totalPendientes)}</span>
          </div>
          <div className="bg-orange-50 text-orange-600 p-3 rounded-lg border border-orange-100">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* Main Block Box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 overflow-hidden">
        {/* Filter Rail and Controllers */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setStateFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xxs font-extrabold uppercase border transition-all cursor-pointer ${stateFilter === 'all' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-505 hover:bg-slate-50'}`}
            >
              Todas ({facturas.length})
            </button>
            <button 
              onClick={() => setStateFilter('Pagado')}
              className={`px-3 py-1.5 rounded-lg text-xxs font-extrabold uppercase border transition-all cursor-pointer ${stateFilter === 'Pagado' ? 'bg-green-600 border-green-600 text-white' : 'bg-green-50/60 border-green-200/60 text-green-700 hover:bg-green-50'}`}
            >
              Pagadas ({facturas.filter(f => f.estado === 'Pagado').length})
            </button>
            <button 
              onClick={() => setStateFilter('Pendiente')}
              className={`px-3 py-1.5 rounded-lg text-xxs font-extrabold uppercase border transition-all cursor-pointer ${stateFilter === 'Pendiente' ? 'bg-orange-500 border-orange-500 text-white' : 'bg-orange-50/60 border-orange-200/60 text-orange-700 hover:bg-orange-50'}`}
            >
              Por Vencer ({facturas.filter(f => f.estado === 'Pendiente' && getInvoiceStatus(f) !== 'Vencida').length})
            </button>
            <button 
              onClick={() => setStateFilter('Vencida')}
              className={`px-3 py-1.5 rounded-lg text-xxs font-extrabold uppercase border transition-all cursor-pointer ${stateFilter === 'Vencida' ? 'bg-red-600 border-red-600 text-white' : 'bg-red-50/60 border-red-200/60 text-red-700 hover:bg-red-50'}`}
            >
              Vencidas ({facturas.filter(f => getInvoiceStatus(f) === 'Vencida').length})
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <input 
                id="search-invoice"
                type="text"
                placeholder="Buscar descripción o categoría..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-green-600 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            </div>

            {/* Toggle form button */}
            <button 
              id="btn-toggle-add-bill"
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="bg-slate-900 text-white border border-slate-800 rounded-xl py-2 px-4 text-xs font-bold hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Plus size={14} />
              {isFormOpen ? 'CERRAR REGISTRO' : 'REGISTRAR FACTURA'}
            </button>
          </div>
        </div>

        {/* Forms Slide box */}
        {isFormOpen && (
          <form id="form-add-bill" onSubmit={handleSubmit} className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-xl animate-fadeIn space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2.5 mb-2">
              <Calendar className="text-green-600" size={14} />
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Agregar nueva obligación de pago fijo</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="venc-bill" className="text-xxs font-bold uppercase tracking-wider text-slate-455">Fecha de Vencimiento</label>
                <input 
                  id="venc-bill"
                  type="date"
                  required
                  value={vencimiento}
                  onChange={(e) => setVencimiento(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="cat-bill" className="text-xxs font-bold uppercase tracking-wider text-slate-455">Categoría de Presupuesto</label>
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
                      placeholder="e.g. Servicios, Suscripciones"
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
                    id="cat-bill"
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
                <label htmlFor="desc-bill" className="text-xxs font-bold uppercase tracking-wider text-slate-455">Descripción Obligación</label>
                <input 
                  id="desc-bill"
                  type="text"
                  placeholder="e.g. Luz Enel, Pago arriendo"
                  required
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="val-bill" className="text-xxs font-bold uppercase tracking-wider text-slate-455">Valor (COP)</label>
                <input 
                  id="val-bill"
                  type="number"
                  placeholder="e.g. 210000"
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
                Agregar Factura
              </button>
            </div>
          </form>
        )}

        {/* Tables */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                <th className="py-2.5 px-4">Vencimiento</th>
                <th className="py-2.5 px-4">Categoría</th>
                <th className="py-2.5 px-4">Descripción</th>
                <th className="py-2.5 px-4 text-right">Valor</th>
                <th className="py-2.5 px-4 text-center">Estado de Pago</th>
                <th className="py-2.5 px-4 text-center">Fecha Pago</th>
                <th className="py-2.5 px-4 text-center">Acción de Cobro</th>
                <th className="py-2.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredFacturas.length > 0 ? (
                filteredFacturas.map((item) => {
                  const status = getInvoiceStatus(item);
                  const isEditing = editingId === item.id;
                  
                  let badgeColors = "";
                  let cardBorder = "";
                  let statusLabel = "";

                  if (item.estado === 'Pagado') {
                    badgeColors = "bg-green-50 text-green-700 border-green-150";
                    cardBorder = "border-l-4 border-l-green-600";
                    statusLabel = "🟢 Pagada";
                  } else if (status === 'Vencida') {
                    badgeColors = "bg-red-50 text-red-700 border-red-150";
                    cardBorder = "border-l-4 border-l-red-600";
                    statusLabel = "🔴 Vencida";
                  } else if (status === 'VenceHoy') {
                    badgeColors = "bg-rose-50 text-rose-700 border-rose-200 animate-pulse font-extrabold";
                    cardBorder = "border-l-4 border-l-rose-500";
                    statusLabel = "⚡ VENCE HOY";
                  } else if (status === 'DueSoon') {
                    badgeColors = "bg-orange-50 text-orange-700 border-orange-150";
                    cardBorder = "border-l-4 border-l-orange-500";
                    statusLabel = "🟡 Vence Pronto (<7d)";
                  } else {
                    badgeColors = "bg-slate-50 text-slate-600 border-slate-200";
                    cardBorder = "border-l-4 border-l-slate-350";
                    statusLabel = "🕒 Pendiente";
                  }

                  return (
                    <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors ${isEditing ? 'bg-green-50/20' : ''}`}>
                      <td className={`py-3 px-4 font-mono text-[11px] ${cardBorder}`}>
                        {isEditing ? (
                          <input 
                            type="date"
                            value={editVencimiento}
                            onChange={(e) => setEditVencimiento(e.target.value)}
                            className="bg-white border border-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-green-600 font-mono w-28"
                          />
                        ) : (
                          item.fechaVencimiento
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
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
                          <span className="font-semibold">{item.categoria}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-800">
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
                          <select 
                            value={editEstado}
                            onChange={(e) => {
                              const nextEst = e.target.value as 'Pagado' | 'Pendiente';
                              setEditEstado(nextEst);
                              if (nextEst === 'Pagado' && !editFechaPago) {
                                setEditFechaPago(new Date().toISOString().split('T')[0]);
                              }
                            }}
                            className="bg-white border border-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-green-600 font-sans h-7 w-24"
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="Pagado">Pagada</option>
                          </select>
                        ) : (
                          <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold rounded border ${badgeColors}`}>
                            {statusLabel}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500 font-mono text-[11px]">
                        {isEditing ? (
                          editEstado === 'Pagado' ? (
                            <input 
                              type="date"
                              value={editFechaPago || ''}
                              onChange={(e) => setEditFechaPago(e.target.value)}
                              className="bg-white border border-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-green-600 font-mono w-28"
                            />
                          ) : (
                            <span className="text-slate-400">-</span>
                          )
                        ) : (
                          item.fechaPago || '-'
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isEditing ? (
                          <span className="text-[10px] text-slate-400 italic">Editando...</span>
                        ) : (
                          <button 
                            onClick={() => {
                              const todayStr = new Date().toISOString().split('T')[0];
                              onToggleFacturaEstado(item.id, item.estado === 'Pendiente' ? todayStr : undefined);
                            }}
                            className={`text-[9px] font-bold px-2.5 py-1 rounded border cursor-pointer transition-all uppercase tracking-wide ${item.estado === 'Pagado' 
                              ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200' 
                              : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-110'}`}
                            id={`btn-toggle-paid-state-${item.id}`}
                          >
                            {item.estado === 'Pagado' ? 'Revertir' : 'Pagar'}
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => handleSaveEdit(item)}
                              className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50 transition-colors cursor-pointer inline-flex items-center font-bold"
                              title="Guardar cambios"
                              id={`btn-save-bill-${item.id}`}
                            >
                              <Check size={13} />
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center"
                              title="Cancelar"
                              id={`btn-cancel-bill-${item.id}`}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => startEditing(item)}
                              className="text-slate-400 hover:text-green-600 p-1 rounded hover:bg-green-50 transition-colors cursor-pointer inline-flex items-center"
                              title="Editar Factura"
                              id={`btn-edit-bill-${item.id}`}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button 
                              onClick={() => onDeleteFactura(item.id)}
                              className="text-slate-400 hover:text-red-650 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer inline-flex items-center"
                              id={`btn-delete-bill-${item.id}`}
                              title="Eliminar Factura"
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
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Ninguna factura registrada coincide con este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
