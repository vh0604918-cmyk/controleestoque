import { Material, Department, Movement, Requisition, InventoryStats, DatabaseBackup } from '../types.ts';

const STORAGE_KEY = 'estoque_enterprise_v2_db';

const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-1',
    code: 'SET-TI',
    name: 'Tecnologia da Informação',
    manager: 'Carlos Eduardo Silva',
    email: 'carlos.silva@empresa.com.br',
    phone: '(11) 3450-4012',
    description: 'Gestão de infraestrutura de rede, servidores e suporte ao usuário.',
    createdAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'dept-2',
    code: 'SET-MANUT',
    name: 'Manutenção Industrial & Predial',
    manager: 'Roberto Mendes Oliveira',
    email: 'roberto.mendes@empresa.com.br',
    phone: '(11) 3450-4055',
    description: 'Manutenção preventiva e corretiva de máquinas, equipamentos e instalações.',
    createdAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'dept-3',
    code: 'SET-PROD',
    name: 'Produção & Montagem',
    manager: 'Juliana Vasconcelos',
    email: 'juliana.vasconcelos@empresa.com.br',
    phone: '(11) 3450-4100',
    description: 'Linha operacional de fabricação e montagem de componentes.',
    createdAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'dept-4',
    code: 'SET-LOG',
    name: 'Logística & Expedição',
    manager: 'Marcos Vinícius Santos',
    email: 'marcos.vinicius@empresa.com.br',
    phone: '(11) 3450-4200',
    description: 'Recebimento, armazenagem, separação e despacho de produtos.',
    createdAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'dept-5',
    code: 'SET-ADM',
    name: 'Administração & Controladoria',
    manager: 'Fernando Souza Lima',
    email: 'fernando.souza@empresa.com.br',
    phone: '(11) 3450-4001',
    description: 'Gestão administrativa, fiscal e planejamento orçamentário.',
    createdAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'dept-6',
    code: 'SET-RH',
    name: 'Recursos Humanos & SESMT',
    manager: 'Patrícia Guimarães',
    email: 'patricia.guimaraes@empresa.com.br',
    phone: '(11) 3450-4020',
    description: 'Gestão de pessoas, segurança do trabalho e treinamentos internos.',
    createdAt: '2026-01-10T08:00:00.000Z'
  }
];

const INITIAL_MATERIALS: Material[] = [
  {
    id: 'mat-1',
    code: 'MAT-101',
    name: 'Cabo de Rede UTP Cat6 100% Cobre',
    description: 'Cabo de 4 pares trançados categoria 6 para rede gigabit, caixa com 305 metros.',
    unit: 'RL',
    minQuantity: 4,
    currentQuantity: 8,
    averageUnitCost: 420.00,
    departmentId: 'dept-1',
    category: 'Redes e TI',
    location: 'Prateleira A-01',
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-02-18T10:30:00.000Z'
  },
  {
    id: 'mat-2',
    code: 'MAT-102',
    name: 'Conector RJ45 Macho Cat6 Blindado',
    description: 'Conector de rede modular para terminação Cat6, embalagem com 100 unidades.',
    unit: 'CX',
    minQuantity: 5,
    currentQuantity: 2,
    averageUnitCost: 68.50,
    departmentId: 'dept-1',
    category: 'Redes e TI',
    location: 'Gaveteiro A-04',
    createdAt: '2026-01-15T09:10:00.000Z',
    updatedAt: '2026-02-20T14:15:00.000Z'
  },
  {
    id: 'mat-3',
    code: 'MAT-201',
    name: 'Luva de Proteção Mecânica Nitrílica',
    description: 'EPI com banho nitrílico na palma e dedos para manuseio de peças oleadas.',
    unit: 'PAR',
    minQuantity: 30,
    currentQuantity: 12,
    averageUnitCost: 19.80,
    departmentId: 'dept-6',
    category: 'EPI e Segurança',
    location: 'Armário E-02',
    createdAt: '2026-01-16T11:00:00.000Z',
    updatedAt: '2026-02-22T08:45:00.000Z'
  },
  {
    id: 'mat-4',
    code: 'MAT-202',
    name: 'Óleo Lubrificante Sintético ISO VG 68',
    description: 'Lubrificante hidráulico de alta performance com aditivos antidesgaste.',
    unit: 'L',
    minQuantity: 20,
    currentQuantity: 26,
    averageUnitCost: 46.50,
    departmentId: 'dept-2',
    category: 'Manutenção',
    location: 'Depósito Q-01',
    createdAt: '2026-01-16T11:20:00.000Z',
    updatedAt: '2026-02-15T16:00:00.000Z'
  },
  {
    id: 'mat-5',
    code: 'MAT-203',
    name: 'Fita Isolante Autofusão 19mm x 10m',
    description: 'Fita de alta isolação elétrica classe H para barramentos e cabos industriais.',
    unit: 'RL',
    minQuantity: 15,
    currentQuantity: 22,
    averageUnitCost: 28.90,
    departmentId: 'dept-2',
    category: 'Elétrica',
    location: 'Gaveteiro B-01',
    createdAt: '2026-01-17T14:00:00.000Z',
    updatedAt: '2026-02-10T10:00:00.000Z'
  },
  {
    id: 'mat-6',
    code: 'MAT-301',
    name: 'Disco de Corte Fino Inox 115 x 1.0mm',
    description: 'Disco abrasivo para esmerilhadeira angular, corte rápido e sem rebarba.',
    unit: 'CX',
    minQuantity: 10,
    currentQuantity: 0,
    averageUnitCost: 85.00,
    departmentId: 'dept-3',
    category: 'Usinagem e Corte',
    location: 'Prateleira P-03',
    createdAt: '2026-01-18T10:00:00.000Z',
    updatedAt: '2026-02-25T11:20:00.000Z'
  },
  {
    id: 'mat-7',
    code: 'MAT-401',
    name: 'Etiqueta Adesiva Térmica 100 x 150mm',
    description: 'Rolo com 500 etiquetas para impressora Zebra/Argox de despacho e rastreio.',
    unit: 'RL',
    minQuantity: 12,
    currentQuantity: 5,
    averageUnitCost: 39.50,
    departmentId: 'dept-4',
    category: 'Embalagem e Logística',
    location: 'Prateleira L-02',
    createdAt: '2026-01-19T09:30:00.000Z',
    updatedAt: '2026-02-23T15:10:00.000Z'
  },
  {
    id: 'mat-8',
    code: 'MAT-501',
    name: 'Papel Sulfite A4 75g Branco Caixa',
    description: 'Caixa com 5 resmas de 500 folhas (total 2.500 folhas) papel alcalino.',
    unit: 'CX',
    minQuantity: 8,
    currentQuantity: 16,
    averageUnitCost: 138.00,
    departmentId: 'dept-5',
    category: 'Escritório',
    location: 'Armário C-01',
    createdAt: '2026-01-20T13:00:00.000Z',
    updatedAt: '2026-02-12T09:00:00.000Z'
  },
  {
    id: 'mat-9',
    code: 'MAT-103',
    name: 'Kit Teclado e Mouse Sem Fio ABNT2',
    description: 'Combo periféricos USB 2.4GHz com pilhas inclusas para estações operacionais.',
    unit: 'UN',
    minQuantity: 8,
    currentQuantity: 14,
    averageUnitCost: 119.90,
    departmentId: 'dept-1',
    category: 'Redes e TI',
    location: 'Armário T-02',
    createdAt: '2026-01-21T14:30:00.000Z',
    updatedAt: '2026-02-16T17:00:00.000Z'
  },
  {
    id: 'mat-10',
    code: 'MAT-204',
    name: 'Óculos de Proteção Antiembaçante Incolor',
    description: 'EPI com lente de policarbonato e proteção UV para ambientes industriais.',
    unit: 'UN',
    minQuantity: 25,
    currentQuantity: 38,
    averageUnitCost: 16.50,
    departmentId: 'dept-6',
    category: 'EPI e Segurança',
    location: 'Armário E-01',
    createdAt: '2026-01-22T08:00:00.000Z',
    updatedAt: '2026-02-19T10:00:00.000Z'
  }
];

const INITIAL_MOVEMENTS: Movement[] = [
  {
    id: 'mov-1',
    code: 'MOV-2026-0001',
    type: 'IN',
    materialId: 'mat-1',
    materialName: 'Cabo de Rede UTP Cat6 100% Cobre',
    materialCode: 'MAT-101',
    unit: 'RL',
    quantity: 10,
    date: '2026-01-20',
    supplier: 'Distribuidora Conectividade Brasil Ltda',
    unitCost: 420.00,
    totalCost: 4200.00,
    invoiceNumber: 'NF-e 88341',
    observations: 'Recebimento de lote para ampliação de infraestrutura predial.',
    registeredBy: 'Victor Hugo',
    createdAt: '2026-01-20T10:00:00.000Z'
  },
  {
    id: 'mov-2',
    code: 'MOV-2026-0002',
    type: 'OUT',
    materialId: 'mat-1',
    materialName: 'Cabo de Rede UTP Cat6 100% Cobre',
    materialCode: 'MAT-101',
    unit: 'RL',
    quantity: 2,
    date: '2026-02-05',
    departmentId: 'dept-1',
    departmentName: 'Tecnologia da Informação',
    reason: 'Instalação de pontos de rede no novo anexo administrativo',
    requester: 'Carlos Eduardo Silva',
    requisitionId: 'req-1',
    observations: 'Requisição atendida integralmente.',
    registeredBy: 'Victor Hugo',
    createdAt: '2026-02-05T14:30:00.000Z'
  },
  {
    id: 'mov-3',
    code: 'MOV-2026-0003',
    type: 'IN',
    materialId: 'mat-4',
    materialName: 'Óleo Lubrificante Sintético ISO VG 68',
    materialCode: 'MAT-202',
    unit: 'L',
    quantity: 30,
    date: '2026-02-01',
    supplier: 'Lubripar Distribuidora de Óleos Industriais',
    unitCost: 46.50,
    totalCost: 1395.00,
    invoiceNumber: 'NF-e 91204',
    observations: 'Lote de reposição periódica para manutenção de prensas hidráulicas.',
    registeredBy: 'Victor Hugo',
    createdAt: '2026-02-01T09:15:00.000Z'
  },
  {
    id: 'mov-4',
    code: 'MOV-2026-0004',
    type: 'OUT',
    materialId: 'mat-4',
    materialName: 'Óleo Lubrificante Sintético ISO VG 68',
    materialCode: 'MAT-202',
    unit: 'L',
    quantity: 4,
    date: '2026-02-14',
    departmentId: 'dept-2',
    departmentName: 'Manutenção Industrial & Predial',
    reason: 'Troca de óleo preventiva da Prensa Mecânica P-04',
    requester: 'Roberto Mendes Oliveira',
    observations: 'Retirada efetuada pelo técnico responsável.',
    registeredBy: 'Victor Hugo',
    createdAt: '2026-02-14T11:00:00.000Z'
  },
  {
    id: 'mov-5',
    code: 'MOV-2026-0005',
    type: 'OUT',
    materialId: 'mat-3',
    materialName: 'Luva de Proteção Mecânica Nitrílica',
    materialCode: 'MAT-201',
    unit: 'PAR',
    quantity: 18,
    date: '2026-02-18',
    departmentId: 'dept-3',
    departmentName: 'Produção & Montagem',
    reason: 'Distribuição mensal de EPIs para o turno B de montagem',
    requester: 'Juliana Vasconcelos',
    requisitionId: 'req-2',
    observations: 'EPIs com Ficha de Entrega assinada.',
    registeredBy: 'Victor Hugo',
    createdAt: '2026-02-18T16:00:00.000Z'
  },
  {
    id: 'mov-6',
    code: 'MOV-2026-0006',
    type: 'OUT',
    materialId: 'mat-6',
    materialName: 'Disco de Corte Fino Inox 115 x 1.0mm',
    materialCode: 'MAT-301',
    unit: 'CX',
    quantity: 10,
    date: '2026-02-22',
    departmentId: 'dept-3',
    departmentName: 'Produção & Montagem',
    reason: 'Corte de perfis para estrutura do projeto de caldeiraria',
    requester: 'Juliana Vasconcelos',
    observations: 'Estoque do item zerado após esta saída. Necessário compra urgente.',
    registeredBy: 'Victor Hugo',
    createdAt: '2026-02-22T10:45:00.000Z'
  },
  {
    id: 'mov-7',
    code: 'MOV-2026-0007',
    type: 'IN',
    materialId: 'mat-8',
    materialName: 'Papel Sulfite A4 75g Branco Caixa',
    materialCode: 'MAT-501',
    unit: 'CX',
    quantity: 20,
    date: '2026-02-10',
    supplier: 'Papelaria & Suprimentos Corporativos SP',
    unitCost: 138.00,
    totalCost: 2760.00,
    invoiceNumber: 'NF-e 77312',
    observations: 'Compra programada do almoxarifado geral.',
    registeredBy: 'Victor Hugo',
    createdAt: '2026-02-10T08:30:00.000Z'
  },
  {
    id: 'mov-8',
    code: 'MOV-2026-0008',
    type: 'OUT',
    materialId: 'mat-8',
    materialName: 'Papel Sulfite A4 75g Branco Caixa',
    materialCode: 'MAT-501',
    unit: 'CX',
    quantity: 4,
    date: '2026-02-20',
    departmentId: 'dept-5',
    departmentName: 'Administração & Controladoria',
    reason: 'Suprimento das impressoras da contabilidade e RH para fechamento contábil',
    requester: 'Fernando Souza Lima',
    observations: 'Retirada mensal padrão.',
    registeredBy: 'Victor Hugo',
    createdAt: '2026-02-20T15:20:00.000Z'
  }
];

const INITIAL_REQUISITIONS: Requisition[] = [
  {
    id: 'req-1',
    code: 'REQ-2026-001',
    departmentId: 'dept-1',
    departmentName: 'Tecnologia da Informação',
    requesterName: 'Carlos Eduardo Silva',
    priority: 'ALTA',
    reason: 'Ampliação do cabeamento estruturado e atendimento de novos postos operacionais.',
    status: 'ATENDIDA',
    date: '2026-02-05',
    authorizedBy: 'Gestão Administrativa',
    fulfilledDate: '2026-02-05T14:30:00.000Z',
    items: [
      {
        materialId: 'mat-1',
        materialCode: 'MAT-101',
        materialName: 'Cabo de Rede UTP Cat6 100% Cobre',
        unit: 'RL',
        quantityRequested: 2,
        quantityFulfilled: 2,
        unitCost: 420.00
      },
      {
        materialId: 'mat-2',
        materialCode: 'MAT-102',
        materialName: 'Conector RJ45 Macho Cat6 Blindado',
        unit: 'CX',
        quantityRequested: 1,
        quantityFulfilled: 1,
        unitCost: 68.50
      }
    ],
    observations: 'Material conferido e entregue na bancada da TI.',
    createdAt: '2026-02-04T16:00:00.000Z'
  },
  {
    id: 'req-2',
    code: 'REQ-2026-002',
    departmentId: 'dept-3',
    departmentName: 'Produção & Montagem',
    requesterName: 'Juliana Vasconcelos',
    priority: 'URGENTE',
    reason: 'Reposição de itens de segurança para operários da linha de estamparia.',
    status: 'ATENDIDA',
    date: '2026-02-18',
    authorizedBy: 'Coordenação SESMT',
    fulfilledDate: '2026-02-18T16:00:00.000Z',
    items: [
      {
        materialId: 'mat-3',
        materialCode: 'MAT-201',
        materialName: 'Luva de Proteção Mecânica Nitrílica',
        unit: 'PAR',
        quantityRequested: 18,
        quantityFulfilled: 18,
        unitCost: 19.80
      }
    ],
    observations: 'Atendida em regime de prioridade.',
    createdAt: '2026-02-18T13:00:00.000Z'
  },
  {
    id: 'req-3',
    code: 'REQ-2026-003',
    departmentId: 'dept-2',
    departmentName: 'Manutenção Industrial & Predial',
    requesterName: 'Roberto Mendes Oliveira',
    priority: 'MEDIA',
    reason: 'Manutenção corretiva e isolamento elétrico no painel secundário do galpão 2.',
    status: 'APROVADA',
    date: '2026-02-24',
    authorizedBy: 'Eng. Chefe de Operações',
    items: [
      {
        materialId: 'mat-5',
        materialCode: 'MAT-203',
        materialName: 'Fita Isolante Autofusão 19mm x 10m',
        unit: 'RL',
        quantityRequested: 3,
        unitCost: 28.90
      },
      {
        materialId: 'mat-4',
        materialCode: 'MAT-202',
        materialName: 'Óleo Lubrificante Sintético ISO VG 68',
        unit: 'L',
        quantityRequested: 5,
        unitCost: 46.50
      }
    ],
    observations: 'Aguardando liberação de retirada pelo almoxarife.',
    createdAt: '2026-02-24T09:30:00.000Z'
  },
  {
    id: 'req-4',
    code: 'REQ-2026-004',
    departmentId: 'dept-4',
    departmentName: 'Logística & Expedição',
    requesterName: 'Marcos Vinícius Santos',
    priority: 'ALTA',
    reason: 'Etiquetas para identificação de paletes no despacho da carga da semana.',
    status: 'PENDENTE',
    date: '2026-02-26',
    items: [
      {
        materialId: 'mat-7',
        materialCode: 'MAT-401',
        materialName: 'Etiqueta Adesiva Térmica 100 x 150mm',
        unit: 'RL',
        quantityRequested: 3,
        unitCost: 39.50
      }
    ],
    observations: 'Solicitação em análise pelo gestor responsável.',
    createdAt: '2026-02-26T11:00:00.000Z'
  }
];

export interface LocalDatabaseState {
  materials: Material[];
  departments: Department[];
  movements: Movement[];
  requisitions: Requisition[];
  lastUpdated: string;
}

function getInitialState(): LocalDatabaseState {
  return {
    materials: JSON.parse(JSON.stringify(INITIAL_MATERIALS)),
    departments: JSON.parse(JSON.stringify(INITIAL_DEPARTMENTS)),
    movements: JSON.parse(JSON.stringify(INITIAL_MOVEMENTS)),
    requisitions: JSON.parse(JSON.stringify(INITIAL_REQUISITIONS)),
    lastUpdated: new Date().toISOString()
  };
}

class LocalStoreManager {
  private memoryData: LocalDatabaseState;

  constructor() {
    this.memoryData = this.loadFromStorage();
  }

  private loadFromStorage(): LocalDatabaseState {
    if (typeof window === 'undefined') {
      return getInitialState();
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          Array.isArray(parsed.materials) &&
          Array.isArray(parsed.departments) &&
          Array.isArray(parsed.movements) &&
          Array.isArray(parsed.requisitions)
        ) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Erro ao ler localStorage, utilizando semente padrão:', e);
    }
    const initial = getInitialState();
    this.saveToStorage(initial);
    return initial;
  }

  private saveToStorage(data: LocalDatabaseState) {
    this.memoryData = data;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.warn('Erro ao salvar no localStorage:', e);
      }
    }
  }

  public syncWithServer(data: Partial<LocalDatabaseState>) {
    const updated = {
      ...this.memoryData,
      ...data,
      lastUpdated: new Date().toISOString()
    };
    this.saveToStorage(updated);
  }

  public getMaterials(): Material[] {
    return [...this.memoryData.materials];
  }

  public addMaterial(materialData: Partial<Material>): Material {
    const newMaterial: Material = {
      id: `mat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      code: (materialData.code || `MAT-${Date.now().toString().slice(-4)}`).trim().toUpperCase(),
      name: (materialData.name || 'Novo Material').trim(),
      description: materialData.description || '',
      unit: materialData.unit || 'UN',
      minQuantity: Number(materialData.minQuantity) || 0,
      currentQuantity: Number(materialData.currentQuantity) || 0,
      averageUnitCost: Number(materialData.averageUnitCost) || 0,
      departmentId: materialData.departmentId || '',
      category: materialData.category || 'Geral',
      location: materialData.location || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const materials = [newMaterial, ...this.memoryData.materials];
    this.saveToStorage({ ...this.memoryData, materials });
    return newMaterial;
  }

  public updateMaterial(id: string, updates: Partial<Material>): Material {
    const index = this.memoryData.materials.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error(`Material com ID ${id} não encontrado.`);
    }

    const updatedMaterial: Material = {
      ...this.memoryData.materials[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const materials = [...this.memoryData.materials];
    materials[index] = updatedMaterial;
    this.saveToStorage({ ...this.memoryData, materials });
    return updatedMaterial;
  }

  public deleteMaterial(id: string): { success: boolean; message: string } {
    const hasMovements = this.memoryData.movements.some(m => m.materialId === id);
    if (hasMovements) {
      throw new Error('Não é possível excluir material que possui movimentações de estoque registradas.');
    }

    const materials = this.memoryData.materials.filter(m => m.id !== id);
    this.saveToStorage({ ...this.memoryData, materials });
    return { success: true, message: 'Material excluído com sucesso.' };
  }

  public getDepartments(): Department[] {
    return [...this.memoryData.departments];
  }

  public addDepartment(deptData: Partial<Department>): Department {
    const newDept: Department = {
      id: `dept-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      code: (deptData.code || `SET-${Date.now().toString().slice(-4)}`).trim().toUpperCase(),
      name: (deptData.name || 'Novo Setor').trim(),
      manager: (deptData.manager || 'Responsável').trim(),
      email: deptData.email || '',
      phone: deptData.phone || '',
      description: deptData.description || '',
      createdAt: new Date().toISOString()
    };

    const departments = [...this.memoryData.departments, newDept];
    this.saveToStorage({ ...this.memoryData, departments });
    return newDept;
  }

  public updateDepartment(id: string, updates: Partial<Department>): Department {
    const index = this.memoryData.departments.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error(`Setor com ID ${id} não encontrado.`);
    }

    const updatedDept: Department = {
      ...this.memoryData.departments[index],
      ...updates
    };

    const departments = [...this.memoryData.departments];
    departments[index] = updatedDept;
    this.saveToStorage({ ...this.memoryData, departments });
    return updatedDept;
  }

  public deleteDepartment(id: string): { success: boolean; message: string } {
    const hasMaterials = this.memoryData.materials.some(m => m.departmentId === id);
    if (hasMaterials) {
      throw new Error('Não é possível excluir setor com materiais associados. Realoque os materiais primeiro.');
    }

    const departments = this.memoryData.departments.filter(d => d.id !== id);
    this.saveToStorage({ ...this.memoryData, departments });
    return { success: true, message: 'Setor excluído com sucesso.' };
  }

  public getMovements(): Movement[] {
    return [...this.memoryData.movements];
  }

  public addMovement(movementData: Partial<Movement>): Movement {
    const material = this.memoryData.materials.find(m => m.id === movementData.materialId);
    if (!material) {
      throw new Error('Material selecionado não encontrado.');
    }

    const qty = Number(movementData.quantity);
    if (qty <= 0) {
      throw new Error('A quantidade da movimentação deve ser maior que zero.');
    }

    if (movementData.type === 'OUT' && material.currentQuantity < qty) {
      throw new Error(`Saldo insuficiente em estoque. Saldo atual: ${material.currentQuantity} ${material.unit}. Solicitado: ${qty}.`);
    }

    // Atualiza saldo do material
    const updatedMaterials = this.memoryData.materials.map(m => {
      if (m.id === material.id) {
        let newQty = m.currentQuantity;
        let newAvgCost = m.averageUnitCost;

        if (movementData.type === 'IN') {
          const inCost = Number(movementData.unitCost) || m.averageUnitCost;
          const currentTotal = m.currentQuantity * m.averageUnitCost;
          const newTotal = currentTotal + (qty * inCost);
          newQty = m.currentQuantity + qty;
          newAvgCost = newQty > 0 ? Number((newTotal / newQty).toFixed(2)) : inCost;
        } else {
          newQty = m.currentQuantity - qty;
        }

        return {
          ...m,
          currentQuantity: newQty,
          averageUnitCost: newAvgCost,
          updatedAt: new Date().toISOString()
        };
      }
      return m;
    });

    const newMovement: Movement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      code: `MOV-${new Date().getFullYear()}-${String(this.memoryData.movements.length + 1).padStart(4, '0')}`,
      type: movementData.type || 'IN',
      materialId: material.id,
      materialName: material.name,
      materialCode: material.code,
      unit: material.unit,
      quantity: qty,
      date: movementData.date || new Date().toISOString().split('T')[0],
      supplier: movementData.supplier,
      unitCost: movementData.unitCost ? Number(movementData.unitCost) : material.averageUnitCost,
      totalCost: movementData.totalCost
        ? Number(movementData.totalCost)
        : qty * (Number(movementData.unitCost) || material.averageUnitCost),
      invoiceNumber: movementData.invoiceNumber,
      departmentId: movementData.departmentId,
      departmentName: movementData.departmentName,
      reason: movementData.reason,
      requester: movementData.requester,
      observations: movementData.observations,
      registeredBy: movementData.registeredBy || 'Victor Hugo',
      createdAt: new Date().toISOString()
    };

    const movements = [newMovement, ...this.memoryData.movements];
    this.saveToStorage({
      ...this.memoryData,
      materials: updatedMaterials,
      movements
    });

    return newMovement;
  }

  public getRequisitions(): Requisition[] {
    return [...this.memoryData.requisitions];
  }

  public addRequisition(reqData: Partial<Requisition>): Requisition {
    const newReq: Requisition = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      code: `REQ-${new Date().getFullYear()}-${String(this.memoryData.requisitions.length + 1).padStart(3, '0')}`,
      departmentId: reqData.departmentId || '',
      departmentName: reqData.departmentName || 'Setor Solicitante',
      requesterName: reqData.requesterName || 'Requisitante',
      priority: reqData.priority || 'MEDIA',
      reason: reqData.reason || 'Consumo operacional',
      status: 'PENDENTE',
      date: reqData.date || new Date().toISOString().split('T')[0],
      items: reqData.items || [],
      observations: reqData.observations,
      createdAt: new Date().toISOString()
    };

    const requisitions = [newReq, ...this.memoryData.requisitions];
    this.saveToStorage({ ...this.memoryData, requisitions });
    return newReq;
  }

  public updateRequisitionStatus(id: string, status: Requisition['status'], authorizedBy?: string): Requisition {
    const index = this.memoryData.requisitions.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Requisição ${id} não encontrada.`);
    }

    const updatedReq: Requisition = {
      ...this.memoryData.requisitions[index],
      status,
      authorizedBy: authorizedBy || this.memoryData.requisitions[index].authorizedBy
    };

    const requisitions = [...this.memoryData.requisitions];
    requisitions[index] = updatedReq;
    this.saveToStorage({ ...this.memoryData, requisitions });
    return updatedReq;
  }

  public fulfillRequisition(id: string, operatorName: string = 'Victor Hugo'): Requisition {
    const req = this.memoryData.requisitions.find(r => r.id === id);
    if (!req) {
      throw new Error(`Requisição ${id} não encontrada.`);
    }
    if (req.status === 'ATENDIDA') {
      throw new Error('Esta requisição já foi atendida anteriormente.');
    }

    // Verificar se há estoque para todos os itens
    for (const item of req.items) {
      const mat = this.memoryData.materials.find(m => m.id === item.materialId);
      if (!mat) {
        throw new Error(`Material "${item.materialName}" não encontrado no catálogo.`);
      }
      if (mat.currentQuantity < item.quantityRequested) {
        throw new Error(`Estoque insuficiente para "${mat.name}". Disponível: ${mat.currentQuantity}, Solicitado: ${item.quantityRequested}.`);
      }
    }

    // Gerar baixas de estoque
    const now = new Date();
    const newMovements: Movement[] = [];
    let updatedMaterials = [...this.memoryData.materials];

    for (const item of req.items) {
      const mat = updatedMaterials.find(m => m.id === item.materialId)!;
      const movCode = `MOV-${now.getFullYear()}-${String(this.memoryData.movements.length + newMovements.length + 1).padStart(4, '0')}`;

      const mov: Movement = {
        id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        code: movCode,
        type: 'OUT',
        materialId: mat.id,
        materialName: mat.name,
        materialCode: mat.code,
        unit: mat.unit,
        quantity: item.quantityRequested,
        date: now.toISOString().split('T')[0],
        departmentId: req.departmentId,
        departmentName: req.departmentName,
        reason: `Atendimento de Requisição ${req.code} - ${req.reason}`,
        requester: req.requesterName,
        requisitionId: req.id,
        unitCost: mat.averageUnitCost,
        totalCost: item.quantityRequested * mat.averageUnitCost,
        observations: `Baixa automática via requisição ${req.code}. Operador: ${operatorName}`,
        registeredBy: operatorName,
        createdAt: now.toISOString()
      };

      newMovements.push(mov);

      // Decrementa saldo
      updatedMaterials = updatedMaterials.map(m =>
        m.id === mat.id
          ? {
              ...m,
              currentQuantity: m.currentQuantity - item.quantityRequested,
              updatedAt: now.toISOString()
            }
          : m
      );
    }

    const updatedReq: Requisition = {
      ...req,
      status: 'ATENDIDA',
      fulfilledDate: now.toISOString(),
      items: req.items.map(item => ({
        ...item,
        quantityFulfilled: item.quantityRequested
      }))
    };

    const requisitions = this.memoryData.requisitions.map(r => (r.id === id ? updatedReq : r));
    const movements = [...newMovements, ...this.memoryData.movements];

    this.saveToStorage({
      ...this.memoryData,
      materials: updatedMaterials,
      movements,
      requisitions
    });

    return updatedReq;
  }

  public getStats(): InventoryStats {
    const totalInventoryValue = this.memoryData.materials.reduce((acc, m) => {
      return acc + (m.currentQuantity * m.averageUnitCost);
    }, 0);

    const criticalItemsCount = this.memoryData.materials.filter(m => m.currentQuantity <= m.minQuantity).length;
    const outOfStockCount = this.memoryData.materials.filter(m => m.currentQuantity === 0).length;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthMovements = this.memoryData.movements.filter(m => m.date.startsWith(currentMonth));

    const totalEntriesValueThisMonth = monthMovements
      .filter(m => m.type === 'IN')
      .reduce((acc, m) => acc + (m.totalCost || 0), 0);

    const totalExitsValueThisMonth = monthMovements
      .filter(m => m.type === 'OUT')
      .reduce((acc, m) => acc + (m.totalCost || 0), 0);

    const stockTurnoverRate = totalInventoryValue > 0
      ? Number(((totalExitsValueThisMonth * 12) / totalInventoryValue).toFixed(2))
      : 0;

    const topMovedMaterials = this.memoryData.materials.map(mat => {
      const matMovs = this.memoryData.movements.filter(m => m.materialId === mat.id);
      const totalExits = matMovs.filter(m => m.type === 'OUT').reduce((acc, m) => acc + m.quantity, 0);
      const totalEntries = matMovs.filter(m => m.type === 'IN').reduce((acc, m) => acc + m.quantity, 0);
      return {
        materialId: mat.id,
        materialCode: mat.code,
        materialName: mat.name,
        totalExits,
        totalEntries,
        unit: mat.unit
      };
    }).sort((a, b) => (b.totalExits + b.totalEntries) - (a.totalExits + a.totalEntries)).slice(0, 6);

    return {
      totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
      totalMaterialsCount: this.memoryData.materials.length,
      criticalItemsCount,
      outOfStockCount,
      totalMovementsThisMonth: monthMovements.length,
      totalEntriesValueThisMonth: Number(totalEntriesValueThisMonth.toFixed(2)),
      totalExitsValueThisMonth: Number(totalExitsValueThisMonth.toFixed(2)),
      stockTurnoverRate,
      topMovedMaterials
    };
  }

  public getBackup(): DatabaseBackup {
    return {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      systemName: 'Controle de Estoque Enterprise',
      technicalLead: 'Victor Hugo',
      materials: [...this.memoryData.materials],
      departments: [...this.memoryData.departments],
      movements: [...this.memoryData.movements],
      requisitions: [...this.memoryData.requisitions]
    };
  }

  public restoreBackup(backupData: any): { success: boolean; message: string } {
    const raw = backupData.database || backupData;
    const materials = raw.materials;
    const departments = raw.departments;
    const movements = raw.movements;
    const requisitions = raw.requisitions;

    if (
      !Array.isArray(materials) ||
      !Array.isArray(departments) ||
      !Array.isArray(movements) ||
      !Array.isArray(requisitions)
    ) {
      throw new Error('Arquivo de backup inválido. A estrutura não possui as coleções exigidas.');
    }

    const state: LocalDatabaseState = {
      materials,
      departments,
      movements,
      requisitions,
      lastUpdated: new Date().toISOString()
    };

    this.saveToStorage(state);
    return { success: true, message: 'Base de dados restaurada com sucesso.' };
  }

  public resetToSeed(): { success: boolean; message: string } {
    const initial = getInitialState();
    this.saveToStorage(initial);
    return { success: true, message: 'Base reinicializada com sucesso para os dados padrão.' };
  }
}

export const localStore = new LocalStoreManager();
