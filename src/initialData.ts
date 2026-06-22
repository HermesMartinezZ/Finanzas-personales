/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FinanzasData } from './types';

export const INITIAL_DATA: FinanzasData = {
  ingresos: [
    {
      id: 'i1',
      fecha: '2026-06-01',
      concepto: 'Salario Principal',
      valor: 4500000,
    },
    {
      id: 'i2',
      fecha: '2026-06-15',
      concepto: 'Trabajo Freelance (Desarrollo Web)',
      valor: 850000,
    },
  ],
  facturas: [
    {
      id: 'f1',
      fechaVencimiento: '2026-06-10',
      categoria: 'Vivienda',
      descripcion: 'Canon de Arriendo Apt.',
      valor: 1200000,
      estado: 'Pagado',
      fechaPago: '2026-06-05',
    },
    {
      id: 'f2',
      fechaVencimiento: '2026-06-14',
      categoria: 'Servicios',
      descripcion: 'Servicios Públicos (Agua, Luz, Gas)',
      valor: 220000,
      estado: 'Pagado',
      fechaPago: '2026-06-12',
    },
    {
      id: 'f3',
      fechaVencimiento: '2026-06-10',
      categoria: 'Vivienda',
      descripcion: 'Administración del Conjunto',
      valor: 150000,
      estado: 'Pagado',
      fechaPago: '2026-06-08',
    },
    {
      id: 'f4',
      fechaVencimiento: '2026-06-25', // less than 7 days from June 19, 2026
      categoria: 'Telecomunicaciones',
      descripcion: 'Plan Móvil e Internet Hogar Claro',
      valor: 110000,
      estado: 'Pendiente',
    },
    {
      id: 'f5',
      fechaVencimiento: '2026-06-22', // less than 7 days
      categoria: 'Entretenimiento',
      descripcion: 'Suscripciones (Netflix, Spotify, Prime)',
      valor: 45000,
      estado: 'Pendiente',
    },
    {
      id: 'f6',
      fechaVencimiento: '2026-06-15', // past due (June 15 is < June 19)
      categoria: 'Transporte',
      descripcion: 'Seguro Obligatorio Vehículo (SOAT)',
      valor: 180000,
      estado: 'Pendiente',
    },
  ],
  gastos: [
    {
      id: 'g1',
      fecha: '2026-06-03',
      categoria: 'Mercado',
      descripcion: 'Compra quincenal Almacenes Éxito',
      valor: 450000,
    },
    {
      id: 'g2',
      fecha: '2026-06-06',
      categoria: 'Restaurantes',
      descripcion: 'Almuerzo familiar fin de semana',
      valor: 120000,
    },
    {
      id: 'g3',
      fecha: '2026-06-08',
      categoria: 'Transporte',
      descripcion: 'Tanqueada de gasolina Terpel',
      valor: 110000,
    },
    {
      id: 'g4',
      fecha: '2026-06-10',
      categoria: 'Salud',
      descripcion: 'Cita odontológica de control',
      valor: 80000,
    },
    {
      id: 'g5',
      fecha: '2026-06-12',
      categoria: 'Entretenimiento',
      descripcion: 'Entradas de cine y snacks Procinal',
      valor: 50000,
    },
    {
      id: 'g6',
      fecha: '2026-06-14',
      categoria: 'Educación',
      descripcion: 'Curso de Excel y Macros AI en Udemy',
      valor: 60000,
    },
    {
      id: 'g7',
      fecha: '2026-06-16',
      categoria: 'Tecnología',
      descripcion: 'Repuesto cargador portátil',
      valor: 95000,
    },
    {
      id: 'g8',
      fecha: '2026-06-17',
      categoria: 'Transporte',
      descripcion: 'Servicio de Uber al trabajo',
      valor: 25000,
    },
  ],
  ahorros: [
    {
      id: 'a1',
      fecha: '2026-06-02',
      descripcion: 'Traspaso a cuenta de ahorro de alta rentabilidad',
      valor: 400000,
    },
    {
      id: 'a2',
      fecha: '2026-06-15',
      descripcion: 'Aporte fondo para compra de computador',
      valor: 300000,
    },
  ],
  presupuestos: [
    { categoria: 'Mercado', asignado: 800000 },
    { categoria: 'Transporte', asignado: 350000 },
    { categoria: 'Restaurantes', asignado: 400000 },
    { categoria: 'Salud', asignado: 200000 },
    { categoria: 'Entretenimiento', asignado: 300000 },
    { categoria: 'Educación', asignado: 250000 },
    { categoria: 'Tecnología', asignado: 150000 },
    { categoria: 'Otros', asignado: 200000 },
  ],
  historial: [
    {
      id: 'h1',
      mes: 'Enero 2026',
      ingresos: 4800000,
      gastos: 3200000,
      ahorros: 500000,
      disponible: 1100000,
    },
    {
      id: 'h2',
      mes: 'Febrero 2026',
      ingresos: 4900000,
      gastos: 3400000,
      ahorros: 550000,
      disponible: 950000,
    },
    {
      id: 'h3',
      mes: 'Marzo 2026',
      ingresos: 5120000,
      gastos: 3300000,
      ahorros: 600000,
      disponible: 1220000,
    },
    {
      id: 'h4',
      mes: 'Abril 2026',
      ingresos: 5000000,
      gastos: 3150000,
      ahorros: 600000,
      disponible: 1250000,
    },
    {
      id: 'h5',
      mes: 'Mayo 2026',
      ingresos: 5200000,
      gastos: 3250000,
      ahorros: 650000,
      disponible: 1300000,
    },
  ],
};
