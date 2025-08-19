import React from 'react';
import { 
  LucideProps,
  Tag, ShoppingCart, Home, Car, Heart, Gamepad2, 
  Book, Coffee, Gift, Shirt, Plane, Music, 
  Smartphone, Laptop, Wrench, Briefcase, GraduationCap,
  Camera, MapPin, Star, Clock, Calendar, Settings,
  User, Users, Building, Factory, Store, School,
  Hospital, Building2, Train, Bus, Bike, Footprints,
  Pizza, Wine, Cookie, Apple, Fish, Soup,
  Palette, Brush, Scissors, Hammer, Lightbulb, Key,
  Shield, Lock, Unlock, Eye, EyeOff, Mail, Phone,
  MessageSquare, Bell, Search, Download, Upload, Save,
  Edit, Trash2, Plus, Minus, Check, X, ArrowUp, ArrowDown,
  ArrowLeft, ArrowRight, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Menu, MoreHorizontal, MoreVertical, Filter, ArrowUpDown, Grid, List,
  Sun, Moon,
  Target, TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet,
  PiggyBank, Calculator, BarChart, LineChart, PieChart, Activity,
  Landmark, UserPlus, LogOut
} from 'lucide-react';

// Mapa de iconos disponibles - solo incluye los que realmente usamos
const iconMap = {
  // Categorías principales
  tag: Tag,
  shoppingcart: ShoppingCart,
  home: Home,
  car: Car,
  heart: Heart,
  gamepad2: Gamepad2,
  book: Book,
  coffee: Coffee,
  gift: Gift,
  shirt: Shirt,
  plane: Plane,
  music: Music,
  smartphone: Smartphone,
  laptop: Laptop,
  wrench: Wrench,
  briefcase: Briefcase,
  graduationcap: GraduationCap,
  camera: Camera,
  mappin: MapPin,
  star: Star,
  clock: Clock,
  calendar: Calendar,
  settings: Settings,
  
  // Usuarios y lugares
  user: User,
  users: Users,
  building: Building,
  factory: Factory,
  store: Store,
  school: School,
  hospital: Hospital,
  bank: Building2, // Usar Building2 como reemplazo para bank
  
  // Transporte
  train: Train,
  bus: Bus,
  bike: Bike,
  footprints: Footprints,
  
  // Comida
  pizza: Pizza,
  wine: Wine,
  cookie: Cookie,
  apple: Apple,
  fish: Fish,
  soup: Soup,
  
  // Herramientas y utilidades
  palette: Palette,
  brush: Brush,
  scissors: Scissors,
  hammer: Hammer,
  lightbulb: Lightbulb,
  key: Key,
  shield: Shield,
  lock: Lock,
  unlock: Unlock,
  eye: Eye,
  eyeoff: EyeOff,
  mail: Mail,
  phone: Phone,
  messagesquare: MessageSquare,
  bell: Bell,
  search: Search,
  download: Download,
  upload: Upload,
  save: Save,
  edit: Edit,
  trash2: Trash2,
  plus: Plus,
  minus: Minus,
  check: Check,
  x: X,
  
  // Navegación
  arrowup: ArrowUp,
  arrowdown: ArrowDown,
  arrowleft: ArrowLeft,
  arrowright: ArrowRight,
  chevronup: ChevronUp,
  chevrondown: ChevronDown,
  chevronleft: ChevronLeft,
  chevronright: ChevronRight,
  menu: Menu,
  morehorizontal: MoreHorizontal,
  morevertical: MoreVertical,
  filter: Filter,
  sort: ArrowUpDown, // Usar ArrowUpDown como reemplazo para sort
  grid: Grid,
  list: List,
  
  // Tema y UI
  sun: Sun,
  moon: Moon,
  
  // Finanzas
  target: Target,
  trendingup: TrendingUp,
  trendingdown: TrendingDown,
  dollarsign: DollarSign,
  creditcard: CreditCard,
  wallet: Wallet,
  piggybank: PiggyBank,
  calculator: Calculator,
  barchart: BarChart,
  linechart: LineChart,
  piechart: PieChart,
  activity: Activity,
  landmark: Landmark,
  
  // Autenticación
  userplus: UserPlus,
  logout: LogOut
};

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  // Normalizar el nombre del icono a minúsculas
  const iconKey = name.toLowerCase().replace(/[-_\s]/g, '') as keyof typeof iconMap;
  const IconComponent = iconMap[iconKey];

  // Si el icono no se encuentra, devolvemos un icono por defecto
  if (!IconComponent) {
    return <Tag {...props} />;
  }

  return <IconComponent {...props} />;
};