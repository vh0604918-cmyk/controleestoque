export type UnitOfMeasure =
  | 'UN' // Unidade
  | 'CX' // Caixa
  | 'M'  // Metro
  | 'KG' // Quilograma
  | 'L'  // Litro
  | 'PC' // Peça
  | 'RL' // Rolo
  | 'PAR'; // Par

export interface Material {
  id: string;
  code: string;               // Código do material (ex: MAT-101)
  name: string;               // Nome do material
  description: string;        // Descrição detalhada
  unit: UnitOfMeasure;        // Unidade de medida
  minQuantity: number;        // Quantidade mínima (estoque de segurança)
  currentQuantity: number;    // Quantidade em estoque
  averageUnitCost: number;    // Custo médio unitário (R$)
  departmentId: string;       // Setor/departamento associado principal
  category: string;           // Categoria (Informática, Elétrica, Escritório, etc.)
  location?: string;          // Localização no almoxarifado (ex: Prateleira A2)
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  code: string;               // Código do setor (ex: SET-TI)
  name: string;               // Nome do setor
  manager: string;            // Responsável pelo setor
  email: string;              // E-mail de contato
  phone?: string;             // Telefone/Ramal
  description: string;        // Descrição do setor
  createdAt: string;
}

export type MovementType = 'IN' | 'OUT';

export interface Movement {
  id: string;
  code: string;               // Código da movimentação (ex: MOV-2026-001)
  type: MovementType;         // ENTRADA ou SAÍDA
  materialId: string;
  materialName: string;
  materialCode: string;
  unit: UnitOfMeasure;
  quantity: number;
  date: string;               // Data da movimentação (YYYY-MM-DD ou ISO)
  // Campos específicos de Entrada
  supplier?: string;          // Fornecedor
  unitCost?: number;          // Custo unitário da compra
  totalCost?: number;         // Custo total da movimentação
  invoiceNumber?: string;     // Número da Nota Fiscal
  // Campos específicos de Saída
  departmentId?: string;      // Setor responsável / destino
  departmentName?: string;
  reason?: string;            // Motivo da saída (Manutenção, Consumo, etc.)
  requester?: string;         // Nome do requisitante
  requisitionId?: string;     // ID da requisição relacionada se houver
  observations?: string;
  registeredBy: string;       // Usuário que registrou
  createdAt: string;
}

export type RequisitionPriority = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
export type RequisitionStatus = 'PENDENTE' | 'APROVADA' | 'ATENDIDA' | 'CANCELADA';

export interface RequisitionItem {
  materialId: string;
  materialCode: string;
  materialName: string;
  unit: UnitOfMeasure;
  quantityRequested: number;
  quantityFulfilled?: number;
  unitCost?: number;
}

export interface Requisition {
  id: string;
  code: string;               // Código da requisição (ex: REQ-2026-004)
  departmentId: string;
  departmentName: string;
  requesterName: string;
  priority: RequisitionPriority;
  reason: string;
  status: RequisitionStatus;
  date: string;
  items: RequisitionItem[];
  authorizedBy?: string;
  fulfilledDate?: string;
  observations?: string;
  createdAt: string;
}

export interface InventoryStats {
  totalInventoryValue: number;
  totalMaterialsCount: number;
  criticalItemsCount: number; // itens <= estoque mínimo ou zerados
  outOfStockCount: number;    // itens com estoque = 0
  totalMovementsThisMonth: number;
  totalEntriesValueThisMonth: number;
  totalExitsValueThisMonth: number;
  stockTurnoverRate: number;  // Giro de Estoque (taxa de rotatividade anualizada ou no período)
  topMovedMaterials: {
    materialId: string;
    materialCode: string;
    materialName: string;
    totalExits: number;
    totalEntries: number;
    unit: string;
  }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMINISTRADOR' | 'GESTOR' | 'ALMOXARIFE';
  department: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface DatabaseBackup {
  version: string;
  exportedAt: string;
  systemName: string;
  technicalLead: string;
  materials: Material[];
  departments: Department[];
  movements: Movement[];
  requisitions: Requisition[];
}
