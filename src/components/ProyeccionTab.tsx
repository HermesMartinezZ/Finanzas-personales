/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, BarChart3, ShieldCheck, Flame, Info, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { FinanzasData } from '../types';

interface ProyeccionTabProps {
  data: FinanzasData;
}

export function ProyeccionTab({ data }: ProyeccionTabProps) {
  // 1. Gather all recorded months
  const liveIncomes = data.ingresos.reduce((s, i) => s + i.valor, 0);
  const liveExpenses = data.facturas.reduce((s, f) => s + f.valor, 0) + data.gastos.reduce((s, g) => s + g.valor, 0);
  const liveSavings = data.ahorros.reduce((s, a) => s + a.valor, 0);
  const liveAvail = liveIncomes - liveExpenses - liveSavings;

  const allMonths = [
    ...data.historial,
    { id: 'live', mes: 'Junio 2026', ingresos: liveIncomes, gastos: liveExpenses, savings: liveSavings, disponible: liveAvail }
  ];

  // 2. Compute averages based on values
  const totalMonthsCount = allMonths.length;
  const avgMonthlyIncomes = allMonths.reduce((sum, m) => sum + m.ingresos, 0) / totalMonthsCount;
  
  // Wait, let's look at how gastos should be extracted from different objects
  const avgMonthlyExpenses = allMonths.reduce((sum, m) => {
    // some static database objects inside data.historial use the schema key: "gastos"
    const gas = 'gastos' in m ? (m as any).gastos : (m as any).gastos;
    return sum + gas;
  }, 0) / totalMonthsCount;

  const avgMonthlySavings = allMonths.reduce((sum, m) => {
    const sav = 'ahorros' in m ? (m as any).ahorros : 'savings' in m ? (m as any).savings : 0;
    return sum + (sav || 0);
  }, 0) / totalMonthsCount;

  const avgMonthlyDisponible = allMonths.reduce((sum, m) => sum + m.disponible, 0) / totalMonthsCount;

  // 3. Projections factor
  const projectedIncomes = avgMonthlyIncomes * 12;
  const projectedExpenses = avgMonthlyExpenses * 12;
  const projectedSavings = avgMonthlySavings * 12;
  const projectedDisponible = avgMonthlyDisponible * 12;

  const formataCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  // 4. Recommendation thresholds
  const expensePercentage = projectedIncomes > 0 ? (projectedExpenses / projectedIncomes) * 100 : 0;
  const savingsPercentage = projectedIncomes > 0 ? (projectedSavings / projectedIncomes) * 100 : 0;

  let adviceCardHeading = "";
  let adviceCardColor = "";
  let adviceCardIcon = null;
  let adviceCardPoints: string[] = [];

  if (expensePercentage > 75) {
    adviceCardHeading = "Recomendación: Plan de Contención de Costos Urgente";
    adviceCardColor = "bg-red-50 text-red-750 border-red-150";
    adviceCardIcon = <AlertTriangle className="text-red-600 shrink-0" size={20} />;
    adviceCardPoints = [
      "Tus gastos proyectados representan más del 75% de tus ingresos estimados anuales, superando la regla prudencial del 50-30-20.",
      "Revisa la pestaña PRESUPUESTOS y reduce a la mitad el cupo de categorías no esenciales como 'Entretenimiento' o 'Restaurantes'.",
      "Evalúa recortar las suscripciones duplicadas reflejadas en tus FACTURAS para liberar flujo neta mensual."
    ];
  } else if (savingsPercentage < 10) {
    adviceCardHeading = "Recomendación: Incrementar Margen Preventivo de Depósitos";
    adviceCardColor = "bg-orange-50 text-orange-750 border-orange-150";
    adviceCardIcon = <AlertTriangle className="text-orange-600 shrink-0" size={20} />;
    adviceCardPoints = [
      "Tu proporción de ahorro estimada anual está por debajo del 10%. Lo idóneo para finanzas sólidas es del 15% al 20%.",
      "Programa transferencias automáticas en tus INGRESOS a primera hora de recibir tu salario; ahorra antes de empezar a gastar.",
      "Establece una política de micro-ahorro registrando aportes pequeños constantes semanales."
    ];
  } else {
    adviceCardHeading = "Diagnóstico: Tus Finanzas se Proyectan con Excelente Salud";
    adviceCardColor = "bg-green-50 text-green-755 border-green-150";
    adviceCardIcon = <ShieldCheck className="text-green-600 shrink-0" size={20} />;
    adviceCardPoints = [
      "¡Felicitaciones! Cumples holgadamente los estándares del cuadrante ideal de estabilidad: tu tasa de gasto está bajo control (<70%) y ahorras de manera óptima.",
      "Con un acumulado anual de ahorro proyectado de más de " + formataCOP(projectedSavings) + ", puedes abrir depósitos de renta fija (CDTs) o fondos de inversión colectiva de bajo riesgo.",
      "Mantén actualizado tu diario de facturas para retener este ritmo intachable."
    ];
  }

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Description Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
        <div className="bg-blue-50 text-blue-600 p-3 rounded-lg border border-blue-100">
          <BarChart3 size={20} />
        </div>
        <div>
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">Modelo Estadístico de Proyección Anual</h3>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Estimamos el comportamiento financiero a 12 meses basando las multiplicaciones estrictamente en el promedio de los meses registrados en tu histórico (Enero a Junio de 25/26). Esto evita picos irreales y te da una visión de tu balance neto futuro.
          </p>
        </div>
      </div>

      {/* Projection Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ingresos Anuales Est.</span>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-800 font-mono">{formataCOP(projectedIncomes)}</span>
            <div className="flex items-center gap-1 text-slate-400 text-xxs mt-2 border-t border-slate-100 pt-2">
              <span className="font-semibold text-slate-500 font-mono">{formataCOP(avgMonthlyIncomes)}</span>
              <span>/ promedio mes</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gastos Anuales Est.</span>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-800 font-mono">{formataCOP(projectedExpenses)}</span>
            <div className="flex items-center gap-1 text-slate-400 text-xxs mt-2 border-t border-slate-100 pt-2">
              <span className="font-semibold text-slate-500 font-mono">{formataCOP(avgMonthlyExpenses)}</span>
              <span>/ promedio mes</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ahorro Anual Est.</span>
          <div className="mt-3">
            <span className="text-2xl font-bold text-green-600 font-mono">{formataCOP(projectedSavings)}</span>
            <div className="flex items-center gap-1 text-slate-400 text-xxs mt-2 border-t border-slate-100 pt-2">
              <span className="font-semibold text-green-600 font-mono">{formataCOP(avgMonthlySavings)}</span>
              <span>/ promedio mes</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Disponible Anual Est.</span>
          <div className="mt-3">
            <span className={`text-2xl font-bold font-mono ${projectedDisponible >= 0 ? 'text-blue-600' : 'text-red-650'}`}>
              {formataCOP(projectedDisponible)}
            </span>
            <div className="flex items-center gap-1 text-slate-400 text-xxs mt-2 border-t border-slate-100 pt-2">
              <span className={`font-semibold font-mono ${projectedDisponible >= 0 ? 'text-blue-600' : 'text-red-650'}`}>
                {formataCOP(avgMonthlyDisponible)}
              </span>
              <span>/ promedio mes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Averages List and Recommendations block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendation card Column */}
        <div className={`lg:col-span-2 p-5 rounded-xl border ${adviceCardColor} flex flex-col justify-between shadow-sm space-y-4`}>
          <div className="flex items-start gap-3">
            {adviceCardIcon}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-700">{adviceCardHeading}</h4>
              <p className="text-xs leading-relaxed opacity-95 mt-1">Nuestros algoritmos financieros han estructurado los siguientes puntos de optimización personalizados:</p>
            </div>
          </div>

          <div className="space-y-3 pl-8">
            {adviceCardPoints.map((pt, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="font-bold text-xs mt-0.5">•</span>
                <p className="text-xs leading-relaxed opacity-95">{pt}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-current/10 text-[10px] flex items-center gap-1.5 opacity-90 font-bold uppercase tracking-wider">
            <Sparkles size={12} />
            Métricas re-evaluadas automáticamente tras cualquier alteración de ingresos o cobros fijos en las otras pestañas.
          </div>
        </div>

        {/* Ideal distribution metrics card */}
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">Distribución de Proporción</h4>
            <p className="text-[10px] text-slate-400 mt-1">Compara la distribución estimada de tus ingresos contra las ratios de sanidad estándar (70/15/15).</p>
          </div>

          <div className="space-y-4">
            {/* Gasto ratio */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Gastos fijos/var</span>
                <span className="font-mono text-slate-700">{expensePercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${expensePercentage <= 70 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(expensePercentage, 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block tracking-wide italic">Target recomendado: menos del 70%</span>
            </div>

            {/* Ahorro ratio */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Ahorros consolidados</span>
                <span className="font-mono text-slate-700">{savingsPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full bg-green-500`}
                  style={{ 
                    width: `${Math.min(savingsPercentage, 100)}%`
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block tracking-wide italic">Target recomendado: más del 15%</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg text-[10px] text-slate-450 flex items-start gap-1.5 border border-slate-200">
            <Info size={13} className="text-slate-400 shrink-0 mt-0.5" />
            <p>
              Proyección optimizada para Google Sheets. Al exportar tu excel, las fórmulas correspondientes se generarán en la pestaña <strong>PROYECCIÓN ANUAL</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
