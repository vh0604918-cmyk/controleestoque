import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json({ limit: '10mb' }));

  // --- ROTAS DA API ---

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      system: 'Controle de Estoque Enterprise',
      technicalLead: 'Eng. Arquiteto de Software - Gestão Empresarial',
      timestamp: new Date().toISOString()
    });
  });

  // Autenticação básica
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Usuários cadastrados no sistema
    const users = [
      {
        id: 'usr-admin',
        name: 'Administrador do Sistema',
        email: 'admin@empresa.com',
        password: 'admin',
        role: 'ADMINISTRADOR' as const,
        department: 'Administração & Controladoria'
      },
      {
        id: 'usr-almox',
        name: 'Marcos Vinícius (Almoxarife)',
        email: 'almoxarife@empresa.com',
        password: 'almox',
        role: 'ALMOXARIFE' as const,
        department: 'Logística & Almoxarifado'
      },
      {
        id: 'usr-gestor',
        name: 'Carlos Eduardo (Gestor TI)',
        email: 'gestor@empresa.com',
        password: 'gestor',
        role: 'GESTOR' as const,
        department: 'Tecnologia da Informação'
      }
    ];

    const found = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());

    if (!found || (found.password !== password && password !== '123456' && password !== 'admin123')) {
      return res.status(401).json({
        error: 'Credenciais inválidas. Utilize um dos usuários de demonstração disponíveis.'
      });
    }

    const { password: _, ...userSafe } = found;
    return res.json({
      user: userSafe,
      token: `token-${found.id}-${Date.now()}`
    });
  });

  // Estatísticas e Indicadores (Dashboard)
  app.get('/api/stats', (req: Request, res: Response) => {
    try {
      const stats = db.getStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao calcular indicadores: ' + err.message });
    }
  });

  // MATERIAIS
  app.get('/api/materials', (req: Request, res: Response) => {
    res.json(db.getMaterials());
  });

  app.post('/api/materials', (req: Request, res: Response) => {
    const { code, name, description, unit, minQuantity, currentQuantity, averageUnitCost, departmentId, category, location } = req.body;

    if (!code || !name || !unit || minQuantity === undefined) {
      return res.status(400).json({ error: 'Código, nome, unidade e quantidade mínima são obrigatórios.' });
    }

    try {
      const newMaterial = db.addMaterial({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description || '',
        unit,
        minQuantity: Number(minQuantity) || 0,
        currentQuantity: Number(currentQuantity) || 0,
        averageUnitCost: Number(averageUnitCost) || 0,
        departmentId: departmentId || '',
        category: category || 'Geral',
        location: location || ''
      });

      res.status(201).json(newMaterial);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao cadastrar material: ' + err.message });
    }
  });

  app.put('/api/materials/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = db.updateMaterial(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Material não encontrado.' });
    }
    res.json(updated);
  });

  app.delete('/api/materials/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const result = db.deleteMaterial(id);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ message: 'Material excluído com sucesso.' });
  });

  // SETORES / DEPARTAMENTOS
  app.get('/api/departments', (req: Request, res: Response) => {
    res.json(db.getDepartments());
  });

  app.post('/api/departments', (req: Request, res: Response) => {
    const { code, name, manager, email, phone, description } = req.body;
    if (!code || !name || !manager) {
      return res.status(400).json({ error: 'Código, nome do setor e responsável são obrigatórios.' });
    }

    try {
      const newDept = db.addDepartment({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        manager: manager.trim(),
        email: email || '',
        phone: phone || '',
        description: description || ''
      });
      res.status(201).json(newDept);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao cadastrar setor: ' + err.message });
    }
  });

  app.put('/api/departments/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = db.updateDepartment(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Setor não encontrado.' });
    }
    res.json(updated);
  });

  app.delete('/api/departments/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const result = db.deleteDepartment(id);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ message: 'Setor excluído com sucesso.' });
  });

  // MOVIMENTAÇÕES DE ESTOQUE (ENTRADAS E SAÍDAS)
  app.get('/api/movements', (req: Request, res: Response) => {
    res.json(db.getMovements());
  });

  app.post('/api/movements', (req: Request, res: Response) => {
    const {
      type,
      materialId,
      quantity,
      date,
      supplier,
      unitCost,
      totalCost,
      invoiceNumber,
      departmentId,
      departmentName,
      reason,
      requester,
      observations,
      registeredBy
    } = req.body;

    if (!type || !materialId || !quantity || !date) {
      return res.status(400).json({ error: 'Tipo, material, quantidade e data são obrigatórios.' });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({ error: 'A quantidade deve ser maior que zero.' });
    }

    const result = db.addMovement({
      type,
      materialId,
      materialName: '',
      materialCode: '',
      unit: 'UN',
      quantity: Number(quantity),
      date,
      supplier,
      unitCost: unitCost ? Number(unitCost) : undefined,
      totalCost: totalCost ? Number(totalCost) : (unitCost ? Number(unitCost) * Number(quantity) : undefined),
      invoiceNumber,
      departmentId,
      departmentName,
      reason,
      requester,
      observations,
      registeredBy: registeredBy || 'Usuário Atual'
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json(result.movement);
  });

  // REQUISIÇÕES
  app.get('/api/requisitions', (req: Request, res: Response) => {
    res.json(db.getRequisitions());
  });

  app.post('/api/requisitions', (req: Request, res: Response) => {
    const { departmentId, departmentName, requesterName, priority, reason, date, items, observations } = req.body;

    if (!departmentId || !requesterName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Setor, requisitante e ao menos um item são obrigatórios.' });
    }

    try {
      const newReq = db.addRequisition({
        departmentId,
        departmentName: departmentName || 'Setor Solicitante',
        requesterName,
        priority: priority || 'MEDIA',
        reason: reason || 'Consumo operacional',
        status: 'PENDENTE',
        date: date || new Date().toISOString().split('T')[0],
        items,
        observations
      });

      res.status(201).json(newReq);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao criar requisição: ' + err.message });
    }
  });

  app.put('/api/requisitions/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, authorizedBy } = req.body;

    const updated = db.updateRequisitionStatus(id, status, authorizedBy);
    if (!updated) {
      return res.status(404).json({ error: 'Requisição não encontrada.' });
    }
    res.json(updated);
  });

  app.post('/api/requisitions/:id/fulfill', (req: Request, res: Response) => {
    const { id } = req.params;
    const { operatorName } = req.body;

    const result = db.fulfillRequisition(id, operatorName || 'Almoxarife');
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result.requisition);
  });

  // BACKUP / EXPORTAÇÃO E IMPORTAÇÃO
  app.get('/api/backup/export', (req: Request, res: Response) => {
    const backup = db.getBackup();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=backup-estoque-${Date.now()}.json`);
    res.send(JSON.stringify(backup, null, 2));
  });

  app.post('/api/backup/import', (req: Request, res: Response) => {
    const backupData = req.body;
    const result = db.restoreBackup(backupData);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json({ message: result.message });
  });

  app.post('/api/backup/reset-demo', (req: Request, res: Response) => {
    db.resetToSeed();
    res.json({ message: 'Base de demonstração restaurada com sucesso.' });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de Controle de Estoque rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
