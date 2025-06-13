import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Wallet } from 'lucide-react';

export const ExpenseChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center h-full text-center bg-gray-50 rounded-lg p-4">
                <Wallet size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">Sin datos para el gráfico</h3>
                <p className="text-sm text-gray-400">Agrega algunos gastos para ver tu resumen visual.</p>
            </div>
        );
    }

    return (
        // El contenedor responsivo hace que el gráfico se adapte al tamaño del padre
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={data}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280' }}/>
                <YAxis tick={{ fill: '#6b7280' }} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                    cursor={{fill: 'rgba(238, 242, 255, 0.6)'}}
                    contentStyle={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                    }}
                />
                <Legend />
                <Bar dataKey="total" name="Total Gastado" barSize={30}>
                    {/* Asigna un color a cada barra según la categoría */}
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};
