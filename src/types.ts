import { Timestamp } from 'firebase/firestore';

// Define cómo se ve un objeto de Gasto en nuestra app
export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  createdAt: Timestamp;
}

// Define la estructura de los datos para el gráfico
export interface ChartData {
  name: string;
  total: number;
  fill: string;
}