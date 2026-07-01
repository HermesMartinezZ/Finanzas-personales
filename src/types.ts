/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Ingreso {
  id: string;
  fecha: string; // YYYY-MM-DD
  concepto: string;
  valor: number;
}

export interface Factura {
  id: string;
  fechaVencimiento: string; // YYYY-MM-DD
  categoria: string;
  descripcion: string;
  valor: number;
  estado: 'Pagado' | 'Pendiente';
  fechaPago?: string; // YYYY-MM-DD
}

export interface GastoVariable {
  id: string;
  fecha: string; // YYYY-MM-DD
  categoria: string;
  descripcion: string;
  valor: number;
}

export interface Ahorro {
  id: string;
  fecha: string; // YYYY-MM-DD
  descripcion: string;
  categoria?: string; // Bolsillo o destino del ahorro
  valor: number;
}

export interface Presupuesto {
  categoria: string;
  asignado: number;
}

export interface HistorialMensual {
  id: string;
  mes: string; // e.g. "Enero 2026"
  ingresos: number;
  gastos: number;
  ahorros: number;
  disponible: number;
}

export interface FinanzasData {
  ingresos: Ingreso[];
  facturas: Factura[];
  gastos: GastoVariable[];
  ahorros: Ahorro[];
  presupuestos: Presupuesto[];
  historial: HistorialMensual[];
  categoriasAhorro?: string[]; // Bolsillos o cuentas de ahorro personalizadas
}
