-- Gastos Hormigas - Supabase Database Schema
-- Migration from Firebase Firestore to Supabase PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS TABLE
-- Almacena información de perfil de usuarios (complementa auth.users de Supabase)
-- ============================================================================

CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT NOT NULL DEFAULT 'Usuario',
    email TEXT,
    currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- CATEGORIES TABLE
-- Categorías de gastos personalizables por usuario
-- ============================================================================

CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    budget DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    UNIQUE(user_id, name)
);

-- ============================================================================
-- SUBCATEGORIES TABLE
-- Subcategorías relacionadas con las categorías principales
-- ============================================================================

CREATE TABLE public.subcategories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    UNIQUE(category_id, name)
);

-- ============================================================================
-- PAYMENT SOURCES TABLE
-- Fuentes de pago (efectivo, cuentas bancarias, tarjetas, etc.)
-- ============================================================================

CREATE TYPE payment_source_type AS ENUM (
    'cash', 'checking', 'savings', 'credit_card', 'debit_card', 
    'loan', 'income_salary', 'income_extra', 'investment', 'other'
);

CREATE TABLE public.payment_sources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type payment_source_type NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    icon TEXT,
    color TEXT,
    auto_update BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    UNIQUE(user_id, name)
);

-- ============================================================================
-- EXPENSES TABLE
-- Registro de gastos de los usuarios
-- ============================================================================

CREATE TABLE public.expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
    sub_category TEXT NOT NULL,
    payment_source_id UUID REFERENCES public.payment_sources(id) ON DELETE SET NULL,
    balance_after_transaction DECIMAL(10,2),
    is_automatic BOOLEAN DEFAULT FALSE,
    parent_transaction_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- FIXED EXPENSES TABLE
-- Gastos fijos mensuales que se pueden automatizar
-- ============================================================================

CREATE TABLE public.fixed_expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    category TEXT NOT NULL,
    day_of_month INTEGER NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 31),
    last_posted_month TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- FINANCIALS TABLE
-- Información financiera general del usuario
-- ============================================================================

CREATE TABLE public.financials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    monthly_income DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    UNIQUE(user_id)
);

-- ============================================================================
-- SAVINGS GOALS TABLE
-- Metas de ahorro de los usuarios
-- ============================================================================

CREATE TABLE public.savings_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- ASSETS TABLE
-- Activos del usuario (propiedades, inversiones, etc.)
-- ============================================================================

CREATE TYPE asset_type AS ENUM ('cash', 'investment', 'property');

CREATE TABLE public.assets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    value DECIMAL(10,2) NOT NULL CHECK (value >= 0),
    type asset_type NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- LIABILITIES TABLE
-- Pasivos/Deudas del usuario
-- ============================================================================

CREATE TYPE liability_type AS ENUM ('credit_card', 'loan', 'mortgage', 'student_loan', 'other');

CREATE TABLE public.liabilities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    original_amount DECIMAL(10,2),
    type liability_type NOT NULL,
    interest_rate DECIMAL(5,2),
    monthly_payment DECIMAL(10,2),
    duration INTEGER, -- months
    due_date DATE,
    description TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- DEBT PAYMENTS TABLE
-- Registro de pagos de deudas
-- ============================================================================

CREATE TYPE debt_payment_type AS ENUM ('regular', 'extra', 'interest_only');

CREATE TABLE public.debt_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    liability_id UUID REFERENCES public.liabilities(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    payment_type debt_payment_type NOT NULL DEFAULT 'regular',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- RECURRING INCOME TABLE
-- Ingresos recurrentes automáticos
-- ============================================================================

CREATE TYPE recurring_frequency AS ENUM ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly');
CREATE TYPE income_category AS ENUM ('salary', 'freelance', 'business', 'investment', 'other');

CREATE TABLE public.recurring_income (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    frequency recurring_frequency NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    next_date TIMESTAMP WITH TIME ZONE NOT NULL,
    last_processed TIMESTAMP WITH TIME ZONE,
    payment_source_id UUID REFERENCES public.payment_sources(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    category income_category DEFAULT 'salary',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- AUTOMATIC TRANSACTIONS TABLE
-- Transacciones automáticas (ingresos y gastos)
-- ============================================================================

CREATE TYPE transaction_type AS ENUM ('income', 'expense');

CREATE TABLE public.automatic_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    type transaction_type NOT NULL,
    frequency recurring_frequency NOT NULL,
    next_date TIMESTAMP WITH TIME ZONE NOT NULL,
    from_payment_source_id UUID REFERENCES public.payment_sources(id) ON DELETE SET NULL,
    to_payment_source_id UUID REFERENCES public.payment_sources(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_processed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- FINANCIAL ALERTS TABLE
-- Alertas y notificaciones financieras
-- ============================================================================

CREATE TYPE alert_type AS ENUM (
    'low_balance', 'upcoming_payment', 'debt_reminder', 'budget_exceeded',
    'savings_opportunity', 'income_received', 'goal_achieved'
);

CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE public.financial_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type alert_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity alert_severity NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    actionable BOOLEAN DEFAULT FALSE,
    data JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- TRANSACTIONS TABLE
-- Registro histórico de todas las transacciones
-- ============================================================================

CREATE TYPE transaction_history_type AS ENUM ('income', 'expense', 'transfer');

CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type transaction_history_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    from_payment_source_id UUID REFERENCES public.payment_sources(id) ON DELETE SET NULL,
    to_payment_source_id UUID REFERENCES public.payment_sources(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_automatic BOOLEAN DEFAULT FALSE,
    related_id UUID, -- ID del gasto, ingreso o transferencia relacionada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- ACHIEVEMENTS TABLE
-- Sistema de logros y gamificación
-- ============================================================================

CREATE TYPE achievement_category AS ENUM ('budget', 'savings', 'debt', 'income', 'general');
CREATE TYPE achievement_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE achievement_requirement_type AS ENUM (
    'budget_streak', 'savings_goal', 'debt_payment', 'expense_reduction',
    'income_increase', 'net_worth_growth'
);
CREATE TYPE achievement_period AS ENUM ('monthly', 'yearly', 'total');

CREATE TABLE public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category achievement_category NOT NULL,
    tier achievement_tier NOT NULL,
    icon TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    requirement_type achievement_requirement_type NOT NULL,
    requirement_value DECIMAL(10,2) NOT NULL,
    requirement_period achievement_period,
    is_unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    progress DECIMAL(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- USER STATS TABLE
-- Estadísticas del usuario para gamificación
-- ============================================================================

CREATE TABLE public.user_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    total_points INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    points_to_next_level INTEGER DEFAULT 100,
    achievements_unlocked INTEGER DEFAULT 0,
    total_achievements INTEGER DEFAULT 0,
    budget_streak INTEGER DEFAULT 0,
    savings_streak INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    UNIQUE(user_id)
);

-- ============================================================================
-- MONTHLY STATS TABLE
-- Estadísticas mensuales del usuario
-- ============================================================================

CREATE TABLE public.monthly_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    month TEXT NOT NULL, -- YYYY-MM format
    budget_compliance DECIMAL(5,2) DEFAULT 0,
    savings_rate DECIMAL(5,2) DEFAULT 0,
    expense_reduction DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    UNIQUE(user_id, month)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Categories indexes
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_subcategories_category_id ON public.subcategories(category_id);

-- Payment sources indexes
CREATE INDEX idx_payment_sources_user_id ON public.payment_sources(user_id);
CREATE INDEX idx_payment_sources_active ON public.payment_sources(user_id, is_active);

-- Expenses indexes
CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX idx_expenses_created_at ON public.expenses(user_id, created_at DESC);
CREATE INDEX idx_expenses_category ON public.expenses(category_id);
CREATE INDEX idx_expenses_payment_source ON public.expenses(payment_source_id);

-- Fixed expenses indexes
CREATE INDEX idx_fixed_expenses_user_id ON public.fixed_expenses(user_id);
CREATE INDEX idx_fixed_expenses_active ON public.fixed_expenses(user_id, is_active);

-- Assets and liabilities indexes
CREATE INDEX idx_assets_user_id ON public.assets(user_id);
CREATE INDEX idx_liabilities_user_id ON public.liabilities(user_id);
CREATE INDEX idx_liabilities_active ON public.liabilities(user_id, is_archived);

-- Debt payments indexes
CREATE INDEX idx_debt_payments_user_id ON public.debt_payments(user_id);
CREATE INDEX idx_debt_payments_liability ON public.debt_payments(liability_id);
CREATE INDEX idx_debt_payments_date ON public.debt_payments(user_id, payment_date DESC);

-- Financial alerts indexes
CREATE INDEX idx_financial_alerts_user_id ON public.financial_alerts(user_id);
CREATE INDEX idx_financial_alerts_unread ON public.financial_alerts(user_id, is_read);
CREATE INDEX idx_financial_alerts_expires ON public.financial_alerts(expires_at);

-- Transactions indexes
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(user_id, date DESC);
CREATE INDEX idx_transactions_type ON public.transactions(user_id, type);

-- Achievements and stats indexes
CREATE INDEX idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX idx_achievements_unlocked ON public.achievements(user_id, is_unlocked);
CREATE INDEX idx_monthly_stats_user_month ON public.monthly_stats(user_id, month);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automatic_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for categories
CREATE POLICY "Users can manage own categories" ON public.categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own subcategories" ON public.subcategories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.categories WHERE categories.id = subcategories.category_id AND categories.user_id = auth.uid())
);

-- Create RLS policies for payment sources
CREATE POLICY "Users can manage own payment sources" ON public.payment_sources FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for expenses
CREATE POLICY "Users can manage own expenses" ON public.expenses FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for fixed expenses
CREATE POLICY "Users can manage own fixed expenses" ON public.fixed_expenses FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for financials
CREATE POLICY "Users can manage own financials" ON public.financials FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for savings goals
CREATE POLICY "Users can manage own savings goals" ON public.savings_goals FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for assets
CREATE POLICY "Users can manage own assets" ON public.assets FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for liabilities
CREATE POLICY "Users can manage own liabilities" ON public.liabilities FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for debt payments
CREATE POLICY "Users can manage own debt payments" ON public.debt_payments FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for recurring income
CREATE POLICY "Users can manage own recurring income" ON public.recurring_income FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for automatic transactions
CREATE POLICY "Users can manage own automatic transactions" ON public.automatic_transactions FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for financial alerts
CREATE POLICY "Users can manage own financial alerts" ON public.financial_alerts FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can manage own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for achievements
CREATE POLICY "Users can manage own achievements" ON public.achievements FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for user stats
CREATE POLICY "Users can manage own stats" ON public.user_stats FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for monthly stats
CREATE POLICY "Users can manage own monthly stats" ON public.monthly_stats FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON public.subcategories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_sources_updated_at BEFORE UPDATE ON public.payment_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fixed_expenses_updated_at BEFORE UPDATE ON public.fixed_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financials_updated_at BEFORE UPDATE ON public.financials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_liabilities_updated_at BEFORE UPDATE ON public.liabilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_debt_payments_updated_at BEFORE UPDATE ON public.debt_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recurring_income_updated_at BEFORE UPDATE ON public.recurring_income FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_automatic_transactions_updated_at BEFORE UPDATE ON public.automatic_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_alerts_updated_at BEFORE UPDATE ON public.financial_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON public.achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON public.user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monthly_stats_updated_at BEFORE UPDATE ON public.monthly_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, display_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email, 'Usuario'),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- DEFAULT DATA INSERTION
-- ============================================================================

-- Function to initialize default categories for a user
CREATE OR REPLACE FUNCTION public.initialize_default_categories(user_id UUID)
RETURNS VOID AS $$
DECLARE
    cat_id UUID;
BEGIN
    -- Alimento
    INSERT INTO public.categories (user_id, name, icon, color, is_default)
    VALUES (user_id, 'Alimento', 'Pizza', '#FFC300', TRUE)
    RETURNING id INTO cat_id;
    
    INSERT INTO public.subcategories (category_id, name) VALUES
        (cat_id, 'Supermercado'),
        (cat_id, 'Restaurante'),
        (cat_id, 'Delivery');
    
    -- Transporte
    INSERT INTO public.categories (user_id, name, icon, color, is_default)
    VALUES (user_id, 'Transporte', 'Car', '#FF5733', TRUE)
    RETURNING id INTO cat_id;
    
    INSERT INTO public.subcategories (category_id, name) VALUES
        (cat_id, 'Gasolina'),
        (cat_id, 'Transporte Público'),
        (cat_id, 'Taxi/Uber');
    
    -- Hogar
    INSERT INTO public.categories (user_id, name, icon, color, is_default)
    VALUES (user_id, 'Hogar', 'Home', '#C70039', TRUE)
    RETURNING id INTO cat_id;
    
    INSERT INTO public.subcategories (category_id, name) VALUES
        (cat_id, 'Servicios (Luz, Agua)'),
        (cat_id, 'Decoración'),
        (cat_id, 'Reparaciones');
    
    -- Entretenimiento
    INSERT INTO public.categories (user_id, name, icon, color, is_default)
    VALUES (user_id, 'Entretenimiento', 'Gamepad2', '#900C3F', TRUE)
    RETURNING id INTO cat_id;
    
    INSERT INTO public.subcategories (category_id, name) VALUES
        (cat_id, 'Suscripciones'),
        (cat_id, 'Cine'),
        (cat_id, 'Salidas');
    
    -- Salud
    INSERT INTO public.categories (user_id, name, icon, color, is_default)
    VALUES (user_id, 'Salud', 'HeartPulse', '#581845', TRUE)
    RETURNING id INTO cat_id;
    
    INSERT INTO public.subcategories (category_id, name) VALUES
        (cat_id, 'Farmacia'),
        (cat_id, 'Consulta Médica');
    
    -- Otro
    INSERT INTO public.categories (user_id, name, icon, color, is_default)
    VALUES (user_id, 'Otro', 'ShoppingBag', '#2a9d8f', TRUE)
    RETURNING id INTO cat_id;
    
    INSERT INTO public.subcategories (category_id, name) VALUES
        (cat_id, 'General');
        
    -- Initialize user stats
    INSERT INTO public.user_stats (user_id) VALUES (user_id);
    
    -- Initialize financials
    INSERT INTO public.financials (user_id) VALUES (user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
