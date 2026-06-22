import ExcelJS from 'exceljs';
import { FinanzasData } from '../types';

/**
 * Parses a downloaded Finanzas Personales .xlsx file and restores the full system state.
 * Reads the individual worksheets, filters out cell formulas/metatemplates, and reconstructs lists.
 */
export async function parseExcelFile(file: File): Promise<FinanzasData> {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);

  const data: FinanzasData = {
    ingresos: [],
    facturas: [],
    gastos: [],
    ahorros: [],
    presupuestos: [],
    historial: [],
  };

  const getCellValue = (cell: any): any => {
    if (!cell) return undefined;
    const val = cell.value;
    if (val === null || val === undefined) return undefined;
    if (typeof val === 'object') {
      if ('result' in val) return val.result;
      if ('text' in val) return val.text;
      if ('richText' in val) return val.richText.map((rt: any) => rt.text).join('');
    }
    return val;
  };

  const getCleanString = (cell: any): string => {
    const val = getCellValue(cell);
    if (val === undefined || val === null) return '';
    if (val instanceof Date) {
      try {
        return val.toISOString().split('T')[0];
      } catch (e) {
        return '';
      }
    }
    return String(val).trim();
  };

  const getCleanNumber = (cell: any): number => {
    const val = getCellValue(cell);
    if (val === undefined || val === null) return 0;
    if (typeof val === 'string') {
      const parsed = parseFloat(val.replace(/[^\d.-]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // 1. Parse INGRESOS
  const shIng = workbook.getWorksheet('INGRESOS');
  if (shIng) {
    shIng.eachRow((row, rowNumber) => {
      if (rowNumber >= 8) {
        const fecha = getCleanString(row.getCell(1));
        const concepto = getCleanString(row.getCell(2));
        const valor = getCleanNumber(row.getCell(3));
        
        if (fecha || concepto || valor > 0) {
          data.ingresos.push({
            id: 'ing-' + generateId(),
            fecha: fecha || new Date().toISOString().split('T')[0],
            concepto: concepto || 'Ingreso Importado',
            valor: valor
          });
        }
      }
    });
  }

  // 2. Parse FACTURAS
  const shFact = workbook.getWorksheet('FACTURAS');
  if (shFact) {
    shFact.eachRow((row, rowNumber) => {
      if (rowNumber >= 8) {
        const fechaVenc = getCleanString(row.getCell(1));
        const categoria = getCleanString(row.getCell(2));
        const descripcion = getCleanString(row.getCell(3));
        const valor = getCleanNumber(row.getCell(4));
        const estadoRaw = getCleanString(row.getCell(5));
        const fechaPagoRaw = getCleanString(row.getCell(6));

        if (!fechaVenc && !descripcion && valor === 0) return;

        let estado: 'Pagado' | 'Pendiente' = 'Pendiente';
        if (
          estadoRaw.toLowerCase().includes('pagad') || 
          estadoRaw.toLowerCase().includes('pagada') ||
          estadoRaw.toLowerCase().includes('ok')
        ) {
          estado = 'Pagado';
        }

        const fechaPago = !fechaPagoRaw || fechaPagoRaw === '-' ? undefined : fechaPagoRaw;

        data.facturas.push({
          id: 'fact-' + generateId(),
          fechaVencimiento: fechaVenc || new Date().toISOString().split('T')[0],
          categoria: categoria || 'Servicios',
          descripcion: descripcion || 'Obligación',
          valor,
          estado,
          fechaPago
        });
      }
    });
  }

  // 3. Parse GASTOS VARIABLES (GASTOS VARIABLES)
  const shGast = workbook.getWorksheet('GASTOS VARIABLES');
  if (shGast) {
    shGast.eachRow((row, rowNumber) => {
      if (rowNumber >= 8) {
        const fecha = getCleanString(row.getCell(1));
        const categoria = getCleanString(row.getCell(2));
        const descripcion = getCleanString(row.getCell(3));
        const valor = getCleanNumber(row.getCell(4));

        if (fecha || descripcion || valor > 0) {
          data.gastos.push({
            id: 'gst-' + generateId(),
            fecha: fecha || new Date().toISOString().split('T')[0],
            categoria: categoria || 'Mercado',
            descripcion: descripcion || 'Consumo',
            valor
          });
        }
      }
    });
  }

  // 4. Parse AHORROS
  const shAho = workbook.getWorksheet('AHORROS');
  if (shAho) {
    shAho.eachRow((row, rowNumber) => {
      if (rowNumber >= 8) {
        const fecha = getCleanString(row.getCell(1));
        const descripcion = getCleanString(row.getCell(2));
        const valor = getCleanNumber(row.getCell(3));

        if (fecha || descripcion || valor > 0) {
          data.ahorros.push({
            id: 'aho-' + generateId(),
            fecha: fecha || new Date().toISOString().split('T')[0],
            descripcion: descripcion || 'Ahorro',
            valor
          });
        }
      }
    });
  }

  // 5. Parse PRESUPUESTO
  const shPres = workbook.getWorksheet('PRESUPUESTO');
  if (shPres) {
    shPres.eachRow((row, rowNumber) => {
      if (rowNumber >= 8) {
        const categoria = getCleanString(row.getCell(1));
        const asignado = getCleanNumber(row.getCell(2));

        if (categoria && asignado > 0) {
          const existing = data.presupuestos.find(
            p => p.categoria.toLowerCase() === categoria.toLowerCase()
          );
          if (!existing) {
            data.presupuestos.push({
              categoria,
              asignado
            });
          }
        }
      }
    });
  }

  // 6. Parse HISTORIAL
  const shHist = workbook.getWorksheet('HISTORIAL');
  if (shHist) {
    shHist.eachRow((row, rowNumber) => {
      if (rowNumber >= 6) {
        const mesRaw = getCleanString(row.getCell(1));
        
        if (
          mesRaw && 
          !mesRaw.toLowerCase().includes('total') && 
          !mesRaw.toLowerCase().includes('actual') && 
          !mesRaw.toLowerCase().includes('mes / periodo')
        ) {
          const ingresos = getCleanNumber(row.getCell(2));
          const gastos = getCleanNumber(row.getCell(3));
          const ahorros = getCleanNumber(row.getCell(4));
          const disponible = getCleanNumber(row.getCell(5));

          const existing = data.historial.find(h => h.mes.toLowerCase() === mesRaw.toLowerCase());
          if (!existing) {
            data.historial.push({
              id: 'hist-' + generateId(),
              mes: mesRaw,
              ingresos,
              gastos,
              ahorros,
              disponible
            });
          }
        }
      }
    });
  }

  return data;
}
