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
import { FinanzasData, HistorialMensual } from '../types';

interface DashboardTabProps {
  data: FinanzasData;
  selectedMonth: string;
}

export function DashboardTab({ data, selectedMonth }: DashboardTabProps) {
  const getMonthYearFromDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 2) return '';
    const year = parts[0];
    const monthInt = parseInt(parts[1], 10);
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    if (monthInt >= 1 && monthInt <= 12) {
      return `${meses[monthInt - 1]} ${year}`;
    }
    return '';
  };

  const getCombinedHistorial = (): HistorialMensual[] => {
    const groups: { [key: string]: { ingresos: number; gastos: number; ahorros: number } } = {};
    
    data.ingresos.forEach(i => {
      const m = getMonthYearFromDate(i.fecha);
      if (!m) return;
      if (!groups[m]) groups[m] = { ingresos: 0, gastos: 0, ahorros: 0 };
      groups[m].ingresos += i.valor;
    });

    data.facturas.forEach(f => {
      const m = getMonthYearFromDate(f.fechaPago || f.fechaVencimiento);
      if (!m) return;
      if (!groups[m]) groups[m] = { ingresos: 0, gastos: 0, ahorros: 0 };
      groups[m].gastos += f.valor;
    });

    data.gastos.forEach(g => {
      const m = getMonthYearFromDate(g.fecha);
      if (!m) return;
      if (!groups[m]) groups[m] = { ingresos: 0, gastos: 0, ahorros: 0 };
      groups[m].gastos += g.valor;
    });

    data.ahorros.forEach(a => {
      const m = getMonthYearFromDate(a.fecha);
      if (!m) return;
      if (!groups[m]) groups[m] = { ingresos: 0, gastos: 0, ahorros: 0 };
      groups[m].ahorros += a.valor;
    });

    const dynamicHistoryList: HistorialMensual[] = Object.keys(groups).map(mesName => {
      const g = groups[mesName];
      return {
        id: `dynamic-${mesName}`,
        mes: mesName,
        ingresos: g.ingresos,
        gastos: g.gastos,
        ahorros: g.ahorros,
        disponible: g.ingresos - g.gastos - g.ahorros
      };
    });

    const filteredStaticHistory = data.historial.filter(h => {
      if (h.id === 'live-june' || h.id.startsWith('live-') || h.id.startsWith('dynamic-')) return false;
      return !groups[h.mes];
    });

    const combined = [...filteredStaticHistory, ...dynamicHistoryList];

    const parseMonthYearToValue = (my: string): number => {
      const parts = my.split(' ');
      if (parts.length < 2) return 0;
      const monthName = parts[0];
      const year = parseInt(parts[1], 10);
      const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];
      const monthIndex = meses.indexOf(monthName);
      return year * 12 + (monthIndex !== -1 ? monthIndex : 0);
    };

    return combined.sort((a, b) => parseMonthYearToValue(a.mes) - parseMonthYearToValue(b.mes));
  };

  const combinedHistorial = getCombinedHistorial();

  // 1. Calculations for selected month
  const isAllTime = selectedMonth === 'Todos';

  const ingresosFiltrados = isAllTime 
    ? data.ingresos 
    : data.ingresos.filter(i => getMonthYearFromDate(i.fecha) === selectedMonth);

  const facturasFiltradas = isAllTime 
    ? data.facturas 
    : data.facturas.filter(f => getMonthYearFromDate(f.fechaPago || f.fechaVencimiento) === selectedMonth);

  const gastosFiltrados = isAllTime 
    ? data.gastos 
    : data.gastos.filter(g => getMonthYearFromDate(g.fecha) === selectedMonth);

  const ahorrosFiltrados = isAllTime 
    ? data.ahorros 
    : data.ahorros.filter(a => getMonthYearFromDate(a.fecha) === selectedMonth);

  const totalIngresos = ingresosFiltrados.reduce((sum, item) => sum + item.valor, 0);
  const totalFacturas = facturasFiltradas.reduce((sum, item) => sum + item.valor, 0);
  const totalGastosVariables = gastosFiltrados.reduce((sum, item) => sum + item.valor, 0);
  const totalAhorrado = ahorrosFiltrados.reduce((sum, item) => sum + item.valor, 0);
  
  // Calculate carryover (saldo inicial traído de meses anteriores)
  const getSaldoInicialYDisponible = () => {
    if (isAllTime) {
      const totalDisp = combinedHistorial.reduce((s, h) => s + h.disponible, 0);
      return { saldoInicial: 0, disponibleAcumulado: totalDisp };
    }
    
    const index = combinedHistorial.findIndex(h => h.mes === selectedMonth);
    if (index === -1) {
      const net = totalIngresos - totalFacturas - totalGastosVariables - totalAhorrado;
      return { saldoInicial: 0, disponibleAcumulado: net };
    }
    
    // Sum all months before this one
    const saldoInicial = combinedHistorial
      .slice(0, index)
      .reduce((s, h) => s + h.disponible, 0);
      
    const netCorriente = totalIngresos - totalFacturas - totalGastosVariables - totalAhorrado;
    
    return {
      saldoInicial,
      disponibleAcumulado: saldoInicial + netCorriente
    };
  };

  const { saldoInicial, disponibleAcumulado: dineroDisponible } = getSaldoInicialYDisponible();
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

  // 3. Comparison with previous month (derived from combined history list)
  let prevMonthName = "";
  let currentMonthNameForHeader = "";
  let prevIngresos = 0;
  let prevGastosTotales = 0;
  let prevAhorros = 0;
  let prevDisponible = 0;

  let actualIngresos = 0;
  let actualGastosTotales = 0;
  let actualAhorros = 0;
  let actualDisponible = 0;

  const currentGastosTotales = totalFacturas + totalGastosVariables;

  if (isAllTime) {
    // If "Todos" is selected, compare the average of all closed months with the latest month (current/live month)
    const activeMonths = combinedHistorial;
    const latestMonthItem = activeMonths.length > 0 ? activeMonths[activeMonths.length - 1] : null;
    const pastMonths = activeMonths.length > 1 ? activeMonths.slice(0, -1) : activeMonths;

    const count = pastMonths.length;
    prevMonthName = "Promedio Histórico";
    currentMonthNameForHeader = latestMonthItem ? `${latestMonthItem.mes} (Último)` : "Mes Actual";

    if (count > 0) {
      prevIngresos = Math.round(pastMonths.reduce((sum, h) => sum + h.ingresos, 0) / count);
      prevGastosTotales = Math.round(pastMonths.reduce((sum, h) => sum + h.gastos, 0) / count);
      prevAhorros = Math.round(pastMonths.reduce((sum, h) => sum + h.ahorros, 0) / count);
      prevDisponible = Math.round(pastMonths.reduce((sum, h) => sum + h.disponible, 0) / count);
    }

    if (latestMonthItem) {
      actualIngresos = latestMonthItem.ingresos;
      actualGastosTotales = latestMonthItem.gastos;
      actualAhorros = latestMonthItem.ahorros;
      actualDisponible = latestMonthItem.disponible;
    }
  } else {
    // A specific month is selected
    const currentMonthIndex = combinedHistorial.findIndex(h => h.mes === selectedMonth);
    const lastHistoryItem = currentMonthIndex > 0 ? combinedHistorial[currentMonthIndex - 1] : null;

    prevMonthName = lastHistoryItem ? lastHistoryItem.mes : "Mes Anterior";
    currentMonthNameForHeader = selectedMonth;

    prevIngresos = lastHistoryItem ? lastHistoryItem.ingresos : 0;
    prevGastosTotales = lastHistoryItem ? lastHistoryItem.gastos : 0;
    prevAhorros = lastHistoryItem ? lastHistoryItem.ahorros : 0;
    prevDisponible = lastHistoryItem ? lastHistoryItem.disponible : 0;

    actualIngresos = totalIngresos;
    actualGastosTotales = currentGastosTotales;
    actualAhorros = totalAhorrado;
    actualDisponible = dineroDisponible;
  }

  const compData = [
    {
      criterio: 'Ingresos Totales',
      previo: prevIngresos,
      actual: actualIngresos,
      varNet: actualIngresos - prevIngresos,
      varPct: prevIngresos > 0 ? ((actualIngresos - prevIngresos) / prevIngresos) * 100 : 0,
      isCost: false
    },
    {
      criterio: 'Gastos Totales (Fijos + Var)',
      previo: prevGastosTotales,
      actual: actualGastosTotales,
      varNet: actualGastosTotales - prevGastosTotales,
      varPct: prevGastosTotales > 0 ? ((actualGastosTotales - prevGastosTotales) / prevGastosTotales) * 100 : 0,
      isCost: true
    },
    {
      criterio: 'Ahorro Consolidado',
      previo: prevAhorros,
      actual: actualAhorros,
      varNet: actualAhorros - prevAhorros,
      varPct: prevAhorros > 0 ? ((actualAhorros - prevAhorros) / prevAhorros) * 100 : 0,
      isCost: false
    },
    {
      criterio: 'Dinero Disponible',
      previo: prevDisponible,
      actual: actualDisponible,
      varNet: actualDisponible - prevDisponible,
      varPct: prevDisponible > 0 ? ((actualDisponible - prevDisponible) / prevDisponible) * 100 : 0,
      isCost: false
    }
  ];

  // 4. Expense Distribution Chart
  const categories = Array.from(new Set([
    ...facturasFiltradas.map(f => f.categoria),
    ...gastosFiltrados.map(g => g.categoria)
  ]));

  const expenseDist = categories.map(cat => {
    const sumF = facturasFiltradas.filter(f => f.categoria === cat).reduce((s, f) => s + f.valor, 0);
    const sumV = gastosFiltrados.filter(g => g.categoria === cat).reduce((s, g) => s + g.valor, 0);
    return {
      name: cat,
      value: sumF + sumV
    };
  }).filter(c => c.value > 0);

  const COLORS = ['#16a34a', '#3b82f6', '#f97316', '#ef4444', '#6366f1', '#a855f7', '#06b6d4', '#eab308', '#ec4899'];

  // 5. Historial Chart Data (mapped from combined history list)
  const chartHistory = combinedHistorial.map(h => ({
    name: h.mes,
    Ingresos: h.ingresos,
    Gastos: h.gastos,
    Ahorros: h.ahorros,
    Disponible: h.disponible
  }));

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

            {!isAllTime && (
              <div className="mt-2 pt-2 border-t border-white/5 space-y-1 text-[10px] text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>Saldo mes anterior:</span>
                  <span className="text-slate-200">{formataCOP(saldoInicial)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Flujo neto del mes:</span>
                  <span className={totalIngresos - totalFacturas - totalGastosVariables - totalAhorrado >= 0 ? "text-green-400 font-bold" : "text-rose-400 font-bold"}>
                    {totalIngresos - totalFacturas - totalGastosVariables - totalAhorrado >= 0 ? "+" : ""}{formataCOP(totalIngresos - totalFacturas - totalGastosVariables - totalAhorrado)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <p className="text-[9px] text-slate-400 mt-3 font-medium">
            {isAllTime 
              ? "Disponible Acumulado de todos los periodos."
              : "Disponible = Saldo Anterior + (Ingresos - Gastos - Ahorros de este mes)"}
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
            <p className="text-xxs text-slate-400 mt-0.5">
              {isAllTime 
                ? `${currentMonthNameForHeader} comparado contra el ${prevMonthName} de periodos cerrados.`
                : `${currentMonthNameForHeader} comparado contra ${prevMonthName}.`
              }
            </p>
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
                <th className="py-2.5 px-4 text-right">{currentMonthNameForHeader}</th>
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
