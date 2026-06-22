/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  PiggyBank, 
  CreditCard, 
  Percent, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { FinanzasData } from '../types';

interface DashboardTabProps {
  data: FinanzasData;
}

export function DashboardTab({ data }: DashboardTabProps) {
  // 1. Calculations
  const totalIngresos = data.ingresos.reduce((sum, item) => sum + item.valor, 0);
  const totalFacturas = data.facturas.reduce((sum, item) => sum + item.valor, 0);
  const totalGastosVariables = data.gastos.reduce((sum, item) => sum + item.valor, 0);
  const totalAhorrado = data.ahorros.reduce((sum, item) => sum + item.valor, 0);
  
  const dineroDisponible = totalIngresos - totalFacturas - totalGastosVariables - totalAhorrado;
  const porcentajeGastado = totalIngresos > 0 ? ((totalFacturas + totalGastosVariables) / totalIngresos) * 100 : 0;
  const porcentajeAhorrado = totalIngresos > 0 ? (totalAhorrado / totalIngresos) * 100 : 0;

  // Formatting helper
  const formataCOP = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  };

  // 2. Health Status Indicator
  let healthText = "EXCELENTE (Saludable)";
  let healthColor = "bg-green-50 text-green-900 border-green-200/60";
  let healthDot = "bg-green-500";
  let healthDesc = "Mantienes un balance óptimo con un remanente mayor al 15% de tus ingresos.";

  if (dineroDisponible < 0) {
    healthText = "CRÍTICO (Déficit)";
    healthColor = "bg-rose-50 text-rose-900 border-rose-250";
    healthDot = "bg-rose-550";
    healthDesc = "Tus compromisos y gastos superan tus ingresos totales. ¡Ajusta tu presupuesto urgente!";
  } else if (dineroDisponible < (0.15 * totalIngresos)) {
    healthText = "ALERTA (Poco Margen)";
    healthColor = "bg-orange-50 text-orange-950 border-orange-200";
    healthDot = "bg-orange-500";
    healthDesc = "Tu remanente disponible está por debajo del 15%. Intenta reducir algunos gastos variables.";
  }

  // 3. Comparison with previous month (Last month in history)
  const lastHistoryItem = data.historial && data.historial.length > 0 
    ? data.historial[data.historial.length - 1] 
    : null;

  const prevMonthName = lastHistoryItem ? lastHistoryItem.mes : "Mes Anterior";
  const prevIngresos = lastHistoryItem ? lastHistoryItem.ingresos : 0;
  const prevGastosTotales = lastHistoryItem ? lastHistoryItem.gastos : 0;
  const prevAhorros = lastHistoryItem ? lastHistoryItem.ahorros : 0;
  const prevDisponible = lastHistoryItem ? lastHistoryItem.disponible : 0;

  const currentGastosTotales = totalFacturas + totalGastosVariables;

  const compData = [
    {
      criterio: 'Ingresos Totales',
      previo: prevIngresos,
      actual: totalIngresos,
      varNet: totalIngresos - prevIngresos,
      varPct: ((totalIngresos - prevIngresos) / prevIngresos) * 100,
      isCost: false
    },
    {
      criterio: 'Gastos Totales (Fijos + Var)',
      previo: prevGastosTotales,
      actual: currentGastosTotales,
      varNet: currentGastosTotales - prevGastosTotales,
      varPct: ((currentGastosTotales - prevGastosTotales) / prevGastosTotales) * 100,
      isCost: true
    },
    {
      criterio: 'Ahorro Consolidado',
      previo: prevAhorros,
      actual: totalAhorrado,
      varNet: totalAhorrado - prevAhorros,
      varPct: prevAhorros > 0 ? ((totalAhorrado - prevAhorros) / prevAhorros) * 100 : 0,
      isCost: false
    },
    {
      criterio: 'Dinero Disponible',
      previo: prevDisponible,
      actual: dineroDisponible,
      varNet: dineroDisponible - prevDisponible,
      varPct: ((dineroDisponible - prevDisponible) / prevDisponible) * 100,
      isCost: false
    }
  ];

  // 4. Expense Distribution Chart
  const categories = Array.from(new Set([
    ...data.facturas.map(f => f.categoria),
    ...data.gastos.map(g => g.categoria)
  ]));

  const expenseDist = categories.map(cat => {
    const sumF = data.facturas.filter(f => f.categoria === cat).reduce((s, f) => s + f.valor, 0);
    const sumV = data.gastos.filter(g => g.categoria === cat).reduce((s, g) => s + g.valor, 0);
    return {
      name: cat,
      value: sumF + sumV
    };
  }).filter(c => c.value > 0);

  const COLORS = ['#16a34a', '#3b82f6', '#f97316', '#ef4444', '#6366f1', '#a855f7', '#06b6d4', '#eab308', '#ec4899'];

  // 5. Historial Chart Data
  // Combine stored historical records with the LIVE calculated June month
  const chartHistory = [
    ...data.historial.map(h => ({
      name: h.mes,
      Ingresos: h.ingresos,
      Gastos: h.gastos,
      Ahorros: h.ahorros,
      Disponible: h.disponible
    })),
    {
      name: 'Junio 2026',
      Ingresos: totalIngresos,
      Gastos: currentGastosTotales,
      Ahorros: totalAhorrado,
      Disponible: dineroDisponible
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div id="card-ingresos" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ingresos Totales</span>
            <div className="bg-green-50 p-2 rounded-lg text-green-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-mono font-bold text-slate-900 tracking-tight">{formataCOP(totalIngresos)}</h3>
            <p className="text-xxs text-green-600 mt-1 font-bold flex items-center gap-1">
              • +10.6% vs mes anterior
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div id="card-facturas" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Facturas / Fijos</span>
            <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
              <Calendar size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-mono font-bold text-slate-900 tracking-tight">{formataCOP(totalFacturas)}</h3>
            <p className="text-xxs text-slate-400 mt-1 font-bold">
              • Obligaciones del mes
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div id="card-gastos-variables" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gastos Variables</span>
            <div className="bg-red-50 p-2 rounded-lg text-red-600">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-mono font-bold text-slate-900 tracking-tight">{formataCOP(totalGastosVariables)}</h3>
            <p className="text-xxs text-slate-400 mt-1 font-bold">
              • Consumos diarios
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div id="card-ahorros" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ahorro Mensual</span>
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <PiggyBank size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-mono font-bold text-slate-900 tracking-tight">{formataCOP(totalAhorrado)}</h3>
            <p className="text-xxs text-blue-600 mt-1 font-bold flex items-center">
              • {porcentajeAhorrado.toFixed(1)}% de ingresos
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Secondary Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 5: Disponible */}
        <div id="card-disponible" className="bg-slate-900 text-white p-6 rounded-xl shadow-md border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dinero Disponible</span>
              <div className="bg-white/10 p-2 rounded-lg">
                <DollarSign size={16} />
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-mono font-bold text-green-500 tracking-tight">
              {formataCOP(dineroDisponible)}
            </h3>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-medium">
            Fórmula: Disponible = Ingresos - Facturas - Gastos - Ahorros
          </p>
        </div>

        {/* Card 6: % Gastado */}
        <div id="card-pct-gastado" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Presupuesto Consumido</span>
              <span className="text-xs font-mono font-bold text-slate-700">{porcentajeGastado.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 mt-3 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${porcentajeGastado > 90 ? 'bg-red-500' : 'bg-green-600'}`}
                style={{ width: `${Math.min(porcentajeGastado, 100)}%` }}
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-medium">
            Destinado a pagar gastos y obligaciones generales del mes.
          </p>
        </div>

        {/* Health status alert panel */}
        <div id="card-health" className={`p-5 rounded-xl border flex flex-col justify-between ${healthColor}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest uppercase opacity-75">Comportamiento Financiero</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${healthDot}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${healthDot}`} />
            </span>
          </div>
          <div className="mt-3">
            <h4 className="text-sm font-bold tracking-tight">
              {healthText}
            </h4>
            <p className="text-[10px] mt-1 leading-relaxed opacity-90">
              {healthDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Evolution */}
        <div id="chart-panel-evolution" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
              Evolución Mensual del Presupuesto
            </h3>
            <p className="text-xxs text-slate-405 leading-relaxed mt-0.5">Historial acumulado contra el mes en curso.</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis 
                  stroke="#94A3B8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `$${(val / 1e6).toFixed(1)}M`} 
                />
                <Tooltip 
                  formatter={(value) => [formataCOP(Number(value)), '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="Ingresos" stroke="#16a34a" strokeWidth={2} fillOpacity={1} fill="url(#colorIngresos)" />
                <Area type="monotone" dataKey="Gastos" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorGastos)" />
                <Area type="monotone" dataKey="Ahorros" stroke="#3b82f6" strokeWidth={1.5} fill="none" strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Dist */}
        <div id="chart-panel-distribution" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
              Distribución de Gastos
            </h3>
            <p className="text-xxs text-slate-400 mt-0.5">Total fijos + variables por categoría.</p>
          </div>
          
          <div className="h-48 w-full relative flex items-center justify-center my-4">
            {expenseDist.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formataCOP(Number(value)), '']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400 text-center">No hay gastos ingresados</div>
            )}
            
            {expenseDist.length > 0 && (
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Consumido</span>
                <span className="text-xs font-mono font-bold text-slate-700">{formataCOP(currentGastosTotales)}</span>
              </div>
            )}
          </div>

          {/* Simple custom legend inside tab */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 overflow-y-auto max-h-24 pt-2 border-t border-slate-100">
            {expenseDist.slice(0, 8).map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="truncate font-medium text-slate-600">{entry.name}</span>
                <span className="ml-auto font-mono font-bold text-slate-700">{((entry.value / currentGastosTotales) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Comparison vs Month Mayo Table */}
      <div id="comparison-section" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
              Comparativo Mes Anterior vs Mes Actual
            </h3>
            <p className="text-xxs text-slate-400 mt-0.5">Junio 2026 comparado contra {prevMonthName}.</p>
          </div>
          <span className="text-xxs bg-slate-55 border border-slate-200 px-2.5 py-1 rounded-lg font-bold text-slate-500 tracking-wide">
            ANÁLISIS ESTÁNDAR EXCEL
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-widest">
                <th className="py-2.5 px-4 text-left">Indicador / Criterio</th>
                <th className="py-2.5 px-4 text-right">{prevMonthName}</th>
                <th className="py-2.5 px-4 text-right">Junio 2026 (Live)</th>
                <th className="py-2.5 px-4 text-right">Variación Neta</th>
                <th className="py-2.5 px-4 text-right">Variación %</th>
                <th className="py-2.5 px-4 text-center">Diagnóstico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {compData.map((row, idx) => {
                const isPositive = row.varNet >= 0;
                let textClass = "";
                let badgeStyle = "";

                if (row.isCost) {
                  // Expense increase is bad (red), decrease is good (green)
                  textClass = isPositive ? "text-red-600 font-semibold" : "text-green-600 font-semibold";
                  badgeStyle = isPositive 
                    ? "bg-red-50 text-red-700 border-red-100" 
                    : "bg-green-50 text-green-700 border-green-150";
                } else {
                  // Incomes/Savings increase is good (green), decrease is bad (red)
                  textClass = isPositive ? "text-green-600 font-semibold" : "text-red-600 font-semibold";
                  badgeStyle = isPositive 
                    ? "bg-green-50 text-green-700 border-green-150" 
                    : "bg-red-50 text-red-700 border-red-100";
                }

                return (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-700">{row.criterio}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">{formataCOP(row.previo)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-800 font-extrabold">{formataCOP(row.actual)}</td>
                    <td className={`py-3 px-4 text-right font-mono ${textClass}`}>
                      {row.varNet > 0 ? '+' : ''}{formataCOP(row.varNet)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${textClass}`}>
                      {row.varNet > 0 ? '+' : ''}{row.varPct.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 text-[9px] font-black rounded border ${badgeStyle}`}>
                        {row.isCost ? (
                          isPositive ? "▲ GASTO ALTO" : "▼ GASTO REDUCIDO"
                        ) : (
                          isPositive ? "▲ INCREMENTO" : "▼ DECREMENTO"
                        )}
                      </span>
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
