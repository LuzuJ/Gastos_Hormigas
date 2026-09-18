import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Workspace } from '../core/models/ledger';
import { LedgerRepository } from '../services/ledgerRepository';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';
import { nanoid } from 'nanoid';

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoading: boolean;
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string, type: 'personal' | 'business', currency?: string) => Promise<Workspace | null>;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

const ACTIVE_WS_KEY = 'gh_active_workspace_id';
const LOCAL_WS_KEY = 'gh_local_workspaces_v1';

const DEFAULT_PERSONAL_WORKSPACE: Workspace = {
  id: 'ws-personal-default',
  name: 'Mi Espacio Personal',
  type: 'personal',
  currency: 'USD',
  planTier: 'free',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_WS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [DEFAULT_PERSONAL_WORKSPACE];
  });

  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(() => {
    const savedWsId = localStorage.getItem(ACTIVE_WS_KEY);
    return workspaces.find((w) => w.id === savedWsId) || workspaces[0] || DEFAULT_PERSONAL_WORKSPACE;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshWorkspaces = async () => {
    if (!isAuthenticated || !supabase || !user) {
      // Modo Local / Invitado
      try {
        const saved = localStorage.getItem(LOCAL_WS_KEY);
        let list = [DEFAULT_PERSONAL_WORKSPACE];
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
        }
        setWorkspaces(list);
        const savedWsId = localStorage.getItem(ACTIVE_WS_KEY);
        const found = list.find((w) => w.id === savedWsId) || list[0];
        setActiveWorkspace(found);
      } catch (err) {
        console.error('Error cargando workspaces locales:', err);
      }
      return;
    }

    try {
      setIsLoading(true);
      const list = await LedgerRepository.fetchWorkspaces();
      if (list && list.length > 0) {
        setWorkspaces(list);
        const savedWsId = localStorage.getItem(ACTIVE_WS_KEY);
        const found = list.find((w) => w.id === savedWsId) || list[0];
        setActiveWorkspace(found);
        localStorage.setItem(ACTIVE_WS_KEY, found.id);
        localStorage.setItem(LOCAL_WS_KEY, JSON.stringify(list));
      }
    } catch (err) {
      console.error('Error cargando workspaces remotos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshWorkspaces();
  }, [user?.id, isAuthenticated]);

  const switchWorkspace = (workspaceId: string) => {
    const found = workspaces.find((w) => w.id === workspaceId);
    if (found) {
      setActiveWorkspace(found);
      localStorage.setItem(ACTIVE_WS_KEY, found.id);
    }
  };

  const createWorkspace = async (
    name: string,
    type: 'personal' | 'business',
    currency: string = 'USD'
  ): Promise<Workspace | null> => {
    // Si está autenticado en Supabase, guardar en la base de datos remota
    if (supabase && user) {
      try {
        const { data: wsData, error: wsError } = await supabase
          .from('workspaces')
          .insert({
            name,
            type,
            currency,
            created_by: user.id,
          })
          .select()
          .single();

        if (wsError || !wsData) {
          console.warn('Error en Supabase al crear workspace, fallback a local:', wsError?.message);
        } else {
          // Asignar rol de owner en workspace_members
          await supabase.from('workspace_members').insert({
            workspace_id: wsData.id,
            user_id: user.id,
            role: 'owner',
          });

          // Crear cuentas base contables para el nuevo workspace
          await supabase.from('accounts').insert([
            { workspace_id: wsData.id, name: 'Caja Efectivo', type: 'asset', subtype: 'cash', icon: '💵', color: '#10B981' },
            { workspace_id: wsData.id, name: 'Cuenta Bancaria', type: 'asset', subtype: 'bank', icon: '🏦', color: '#3B82F6' },
            { workspace_id: wsData.id, name: 'Gastos Operativos', type: 'expense', subtype: 'operating_expense', icon: '🛒', color: '#EF4444' },
            { workspace_id: wsData.id, name: 'Ingresos por Ventas', type: 'revenue', subtype: 'general', icon: '💰', color: '#8B5CF6' },
          ]);

          const newWs: Workspace = {
            id: wsData.id,
            name: wsData.name,
            type: wsData.type,
            currency: wsData.currency,
            planTier: wsData.plan_tier,
            createdBy: wsData.created_by,
            createdAt: wsData.created_at,
            updatedAt: wsData.updated_at,
          };

          const updatedList = [...workspaces, newWs];
          setWorkspaces(updatedList);
          setActiveWorkspace(newWs);
          localStorage.setItem(ACTIVE_WS_KEY, newWs.id);
          localStorage.setItem(LOCAL_WS_KEY, JSON.stringify(updatedList));
          return newWs;
        }
      } catch (err) {
        console.warn('Excepción remota, procediendo con workspace local:', err);
      }
    }

    // Modo Local / Offline / Fallback garantizado
    const localId = 'ws-' + nanoid(8);
    const newWs: Workspace = {
      id: localId,
      name,
      type,
      currency,
      planTier: 'free',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [...workspaces, newWs];
    setWorkspaces(updatedList);
    setActiveWorkspace(newWs);
    localStorage.setItem(ACTIVE_WS_KEY, newWs.id);
    localStorage.setItem(LOCAL_WS_KEY, JSON.stringify(updatedList));
    return newWs;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        isLoading,
        switchWorkspace,
        createWorkspace,
        refreshWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace debe ser usado dentro de un WorkspaceProvider');
  }
  return context;
};
