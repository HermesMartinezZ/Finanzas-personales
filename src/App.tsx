import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  CalendarRange, 
  CreditCard, 
  PiggyBank, 
  Target, 
  History, 
  BarChart3, 
  Download, 
  FileSpreadsheet,
  RefreshCw,
  Sparkles
} from 'lucide-react';

// Data & Utils
import { INITIAL_DATA } from './initialData';
import { FinanzasData, Ingreso, Factura, GastoVariable, Ahorro, Presupuesto, HistorialMensual } from './types';
import { generateExcelFile } from './utils/excelGenerator';
import { parseExcelFile } from './utils/excelParser';

// Screen Tabs
import { DashboardTab } from './components/DashboardTab';
import { IngresosTab } from './components/IngresosTab';
import { FacturasTab } from './components/FacturasTab';
import { GastosTab } from './components/GastosTab';
import { AhorrosTab } from './components/AhorrosTab';
import { PresupuestoTab } from './components/PresupuestoTab';
import { HistorialTab } from './components/HistorialTab';
import { ProyeccionTab } from './components/ProyeccionTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isParsingExcel, setIsParsingExcel] = useState<boolean>(false);
  const [userInitials, setUserInitials] = useState<string>(() => {
    return localStorage.getItem('control_finanzas_user_initials') || 'JD';
  });
  const [isEditAvatarOpen, setIsEditAvatarOpen] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [tempInitials, setTempInitials] = useState<string>(() => {
    return localStorage.getItem('control_finanzas_user_initials') || 'JD';
  });

  // Keep initials localStorage updated
  useEffect(() => {
    localStorage.setItem('control_finanzas_user_initials', userInitials);
  }, [userInitials]);

  // Read / Write from LocalStorage to prevent data loss
  const [data, setData] = useState<FinanzasData>(() => {
    const local = localStorage.getItem('control_finanzas_data_v1');
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return INITIAL_DATA;
      }
    }
    return INITIAL_DATA;
  });

  // Keep LocalStorage updated
  useEffect(() => {
    localStorage.setItem('control_finanzas_data_v1', JSON.stringify(data));
  }, [data]);

  // Clean data reset to defaults
  const handleResetData = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    setData(INITIAL_DATA);
    setIsResetConfirmOpen(false);
  };

  // State modification callbacks
  const handleAddIngreso = (newIng: Omit<Ingreso, 'id'>) => {
    const item: Ingreso = {
      ...newIng,
      id: `ing-${Date.now()}`
    };
    setData(prev => ({
      ...prev,
      ingresos: [item, ...prev.ingresos]
    }));
  };

  const handleDeleteIngreso = (id: string) => {
    setData(prev => ({
      ...prev,
      ingresos: prev.ingresos.filter(i => i.id !== id)
    }));
  };

  const handleUpdateIngreso = (updated: Ingreso) => {
    setData(prev => ({
      ...prev,
      ingresos: prev.ingresos.map(i => i.id === updated.id ? updated : i)
    }));
  };

  const handleAddFactura = (newFact: Omit<Factura, 'id'>) => {
    const item: Factura = {
      ...newFact,
      id: `fact-${Date.now()}`
    };
    setData(prev => ({
      ...prev,
      facturas: [item, ...prev.facturas]
    }));
  };

  const handleToggleFacturaEstado = (id: string, paymentDate?: string) => {
    setData(prev => ({
      ...prev,
      facturas: prev.facturas.map(f => {
        if (f.id === id) {
          const nextState = f.estado === 'Pagado' ? 'Pendiente' : 'Pagado';
          return {
            ...f,
            estado: nextState,
            fechaPago: nextState === 'Pagado' ? (paymentDate || new Date().toISOString().split('T')[0]) : undefined
          };
        }
        return f;
      })
    }));
  };

  const handleDeleteFactura = (id: string) => {
    setData(prev => ({
      ...prev,
      facturas: prev.facturas.filter(f => f.id !== id)
    }));
  };

  const handleUpdateFactura = (updated: Factura) => {
    setData(prev => ({
      ...prev,
      facturas: prev.facturas.map(f => f.id === updated.id ? updated : f)
    }));
  };

  const handleAddGasto = (newGas: Omit<GastoVariable, 'id'>) => {
    const item: GastoVariable = {
      ...newGas,
      id: `gas-${Date.now()}`
    };
    setData(prev => ({
      ...prev,
      gastos: [item, ...prev.gastos]
    }));
  };

  const handleDeleteGasto = (id: string) => {
    setData(prev => ({
      ...prev,
      gastos: prev.gastos.filter(g => g.id !== id)
    }));
  };

  const handleUpdateGasto = (updated: GastoVariable) => {
    setData(prev => ({
      ...prev,
      gastos: prev.gastos.map(g => g.id === updated.id ? updated : g)
    }));
  };

  const handleAddAhorro = (newAho: Omit<Ahorro, 'id'>) => {
    const item: Ahorro = {
      ...newAho,
      id: `aho-${Date.now()}`
    };
    setData(prev => ({
      ...prev,
      ahorros: [item, ...prev.ahorros]
    }));
  };

  const handleDeleteAhorro = (id: string) => {
    setData(prev => ({
      ...prev,
      ahorros: prev.ahorros.filter(a => a.id !== id)
    }));
  };

  const handleUpdateAhorro = (updated: Ahorro) => {
    setData(prev => ({
      ...prev,
      ahorros: prev.ahorros.map(a => a.id === updated.id ? updated : a)
    }));
  };

  const handleUpdatePresupuesto = (categoria: string, nuevoAsignado: number) => {
    setData(prev => ({
      ...prev,
      presupuestos: prev.presupuestos.map(p => 
        p.categoria === categoria ? { ...p, asignado: nuevoAsignado } : p
      )
    }));
  };

  const handleAddCategory = (categoria: string, asignado: number) => {
    setData(prev => {
      // Avoid duplicate categories
      if (prev.presupuestos.some(p => p.categoria.toLowerCase() === categoria.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        presupuestos: [...prev.presupuestos, { categoria: categoria.trim(), asignado }]
      };
    });
  };

  const handleDeleteCategory = (categoria: string) => {
    setData(prev => ({
      ...prev,
      presupuestos: prev.presupuestos.filter(p => p.categoria !== categoria)
    }));
  };

  const handleAddHistorial = (newHist: Omit<HistorialMensual, 'id'>) => {
    const item: HistorialMensual = {
      ...newHist,
      id: `hist-${Date.now()}`
    };
    setData(prev => ({
      ...prev,
      historial: [...prev.historial, item]
    }));
  };

  const handleDeleteHistorial = (id: string) => {
    setData(prev => ({
      ...prev,
      historial: prev.historial.filter(h => h.id !== id)
    }));
  };

  // Calculated balance for the header
  const totalIng = data.ingresos.reduce((s, i) => s + i.valor, 0);
  const totalGas = data.facturas.reduce((s, f) => s + f.valor, 0) + data.gastos.reduce((s, g) => s + g.valor, 0);
  const totalAho = data.ahorros.reduce((s, a) => s + a.valor, 0);
  const balanceGeneral = totalIng - totalGas - totalAho;

  const formataCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Excel trigger
  const handleExportToExcel = async () => {
    try {
      setIsExporting(true);
      await generateExcelFile(data);
    } catch (err) {
      console.error('Failed to generate Excel', err);
      alert('Error al exportar el archivo Excel. Verifica los datos.');
    } finally {
      setIsExporting(false);
    }
  };

  // Import Excel Backup
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingExcel(true);
    try {
      const parsedData = await parseExcelFile(file);
      
      // Basic validation of schema structure
      if (
        parsedData &&
        Array.isArray(parsedData.ingresos) &&
        Array.isArray(parsedData.facturas) &&
        Array.isArray(parsedData.gastos) &&
        Array.isArray(parsedData.ahorros)
      ) {
        setData(parsedData);
        alert('¡Increíble! Hemos procesado tu archivo de Excel con éxito. Toda tu información real, categorías, presupuestos e historial mensual han sido restaurados.');
      } else {
        alert('El archivo Excel no parece contener las hojas correctas de esta aplicación (INGRESOS, FACTURAS). Asegúrate de cargar el archivo .xlsx correcto.');
      }
    } catch (err) {
      console.error('Error al importar Excel:', err);
      alert('Error al leer el archivo Excel. Asegúrate de subir el archivo .xlsx generado originalmente por esta aplicación y que no esté corrupto.');
    } finally {
      setIsParsingExcel(false);
      e.target.value = '';
    }
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      const todayStr = new Date().toISOString().split('T')[0];
      downloadAnchor.href = url;
      downloadAnchor.setAttribute('download', `copia_seguridad_finanzas_${todayStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al exportar JSON', err);
      alert('Ocurrió un error al intentar exportar la copia de seguridad.');
    }
  };

  // Import JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        // Basic validation of schema structure
        if (
          parsed &&
          Array.isArray(parsed.ingresos) &&
          Array.isArray(parsed.facturas) &&
          Array.isArray(parsed.gastos) &&
          Array.isArray(parsed.ahorros) &&
          Array.isArray(parsed.presupuestos) &&
          Array.isArray(parsed.historial)
        ) {
          setData(parsed);
          alert('¡Copia de seguridad importada con éxito! Toda tu información ha sido restaurada de manera segura.');
        } else {
          alert('El archivo seleccionado no parece ser un formato válido de copia de seguridad de esta aplicación (faltan tablas clave).');
        }
      } catch (err) {
        console.error('Error al importar JSON', err);
        alert('Error al parsear el archivo JSON. Asegúrate de que no esté corrupto y que sea un archivo .json correcto.');
      }
    };
    fileReader.readAsText(file);
  };

  // Visual Tab definition list
  const tabsList = [
    { id: 'dashboard', label: 'DASHBOARD', icon: <span className="w-2 h-2 rounded-full bg-green-500 mr-2 shrink-0"></span> },
    { id: 'ingresos', label: 'INGRESOS', icon: <span className="w-2 h-2 rounded-full bg-slate-300 mr-2 shrink-0"></span> },
    { id: 'facturas', label: 'FACTURAS', icon: <span className="w-2 h-2 rounded-full bg-orange-400 mr-2 shrink-0"></span> },
    { id: 'gastos', label: 'GASTOS', icon: <span className="w-2 h-2 rounded-full bg-red-400 mr-2 shrink-0"></span> },
    { id: 'ahorros', label: 'AHORROS', icon: <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 shrink-0"></span> },
    { id: 'presupuestos', label: 'PRESUPUESTO', icon: <span className="w-2 h-2 rounded-full bg-indigo-400 mr-2 shrink-0"></span> },
    { id: 'historial', label: 'HISTORIAL', icon: <span className="w-2 h-2 rounded-full bg-slate-400 mr-2 shrink-0"></span> },
    { id: 'proyección', label: 'PROYECCIÓN', icon: <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shrink-0"></span> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      {/* Header Panel */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="bg-green-600 text-white p-2 rounded-lg shadow-sm shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.859 6h18.282L12 12 2.859 6zM21.141 18H2.859l7.741-7.741L12 11.6l1.4-1.341L21.141 18z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold tracking-tight text-slate-900 flex flex-wrap items-center gap-y-1">
                <span>Control de Finanzas Personales</span>
                <span className="text-slate-400 font-normal ml-2 text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                  v2.0.4 — Junio 2026
                </span>
              </h1>
              <p className="text-xxs text-slate-400 font-medium">Geometric Balance Premium Template</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
            {/* Balance General Metric Widget */}
            <div className="relative">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-xl">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Balance General</span>
                  <span className={`text-sm md:text-base font-mono font-bold ${balanceGeneral >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formataCOP(balanceGeneral)} <span className="text-xxs font-sans text-slate-500 font-semibold">COP</span>
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setTempInitials(userInitials);
                    setIsEditAvatarOpen(!isEditAvatarOpen);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 hover:border-slate-400 flex items-center justify-center text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                  title="Cambiar Iniciales del Avatar"
                  id="btn-edit-avatar-trigger"
                >
                  {userInitials}
                </button>
              </div>

              {isEditAvatarOpen && (
                <div className="absolute right-0 mt-2 p-3.5 bg-white border border-slate-200 shadow-xl rounded-xl z-50 w-52 text-left animate-fadeIn">
                  <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Iniciales de Usuario</h4>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      maxLength={3}
                      className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold font-mono text-slate-800 w-16 uppercase focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-500"
                      value={tempInitials}
                      onChange={(e) => setTempInitials(e.target.value.toUpperCase().slice(0, 3))}
                      placeholder="e.g. JD"
                      id="input-user-initials"
                    />
                    <button 
                      onClick={() => {
                        if (tempInitials.trim()) {
                          setUserInitials(tempInitials.trim().toUpperCase());
                        }
                        setIsEditAvatarOpen(false);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold text-xxs px-3 py-1.5 rounded-lg cursor-pointer flex-1 text-center transition-colors shadow-sm"
                      id="btn-save-initials"
                    >
                      Guardar
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-2">Personaliza las iniciales del avatar que se muestra en tu plantilla balanceada.</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Reset Button */}
              <button 
                id="btn-reset-initial"
                onClick={handleResetData}
                className="text-slate-500 hover:text-red-600 border border-slate-200 hover:border-slate-300 bg-white p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-sm"
                title="Restablecer plantilla"
              >
                <RefreshCw size={14} />
                <span className="hidden sm:inline">Restablecer</span>
              </button>

              {/* Premium Download Action Trigger */}
              <button 
                id="btn-download-excel"
                onClick={handleExportToExcel}
                disabled={isExporting}
                className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm border border-green-500 hover:border-green-600 transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="animate-spin" size={13} />
                    <span>Calculando...</span>
                  </>
                ) : (
                  <>
                    <Download size={13} />
                    <span>Exportar Excel (.xlsx)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-60 shrink-0 flex flex-col gap-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-2.5 mb-2">
              ÍndICE DE HOJAS EXCEL
            </span>
            {tabsList.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all text-left cursor-pointer ${
                    isSelected 
                      ? 'bg-slate-100 text-slate-900 border border-slate-200 font-black' 
                      : 'bg-transparent text-slate-500 border border-transparent hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Quick Notice card inside sidebar */}
          <div className="hidden lg:block bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <p className="font-bold text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <FileSpreadsheet size={13} className="text-green-600" />
              SOPORTE 100% NATIVO
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Las pestañas de esta web corresponden exactamente a las pestañas físicas generadas dentro del documento de Excel descargable. Su formato está optimizado tanto para <strong>Microsoft Excel</strong> como para <strong>Google Sheets</strong>.
            </p>
          </div>

          {/* Backup & Restore Data Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <p className="font-bold text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              RESPALDO DE DATOS
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Descarga una copia de seguridad o <strong>restaura utilizando tu archivo de Excel (.xlsx)</strong> si limpiaste la caché de tu navegador.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              {/* Descargar Backup */}
              <button
                onClick={handleExportJSON}
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 font-bold text-[11px] px-3 py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                id="btn-export-backup-json"
              >
                <Download size={11} className="text-emerald-600" />
                Descargar Copia (.json)
              </button>

              {/* Cargar Backup */}
              <label 
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[11px] px-3 py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-colors text-center"
                id="btn-import-backup-label"
              >
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Subir Copia (.json)
                </span>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImportJSON} 
                  className="hidden" 
                />
              </label>

              {/* Restaurar desde Excel (.xlsx) - Salvavidas */}
              <label 
                className={`w-full ${isParsingExcel ? 'bg-indigo-100 text-indigo-705 cursor-not-allowed animate-pulse' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-805 border-indigo-200'} border font-bold text-[11px] px-3 py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-colors text-center`}
                id="btn-import-excel-label"
              >
                <span className="inline-flex items-center gap-1.5">
                  <FileSpreadsheet size={11} className="text-indigo-600" />
                  {isParsingExcel ? 'Leyendo Excel...' : 'Restaurar de Excel (.xlsx)'}
                </span>
                <input 
                  type="file" 
                  accept=".xlsx" 
                  onChange={handleImportExcel} 
                  disabled={isParsingExcel}
                  className="hidden" 
                />
              </label>
            </div>
          </div>
        </aside>

        {/* Action Panel Display Board */}
        <section className="flex-1 min-w-0">
          {activeTab === 'dashboard' && <DashboardTab data={data} />}
          
          {activeTab === 'ingresos' && (
            <IngresosTab 
              ingresos={data.ingresos} 
              historial={data.historial}
              onAddIngreso={handleAddIngreso} 
              onDeleteIngreso={handleDeleteIngreso} 
              onUpdateIngreso={handleUpdateIngreso}
            />
          )}

          {activeTab === 'facturas' && (
            <FacturasTab 
              facturas={data.facturas} 
              categorias={data.presupuestos.map(p => p.categoria)}
              onAddFactura={handleAddFactura} 
              onToggleFacturaEstado={handleToggleFacturaEstado} 
              onDeleteFactura={handleDeleteFactura} 
              onAddCategory={handleAddCategory}
              onUpdateFactura={handleUpdateFactura}
            />
          )}

          {activeTab === 'gastos' && (
            <GastosTab 
              gastos={data.gastos} 
              categorias={data.presupuestos.map(p => p.categoria)}
              onAddGasto={handleAddGasto} 
              onDeleteGasto={handleDeleteGasto} 
              onAddCategory={handleAddCategory}
              onUpdateGasto={handleUpdateGasto}
            />
          )}

          {activeTab === 'ahorros' && (
            <AhorrosTab 
              ahorros={data.ahorros} 
              historial={data.historial}
              onAddAhorro={handleAddAhorro} 
              onDeleteAhorro={handleDeleteAhorro} 
              onUpdateAhorro={handleUpdateAhorro}
            />
          )}

          {activeTab === 'presupuestos' && (
            <PresupuestoTab 
              presupuestos={data.presupuestos} 
              gastos={data.gastos} 
              onUpdatePresupuesto={handleUpdatePresupuesto} 
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {activeTab === 'historial' && (
            <HistorialTab 
              data={data} 
              onAddHistorial={handleAddHistorial} 
              onDeleteHistorial={handleDeleteHistorial} 
            />
          )}

          {activeTab === 'proyección' && <ProyeccionTab data={data} />}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400 font-medium shrink-0">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Planificador Premium de Finanzas Personales. Exportación directa optimizada.</p>
          <div className="flex items-center gap-4 text-slate-405">
            <span className="hover:text-slate-600 cursor-help" title="Fórmula: Disponible = Ingresos - Facturas - Gastos - Ahorros">Ecuación de Caja Activa</span>
            <span>•</span>
            <span className="hover:text-slate-600 cursor-help" title="Soporta filtros, celdas bloqueadas y formato condicional">Norma de Exportación ExcelJS</span>
          </div>
        </div>
      </footer>

      {/* Custom Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl shrink-0">
                <RefreshCw size={22} className="animate-spin-once" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest">Restablecer Datos</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  ¿Estás seguro de que deseas restablecer los datos de tu planificador financiero? 
                  Esto eliminará todos los ingresos, gastos, ahorros, facturas y categorías personalizadas creadas por ti y restaurará los valores de ejemplo por defecto de la plantilla de Excel.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer transition-all"
                id="btn-cancel-reset"
              >
                Cancelar
              </button>
              <button
                type="button"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer transition-all shadow-sm"
                onClick={handleConfirmReset}
                id="btn-confirm-reset"
              >
                Sí, Restablecer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
