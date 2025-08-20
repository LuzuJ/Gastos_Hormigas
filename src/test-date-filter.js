// Test para verificar la lógica de filtros de fecha
console.log('=== Test de filtros de fecha ===');

// Prueba 1: Filtro por mes específico (Enero 2024)
const testMonth = '2024-01';
const [year, month] = testMonth.split('-').map(Number);
const startDate = new Date(year, month - 1, 1);
const endDate = new Date(year, month, 0);
endDate.setHours(23, 59, 59, 999);

console.log('Filtro por mes específico (2024-01):');
console.log('Fecha inicio:', startDate.toISOString());
console.log('Fecha fin:', endDate.toISOString());

// Prueba 2: Filtro por año específico (2024)
const testYear = '2024';
const yearNum = parseInt(testYear);
const startDateYear = new Date(yearNum, 0, 1);
const endDateYear = new Date(yearNum, 11, 31);
endDateYear.setHours(23, 59, 59, 999);

console.log('\nFiltro por año específico (2024):');
console.log('Fecha inicio:', startDateYear.toISOString());
console.log('Fecha fin:', endDateYear.toISOString());

// Prueba 3: Verificar si una fecha está dentro del rango
const testExpenseDate = new Date('2024-01-15T10:30:00Z');
console.log('\nFecha de gasto de prueba:', testExpenseDate.toISOString());

const isInMonthRange = testExpenseDate >= startDate && testExpenseDate <= endDate;
const isInYearRange = testExpenseDate >= startDateYear && testExpenseDate <= endDateYear;

console.log('¿Está en rango del mes?', isInMonthRange);
console.log('¿Está en rango del año?', isInYearRange);

console.log('\n=== Test completado ===');
