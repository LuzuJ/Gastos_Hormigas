import React from 'react';

// Este componente define la estructura general y la navegación
export const Layout = ({ currentPage, setCurrentPage, children }) => {
    
    const NavLink = ({ pageName, children }) => {
        const isActive = currentPage === pageName;
        return (
            <button 
                onClick={() => setCurrentPage(pageName)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-gray-500 hover:bg-indigo-100 hover:text-indigo-600'
                }`}
            >
                {children}
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Panel de Gastos</h1>
                    <p className="text-gray-500 mt-2 text-lg">Tu centro de control para entender y mejorar tus finanzas.</p>
                </header>

                <nav className="flex justify-center mb-8 space-x-2 sm:space-x-4 bg-white p-2 rounded-xl shadow-sm max-w-md mx-auto">
                    <NavLink pageName="dashboard">Dashboard</NavLink>
                    <NavLink pageName="reportes">Reportes (próximamente)</NavLink>
                    <NavLink pageName="ia_advisor">Consejero IA (próximamente)</NavLink>
                </nav>

                <main>
                    {children}
                </main>

                 <footer className="text-center mt-12">
                    <p className="text-xs text-gray-400">ID de Usuario:</p>
                    <p id="userId" className="text-xs text-gray-500 bg-gray-200 p-1 rounded-md inline-block mt-1"></p>
                </footer>
            </div>
        </div>
    );
};
