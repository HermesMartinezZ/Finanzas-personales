/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { FinanzasData } from '../types';

export const generateExcelFile = async (data: FinanzasData) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Control de Finanzas Personales';
  workbook.lastModifiedBy = 'Control de Finanzas Personales';
  workbook.created = new Date();

  // Palette definition
  const COL_PRIMARY = '1F4E5B';   // Deep Teal Green (Headers)
  const COL_SECONDARY = 'E8F1F2'; // Light Mint Accent
  const COL_CARD_BG = 'F8F9FA';    // Light Slate Card Background
  const COL_ACCENT = '2A9D8F';       // Vibrant Teal Sage
  
  // Status Colors
  const COLOR_PAID_BG = 'D1E7DD';
  const COLOR_PAID_FG = '0F5132';
  const COLOR_PENDING_BG = 'FFF3CD';
  const COLOR_PENDING_FG = '664D03';
  const COLOR_OVERDUE_BG = 'F8D7DA';
  const COLOR_OVERDUE_FG = '842029';

  // Fonts
  const FONT_TITLE = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  const FONT_SECTION = { name: 'Segoe UI', size: 12, bold: true, color: { argb: '1F4E5B' } };
  const FONT_HEADER = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } };
  const FONT_KPI_VAL = { name: 'Segoe UI', size: 14, bold: true, color: { argb: '1F4E5B' } };
  const FONT_KPI_LBL = { name: 'Segoe UI', size: 9, bold: false, color: { argb: '6C757D' } };
  const FONT_BODY = { name: 'Segoe UI', size: 10 };
  const FONT_BODY_BOLD = { name: 'Segoe UI', size: 10, bold: true };

  // Common Borders (Typed as any to bypass strict literal checks)
  const borderThin: any = {
    top: { style: 'thin', color: { argb: 'E0E0E0' } },
    left: { style: 'thin', color: { argb: 'E0E0E0' } },
    bottom: { style: 'thin', color: { argb: 'E0E0E0' } },
    right: { style: 'thin', color: { argb: 'E0E0E0' } }
  };
  const borderCard: any = {
    top: { style: 'thin', color: { argb: 'BFD8D5' } },
    left: { style: 'thin', color: { argb: 'BFD8D5' } },
    bottom: { style: 'thin', color: { argb: 'BFD8D5' } },
    right: { style: 'thin', color: { argb: 'BFD8D5' } }
  };

  const applyTitle = (sheet: ExcelJS.Worksheet, text: string) => {
    // Row 2 is Title Row
    sheet.mergeCells('B2:H2');
    const titleCell = sheet.getCell('B2');
    titleCell.value = text;
    titleCell.font = FONT_TITLE;
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COL_PRIMARY }
    };
    sheet.getRow(2).height = 40;
  };

  const autofitColumns = (sheet: ExcelJS.Worksheet) => {
    sheet.columns.forEach((column) => {
      let maxLen = 0;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const text = cell.value ? String(cell.value) : '';
        if (text.length > maxLen) {
          maxLen = text.length;
        }
      });
      column.width = Math.max(maxLen + 4, 12);
    });
  };

  // -------------------------------------------------------------------------
  // 1. DASHBOARD SHEET
  // -------------------------------------------------------------------------
  const shDash = workbook.addWorksheet('DASHBOARD', { views: [{ showGridLines: true }] });
  applyTitle(shDash, 'PANEL DE CONTROL - FINANZAS PERSONALES COP');

  // KPI Row 1: Headers in Row 4, Values in Row 5
  // Columns: B (Ingresos), E (Facturas), H (Gastos Variables)
  const configureKPICard = (
    sheet: ExcelJS.Worksheet,
    labelRange: string,
    valRange: string,
    label: string,
    formulaStr: string,
    defaultVal: number | string,
    isCurrency = true
  ) => {
    sheet.mergeCells(labelRange);
    sheet.mergeCells(valRange);

    const lblCell = sheet.getCell(labelRange.split(':')[0]);
    lblCell.value = label;
    lblCell.font = FONT_KPI_LBL;
    lblCell.alignment = { vertical: 'middle', horizontal: 'center' };
    lblCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F7' } };

    const valCell = sheet.getCell(valRange.split(':')[0]);
    valCell.value = { formula: formulaStr, result: defaultVal as any };
    valCell.font = FONT_KPI_VAL;
    valCell.alignment = { vertical: 'middle', horizontal: 'center' };
    valCell.numFmt = isCurrency ? '"$"#,##0' : '0.0%';

    // Apply borders to the cells
    const labels = labelRange.split(':');
    const vals = valRange.split(':');
    const allCells = [...labels, ...vals];
    allCells.forEach(coord => {
      sheet.getCell(coord).border = borderCard;
    });
  };

  // Calculate current mock results for better direct viewer load experience
  const currentTotalIncomes = data.ingresos.reduce((sum, item) => sum + item.valor, 0);
  const currentTotalInvoices = data.facturas.reduce((sum, item) => sum + item.valor, 0);
  const currentTotalExpenses = data.gastos.reduce((sum, item) => sum + item.valor, 0);
  const currentTotalSavings = data.ahorros.reduce((sum, item) => sum + item.valor, 0);
  const currentAvailable = currentTotalIncomes - currentTotalInvoices - currentTotalExpenses - currentTotalSavings;

  // Row 4-5 Incomes Card (B4:C5)
  configureKPICard(shDash, 'B4:C4', 'B5:C5', 'INGRESOS TOTALES', 'SUM(INGRESOS!C7:C200)', currentTotalIncomes);
  // Row 4-5 Invoices Card (E4:F4)
  configureKPICard(shDash, 'E4:F4', 'E5:F5', 'TOTAL FACTURAS', 'SUM(FACTURAS!D7:D200)', currentTotalInvoices);
  // Row 4-5 Expenses Card (H4:I4)
  configureKPICard(shDash, 'H4:I4', 'H5:I5', 'TOTAL GASTOS VARIABLES', "SUM('GASTOS VARIABLES'!D7:D200)", currentTotalExpenses);

  // Row 7-8 Savings Card (B7:C7)
  configureKPICard(shDash, 'B7:C7', 'B8:C8', 'TOTAL AHORRADO', 'SUM(AHORROS!C7:C200)', currentTotalSavings);
  // Row 7-8 Available Cash (E7:F8) - Formula: Ingresos - Facturas - Gastos - Ahorros
  configureKPICard(shDash, 'E7:F7', 'E8:F8', 'DINERO DISPONIBLE', 'B5-E5-H5-B8', currentAvailable);
  // Row 7-8 % Spent (H7:I8)
  configureKPICard(shDash, 'H7:I7', 'H8:I8', '% GASTADO', '(E5+H5)/B5', (currentTotalInvoices + currentTotalExpenses) / currentTotalIncomes, false);

  // Row 10-11 % Saved (B10:C11)
  configureKPICard(shDash, 'B10:C10', 'B11:C11', '% AHORRADO', 'B8/B5', currentTotalSavings / currentTotalIncomes, false);

  // Semáforo Disponible State Card (E10:F11)
  shDash.mergeCells('E10:F10');
  shDash.mergeCells('E11:F11');
  const dS1 = shDash.getCell('E10');
  dS1.value = 'ESTADO DE SALUD FINANCIERA';
  dS1.font = FONT_KPI_LBL;
  dS1.alignment = { vertical: 'middle', horizontal: 'center' };
  dS1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F7' } };

  const dS2 = shDash.getCell('E11');
  // Formula returns red if available is negative, yellow if tight (<15% of income), green if high.
  // We use B5 (Incomes) as divisor
  dS2.value = {
    formula: 'IF(E8<0,"🔴 CRÍTICO (Déficit)",IF(E8<(0.15*B5),"🟡 ALERTA (Poco Margen)","🟢 EXCELENTE (Saludable)"))',
    result: currentAvailable < 0 ? "🔴 CRÍTICO (Déficit)" : currentAvailable < (0.15 * currentTotalIncomes) ? "🟡 ALERTA (Poco Margen)" : "🟢 EXCELENTE (Saludable)"
  };
  dS2.font = FONT_BODY_BOLD;
  dS2.alignment = { vertical: 'middle', horizontal: 'center' };
  ['E10','E11','F10','F11'].forEach(c => shDash.getCell(c).border = borderCard);

  // Dynamic extraction of previous month's data from user's history
  const lastHistoryItem = data.historial && data.historial.length > 0 
    ? data.historial[data.historial.length - 1] 
    : null;

  const prevMonthNameLabel = lastHistoryItem ? `${lastHistoryItem.mes} (Mes Anterior)` : "Mes Anterior";
  const prevIngresos = lastHistoryItem ? lastHistoryItem.ingresos : 0;
  const prevGastosTotales = lastHistoryItem ? lastHistoryItem.gastos : 0;
  const prevAhorros = lastHistoryItem ? lastHistoryItem.ahorros : 0;
  const prevDisponible = lastHistoryItem ? lastHistoryItem.disponible : 0;

  // Comparative block in row 14
  shDash.mergeCells('B13:H13');
  const cpTitle = shDash.getCell('B13');
  cpTitle.value = 'COMPARATIVO: MES ANTERIOR VS MES ACTUAL';
  cpTitle.font = FONT_SECTION;
  cpTitle.alignment = { vertical: 'middle', horizontal: 'left' };

  const cpHeaders = ['Criterio', prevMonthNameLabel, 'Junio 2026 (Mes Actual)', 'Variación Neta', 'Variación %', 'Estado de Alerta'];
  shDash.getRow(14).height = 25;
  cpHeaders.forEach((hd, idx) => {
    const colIdx = idx + 2; // matches cols B to G
    const cell = shDash.getCell(14, colIdx);
    cell.value = hd;
    cell.font = FONT_HEADER;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COL_PRIMARY } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderThin;
  });

  const comparisonRows = [
    { label: 'Ingresos', prev: prevIngresos, actFormula: 'B5', actVal: currentTotalIncomes, isCost: false },
    { label: 'Gastos Fijos + Diarios', prev: prevGastosTotales, actFormula: 'E5+H5', actVal: currentTotalInvoices + currentTotalExpenses, isCost: true },
    { label: 'Ahorro Realizado', prev: prevAhorros, actFormula: 'B8', actVal: currentTotalSavings, isCost: false },
    { label: 'Disponible Residual', prev: prevDisponible, actFormula: 'E8', actVal: currentAvailable, isCost: false }
  ];

  comparisonRows.forEach((row, idx) => {
    const rowNum = 15 + idx;
    shDash.getRow(rowNum).height = 22;

    const cellLabel = shDash.getCell(rowNum, 2);
    cellLabel.value = row.label;
    cellLabel.font = FONT_BODY_BOLD;
    cellLabel.border = borderThin;

    const cellPrev = shDash.getCell(rowNum, 3);
    cellPrev.value = row.prev;
    cellPrev.font = FONT_BODY;
    cellPrev.numFmt = '"$"#,##0';
    cellPrev.border = borderThin;

    const cellAct = shDash.getCell(rowNum, 4);
    cellAct.value = { formula: row.actFormula, result: row.actVal };
    cellAct.font = FONT_BODY;
    cellAct.numFmt = '"$"#,##0';
    cellAct.border = borderThin;

    // Net Variacion: Act - Prev
    const cellVarNet = shDash.getCell(rowNum, 5);
    const colActLtr = 'D', colPrevLtr = 'C';
    cellVarNet.value = { formula: `${colActLtr}${rowNum}-${colPrevLtr}${rowNum}`, result: row.actVal - row.prev };
    cellVarNet.font = FONT_BODY;
    cellVarNet.numFmt = '"$"#,##0;[Red]"$"#,##0;"$ "0';
    cellVarNet.border = borderThin;

    // % Var: VarNet / Prev
    const cellVarPct = shDash.getCell(rowNum, 6);
    const colVarNetLtr = 'E';
    cellVarPct.value = { 
      formula: `IF(${colPrevLtr}${rowNum}=0, 0, ${colVarNetLtr}${rowNum}/${colPrevLtr}${rowNum})`, 
      result: row.prev === 0 ? 0 : (row.actVal - row.prev) / row.prev 
    };
    cellVarPct.font = FONT_BODY;
    cellVarPct.numFmt = '+0.0%;-0.0%;0.0%';
    cellVarPct.border = borderThin;

    // Alert / Traffic
    const cellAlert = shDash.getCell(rowNum, 7);
    if (row.isCost) {
      cellAlert.value = {
        formula: `IF(E${rowNum}<=0, "🟢 AHORRO (Menos Gasto)", "🔴 AUMENTO GASTO")`,
        result: (row.actVal - row.prev <= 0) ? "🟢 AHORRO (Menos Gasto)" : "🔴 AUMENTO GASTO"
      };
    } else {
      cellAlert.value = {
        formula: `IF(E${rowNum}>=0, "🟢 POSITIVO (Incremento)", "🔴 REDUCCIÓN")`,
        result: (row.actVal - row.prev >= 0) ? "🟢 POSITIVO (Incremento)" : "🔴 REDUCCIÓN"
      };
    }
    cellAlert.font = FONT_BODY_BOLD;
    cellAlert.alignment = { horizontal: 'center' };
    cellAlert.border = borderThin;
  });

  // -------------------------------------------------------------------------
  // 2. INGRESOS SHEET
  // -------------------------------------------------------------------------
  const shIng = workbook.addWorksheet('INGRESOS', { views: [{ showGridLines: true }] });
  applyTitle(shIng, 'REGISTRO MENSUAL DE INGRESOS - COP');

  // Summary header block in B4
  shIng.mergeCells('B4:C4');
  shIng.mergeCells('B5:C5');
  const ingKPI1 = shIng.getCell('B4');
  ingKPI1.value = 'TOTAL INGRESOS DEL MES';
  ingKPI1.font = FONT_KPI_LBL;
  ingKPI1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F7' } };
  ingKPI1.alignment = { horizontal: 'center' };

  const ingKPI2 = shIng.getCell('B5');
  ingKPI2.value = { formula: 'SUM(C8:C200)', result: currentTotalIncomes };
  ingKPI2.font = FONT_KPI_VAL;
  ingKPI2.numFmt = '"$"#,##0';
  ingKPI2.alignment = { horizontal: 'center' };
  ['B4','B5','C4','C5'].forEach(c => shIng.getCell(c).border = borderCard);

  // Set up table
  shIng.getRow(7).height = 25;
  const ingHeaders = ['Fecha', 'Concepto / Canal de Ingreso', 'Valor Recibido'];
  ingHeaders.forEach((h, idx) => {
    const cell = shIng.getCell(7, idx + 1);
    cell.value = h;
    cell.font = FONT_HEADER;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COL_PRIMARY } };
    cell.alignment = { vertical: 'middle', horizontal: idx === 2 ? 'right' : 'left' };
    cell.border = borderThin;
  });

  data.ingresos.forEach((item, idx) => {
    const rIdx = 8 + idx;
    shIng.getRow(rIdx).height = 20;

    const c1 = shIng.getCell(rIdx, 1);
    c1.value = item.fecha;
    c1.font = FONT_BODY;
    c1.alignment = { horizontal: 'center' };
    c1.border = borderThin;

    const c2 = shIng.getCell(rIdx, 2);
    c2.value = item.concepto;
    c2.font = FONT_BODY;
    c2.border = borderThin;

    const c3 = shIng.getCell(rIdx, 3);
    c3.value = item.valor;
    c3.font = FONT_BODY_BOLD;
    c3.numFmt = '"$"#,##0';
    c3.border = borderThin;
  });

  // Freeze top 7 rows for comfortable scrolling
  shIng.views = [{ state: 'frozen', xSplit: 0, ySplit: 7 }];
  // Filter for key columns
  shIng.autoFilter = 'A7:C200';

  // -------------------------------------------------------------------------
  // 3. FACTURAS SHEET
  // -------------------------------------------------------------------------
  const shFact = workbook.addWorksheet('FACTURAS', { views: [{ showGridLines: true }] });
  applyTitle(shFact, 'CONTROL DE FACTURAS Y OBLIGACIONES FIJAS');

  // Summary cards (B4:C5) - total, (E4:F5) - pagadas, (H4:I5) - pendientes
  configureKPICard(shFact, 'B4:C4', 'B5:C5', 'TOTAL FACTURAS', 'SUM(D8:D200)', currentTotalInvoices);
  configureKPICard(shFact, 'E4:F4', 'E5:F5', 'PAGADAS', 'SUMIF(E8:E200,"Pagado",D8:D200)', data.facturas.filter(f => f.estado === 'Pagado').reduce((s,f)=>s+f.valor, 0));
  configureKPICard(shFact, 'H4:I4', 'H5:I5', 'PENDIENTES', 'SUMIF(E8:E200,"Pendiente",D8:D200)', data.facturas.filter(f => f.estado === 'Pendiente').reduce((s,f)=>s+f.valor,0));

  // Table header
  shFact.getRow(7).height = 25;
  const factHeaders = ['Vencimiento', 'Categoría', 'Descripción', 'Valor Obligación', 'Estado', 'Fecha de Pago'];
  factHeaders.forEach((h, idx) => {
    const cell = shFact.getCell(7, idx + 1);
    cell.value = h;
    cell.font = FONT_HEADER;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COL_PRIMARY } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderThin;
  });

  // Current simulation date is June 19, 2026
  const SIMULATED_NOW = new Date('2026-06-19');

  data.facturas.forEach((item, idx) => {
    const rIdx = 8 + idx;
    shFact.getRow(rIdx).height = 22;

    const c1 = shFact.getCell(rIdx, 1);
    c1.value = item.fechaVencimiento;
    c1.font = FONT_BODY;
    c1.alignment = { horizontal: 'center' };
    c1.border = borderThin;

    const c2 = shFact.getCell(rIdx, 2);
    c2.value = item.categoria;
    c2.font = FONT_BODY;
    c2.border = borderThin;

    const c3 = shFact.getCell(rIdx, 3);
    c3.value = item.descripcion;
    c3.font = FONT_BODY;
    c3.border = borderThin;

    const c4 = shFact.getCell(rIdx, 4);
    c4.value = item.valor;
    c4.font = FONT_BODY_BOLD;
    c4.numFmt = '"$"#,##0';
    c4.border = borderThin;

    const c5 = shFact.getCell(rIdx, 5);
    c5.value = item.estado;
    c5.font = FONT_BODY_BOLD;
    c5.alignment = { horizontal: 'center' };
    c5.border = borderThin;

    // Set colors for Estado statically at export based on status:
    // Verde if está pagada.
    // Amarillo si vence en menos de 7 días.
    // Rojo si está vencida.
    const dueDate = new Date(item.fechaVencimiento);
    const diffTime = dueDate.getTime() - SIMULATED_NOW.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (item.estado === 'Pagado') {
      c5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PAID_BG } };
      c5.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLOR_PAID_FG } };
    } else if (diffDays < 0) {
      c5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_OVERDUE_BG } };
      c5.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLOR_OVERDUE_FG } };
    } else if (diffDays <= 7) {
      c5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PENDING_BG } };
      c5.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLOR_PENDING_FG } };
    } else {
      c5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F2F5' } };
      c5.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '40454a' } };
    }

    const c6 = shFact.getCell(rIdx, 6);
    c6.value = item.fechaPago || '-';
    c6.font = FONT_BODY;
    c6.alignment = { horizontal: 'center' };
    c6.border = borderThin;
  });

  // Freeze top row & activate filtering
  shFact.views = [{ state: 'frozen', xSplit: 0, ySplit: 7 }];
  shFact.autoFilter = 'A7:F200';


  // -------------------------------------------------------------------------
  // 4. GASTOS VARIABLES SHEET
  // -------------------------------------------------------------------------
  const shGastVal = workbook.addWorksheet('GASTOS VARIABLES', { views: [{ showGridLines: true }] });
  applyTitle(shGastVal, 'REGISTRO DE GASTOS VARIABLES Y CONSUMOS DIARIOS');

  // KPI total (B4:C5)
  configureKPICard(shGastVal, 'B4:C4', 'B5:C5', 'TOTAL GASTOS VARIABLES', 'SUM(D8:D200)', currentTotalExpenses);

  // Table Headers (A7 to D7)
  shGastVal.getRow(7).height = 25;
  const gasHeaders = ['Fecha de Consumo', 'Categoría', 'Descripción del Gasto', 'Valor Pagado'];
  gasHeaders.forEach((h, idx) => {
    const cell = shGastVal.getCell(7, idx + 1);
    cell.value = h;
    cell.font = FONT_HEADER;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COL_PRIMARY } };
    cell.alignment = { vertical: 'middle', horizontal: idx === 3 ? 'right' : 'left' };
    cell.border = borderThin;
  });

  // Category list table on the right: F7 to G15
  shGastVal.getCell('F6').value = 'GASTOS POR CATEGORÍA';
  shGastVal.getCell('F6').font = FONT_BODY_BOLD;
  shGastVal.getCell('F7').value = 'Categoría';
  shGastVal.getCell('F7').font = FONT_HEADER;
  shGastVal.getCell('F7').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COL_PRIMARY } };
  shGastVal.getCell('F7').border = borderThin;

  shGastVal.getCell('G7').value = 'Total Acumulado';
  shGastVal.getCell('G7').font = FONT_HEADER;
  shGastVal.getCell('G7').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COL_PRIMARY } };
  shGastVal.getCell('G7').alignment = { horizontal: 'right' };
  shGastVal.getCell('G7').border = borderThin;

  const categoriesSugg = ['Mercado', 'Transporte', 'Restaurantes', 'Salud', 'Entretenimiento', 'Educación', 'Tecnología', 'Otros'];
  categoriesSugg.forEach((cat, idx) => {
    const rIdx = 8 + idx;
    const cCat = shGastVal.getCell(rIdx, 6);
    cCat.value = cat;
    cCat.font = FONT_BODY;
    cCat.border = borderThin;

    const cVal = shGastVal.getCell(rIdx, 7);
    // Formula calculates sumif: =SUMIF(B$8:B$200, F8, D$8:D$200)
    cVal.value = {
      formula: `SUMIF(B$8:B$200, F${rIdx}, D$8:D$200)`,
      result: data.gastos.filter(g => g.categoria === cat).reduce((s, g) => s + g.valor, 0)
    };
    cVal.font = FONT_BODY_BOLD;
    cVal.numFmt = '"$"#,##0';
    cVal.border = borderThin;
  });

  // Table contents
  data.gastos.forEach((item, idx) => {
    const rIdx = 8 + idx;
    shGastVal.getRow(rIdx).height = 20;

    const c1 = shGastVal.getCell(rIdx, 1);
    c1.value = item.fecha;
    c1.font = FONT_BODY;
    c1.alignment = { horizontal: 'center' };
    c1.border = borderThin;

    const c2 = shGastVal.getCell(rIdx, 2);
    c2.value = item.categoria;
    c2.font = FONT_BODY;
    c2.border = borderThin;

    const c3 = shGastVal.getCell(rIdx, 3);
    c3.value = item.descripcion;
    c3.font = FONT_BODY;
    c3.border = borderThin;

    const c4 = shGastVal.getCell(rIdx, 4);
    c4.value = item.valor;
    c4.font = FONT_BODY_BOLD;
    c4.numFmt = '"$"#,##0';
    c4.border = borderThin;
  });

  // Freeze top part
  shGastVal.views = [{ state: 'frozen', xSplit: 0, ySplit: 7 }];
  shGastVal.autoFilter = 'A7:D200';


  // -------------------------------------------------------------------------
  // 5. AHORROS SHEET
  // -------------------------------------------------------------------------
  const shAho = workbook.addWorksheet('AHORROS', { views: [{ showGridLines: true }] });
  applyTitle(shAho, 'HISTORIAL DE APORTES DE AHORRO');

  // KPI cards
  const initialSavingsCarried = 2900000;
  configureKPICard(shAho, 'B4:C4', 'B5:C5', 'TOTAL AHORRADO ACUMULADO', 'SUM(C8:C200)+' + initialSavingsCarried, currentTotalSavings + initialSavingsCarried);
  configureKPICard(shAho, 'E4:F4', 'E5:F5', 'AHORRADO ESTE MES', 'SUM(C8:C200)', currentTotalSavings);

  // Table Headers
  shAho.getRow(7).height = 25;
  const iAhoHeaders = ['Fecha Aporte', 'Detalle del Aporte / Fondo Destino', 'Valor Aportado'];
  iAhoHeaders.forEach((h, idx) => {
    const cell = shAho.getCell(7, idx + 1);
    cell.value = h;
    cell.font = FONT_HEADER;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COL_PRIMARY } };
    cell.alignment = { vertical: 'middle', horizontal: idx === 2 ? 'right' : 'left' };
    cell.border = borderThin;
  });

  data.ahorros.forEach((item, idx) => {
    const rIdx = 8 + idx;
    shAho.getRow(rIdx).height = 20;

    const c1 = shAho.getCell(rIdx, 1);
    c1.value = item.fecha;
    c1.font = FONT_BODY;
    c1.alignment = { horizontal: 'center' };
    c1.border = borderThin;

    const c2 = shAho.getCell(rIdx, 2);
    c2.value = item.descripcion;
    c2.font = FONT_BODY;
    c2.border = borderThin;

    const c3 = shAho.getCell(rIdx, 3);
    c3.value = item.valor;
    c3.font = FONT_BODY_BOLD;
    c3.numFmt = '"$"#,##0';
    c3.border = borderThin;
  });

  shAho.views = [{ state: 'frozen', xSplit: 0, ySplit: 7 }];
  shAho.autoFilter = 'A7:C200';


  // -------------------------------------------------------------------------
  // 6. PRESUPUESTO SHEET
  // -------------------------------------------------------------------------
  const shPres = workbook.addWorksheet('PRESUPUESTO', { views: [{ showGridLines: true }] });
  applyTitle(shPres, 'CONTROL DE PRESUPUESTOS POR CATEGORÍA');

  // KPI panels
  const currentTotalBudget = data.presupuestos.reduce((s, p) => s + p.asignado, 0);
  configureKPICard(shPres, 'B4:C4', 'B5:C5', 'PRESUPUESTO TOTAL', 'SUM(B8:B15)', currentTotalBudget);
  configureKPICard(shPres, 'E4:F4', 'E5:F5', 'TOTAL GASTADO REAL (VAR)', 'SUM(C8:C15)', currentTotalExpenses);
  configureKPICard(shPres, 'H4:I4', 'H5:I5', 'SALDO DISPONIBLE TOTAL', 'B5-E5', currentTotalBudget - currentTotalExpenses);

  // Table Headers
  shPres.getRow(7).height = 25;
  const presHeaders = ['Categoría', 'Presupuesto Asignado', 'Gastado Real', 'Cupo Disponible', 'Ejecución %', 'Semáforo de Estado'];
  presHeaders.forEach((h, idx) => {
    const cell = shPres.getCell(7, idx + 1);
    cell.value = h;
    cell.font = FONT_HEADER;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COL_PRIMARY } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderThin;
  });

  data.presupuestos.forEach((item, idx) => {
    const rIdx = 8 + idx;
    shPres.getRow(rIdx).height = 22;

    const c1 = shPres.getCell(rIdx, 1);
    c1.value = item.categoria;
    c1.font = FONT_BODY_BOLD;
    c1.border = borderThin;

    const c2 = shPres.getCell(rIdx, 2);
    c2.value = item.asignado;
    c2.font = FONT_BODY;
    c2.numFmt = '"$"#,##0';
    c2.border = borderThin;

    // Link Gastado Real with Gastos Variables sheet dynamically using formula
    // SUMIF('GASTOS VARIABLES'!B8:B200, A8, 'GASTOS VARIABLES'!D8:D200)
    const gastadoRealVal = data.gastos.filter(g => g.categoria === item.categoria).reduce((s,g)=>s+g.valor, 0);
    const c3 = shPres.getCell(rIdx, 3);
    c3.value = {
      formula: `SUMIF('GASTOS VARIABLES'!B$8:B$200, A${rIdx}, 'GASTOS VARIABLES'!D$8:D$200)`,
      result: gastadoRealVal
    };
    c3.font = FONT_BODY;
    c3.numFmt = '"$"#,##0';
    c3.border = borderThin;

    // Cupo Disponible: Presupuesto - Gastado
    const c4 = shPres.getCell(rIdx, 4);
    c4.value = { formula: `B${rIdx}-C${rIdx}`, result: item.asignado - gastadoRealVal };
    c4.font = FONT_BODY_BOLD;
    c4.numFmt = '"$"#,##0;[Red]"$"#,##0;"$ "0';
    c4.border = borderThin;

    // Ejecucion %: Gastado / Presupuesto
    const c5 = shPres.getCell(rIdx, 5);
    c5.value = { formula: `IFERROR(C${rIdx}/B${rIdx}, 0)`, result: item.asignado > 0 ? gastadoRealVal / item.asignado : 0 };
    c5.font = FONT_BODY;
    c5.numFmt = '0.0%';
    c5.border = borderThin;

    // Semaphore
    // GREEN: < 70%, YELLOW: 70-90%, RED: > 90%
    const c6 = shPres.getCell(rIdx, 6);
    const executionRate = item.asignado > 0 ? gastadoRealVal / item.asignado : 0;
    c6.value = {
      formula: `IF(E${rIdx}<0.7, "🟢 Bajo (OK)", IF(E${rIdx}<=0.9, "🟡 Medio (Alerta)", "🔴 Crítico (Excedido)"))`,
      result: executionRate < 0.70 ? "🟢 Bajo (OK)" : executionRate <= 0.90 ? "🟡 Medio (Alerta)" : "🔴 Crítico (Excedido)"
    };
    c6.font = FONT_BODY_BOLD;
    c6.alignment = { horizontal: 'center' };
    c6.border = borderThin;

    // Apply color highlight physically in export
    if (executionRate < 0.70) {
      c6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PAID_BG } };
      c6.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLOR_PAID_FG } };
    } else if (executionRate <= 0.90) {
      c6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PENDING_BG } };
      c6.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLOR_PENDING_FG } };
    } else {
      c6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_OVERDUE_BG } };
      c6.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLOR_OVERDUE_FG } };
    }
  });

  shPres.views = [{ state: 'frozen', xSplit: 0, ySplit: 7 }];


  // -------------------------------------------------------------------------
  // 7. HISTORIAL MENSUAL SHEET
  // -------------------------------------------------------------------------
  const shHist = workbook.addWorksheet('HISTORIAL', { views: [{ showGridLines: true }] });
  applyTitle(shHist, 'HISTORIAL MENSUAL ACUMULADO');

  // Header cells
  shHist.getRow(5).height = 25;
  const histHeaders = ['Mes / Periodo', 'Ingresos Totales', 'Gastos Propios (Fijos + Var)', 'Ahorros Consolidados', 'Disponible Residual'];
  histHeaders.forEach((h, idx) => {
    const cell = shHist.getCell(5, idx + 1);
    cell.value = h;
    cell.font = FONT_HEADER;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COL_PRIMARY } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderThin;
  });

  // Seeds data for past months
  data.historial.forEach((item, idx) => {
    const rIdx = 6 + idx;
    shHist.getRow(rIdx).height = 20;

    const c1 = shHist.getCell(rIdx, 1);
    c1.value = item.mes;
    c1.font = FONT_BODY_BOLD;
    c1.border = borderThin;

    const c2 = shHist.getCell(rIdx, 2);
    c2.value = item.ingresos;
    c2.font = FONT_BODY;
    c2.numFmt = '"$"#,##0';
    c2.border = borderThin;

    const c3 = shHist.getCell(rIdx, 3);
    c3.value = item.gastos;
    c3.font = FONT_BODY;
    c3.numFmt = '"$"#,##0';
    c3.border = borderThin;

    const c4 = shHist.getCell(rIdx, 4);
    c4.value = item.ahorros;
    c4.font = FONT_BODY;
    c4.numFmt = '"$"#,##0';
    c4.border = borderThin;

    const c5 = shHist.getCell(rIdx, 5);
    c5.value = item.disponible;
    c5.font = FONT_BODY_BOLD;
    c5.numFmt = '"$"#,##0';
    c5.border = borderThin;
  });

  // Now, link June 2026 dynamically to Dashboard KPI outcomes!
  const juneRowIdx = 6 + data.historial.length; // Row 11
  shHist.getRow(juneRowIdx).height = 22;

  const j1 = shHist.getCell(juneRowIdx, 1);
  j1.value = 'Junio 2026 (Actual)';
  j1.font = FONT_BODY_BOLD;
  j1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COL_SECONDARY } };
  j1.border = borderThin;

  // Incomes link: DASHBOARD!B5
  const j2 = shHist.getCell(juneRowIdx, 2);
  j2.value = { formula: 'DASHBOARD!B5', result: currentTotalIncomes };
  j2.font = FONT_BODY;
  j2.numFmt = '"$"#,##0';
  j2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COL_SECONDARY } };
  j2.border = borderThin;

  // Total expenses link: DASHBOARD!E5+DASHBOARD!H5 (fijos + var)
  const j3 = shHist.getCell(juneRowIdx, 3);
  j3.value = { formula: 'DASHBOARD!E5+DASHBOARD!H5', result: currentTotalInvoices + currentTotalExpenses };
  j3.font = FONT_BODY;
  j3.numFmt = '"$"#,##0';
  j3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COL_SECONDARY } };
  j3.border = borderThin;

  // Savings link: DASHBOARD!B8
  const j4 = shHist.getCell(juneRowIdx, 4);
  j4.value = { formula: 'DASHBOARD!B8', result: currentTotalSavings };
  j4.font = FONT_BODY;
  j4.numFmt = '"$"#,##0';
  j4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COL_SECONDARY } };
  j4.border = borderThin;

  // Available link: DASHBOARD!E8
  const j5 = shHist.getCell(juneRowIdx, 5);
  j5.value = { formula: 'DASHBOARD!E8', result: currentAvailable };
  j5.font = FONT_BODY_BOLD;
  j5.numFmt = '"$"#,##0;[Red]"$"#,##0;"$ "0';
  j5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COL_SECONDARY } };
  j5.border = borderThin;

  // Totales Row
  const totRowIdx = juneRowIdx + 1; // Row 12
  shHist.getRow(totRowIdx).height = 22;

  const t1 = shHist.getCell(totRowIdx, 1);
  t1.value = 'Total Histórico';
  t1.font = FONT_BODY_BOLD;
  t1.border = borderThin;

  for (let c = 2; c <= 5; c++) {
    const colLtr = String.fromCharCode(64 + c);
    const cell = shHist.getCell(totRowIdx, c);
    cell.value = { formula: `SUM(${colLtr}6:${colLtr}${juneRowIdx})`, result: 0 }; // let excel calculate
    cell.font = FONT_BODY_BOLD;
    cell.numFmt = '"$"#,##0';
    cell.border = borderThin;
  }


  // -------------------------------------------------------------------------
  // 8. PROYECCIÓN ANUAL SHEET
  // -------------------------------------------------------------------------
  const shProy = workbook.addWorksheet('PROYECCIÓN ANUAL', { views: [{ showGridLines: true }] });
  applyTitle(shProy, 'PROYECCIONES Y PLANIFICACIÓN ANUAL');

  shProy.mergeCells('B4:H4');
  const proyDesc = shProy.getCell('B4');
  proyDesc.value = 'Cálculos proyectados a 12 meses basados en el promedio de los meses históricos';
  proyDesc.font = FONT_BODY;
  proyDesc.alignment = { horizontal: 'center' };

  // Set headers
  shProy.getRow(6).height = 25;
  const proyHeaders = ['Métrica Proyectada', 'Promedio Mensual Actual', 'Factor Anual', 'Total Proyección Anual', 'Recomendación'];
  proyHeaders.forEach((h, idx) => {
    const cell = shProy.getCell(6, idx + 2); // starts at Col B (2)
    cell.value = h;
    cell.font = FONT_HEADER;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COL_PRIMARY } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderThin;
  });

  const proyConfigs = [
    { label: 'INGRESOS ANUALES', histCol: 'B', recomFormula: 'IF(D7>50000000, "🟢 Ingreso robusto. Busca diversificación.", "🟡 Considera fuentes extras.")' },
    { label: 'GASTOS ANUALES EST.', histCol: 'C', recomFormula: 'IF(D8>(0.7*D7), "🔴 Alerta: Los gastos superan el 70% recomendado.", "🟢 Excelente proporción.")' },
    { label: 'AHORRO ANUAL ESTIMADO', histCol: 'D', recomFormula: 'IF(D9>(0.15*D7), "🟢 Excelente ritmo de ahorro (>=15%).", "🟡 Ideal aumentar a por lo menos el 10%.")' },
    { label: 'DISPONIBLE ANUAL EST.', histCol: 'E', recomFormula: 'IF(D10<0, "🔴 Alerta de endeudamiento crónico.", "🟢 Mantienes balance saludable.")' }
  ];

  proyConfigs.forEach((conf, idx) => {
    const rIdx = 7 + idx;
    shProy.getRow(rIdx).height = 25;

    // Metrica
    const c1 = shProy.getCell(rIdx, 2);
    c1.value = conf.label;
    c1.font = FONT_BODY_BOLD;
    c1.border = borderThin;

    // Promedio Mensual Formula linking to Historial: =AVERAGE(HISTORIAL!Col6:Col11)
    const c2 = shProy.getCell(rIdx, 3);
    c2.value = { formula: `AVERAGE(HISTORIAL!${conf.histCol}6:${conf.histCol}${juneRowIdx})`, result: 0 };
    c2.font = FONT_BODY;
    c2.numFmt = '"$"#,##0';
    c2.border = borderThin;

    // Factor
    const c3 = shProy.getCell(rIdx, 4);
    c3.value = 12;
    c3.font = FONT_BODY;
    c3.alignment = { horizontal: 'center' };
    c3.border = borderThin;

    // Total Proyeccion: Promedio * 12
    const c4 = shProy.getCell(rIdx, 5);
    c4.value = { formula: `C${rIdx}*D${rIdx}`, result: 0 };
    c4.font = FONT_BODY_BOLD;
    c4.numFmt = '"$"#,##0';
    c4.border = borderThin;

    // Recomendacion
    const c5 = shProy.getCell(rIdx, 6);
    c5.value = { formula: conf.recomFormula, result: "Analizando..." };
    c5.font = FONT_BODY;
    c5.border = borderThin;
  });


  // -------------------------------------------------------------------------
  // AUTOCOLUMNS & SAVE ACTION
  // -------------------------------------------------------------------------
  // Run autofit columns for all worksheets to make them perfectly styled once loaded
  workbook.worksheets.forEach((sheet) => {
    autofitColumns(sheet);
  });

  // Specific custom overrides for better padding
  shDash.getColumn('B').width = 24;
  shDash.getColumn('C').width = 24;
  shDash.getColumn('D').width = 6;
  shDash.getColumn('E').width = 24;
  shDash.getColumn('F').width = 24;
  shDash.getColumn('G').width = 6;
  shDash.getColumn('H').width = 25;
  shDash.getColumn('I').width = 25;

  shProy.getColumn('B').width = 26;
  shProy.getColumn('C').width = 26;
  shProy.getColumn('D').width = 14;
  shProy.getColumn('E').width = 28;
  shProy.getColumn('F').width = 44;

  const buffer = await workbook.xlsx.writeBuffer();
  const fileBlob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(fileBlob, 'Control_Finanzas_Personales_COP.xlsx');
};
