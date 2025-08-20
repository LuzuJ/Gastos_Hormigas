import React, { useState } from 'react';
import { useExpensesContext, useCategoriesContext, useNetWorthContext } from '../../contexts/AppContext';
import { Download, FileText, Database, Archive, CheckCircle, BarChart3 } from 'lucide-react';
import styles from './ExportManager.module.css';

interface ExportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  filename: string;
  action: () => Promise<void> | void;
}

export const ExportManager: React.FC = () => {
  const { expenses } = useExpensesContext();
  const { categories } = useCategoriesContext();
  const { assets, liabilities } = useNetWorthContext();
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [recentExports, setRecentExports] = useState<string[]>([]);

  const generateExpensesCSV = async () => {
    if (expenses.length === 0) {
      alert("No hay gastos para exportar.");
      return;
    }

    const headers = [
      "Fecha de Registro", 
      "Descripción", 
      "Monto", 
      "Categoría", 
      "Subcategoría",
      "Día de la Semana",
      "Mes",
      "Año"
    ];

    const csvRows = [headers.join(',')];
    
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    expenses
      .sort((a, b) => a.createdAt!.toDate().getTime() - b.createdAt!.toDate().getTime())
      .forEach(expense => {
        const expenseDate = expense.createdAt!.toDate();
        const date = expenseDate.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric'
        });
        
        const dayName = expenseDate.toLocaleDateString('es-ES', { weekday: 'long' });
        const monthName = expenseDate.toLocaleDateString('es-ES', { month: 'long' });
        const year = expenseDate.getFullYear();
        
        const categoryName = categories.find(c => c.id === expense.categoryId)?.name || 'Sin Categoría';
        const description = `"${expense.description.replace(/"/g, '""')}"`;
        const subCategory = expense.subCategory || 'Sin Subcategoría';
        
        const row = [
          date,
          description,
          expense.amount.toFixed(2),
          `"${categoryName}"`,
          `"${subCategory}"`,
          `"${dayName}"`,
          `"${monthName}"`,
          year
        ];
        
        csvRows.push(row.join(','));
      });

    // Agregar resumen
    csvRows.push('');
    csvRows.push('"RESUMEN ESTADÍSTICO"');
    csvRows.push(`"Total de Gastos:","${expenses.length}"`);
    csvRows.push(`"Monto Total:","$${totalAmount.toFixed(2)}"`);
    csvRows.push(`"Promedio por Gasto:","$${(totalAmount / expenses.length).toFixed(2)}"`);

    downloadCSV(csvRows.join('\n'), 'gastos_completos.csv');
  };

  const generateDebtsCSV = async () => {
    if (liabilities.length === 0) {
      alert("No hay deudas para exportar.");
      return;
    }

    const headers = [
      "Nombre de la Deuda",
      "Monto",
      "Tasa de Interés (%)",
      "Tipo",
      "Fecha de Registro"
    ];

    const csvRows = [headers.join(',')];
    
    liabilities.forEach(debt => {
      const row = [
        `"${debt.name.replace(/"/g, '""')}"`,
        debt.amount.toFixed(2),
        (debt.interestRate || 0).toFixed(2),
        `"${debt.type || 'No especificado'}"`,
        new Date().toLocaleDateString('es-ES')
      ];
      csvRows.push(row.join(','));
    });

    // Resumen
    const totalDebt = liabilities.reduce((sum, debt) => sum + debt.amount, 0);
    csvRows.push('');
    csvRows.push('"RESUMEN DE DEUDAS"');
    csvRows.push(`"Total de Deudas:","$${totalDebt.toFixed(2)}"`);
    csvRows.push(`"Número de Deudas:","${liabilities.length}"`);

    downloadCSV(csvRows.join('\n'), 'deudas_completas.csv');
  };

  const generateSummaryCSV = async () => {
    const now = new Date();
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalDebts = liabilities.reduce((sum, debt) => sum + debt.amount, 0);
    const netWorth = totalAssets - totalDebts;

    const csvRows = [
      '"RESUMEN FINANCIERO GENERAL"',
      `"Fecha del Reporte:","${now.toLocaleDateString('es-ES')}"`,
      '',
      '"GASTOS"',
      `"Total de Gastos Registrados:","${expenses.length}"`,
      `"Monto Total en Gastos:","$${totalExpenses.toFixed(2)}"`,
      '',
      '"PATRIMONIO"',
      `"Total de Activos:","$${totalAssets.toFixed(2)}"`,
      `"Total de Pasivos:","$${totalDebts.toFixed(2)}"`,
      `"Patrimonio Neto:","$${netWorth.toFixed(2)}"`,
      '',
      '"CATEGORÍAS DE GASTOS"'
    ];

    // Resumen por categorías
    const categoryTotals = new Map();
    expenses.forEach(expense => {
      const categoryName = categories.find(c => c.id === expense.categoryId)?.name || 'Sin Categoría';
      const current = categoryTotals.get(categoryName) || 0;
      categoryTotals.set(categoryName, current + expense.amount);
    });

    Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, total]) => {
        const percentage = totalExpenses > 0 ? ((total / totalExpenses) * 100).toFixed(2) : '0.00';
        csvRows.push(`"${category}:","$${total.toFixed(2)}","${percentage}%"`);
      });

    downloadCSV(csvRows.join('\n'), 'resumen_financiero_general.csv');
  };

  const generateCompleteBackup = async () => {
    const backup = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      data: {
        expenses: expenses.map(expense => ({
          ...expense,
          createdAt: expense.createdAt?.toDate().toISOString()
        })),
        categories: categories,
        assets: assets,
        liabilities: liabilities
      },
      summary: {
        totalExpenses: expenses.length,
        totalExpenseAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
        totalAssets: assets.reduce((sum, a) => sum + a.value, 0),
        totalLiabilities: liabilities.reduce((sum, l) => sum + l.amount, 0)
      }
    };

    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_completo_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (exportId: string, action: () => Promise<void> | void) => {
    setExportingId(exportId);
    try {
      await action();
      setRecentExports(prev => [exportId, ...prev.filter(id => id !== exportId)].slice(0, 3));
    } catch (error) {
      console.error('Error durante la exportación:', error);
      alert('Error durante la exportación. Inténtalo de nuevo.');
    } finally {
      setExportingId(null);
    }
  };

  const exportOptions: ExportOption[] = [
    {
      id: 'expenses',
      title: 'Exportar Gastos',
      description: 'Todos los gastos registrados con análisis detallado por categorías',
      icon: <FileText className={styles.optionIcon} />,
      filename: 'gastos_completos.csv',
      action: generateExpensesCSV
    },
    {
      id: 'debts',
      title: 'Exportar Deudas',
      description: 'Lista completa de deudas y pasivos registrados',
      icon: <Database className={styles.optionIcon} />,
      filename: 'deudas_completas.csv',
      action: generateDebtsCSV
    },
    {
      id: 'summary',
      title: 'Resumen General',
      description: 'Resumen ejecutivo con estadísticas clave de tu situación financiera',
      icon: <BarChart3 className={styles.optionIcon} />,
      filename: 'resumen_financiero_general.csv',
      action: generateSummaryCSV
    },
    {
      id: 'backup',
      title: 'Backup Completo',
      description: 'Respaldo total de todos los datos en formato JSON',
      icon: <Archive className={styles.optionIcon} />,
      filename: 'backup_completo.json',
      action: generateCompleteBackup
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Download className={styles.headerIcon} />
          Centro de Exportación
        </h3>
        <p className={styles.subtitle}>
          Exporta tus datos financieros para análisis externo o respaldo
        </p>
      </div>

      <div className={styles.optionsGrid}>
        {exportOptions.map(option => (
          <div key={option.id} className={styles.exportOption}>
            <div className={styles.optionHeader}>
              {option.icon}
              <h4 className={styles.optionTitle}>{option.title}</h4>
              {recentExports.includes(option.id) && (
                <CheckCircle className={styles.recentIcon} />
              )}
            </div>
            
            <p className={styles.optionDescription}>{option.description}</p>
            
            <div className={styles.optionFooter}>
              <span className={styles.filename}>📄 {option.filename}</span>
              <button
                onClick={() => handleExport(option.id, option.action)}
                disabled={exportingId === option.id}
                className={styles.exportButton}
              >
                {exportingId === option.id ? (
                  <>
                    <div className={styles.spinner} />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Exportar
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {recentExports.length > 0 && (
        <div className={styles.recentExports}>
          <h4>Exportaciones Recientes</h4>
          <div className={styles.recentList}>
            {recentExports.map(exportId => {
              const option = exportOptions.find(opt => opt.id === exportId);
              return option ? (
                <div key={exportId} className={styles.recentItem}>
                  <CheckCircle size={16} className={styles.recentIcon} />
                  <span>{option.title}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};
