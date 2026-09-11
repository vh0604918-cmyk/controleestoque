import fs from 'fs';
import path from 'path';
import { Material, Department, Movement, Requisition, InventoryStats, DatabaseBackup } from '../types.ts';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'inventory-db.json');

export interface DatabaseSchema {
  materials: Material[];
  departments: Department[];
  movements: Movement[];
  requisitions: Requisition[];
  lastUpdated: string;
}

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
    currentQuantity: 2, // ALERTA: abaixo do mínimo
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
    currentQuantity: 12, // ALERTA: abaixo do mínimo
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
    currentQuantity: 0, // CRÍTICO: EM FALTA ZERADO
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
    currentQuantity: 5, // ALERTA: abaixo do mínimo
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

class InventoryDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    this.ensureDataDir();

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.materials && parsed.departments && parsed.movements && parsed.requisitions) {
          return parsed;
        }
      } catch (err) {
        console.error('Falha ao ler banco de dados local. Restaurando padrão...', err);
      }
    }

    // Inicializa com dados padrão
    const initialData: DatabaseSchema = {
      materials: INITIAL_MATERIALS,
      departments: INITIAL_DEPARTMENTS,
      movements: INITIAL_MOVEMENTS,
      requisitions: INITIAL_REQUISITIONS,
      lastUpdated: new Date().toISOString()
    };

    this.saveDatabase(initialData);
    return initialData;
  }

  private saveDatabase(dataToSave?: DatabaseSchema) {
    try {
      this.ensureDataDir();
      const payload = dataToSave || this.data;
      payload.lastUpdated = new Date().toISOString();
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('Erro ao salvar no banco de dados:', err);
    }
  }

  public resetToSeed(): DatabaseSchema {
    this.data = {
      materials: JSON.parse(JSON.stringify(INITIAL_MATERIALS)),
      departments: JSON.parse(JSON.stringify(INITIAL_DEPARTMENTS)),
      movements: JSON.parse(JSON.stringify(INITIAL_MOVEMENTS)),
      requisitions: JSON.parse(JSON.stringify(INITIAL_REQUISITIONS)),
      lastUpdated: new Date().toISOString()
    };
    this.saveDatabase();
    return this.data;
  }

  // --- MATERIAIS ---
  public getMaterials(): Material[] {
    return this.data.materials;
  }

  public getMaterialById(id: string): Material | undefined {
    return this.data.materials.find(m => m.id === id);
  }

  public addMaterial(materialData: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Material {
    const newMaterial: Material = {
      ...materialData,
      id: 'mat-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.materials.push(newMaterial);
    this.saveDatabase();
    return newMaterial;
  }

  public updateMaterial(id: string, updates: Partial<Material>): Material | null {
    const idx = this.data.materials.findIndex(m => m.id === id);
    if (idx === -1) return null;

    this.data.materials[idx] = {
      ...this.data.materials[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveDatabase();
    return this.data.materials[idx];
  }

  public deleteMaterial(id: string): { success: boolean; error?: string } {
    // Verificar se existem movimentações atreladas a este material
    const hasMovements = this.data.movements.some(m => m.materialId === id);
    if (hasMovements) {
      return { success: false, error: 'Não é permitido excluir material com histórico de movimentações.' };
    }

    const idx = this.data.materials.findIndex(m => m.id === id);
    if (idx === -1) {
      return { success: false, error: 'Material não encontrado.' };
    }

    this.data.materials.splice(idx, 1);
    this.saveDatabase();
    return { success: true };
  }

  // --- SETORES / DEPARTAMENTOS ---
  public getDepartments(): Department[] {
    return this.data.departments;
  }

  public getDepartmentById(id: string): Department | undefined {
    return this.data.departments.find(d => d.id === id);
  }

  public addDepartment(departmentData: Omit<Department, 'id' | 'createdAt'>): Department {
    const newDept: Department = {
      ...departmentData,
      id: 'dept-' + Date.now(),
      createdAt: new Date().toISOString()
    };

    this.data.departments.push(newDept);
    this.saveDatabase();
    return newDept;
  }

  public updateDepartment(id: string, updates: Partial<Department>): Department | null {
    const idx = this.data.departments.findIndex(d => d.id === id);
    if (idx === -1) return null;

    this.data.departments[idx] = {
      ...this.data.departments[idx],
      ...updates
    };
    this.saveDatabase();
    return this.data.departments[idx];
  }

  public deleteDepartment(id: string): { success: boolean; error?: string } {
    // Verificar se há materiais vinculados a este setor
    const hasMaterials = this.data.materials.some(m => m.departmentId === id);
    if (hasMaterials) {
      return { success: false, error: 'Existem materiais vinculados a este setor. Reassocie-os antes de excluir.' };
    }

    const idx = this.data.departments.findIndex(d => d.id === id);
    if (idx === -1) {
      return { success: false, error: 'Setor não encontrado.' };
    }

    this.data.departments.splice(idx, 1);
    this.saveDatabase();
    return { success: true };
  }

  // --- MOVIMENTAÇÕES DE ESTOQUE ---
  public getMovements(): Movement[] {
    return [...this.data.movements].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public addMovement(movementData: Omit<Movement, 'id' | 'code' | 'createdAt'>): { success: boolean; movement?: Movement; error?: string } {
    const material = this.getMaterialById(movementData.materialId);
    if (!material) {
      return { success: false, error: 'Material não encontrado.' };
    }

    // Se for saída, validação de saldo
    if (movementData.type === 'OUT') {
      if (material.currentQuantity < movementData.quantity) {
        return {
          success: false,
          error: `Saldo insuficiente em estoque. Disponível: ${material.currentQuantity} ${material.unit}, Solicitado: ${movementData.quantity} ${material.unit}`
        };
      }
    }

    // Gerar código sequencial legível
    const year = new Date().getFullYear();
    const count = this.data.movements.length + 1;
    const code = `MOV-${year}-${String(count).padStart(4, '0')}`;

    const newMovement: Movement = {
      ...movementData,
      id: 'mov-' + Date.now(),
      code,
      materialName: material.name,
      materialCode: material.code,
      unit: material.unit,
      createdAt: new Date().toISOString()
    };

    // Atualização de estoque do material
    if (movementData.type === 'IN') {
      const prevQty = material.currentQuantity;
      const prevCost = material.averageUnitCost;
      const incomingQty = movementData.quantity;
      const incomingCost = movementData.unitCost ?? prevCost;

      // Cálculo do Custo Médio Ponderado (CMP)
      const newTotalValue = (prevQty * prevCost) + (incomingQty * incomingCost);
      const newQty = prevQty + incomingQty;
      const newAvgCost = newQty > 0 ? Number((newTotalValue / newQty).toFixed(2)) : incomingCost;

      this.updateMaterial(material.id, {
        currentQuantity: newQty,
        averageUnitCost: newAvgCost
      });
    } else {
      // Saída
      const newQty = Math.max(0, material.currentQuantity - movementData.quantity);
      this.updateMaterial(material.id, {
        currentQuantity: newQty
      });
    }

    this.data.movements.push(newMovement);
    this.saveDatabase();
    return { success: true, movement: newMovement };
  }

  // --- REQUISIÇÕES ---
  public getRequisitions(): Requisition[] {
    return [...this.data.requisitions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getRequisitionById(id: string): Requisition | undefined {
    return this.data.requisitions.find(r => r.id === id);
  }

  public addRequisition(reqData: Omit<Requisition, 'id' | 'code' | 'createdAt'>): Requisition {
    const year = new Date().getFullYear();
    const count = this.data.requisitions.length + 1;
    const code = `REQ-${year}-${String(count).padStart(3, '0')}`;

    const newReq: Requisition = {
      ...reqData,
      id: 'req-' + Date.now(),
      code,
      createdAt: new Date().toISOString()
    };

    this.data.requisitions.push(newReq);
    this.saveDatabase();
    return newReq;
  }

  public updateRequisitionStatus(id: string, status: Requisition['status'], authorizedBy?: string): Requisition | null {
    const req = this.getRequisitionById(id);
    if (!req) return null;

    req.status = status;
    if (authorizedBy) req.authorizedBy = authorizedBy;
    this.saveDatabase();
    return req;
  }

  public fulfillRequisition(id: string, operatorName: string): { success: boolean; requisition?: Requisition; error?: string } {
    const req = this.getRequisitionById(id);
    if (!req) return { success: false, error: 'Requisição não encontrada.' };
    if (req.status === 'ATENDIDA') return { success: false, error: 'Esta requisição já foi atendida anteriormente.' };

    // Verificar estoque de todos os itens antes de baixar
    for (const item of req.items) {
      const material = this.getMaterialById(item.materialId);
      if (!material) {
        return { success: false, error: `Material ${item.materialName} não encontrado no catálogo.` };
      }
      if (material.currentQuantity < item.quantityRequested) {
        return {
          success: false,
          error: `Estoque insuficiente para o item "${material.name}". Em estoque: ${material.currentQuantity} ${material.unit}, Requisitado: ${item.quantityRequested} ${material.unit}.`
        };
      }
    }

    // Processar saídas para cada item da requisição
    const dateStr = new Date().toISOString().split('T')[0];
    for (const item of req.items) {
      const material = this.getMaterialById(item.materialId)!;
      this.addMovement({
        type: 'OUT',
        materialId: item.materialId,
        materialName: item.materialName,
        materialCode: item.materialCode,
        unit: item.unit,
        quantity: item.quantityRequested,
        date: dateStr,
        departmentId: req.departmentId,
        departmentName: req.departmentName,
        reason: `Atendimento de Requisição ${req.code}: ${req.reason}`,
        requester: req.requesterName,
        requisitionId: req.id,
        registeredBy: operatorName
      });

      item.quantityFulfilled = item.quantityRequested;
      item.unitCost = material.averageUnitCost;
    }

    req.status = 'ATENDIDA';
    req.fulfilledDate = new Date().toISOString();
    this.saveDatabase();

    return { success: true, requisition: req };
  }

  // --- INDICADORES DE DESEMPENHO E ESTATÍSTICAS ---
  public getStats(): InventoryStats {
    const materials = this.data.materials;
    const movements = this.data.movements;

    // 1. Valor total do estoque
    const totalInventoryValue = materials.reduce(
      (acc, mat) => acc + (mat.currentQuantity * mat.averageUnitCost),
      0
    );

    // 2. Itens críticos (<= estoque mínimo) e itens zerados
    const criticalItemsCount = materials.filter(m => m.currentQuantity <= m.minQuantity).length;
    const outOfStockCount = materials.filter(m => m.currentQuantity === 0).length;

    // 3. Movimentações no mês atual
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const movementsThisMonth = movements.filter(m => {
      const d = new Date(m.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalEntriesValueThisMonth = movementsThisMonth
      .filter(m => m.type === 'IN')
      .reduce((acc, m) => acc + (m.totalCost || (m.quantity * (m.unitCost || 0))), 0);

    const totalExitsValueThisMonth = movementsThisMonth
      .filter(m => m.type === 'OUT')
      .reduce((acc, m) => {
        const mat = materials.find(x => x.id === m.materialId);
        const cost = mat ? mat.averageUnitCost : 0;
        return acc + (m.quantity * cost);
      }, 0);

    // 4. Taxa de rotatividade de materiais (Giro de Estoque = Saídas valor / Estoque Médio valor)
    // Se o valor de estoque for maior que 0, calculamos o giro anualizado proporcional
    const stockTurnoverRate = totalInventoryValue > 0
      ? Number(((totalExitsValueThisMonth * 12) / totalInventoryValue).toFixed(2))
      : 0;

    // 5. Materiais mais movimentados
    const movementCountsByMat: Record<string, { materialCode: string; materialName: string; totalExits: number; totalEntries: number; unit: string }> = {};

    materials.forEach(m => {
      movementCountsByMat[m.id] = {
        materialCode: m.code,
        materialName: m.name,
        totalExits: 0,
        totalEntries: 0,
        unit: m.unit
      };
    });

    movements.forEach(m => {
      if (!movementCountsByMat[m.materialId]) {
        movementCountsByMat[m.materialId] = {
          materialCode: m.materialCode,
          materialName: m.materialName,
          totalExits: 0,
          totalEntries: 0,
          unit: m.unit
        };
      }
      if (m.type === 'OUT') {
        movementCountsByMat[m.materialId].totalExits += m.quantity;
      } else {
        movementCountsByMat[m.materialId].totalEntries += m.quantity;
      }
    });

    const topMovedMaterials = Object.entries(movementCountsByMat)
      .map(([materialId, data]) => ({
        materialId,
        ...data
      }))
      .sort((a, b) => (b.totalExits + b.totalEntries) - (a.totalExits + a.totalEntries))
      .slice(0, 6);

    return {
      totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
      totalMaterialsCount: materials.length,
      criticalItemsCount,
      outOfStockCount,
      totalMovementsThisMonth: movementsThisMonth.length,
      totalEntriesValueThisMonth: Number(totalEntriesValueThisMonth.toFixed(2)),
      totalExitsValueThisMonth: Number(totalExitsValueThisMonth.toFixed(2)),
      stockTurnoverRate,
      topMovedMaterials
    };
  }

  // --- BACKUP & EXPORT / IMPORT ---
  public getBackup(): DatabaseBackup {
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      systemName: 'Controle de Estoque Pro Enterprise',
      technicalLead: 'Arquiteto de Software Especialista em Gestão Empresarial',
      materials: this.data.materials,
      departments: this.data.departments,
      movements: this.data.movements,
      requisitions: this.data.requisitions
    };
  }

  public restoreBackup(backup: Partial<DatabaseBackup>): { success: boolean; message: string } {
    if (!backup.materials || !backup.departments || !backup.movements || !backup.requisitions) {
      return { success: false, message: 'Arquivo de backup inválido ou incompleto.' };
    }

    this.data = {
      materials: backup.materials,
      departments: backup.departments,
      movements: backup.movements,
      requisitions: backup.requisitions,
      lastUpdated: new Date().toISOString()
    };
    this.saveDatabase();
    return { success: true, message: 'Backup restaurado com sucesso!' };
  }
}

export const db = new InventoryDatabase();
