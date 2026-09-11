import { Material, Department, Movement, Requisition, InventoryStats, DatabaseBackup, User } from '../types.ts';
import { localStore } from './localStore.ts';

const BASE_URL = '/api';

async function safeFetch<T>(
  url: string,
  options?: RequestInit,
  fallbackFn?: () => T | Promise<T>
): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return data as T;
    }

    // Se a resposta não for OK (404, 500, etc.)
    console.warn(`[API] Endpoint ${url} retornou HTTP ${res.status}. Utilizando persistência local resiliente.`);
  } catch (err: any) {
    console.warn(`[API] Falha de requisição em ${url} (${err.message}). Utilizando persistência local resiliente.`);
  }

  if (fallbackFn) {
    return await fallbackFn();
  }

  throw new Error('Serviço temporariamente indisponível.');
}

export const api = {
  // Autenticação
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return safeFetch(
      `${BASE_URL}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      },
      () => {
        const demoUser: User = {
          id: 'usr-vh',
          name: 'Victor Hugo',
          email: email || 'victorhugo@empresa.com.br',
          role: 'ADMINISTRADOR',
          department: 'Responsável Técnico & Almoxarifado Central'
        };
        return {
          user: demoUser,
          token: `token-local-${Date.now()}`
        };
      }
    );
  },

  // Indicadores / Estatísticas
  async getStats(): Promise<InventoryStats> {
    return safeFetch(
      `${BASE_URL}/stats`,
      undefined,
      () => localStore.getStats()
    );
  },

  // Materiais
  async getMaterials(): Promise<Material[]> {
    return safeFetch(
      `${BASE_URL}/materials`,
      undefined,
      () => localStore.getMaterials()
    ).then(materials => {
      localStore.syncWithServer({ materials });
      return materials;
    });
  },

  async createMaterial(data: Partial<Material>): Promise<Material> {
    return safeFetch(
      `${BASE_URL}/materials`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => localStore.addMaterial(data)
    ).then(newMat => {
      // Garante sincronia no localStore
      const current = localStore.getMaterials();
      if (!current.some(m => m.id === newMat.id)) {
        localStore.syncWithServer({ materials: [newMat, ...current] });
      }
      return newMat;
    });
  },

  async updateMaterial(id: string, data: Partial<Material>): Promise<Material> {
    return safeFetch(
      `${BASE_URL}/materials/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => localStore.updateMaterial(id, data)
    ).then(updated => {
      const current = localStore.getMaterials().map(m => m.id === id ? updated : m);
      localStore.syncWithServer({ materials: current });
      return updated;
    });
  },

  async deleteMaterial(id: string): Promise<{ message: string }> {
    return safeFetch(
      `${BASE_URL}/materials/${id}`,
      {
        method: 'DELETE'
      },
      () => {
        const res = localStore.deleteMaterial(id);
        return { message: res.message };
      }
    ).then(res => {
      const current = localStore.getMaterials().filter(m => m.id !== id);
      localStore.syncWithServer({ materials: current });
      return res;
    });
  },

  // Departamentos / Setores
  async getDepartments(): Promise<Department[]> {
    return safeFetch(
      `${BASE_URL}/departments`,
      undefined,
      () => localStore.getDepartments()
    ).then(departments => {
      localStore.syncWithServer({ departments });
      return departments;
    });
  },

  async createDepartment(data: Partial<Department>): Promise<Department> {
    return safeFetch(
      `${BASE_URL}/departments`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => localStore.addDepartment(data)
    ).then(newDept => {
      const current = localStore.getDepartments();
      if (!current.some(d => d.id === newDept.id)) {
        localStore.syncWithServer({ departments: [...current, newDept] });
      }
      return newDept;
    });
  },

  async updateDepartment(id: string, data: Partial<Department>): Promise<Department> {
    return safeFetch(
      `${BASE_URL}/departments/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => localStore.updateDepartment(id, data)
    ).then(updated => {
      const current = localStore.getDepartments().map(d => d.id === id ? updated : d);
      localStore.syncWithServer({ departments: current });
      return updated;
    });
  },

  async deleteDepartment(id: string): Promise<{ message: string }> {
    return safeFetch(
      `${BASE_URL}/departments/${id}`,
      {
        method: 'DELETE'
      },
      () => {
        const res = localStore.deleteDepartment(id);
        return { message: res.message };
      }
    ).then(res => {
      const current = localStore.getDepartments().filter(d => d.id !== id);
      localStore.syncWithServer({ departments: current });
      return res;
    });
  },

  // Movimentações
  async getMovements(): Promise<Movement[]> {
    return safeFetch(
      `${BASE_URL}/movements`,
      undefined,
      () => localStore.getMovements()
    ).then(movements => {
      localStore.syncWithServer({ movements });
      return movements;
    });
  },

  async createMovement(data: Partial<Movement>): Promise<Movement> {
    return safeFetch(
      `${BASE_URL}/movements`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => localStore.addMovement(data)
    ).then(newMov => {
      const current = localStore.getMovements();
      if (!current.some(m => m.id === newMov.id)) {
        localStore.syncWithServer({ movements: [newMov, ...current] });
      }
      return newMov;
    });
  },

  // Requisições
  async getRequisitions(): Promise<Requisition[]> {
    return safeFetch(
      `${BASE_URL}/requisitions`,
      undefined,
      () => localStore.getRequisitions()
    ).then(requisitions => {
      localStore.syncWithServer({ requisitions });
      return requisitions;
    });
  },

  async createRequisition(data: Partial<Requisition>): Promise<Requisition> {
    return safeFetch(
      `${BASE_URL}/requisitions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => localStore.addRequisition(data)
    ).then(newReq => {
      const current = localStore.getRequisitions();
      if (!current.some(r => r.id === newReq.id)) {
        localStore.syncWithServer({ requisitions: [newReq, ...current] });
      }
      return newReq;
    });
  },

  async updateRequisitionStatus(id: string, status: Requisition['status'], authorizedBy?: string): Promise<Requisition> {
    return safeFetch(
      `${BASE_URL}/requisitions/${id}/status`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, authorizedBy })
      },
      () => localStore.updateRequisitionStatus(id, status, authorizedBy)
    ).then(updated => {
      const current = localStore.getRequisitions().map(r => r.id === id ? updated : r);
      localStore.syncWithServer({ requisitions: current });
      return updated;
    });
  },

  async fulfillRequisition(id: string, operatorName?: string): Promise<Requisition> {
    return safeFetch(
      `${BASE_URL}/requisitions/${id}/fulfill`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorName: operatorName || 'Victor Hugo' })
      },
      () => localStore.fulfillRequisition(id, operatorName || 'Victor Hugo')
    ).then(updated => {
      const current = localStore.getRequisitions().map(r => r.id === id ? updated : r);
      localStore.syncWithServer({ requisitions: current });
      return updated;
    });
  },

  // Backup & Restauração
  async exportBackup(): Promise<DatabaseBackup> {
    return safeFetch(
      `${BASE_URL}/backup/export`,
      undefined,
      () => localStore.getBackup()
    );
  },

  async importBackup(data: Partial<DatabaseBackup>): Promise<{ message: string }> {
    return safeFetch(
      `${BASE_URL}/backup/import`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => localStore.restoreBackup(data)
    );
  },

  async resetDemo(): Promise<{ message: string }> {
    return safeFetch(
      `${BASE_URL}/backup/reset-demo`,
      {
        method: 'POST'
      },
      () => localStore.resetToSeed()
    );
  }
};
