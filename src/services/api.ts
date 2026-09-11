import { Material, Department, Movement, Requisition, InventoryStats, DatabaseBackup, User } from '../types.ts';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `Erro HTTP: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Autenticação
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  // Indicadores / Estatísticas
  async getStats(): Promise<InventoryStats> {
    const res = await fetch(`${BASE_URL}/stats`);
    return handleResponse(res);
  },

  // Materiais
  async getMaterials(): Promise<Material[]> {
    const res = await fetch(`${BASE_URL}/materials`);
    return handleResponse(res);
  },

  async createMaterial(data: Partial<Material>): Promise<Material> {
    const res = await fetch(`${BASE_URL}/materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateMaterial(id: string, data: Partial<Material>): Promise<Material> {
    const res = await fetch(`${BASE_URL}/materials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteMaterial(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/materials/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Departamentos / Setores
  async getDepartments(): Promise<Department[]> {
    const res = await fetch(`${BASE_URL}/departments`);
    return handleResponse(res);
  },

  async createDepartment(data: Partial<Department>): Promise<Department> {
    const res = await fetch(`${BASE_URL}/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateDepartment(id: string, data: Partial<Department>): Promise<Department> {
    const res = await fetch(`${BASE_URL}/departments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteDepartment(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/departments/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Movimentações
  async getMovements(): Promise<Movement[]> {
    const res = await fetch(`${BASE_URL}/movements`);
    return handleResponse(res);
  },

  async createMovement(data: Partial<Movement>): Promise<Movement> {
    const res = await fetch(`${BASE_URL}/movements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Requisições
  async getRequisitions(): Promise<Requisition[]> {
    const res = await fetch(`${BASE_URL}/requisitions`);
    return handleResponse(res);
  },

  async createRequisition(data: Partial<Requisition>): Promise<Requisition> {
    const res = await fetch(`${BASE_URL}/requisitions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateRequisitionStatus(id: string, status: Requisition['status'], authorizedBy?: string): Promise<Requisition> {
    const res = await fetch(`${BASE_URL}/requisitions/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, authorizedBy })
    });
    return handleResponse(res);
  },

  async fulfillRequisition(id: string, operatorName?: string): Promise<Requisition> {
    const res = await fetch(`${BASE_URL}/requisitions/${id}/fulfill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorName: operatorName || 'Almoxarife' })
    });
    return handleResponse(res);
  },

  // Backup & Restauração
  async exportBackup(): Promise<DatabaseBackup> {
    const res = await fetch(`${BASE_URL}/backup/export`);
    return handleResponse(res);
  },

  async importBackup(data: Partial<DatabaseBackup>): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/backup/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async resetDemo(): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/backup/reset-demo`, {
      method: 'POST'
    });
    return handleResponse(res);
  }
};
