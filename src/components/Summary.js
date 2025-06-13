import React from 'react';

export const Summary = ({ total }) => (
    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-indigo-800">Total Gastado:</span>
            <span className="text-2xl font-bold text-indigo-900">${total.toFixed(2)}</span>
        </div>
    </div>
);