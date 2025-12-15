// UI Management
export default class UI {
    constructor(app) {
        this.app = app;
        this.currentModal = null;
        this.modalStack = [];
        
        // Page templates cache
        this.pageTemplates = new Map();
    }
    
    // ===== Loading States =====
    
    showLoading() {
        const overlay = document.getElementById('loading-overlay');
        const progress = document.getElementById('loading-progress');
        
        if (overlay) {
            overlay.classList.add('active');
            
            // Animate progress bar
            if (progress) {
                let width = 0;
                const interval = setInterval(() => {
                    if (width >= 100) {
                        clearInterval(interval);
                    } else {
                        width += 5;
                        progress.style.width = `${width}%`;
                    }
                }, 50);
            }
        }
    }
    
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            
            // Reset progress bar
            const progress = document.getElementById('loading-progress');
            if (progress) {
                progress.style.width = '0%';
            }
        }
    }
    
    showPageLoading() {
        const pageContent = document.getElementById('page-content');
        if (pageContent) {
            pageContent.innerHTML = `
                <div class="page-loading active">
                    <div class="loading-content">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Carregando página...</p>
                    </div>
                </div>
            `;
        }
    }
    
    hidePageLoading() {
        const pageLoading = document.querySelector('.page-loading');
        if (pageLoading) {
            pageLoading.classList.remove('active');
            setTimeout(() => {
                if (pageLoading.parentNode) {
                    pageLoading.remove();
                }
            }, 300);
        }
    }
    
    showButtonLoading(button) {
        if (!button) return;
        
        const originalHTML = button.innerHTML;
        const originalWidth = button.offsetWidth;
        
        button.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>Processando...</span>
        `;
        button.style.width = `${originalWidth}px`;
        button.disabled = true;
        
        // Store original state for restoration
        button.dataset.originalHTML = originalHTML;
    }
    
    hideButtonLoading(button) {
        if (!button) return;
        
        if (button.dataset.originalHTML) {
            button.innerHTML = button.dataset.originalHTML;
            delete button.dataset.originalHTML;
        }
        
        button.style.width = '';
        button.disabled = false;
    }
    
    // ===== Navigation =====
    
    updateNavigation(page) {
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });
        
        // Update mobile menu if open
        this.hideMobileMenu();
    }
    
    updatePageTitle(page) {
        const pageTitle = document.getElementById('page-title');
        const pageSubtitle = document.getElementById('page-subtitle');
        
        if (!pageTitle || !pageSubtitle) return;
        
        const titles = {
            dashboard: {
                title: 'Dashboard',
                subtitle: 'Visão geral do sistema'
            },
            registrar: {
                title: 'Registrar Corrida',
                subtitle: 'Adicione novas corridas ao sistema'
            },
            motoristas: {
                title: 'Motoristas',
                subtitle: 'Gerencie a equipe de motoristas'
            },
            rotas: {
                title: 'Rotas',
                subtitle: 'Mapa e otimização de trajetos'
            },
            veiculos: {
                title: 'Veículos',
                subtitle: 'Gestão da frota de táxis'
            },
            relatorios: {
                title: 'Relatórios',
                subtitle: 'Análises e exportação de dados'
            },
            financeiro: {
                title: 'Financeiro',
                subtitle: 'Controle de receitas e despesas'
            },
            configuracoes: {
                title: 'Configurações',
                subtitle: 'Personalize o sistema'
            },
            backup: {
                title: 'Backup',
                subtitle: 'Gerencie cópias de segurança'
            }
        };
        
        const pageInfo = titles[page] || { title: page, subtitle: '' };
        pageTitle.textContent = pageInfo.title;
        pageSubtitle.textContent = pageInfo.subtitle;
    }
    
    async loadPageContent(page) {
        const pageContent = document.getElementById('page-content');
        if (!pageContent) return;
        
        // Check if page template is cached
        if (this.pageTemplates.has(page)) {
            pageContent.innerHTML = this.pageTemplates.get(page);
            return;
        }
        
        // Load page template
        try {
            let template = '';
            
            switch(page) {
                case 'dashboard':
                    template = await this.getDashboardTemplate();
                    break;
                case 'registrar':
                    template = await this.getRegistrarTemplate();
                    break;
                case 'motoristas':
                    template = await this.getMotoristasTemplate();
                    break;
                case 'rotas':
                    template = await this.getRotasTemplate();
                    break;
                case 'veiculos':
                    template = await this.getVeiculosTemplate();
                    break;
                case 'relatorios':
                    template = await this.getRelatoriosTemplate();
                    break;
                case 'financeiro':
                    template = await this.getFinanceiroTemplate();
                    break;
                case 'configuracoes':
                    template = await this.getConfiguracoesTemplate();
                    break;
                case 'backup':
                    template = await this.getBackupTemplate();
                    break;
                default:
                    template = this.getNotFoundTemplate();
            }
            
            // Cache the template
            this.pageTemplates.set(page, template);
            
            // Update page content
            pageContent.innerHTML = template;
            
        } catch (error) {
            console.error(`❌ Erro ao carregar template da página ${page}:`, error);
            pageContent.innerHTML = this.getErrorTemplate(error);
        }
    }
    
    showPageContent(content) {
        const pageContent = document.getElementById('page-content');
        if (pageContent) {
            pageContent.innerHTML = content;
        }
    }
    
    // ===== Page Templates =====
    
    async getDashboardTemplate() {
        return `
            <div class="dashboard-grid">
                <!-- Stats Cards -->
                <div class="stats-grid">
                    <div class="stats-card">
                        <div class="stats-icon stats-icon-primary">
                            <i class="fas fa-taxi"></i>
                        </div>
                        <div class="stats-content">
                            <div class="stats-value" id="total-corridas">0</div>
                            <div class="stats-label">Total de Corridas</div>
                            <div class="stats-change positive" id="corridas-change">
                                <i class="fas fa-arrow-up"></i>
                                <span>0%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-card">
                        <div class="stats-icon stats-icon-success">
                            <i class="fas fa-wallet"></i>
                        </div>
                        <div class="stats-content">
                            <div class="stats-value" id="faturamento-hoje">R$ 0,00</div>
                            <div class="stats-label">Faturamento Hoje</div>
                            <div class="stats-change positive" id="faturamento-change">
                                <i class="fas fa-arrow-up"></i>
                                <span>0%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-card">
                        <div class="stats-icon stats-icon-warning">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stats-content">
                            <div class="stats-value" id="total-motoristas">0</div>
                            <div class="stats-label">Motoristas</div>
                            <div class="stats-change" id="motoristas-change">
                                <span>—</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-card">
                        <div class="stats-icon stats-icon-danger">
                            <i class="fas fa-bell"></i>
                        </div>
                        <div class="stats-content">
                            <div class="stats-value" id="notificacoes-pendentes">0</div>
                            <div class="stats-label">Notificações</div>
                            <div class="stats-change negative" id="notificacoes-change">
                                <i class="fas fa-arrow-up"></i>
                                <span>0</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Charts -->
                <div class="charts-grid">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-chart-line"></i>
                                Corridas (Últimos 7 Dias)
                            </div>
                            <div class="card-actions">
                                <button class="btn btn-ghost btn-sm" id="refresh-chart">
                                    <i class="fas fa-sync-alt"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="chart-container">
                                <canvas id="lineChart"></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-chart-pie"></i>
                                Distribuição por Bairro
                            </div>
                            <div class="card-actions">
                                <button class="btn btn-ghost btn-sm" id="toggle-chart-type">
                                    <i class="fas fa-exchange-alt"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="chart-container">
                                <canvas id="pieChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Rides Table -->
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <i class="fas fa-history"></i>
                            Últimas Corridas
                        </div>
                        <div class="card-actions">
                            <button class="btn btn-primary btn-sm" id="view-all-corridas">
                                <i class="fas fa-list"></i>
                                Ver Todas
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-container">
                            <table class="table" id="recent-rides-table">
                                <thead>
                                    <tr>
                                        <th>Motorista</th>
                                        <th>Bairro</th>
                                        <th>Funcionários</th>
                                        <th>Valor</th>
                                        <th>Data</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Table rows will be populated by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="text-muted">
                            <small>Mostrando as 10 últimas corridas</small>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <i class="fas fa-bolt"></i>
                            Ações Rápidas
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-6 col-md-3">
                                <button class="btn btn-outline-primary w-100 h-100 py-3" onclick="app.loadPage('registrar')">
                                    <i class="fas fa-plus fa-2x mb-2"></i>
                                    <div>Nova Corrida</div>
                                </button>
                            </div>
                            <div class="col-6 col-md-3">
                                <button class="btn btn-outline-success w-100 h-100 py-3" onclick="app.loadPage('motoristas')">
                                    <i class="fas fa-user-plus fa-2x mb-2"></i>
                                    <div>Novo Motorista</div>
                                </button>
                            </div>
                            <div class="col-6 col-md-3">
                                <button class="btn btn-outline-warning w-100 h-100 py-3" onclick="app.loadPage('relatorios')">
                                    <i class="fas fa-file-export fa-2x mb-2"></i>
                                    <div>Exportar Dados</div>
                                </button>
                            </div>
                            <div class="col-6 col-md-3">
                                <button class="btn btn-outline-info w-100 h-100 py-3" onclick="app.loadPage('configuracoes')">
                                    <i class="fas fa-cog fa-2x mb-2"></i>
                                    <div>Configurações</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async getRegistrarTemplate() {
        return `
            <div class="form-section">
                <div class="form-section-title">
                    <i class="fas fa-plus-circle"></i>
                    Registrar Nova Corrida
                </div>
                
                <form id="registrar-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="motorista" class="form-label form-label-required">
                                Motorista
                            </label>
                            <select id="motorista" class="form-control" required>
                                <option value="">Selecione um motorista</option>
                                <!-- Motoristas will be loaded dynamically -->
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="bairro" class="form-label form-label-required">
                                Bairro
                            </label>
                            <select id="bairro" class="form-control" required>
                                <option value="">Selecione um bairro</option>
                                <!-- Bairros will be loaded dynamically -->
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="funcionarios" class="form-label form-label-required">
                                Funcionários
                            </label>
                            <input type="text" id="funcionarios" class="form-control" 
                                   placeholder="Ex: 3 passageiros" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="valor" class="form-label">
                                Valor (R$)
                            </label>
                            <input type="number" id="valor" class="form-control" 
                                   step="0.01" min="0" placeholder="0.00">
                            <div class="form-text">
                                O valor será calculado automaticamente se não preenchido
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="observacoes" class="form-label">
                            Observações
                        </label>
                        <textarea id="observacoes" class="form-control" rows="3" 
                                  placeholder="Observações adicionais..."></textarea>
                    </div>
                    
                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i>
                            Salvar Corrida
                        </button>
                        
                        <button type="button" class="btn btn-ghost" id="clear-form">
                            <i class="fas fa-eraser"></i>
                            Limpar
                        </button>
                    </div>
                </form>
            </div>
            
            <div class="form-section mt-4">
                <div class="form-section-title">
                    <i class="fas fa-list"></i>
                    Corridas de Hoje
                </div>
                
                <div class="table-responsive">
                    <table class="table" id="corridas-hoje-table">
                        <thead>
                            <tr>
                                <th>Motorista</th>
                                <th>Bairro</th>
                                <th>Funcionários</th>
                                <th>Valor</th>
                                <th>Hora</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Corridas will be loaded dynamically -->
                        </tbody>
                    </table>
                </div>
                
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <div class="text-muted">
                        <small id="corridas-count">0 corridas registradas hoje</small>
                    </div>
                    
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-primary btn-sm" id="export-hoje">
                            <i class="fas fa-file-excel"></i>
                            Exportar
                        </button>
                        
                        <button class="btn btn-outline-danger btn-sm" id="limpar-hoje">
                            <i class="fas fa-trash"></i>
                            Limpar Todas
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    async getMotoristasTemplate() {
        return `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fas fa-users"></i>
                        Gerenciar Motoristas
                    </div>
                    
                    <div class="card-actions">
                        <div class="d-flex gap-2">
                            <div class="input-group input-group-sm" style="width: 250px;">
                                <span class="input-group-text">
                                    <i class="fas fa-search"></i>
                                </span>
                                <input type="text" id="motoristas-search" class="form-control" 
                                       placeholder="Buscar motoristas...">
                            </div>
                            
                            <select id="motoristas-filter" class="form-select form-select-sm" style="width: 150px;">
                                <option value="todos">Todos</option>
                                <option value="ativo">Ativos</option>
                                <option value="inativo">Inativos</option>
                                <option value="ferias">Férias</option>
                            </select>
                            
                            <button class="btn btn-primary btn-sm" id="add-motorista-btn">
                                <i class="fas fa-plus"></i>
                                Adicionar
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table" id="motoristas-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Telefone</th>
                                    <th>E-mail</th>
                                    <th>Status</th>
                                    <th>Corridas</th>
                                    <th>Faturamento</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Motoristas will be loaded dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="card-footer">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="text-muted">
                            <small id="motoristas-count">0 motoristas encontrados</small>
                        </div>
                        
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-primary btn-sm" id="export-motoristas">
                                <i class="fas fa-file-excel"></i>
                                Exportar
                            </button>
                            
                            <button class="btn btn-outline-danger btn-sm" id="inativar-todos">
                                <i class="fas fa-user-slash"></i>
                                Inativar Todos
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Motorista Details Modal Template -->
            <template id="motorista-details-template">
                <div class="motorista-details">
                    <div class="text-center mb-4">
                        <div class="avatar avatar-xl bg-primary mb-3">
                            <span id="motorista-initial">M</span>
                        </div>
                        <h3 id="motorista-nome">Nome do Motorista</h3>
                        <span class="badge" id="motorista-status">Ativo</span>
                    </div>
                    
                    <div class="row mb-4">
                        <div class="col-6">
                            <div class="text-center">
                                <h4 class="mb-1" id="total-corridas">0</h4>
                                <small class="text-muted">Total de Corridas</small>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-center">
                                <h4 class="mb-1" id="total-faturamento">R$ 0,00</h4>
                                <small class="text-muted">Faturamento Total</small>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <h6>Informações de Contato</h6>
                        <ul class="list-unstyled" id="contact-info">
                            <!-- Contact info will be populated -->
                        </ul>
                    </div>
                    
                    <div id="recent-corridas-section">
                        <!-- Recent rides will be populated -->
                    </div>
                </div>
            </template>
        `;
    }
    
    async getRotasTemplate() {
        return `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fas fa-map-marked-alt"></i>
                        Mapa de Rotas
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-primary btn-sm" id="refresh-map">
                            <i class="fas fa-sync-alt"></i>
                            Atualizar
                        </button>
                    </div>
                </div>
                
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <div id="map-container" style="height: 500px; background: #f8f9fa; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                <div class="text-center text-muted">
                                    <i class="fas fa-map fa-3x mb-3"></i>
                                    <h4>Mapa em Desenvolvimento</h4>
                                    <p>Integração com API de mapas em breve</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="card h-100">
                                <div class="card-header">
                                    <div class="card-title">
                                        <i class="fas fa-route"></i>
                                        Rotas Frequentes
                                    </div>
                                </div>
                                
                                <div class="card-body">
                                    <div class="list-group" id="rotas-frequentes">
                                        <!-- Frequent routes will be loaded dynamically -->
                                    </div>
                                </div>
                                
                                <div class="card-footer">
                                    <button class="btn btn-outline-primary w-100" id="add-rota">
                                        <i class="fas fa-plus"></i>
                                        Adicionar Rota
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-chart-bar"></i>
                                Estatísticas de Rotas
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="chart-container" style="height: 200px;">
                                <canvas id="rotas-chart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-info-circle"></i>
                                Informações
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i>
                                <strong>Funcionalidades em desenvolvimento:</strong>
                                <ul class="mb-0 mt-2">
                                    <li>Mapa interativo com rotas em tempo real</li>
                                    <li>Otimização de trajetos</li>
                                    <li>Cálculo de distâncias e tempo estimado</li>
                                    <li>Histórico de rotas por motorista</li>
                                    <li>Alertas de trânsito</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async getVeiculosTemplate() {
        return `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fas fa-car-side"></i>
                        Gestão de Frota
                    </div>
                    
                    <div class="card-actions">
                        <button class="btn btn-primary btn-sm" id="add-veiculo-btn">
                            <i class="fas fa-plus"></i>
                            Adicionar Veículo
                        </button>
                    </div>
                </div>
                
                <div class="card-body">
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i class="fas fa-car"></i>
                        </div>
                        <h3 class="empty-state-title">Gestão de Frota</h3>
                        <p class="empty-state-description">
                            O módulo de gestão de veículos está em desenvolvimento.
                            Em breve você poderá gerenciar toda a frota de táxis.
                        </p>
                        
                        <div class="alert alert-warning mt-4">
                            <i class="fas fa-exclamation-triangle"></i>
                            <strong>Funcionalidades planejadas:</strong>
                            <ul class="mb-0 mt-2">
                                <li>Cadastro completo de veículos</li>
                                <li>Controle de manutenção</li>
                                <li>Gestão de seguros e documentação</li>
                                <li>Relatórios de consumo e custos</li>
                                <li>Alocação de motoristas por veículo</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async getRelatoriosTemplate() {
        return `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fas fa-file-invoice-dollar"></i>
                        Relatórios e Análises
                    </div>
                    
                    <div class="card-actions">
                        <div class="d-flex gap-2">
                            <button class="btn btn-primary btn-sm" id="gerar-relatorio">
                                <i class="fas fa-chart-bar"></i>
                                Gerar Relatório
                            </button>
                            
                            <div class="dropdown">
                                <button class="btn btn-success btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                                    <i class="fas fa-download"></i>
                                    Exportar
                                </button>
                                <div class="dropdown-menu">
                                    <a class="dropdown-item" href="#" id="export-excel">
                                        <i class="fas fa-file-excel"></i>
                                        Excel (.xlsx)
                                    </a>
                                    <a class="dropdown-item" href="#" id="export-pdf">
                                        <i class="fas fa-file-pdf"></i>
                                        PDF
                                    </a>
                                    <a class="dropdown-item" href="#" id="export-csv">
                                        <i class="fas fa-file-csv"></i>
                                        CSV
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card-body">
                    <!-- Filtros -->
                    <div class="row g-3 mb-4">
                        <div class="col-md-3">
                            <label for="report-start-date" class="form-label">Data Inicial</label>
                            <input type="date" id="report-start-date" class="form-control">
                        </div>
                        
                        <div class="col-md-3">
                            <label for="report-end-date" class="form-label">Data Final</label>
                            <input type="date" id="report-end-date" class="form-control">
                        </div>
                        
                        <div class="col-md-3">
                            <label for="report-motorista" class="form-label">Motorista</label>
                            <select id="report-motorista" class="form-control">
                                <option value="">Todos</option>
                                <!-- Motoristas will be loaded dynamically -->
                            </select>
                        </div>
                        
                        <div class="col-md-3">
                            <label for="report-bairro" class="form-label">Bairro</label>
                            <select id="report-bairro" class="form-control">
                                <option value="">Todos</option>
                                <!-- Bairros will be loaded dynamically -->
                            </select>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-end mb-4">
                        <button class="btn btn-primary" id="apply-filter">
                            <i class="fas fa-filter"></i>
                            Aplicar Filtros
                        </button>
                    </div>
                    
                    <!-- Tabs -->
                    <ul class="nav nav-tabs" id="report-tabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="summary-tab" data-bs-toggle="tab" data-bs-target="#summary">
                                <i class="fas fa-chart-pie"></i>
                                Resumo
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="details-tab" data-bs-toggle="tab" data-bs-target="#details">
                                <i class="fas fa-list"></i>
                                Detalhes
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="charts-tab" data-bs-toggle="tab" data-bs-target="#charts">
                                <i class="fas fa-chart-line"></i>
                                Gráficos
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="comparison-tab" data-bs-toggle="tab" data-bs-target="#comparison">
                                <i class="fas fa-balance-scale"></i>
                                Comparativo
                            </button>
                        </li>
                    </ul>
                    
                    <!-- Tab Content -->
                    <div class="tab-content mt-4" id="report-content">
                        <!-- Summary Tab -->
                        <div class="tab-pane fade show active" id="summary" role="tabpanel">
                            <div class="row">
                                <div class="col-md-3">
                                    <div class="card text-center">
                                        <div class="card-body">
                                            <h1 class="card-title" id="report-total-corridas">0</h1>
                                            <p class="card-text text-muted">Total de Corridas</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-3">
                                    <div class="card text-center">
                                        <div class="card-body">
                                            <h1 class="card-title" id="report-total-faturamento">R$ 0,00</h1>
                                            <p class="card-text text-muted">Faturamento Total</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-3">
                                    <div class="card text-center">
                                        <div class="card-body">
                                            <h1 class="card-title" id="report-media-valor">R$ 0,00</h1>
                                            <p class="card-text text-muted">Valor Médio</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-3">
                                    <div class="card text-center">
                                        <div class="card-body">
                                            <h1 class="card-title" id="report-total-motoristas">0</h1>
                                            <p class="card-text text-muted">Motoristas Ativos</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row mt-4">
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <div class="card-title">
                                                <i class="fas fa-user-crown"></i>
                                                Top 5 Motoristas
                                            </div>
                                        </div>
                                        <div class="card-body">
                                            <div id="top-motoristas-list">
                                                <!-- Top motoristas will be loaded dynamically -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <div class="card-title">
                                                <i class="fas fa-map-marker-alt"></i>
                                                Top 5 Bairros
                                            </div>
                                        </div>
                                        <div class="card-body">
                                            <div id="top-bairros-list">
                                                <!-- Top bairros will be loaded dynamically -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Details Tab -->
                        <div class="tab-pane fade" id="details" role="tabpanel">
                            <div class="table-responsive">
                                <table class="table" id="report-details-table">
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Motorista</th>
                                            <th>Bairro</th>
                                            <th>Funcionários</th>
                                            <th>Valor</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- Report details will be loaded dynamically -->
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <div class="text-muted">
                                    <small id="report-details-count">0 registros encontrados</small>
                                </div>
                                
                                <nav>
                                    <ul class="pagination pagination-sm mb-0" id="report-pagination">
                                        <!-- Pagination will be loaded dynamically -->
                                    </ul>
                                </nav>
                            </div>
                        </div>
                        
                        <!-- Charts Tab -->
                        <div class="tab-pane fade" id="charts" role="tabpanel">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <div class="card-title">
                                                <i class="fas fa-chart-bar"></i>
                                                Corridas por Dia
                                            </div>
                                        </div>
                                        <div class="card-body">
                                            <div class="chart-container" style="height: 300px;">
                                                <canvas id="report-daily-chart"></canvas>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <div class="card-title">
                                                <i class="fas fa-chart-pie"></i>
                                                Distribuição por Motorista
                                            </div>
                                        </div>
                                        <div class="card-body">
                                            <div class="chart-container" style="height: 300px;">
                                                <canvas id="report-driver-chart"></canvas>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row mt-4">
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <div class="card-title">
                                                <i class="fas fa-chart-line"></i>
                                                Faturamento Diário
                                            </div>
                                        </div>
                                        <div class="card-body">
                                            <div class="chart-container" style="height: 300px;">
                                                <canvas id="report-revenue-chart"></canvas>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <div class="card-title">
                                                <i class="fas fa-chart-area"></i>
                                                Comparativo Mensal
                                            </div>
                                        </div>
                                        <div class="card-body">
                                            <div class="chart-container" style="height: 300px;">
                                                <canvas id="report-monthly-chart"></canvas>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Comparison Tab -->
                        <div class="tab-pane fade" id="comparison" role="tabpanel">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <div class="card-title">
                                                <i class="fas fa-balance-scale"></i>
                                                Comparativo Período
                                            </div>
                                            <div class="card-actions">
                                                <select id="comparison-period" class="form-select form-select-sm">
                                                    <option value="month">Mês Anterior</option>
                                                    <option value="year">Ano Anterior</option>
                                                    <option value="custom">Personalizado</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="card-body">
                                            <div class="comparison-stats" id="period-comparison">
                                                <!-- Comparison stats will be loaded dynamically -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <div class="card-title">
                                                <i class="fas fa-chart-bar"></i>
                                                Crescimento
                                            </div>
                                        </div>
                                        <div class="card-body">
                                            <div class="chart-container" style="height: 300px;">
                                                <canvas id="growth-chart"></canvas>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row mt-4">
                                <div class="col-md-12">
                                    <div class="card">
                                        <div class="card-header">
                                            <div class="card-title">
                                                <i class="fas fa-table"></i>
                                                Tabela Comparativa
                                            </div>
                                        </div>
                                        <div class="card-body">
                                            <div class="table-responsive">
                                                <table class="table" id="comparison-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Métrica</th>
                                                            <th>Período Atual</th>
                                                            <th>Período Anterior</th>
                                                            <th>Variação</th>
                                                            <th>Tendência</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <!-- Comparison table will be loaded dynamically -->
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async getFinanceiroTemplate() {
        return `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fas fa-wallet"></i>
                        Gestão Financeira
                    </div>
                    
                    <div class="card-actions">
                        <div class="d-flex gap-2">
                            <button class="btn btn-success btn-sm" id="add-revenue">
                                <i class="fas fa-plus"></i>
                                Receita
                            </button>
                            
                            <button class="btn btn-danger btn-sm" id="add-expense">
                                <i class="fas fa-minus"></i>
                                Despesa
                            </button>
                            
                            <button class="btn btn-primary btn-sm" id="generate-report">
                                <i class="fas fa-file-invoice"></i>
                                Relatório
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="card-body">
                    <!-- Summary Cards -->
                    <div class="row mb-4">
                        <div class="col-md-3">
                            <div class="card bg-success text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="card-title mb-1">Receitas</h6>
                                            <h2 class="mb-0" id="total-receitas">R$ 0,00</h2>
                                        </div>
                                        <i class="fas fa-arrow-up fa-2x"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-3">
                            <div class="card bg-danger text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="card-title mb-1">Despesas</h6>
                                            <h2 class="mb-0" id="total-despesas">R$ 0,00</h2>
                                        </div>
                                        <i class="fas fa-arrow-down fa-2x"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-3">
                            <div class="card bg-primary text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="card-title mb-1">Saldo</h6>
                                            <h2 class="mb-0" id="saldo-total">R$ 0,00</h2>
                                        </div>
                                        <i class="fas fa-balance-scale fa-2x"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-3">
                            <div class="card bg-info text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="card-title mb-1">Margem</h6>
                                            <h2 class="mb-0" id="margem-lucro">0%</h2>
                                        </div>
                                        <i class="fas fa-chart-line fa-2x"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Charts -->
                    <div class="row mb-4">
                        <div class="col-md-8">
                            <div class="card">
                                <div class="card-header">
                                    <div class="card-title">
                                        <i class="fas fa-chart-line"></i>
                                        Evolução Financeira
                                    </div>
                                </div>
                                <div class="card-body">
                                    <div class="chart-container" style="height: 300px;">
                                        <canvas id="finance-trend-chart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="card">
                                <div class="card-header">
                                    <div class="card-title">
                                        <i class="fas fa-chart-pie"></i>
                                        Despesas por Categoria
                                    </div>
                                </div>
                                <div class="card-body">
                                    <div class="chart-container" style="height: 300px;">
                                        <canvas id="expense-category-chart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Tabs -->
                    <ul class="nav nav-tabs" id="finance-tabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="transactions-tab" data-bs-toggle="tab" data-bs-target="#transactions">
                                <i class="fas fa-list"></i>
                                Transações
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="categories-tab" data-bs-toggle="tab" data-bs-target="#categories">
                                <i class="fas fa-tags"></i>
                                Categorias
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="reports-tab" data-bs-toggle="tab" data-bs-target="#reports">
                                <i class="fas fa-file-alt"></i>
                                Relatórios
                            </button>
                        </li>
                    </ul>
                    
                    <!-- Tab Content -->
                    <div class="tab-content mt-4" id="finance-content">
                        <!-- Transactions Tab -->
                        <div class="tab-pane fade show active" id="transactions" role="tabpanel">
                            <div class="table-responsive">
                                <table class="table" id="transactions-table">
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Tipo</th>
                                            <th>Descrição</th>
                                            <th>Categoria</th>
                                            <th>Valor</th>
                                            <th>Status</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- Transactions will be loaded dynamically -->
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <div class="text-muted">
                                    <small id="transactions-count">0 transações encontradas</small>
                                </div>
                                
                                <nav>
                                    <ul class="pagination pagination-sm mb-0" id="transactions-pagination">
                                        <!-- Pagination will be loaded dynamically -->
                                    </ul>
                                </nav>
                            </div>
                        </div>
                        
                        <!-- Categories Tab -->
                        <div class="tab-pane fade" id="categories" role="tabpanel">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <div class="card-title">
                                                <i class="fas fa-arrow-up"></i>
                                                Categorias de Receita
                                            </div>
                                        </div>
                                        <div class="card-body">
                                            <div id="revenue-categories-list">
                                                <!-- Revenue categories will be loaded dynamically -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <div class="card-title">
                                                <i class="fas fa-arrow-down"></i>
                                                Categorias de Despesa
                                            </div>
                                        </div>
                                        <div class="card-body">
                                            <div id="expense-categories-list">
                                                <!-- Expense categories will be loaded dynamically -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Reports Tab -->
                        <div class="tab-pane fade" id="reports" role="tabpanel">
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="card">
                                        <div class="card-body text-center">
                                            <i class="fas fa-file-excel fa-3x text-success mb-3"></i>
                                            <h5>Exportar Excel</h5>
                                            <p class="text-muted">Exporte todos os dados financeiros</p>
                                            <button class="btn btn-success w-100" id="export-finance-excel">
                                                <i class="fas fa-download"></i>
                                                Baixar Excel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-4">
                                    <div class="card">
                                        <div class="card-body text-center">
                                            <i class="fas fa-file-pdf fa-3x text-danger mb-3"></i>
                                            <h5>Relatório PDF</h5>
                                            <p class="text-muted">Gere relatório detalhado em PDF</p>
                                            <button class="btn btn-danger w-100" id="export-finance-pdf">
                                                <i class="fas fa-download"></i>
                                                Gerar PDF
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-4">
                                    <div class="card">
                                        <div class="card-body text-center">
                                            <i class="fas fa-chart-bar fa-3x text-primary mb-3"></i>
                                            <h5>Análise Detalhada</h5>
                                            <p class="text-muted">Análises e insights financeiros</p>
                                            <button class="btn btn-primary w-100" id="generate-analysis">
                                                <i class="fas fa-chart-line"></i>
                                                Gerar Análise
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async getConfiguracoesTemplate() {
        return `
            <div class="row">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-cog"></i>
                                Configurações do Sistema
                            </div>
                        </div>
                        
                        <div class="card-body">
                            <form id="configuracoes-form">
                                <!-- Empresa -->
                                <div class="mb-4">
                                    <h5 class="mb-3">
                                        <i class="fas fa-building"></i>
                                        Dados da Empresa
                                    </h5>
                                    
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label for="empresa_nome" class="form-label">Nome da Empresa</label>
                                            <input type="text" id="empresa_nome" class="form-control">
                                        </div>
                                        
                                        <div class="col-md-6">
                                            <label for="empresa_cnpj" class="form-label">CNPJ/CPF</label>
                                            <input type="text" id="empresa_cnpj" class="form-control">
                                        </div>
                                        
                                        <div class="col-md-6">
                                            <label for="empresa_telefone" class="form-label">Telefone</label>
                                            <input type="text" id="empresa_telefone" class="form-control">
                                        </div>
                                        
                                        <div class="col-md-6">
                                            <label for="empresa_email" class="form-label">E-mail</label>
                                            <input type="email" id="empresa_email" class="form-control">
                                        </div>
                                        
                                        <div class="col-md-12">
                                            <label for="empresa_endereco" class="form-label">Endereço</label>
                                            <textarea id="empresa_endereco" class="form-control" rows="2"></textarea>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Sistema -->
                                <div class="mb-4">
                                    <h5 class="mb-3">
                                        <i class="fas fa-desktop"></i>
                                        Configurações do Sistema
                                    </h5>
                                    
                                    <div class="row g-3">
                                        <div class="col-md-4">
                                            <label for="moeda" class="form-label">Moeda</label>
                                            <select id="moeda" class="form-control">
                                                <option value="R$">Real (R$)</option>
                                                <option value="US$">Dólar (US$)</option>
                                                <option value="€">Euro (€)</option>
                                            </select>
                                        </div>
                                        
                                        <div class="col-md-4">
                                            <label for="formato_data" class="form-label">Formato de Data</label>
                                            <select id="formato_data" class="form-control">
                                                <option value="dd/MM/yyyy">DD/MM/AAAA</option>
                                                <option value="MM/dd/yyyy">MM/DD/AAAA</option>
                                                <option value="yyyy-MM-dd">AAAA-MM-DD</option>
                                            </select>
                                        </div>
                                        
                                        <div class="col-md-4">
                                            <label for="theme" class="form-label">Tema</label>
                                            <select id="theme" class="form-control">
                                                <option value="light">Claro</option>
                                                <option value="dark">Escuro</option>
                                                <option value="auto">Automático</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Backup -->
                                <div class="mb-4">
                                    <h5 class="mb-3">
                                        <i class="fas fa-database"></i>
                                        Backup Automático
                                    </h5>
                                    
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <div class="form-check form-switch">
                                                <input type="checkbox" id="auto_backup" class="form-check-input" role="switch">
                                                <label for="auto_backup" class="form-check-label">Habilitar backup automático</label>
                                            </div>
                                        </div>
                                        
                                        <div class="col-md-6">
                                            <label for="backup_interval" class="form-label">Intervalo (dias)</label>
                                            <select id="backup_interval" class="form-control">
                                                <option value="1">Diário</option>
                                                <option value="7">Semanal</option>
                                                <option value="30">Mensal</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Notificações -->
                                <div class="mb-4">
                                    <h5 class="mb-3">
                                        <i class="fas fa-bell"></i>
                                        Notificações
                                    </h5>
                                    
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <div class="form-check form-switch">
                                                <input type="checkbox" id="notificacoes_email" class="form-check-input" role="switch">
                                                <label for="notificacoes_email" class="form-check-label">Notificações por e-mail</label>
                                            </div>
                                        </div>
                                        
                                        <div class="col-md-6">
                                            <div class="form-check form-switch">
                                                <input type="checkbox" id="notificacoes_push" class="form-check-input" role="switch" checked>
                                                <label for="notificacoes_push" class="form-check-label">Notificações no sistema</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Preços por Bairro -->
                                <div class="mb-4">
                                    <h5 class="mb-3">
                                        <i class="fas fa-tags"></i>
                                        Preços por Bairro
                                    </h5>
                                    
                                    <div class="table-responsive">
                                        <table class="table" id="prices-table">
                                            <thead>
                                                <tr>
                                                    <th>Bairro</th>
                                                    <th>Valor (R$)</th>
                                                    <th>Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <!-- Prices will be loaded dynamically -->
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    <button type="button" class="btn btn-primary btn-sm mt-2" id="add-price">
                                        <i class="fas fa-plus"></i>
                                        Adicionar Bairro
                                    </button>
                                </div>
                                
                                <!-- Actions -->
                                <div class="d-flex gap-2">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-save"></i>
                                        Salvar Configurações
                                    </button>
                                    
                                    <button type="button" class="btn btn-ghost" id="reset-configuracoes">
                                        <i class="fas fa-undo"></i>
                                        Restaurar Padrão
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <!-- Sistema Info -->
                    <div class="card mb-4">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-info-circle"></i>
                                Informações do Sistema
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="list-group list-group-flush">
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    <span>Versão</span>
                                    <span class="badge bg-primary">2.0.0</span>
                                </div>
                                
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    <span>Última Atualização</span>
                                    <span id="last-update-info">—</span>
                                </div>
                                
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    <span>Total de Corridas</span>
                                    <span id="total-corridas-info">0</span>
                                </div>
                                
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    <span>Motoristas Ativos</span>
                                    <span id="active-drivers-info">0</span>
                                </div>
                                
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    <span>Tamanho do Banco</span>
                                    <span id="database-size">—</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Ações Rápidas -->
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-tools"></i>
                                Ações Rápidas
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="d-grid gap-2">
                                <button class="btn btn-outline-primary" onclick="app.loadPage('backup')">
                                    <i class="fas fa-database"></i>
                                    Gerenciar Backup
                                </button>
                                
                                <button class="btn btn-outline-warning" id="check-consistency">
                                    <i class="fas fa-check-circle"></i>
                                    Verificar Dados
                                </button>
                                
                                <button class="btn btn-outline-danger" id="clear-cache">
                                    <i class="fas fa-trash"></i>
                                    Limpar Cache
                                </button>
                                
                                <button class="btn btn-outline-info" id="system-info">
                                    <i class="fas fa-chart-bar"></i>
                                    Estatísticas
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async getBackupTemplate() {
        return `
            <div class="row">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-database"></i>
                                Backup e Restauração
                            </div>
                        </div>
                        
                        <div class="card-body">
                            <!-- Status -->
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i>
                                <strong>Status do Backup:</strong>
                                <div class="mt-2" id="backup-status">
                                    Carregando informações...
                                </div>
                            </div>
                            
                            <!-- Ações -->
                            <div class="row mb-4">
                                <div class="col-md-4">
                                    <div class="card text-center h-100">
                                        <div class="card-body">
                                            <i class="fas fa-save fa-3x text-primary mb-3"></i>
                                            <h5>Criar Backup</h5>
                                            <p class="text-muted">Cria uma cópia de segurança atual</p>
                                            <button class="btn btn-primary w-100" id="backup-btn">
                                                <i class="fas fa-database"></i>
                                                Criar Backup
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-4">
                                    <div class="card text-center h-100">
                                        <div class="card-body">
                                            <i class="fas fa-upload fa-3x text-success mb-3"></i>
                                            <h5>Importar</h5>
                                            <p class="text-muted">Importe um backup externo</p>
                                            <button class="btn btn-success w-100" id="import-backup">
                                                <i class="fas fa-file-import"></i>
                                                Importar Backup
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-4">
                                    <div class="card text-center h-100">
                                        <div class="card-body">
                                            <i class="fas fa-file-export fa-3x text-warning mb-3"></i>
                                            <h5>Exportar</h5>
                                            <p class="text-muted">Exporte backup para arquivo</p>
                                            <button class="btn btn-warning w-100" id="export-backup">
                                                <i class="fas fa-download"></i>
                                                Exportar Backup
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Backups Existentes -->
                            <h5 class="mb-3">
                                <i class="fas fa-history"></i>
                                Backups Existentes
                            </h5>
                            
                            <div class="table-responsive">
                                <table class="table" id="backups-table">
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Tamanho</th>
                                            <th>Itens</th>
                                            <th>Status</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- Backups will be loaded dynamically -->
                                    </tbody>
                                </table>
                            </div>
                            
                            <!-- Ações Avançadas -->
                            <div class="mt-4">
                                <h5 class="mb-3">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    Ações Avançadas
                                </h5>
                                
                                <div class="alert alert-danger">
                                    <i class="fas fa-exclamation-circle"></i>
                                    <strong>Atenção:</strong> As ações abaixo podem resultar em perda de dados.
                                    Use com cautela e sempre faça backup antes.
                                </div>
                                
                                <div class="d-grid gap-2">
                                    <button class="btn btn-outline-danger" id="restore-btn">
                                        <i class="fas fa-redo"></i>
                                        Restaurar Backup
                                    </button>
                                    
                                    <button class="btn btn-outline-danger" id="reset-data">
                                        <i class="fas fa-trash"></i>
                                        Resetar Dados
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <!-- Informações -->
                    <div class="card mb-4">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-info-circle"></i>
                                Informações
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="alert alert-warning">
                                <i class="fas fa-lightbulb"></i>
                                <strong>Dicas:</strong>
                                <ul class="mb-0 mt-2">
                                    <li>Faça backup regularmente</li>
                                    <li>Armazene backups em local seguro</li>
                                    <li>Teste a restauração periodicamente</li>
                                    <li>Mantenha múltiplas versões de backup</li>
                                </ul>
                            </div>
                            
                            <div class="alert alert-success">
                                <i class="fas fa-check-circle"></i>
                                <strong>Boas Práticas:</strong>
                                <ul class="mb-0 mt-2">
                                    <li>Backup diário recomendado</li>
                                    <li>Mantenha pelo menos 7 backups</li>
                                    <li>Verifique integridade dos backups</li>
                                    <li>Criptografe backups sensíveis</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Estatísticas -->
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-chart-bar"></i>
                                Estatísticas
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="list-group list-group-flush">
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    <span>Total de Backups</span>
                                    <span class="badge bg-primary" id="total-backups">0</span>
                                </div>
                                
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    <span>Último Backup</span>
                                    <small id="last-backup-date">—</small>
                                </div>
                                
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    <span>Tamanho Total</span>
                                    <span id="total-backup-size">—</span>
                                </div>
                                
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    <span>Backup Automático</span>
                                    <span class="badge bg-success" id="auto-backup-status">Ativo</span>
                                </div>
                                
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    <span>Próximo Backup</span>
                                    <small id="next-backup-date">—</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getNotFoundTemplate() {
        return `
            <div class="card">
                <div class="card-body text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-4x text-warning mb-4"></i>
                    <h1 class="display-6">Página Não Encontrada</h1>
                    <p class="lead">A página que você está procurando não existe ou foi movida.</p>
                    <button class="btn btn-primary mt-3" onclick="app.loadPage('dashboard')">
                        <i class="fas fa-home"></i>
                        Voltar para o Dashboard
                    </button>
                </div>
            </div>
        `;
    }
    
    getErrorTemplate(error) {
        return `
            <div class="card">
                <div class="card-body text-center py-5">
                    <i class="fas fa-exclamation-circle fa-4x text-danger mb-4"></i>
                    <h1 class="display-6">Erro ao Carregar Página</h1>
                    <p class="lead">Ocorreu um erro ao carregar o conteúdo desta página.</p>
                    <div class="alert alert-danger mt-3">
                        <strong>Detalhes:</strong> ${error.message || 'Erro desconhecido'}
                    </div>
                    <div class="d-flex justify-content-center gap-3 mt-4">
                        <button class="btn btn-primary" onclick="app.loadPage('dashboard')">
                            <i class="fas fa-home"></i>
                            Dashboard
                        </button>
                        <button class="btn btn-secondary" onclick="location.reload()">
                            <i class="fas fa-sync-alt"></i>
                            Recarregar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ===== Dashboard Rendering =====
    
    updateDashboardStats(stats) {
        if (!stats) return;
        
        // Update totals
        this.updateElementText('total-corridas', stats.totalCorridas);
        this.updateElementText('faturamento-hoje', this.formatCurrency(stats.faturamentoHoje));
        this.updateElementText('total-motoristas', stats.totalMotoristas);
        this.updateElementText('notificacoes-pendentes', stats.notificacoesNaoLidas);
        
        // Update changes
        this.updateChangeIndicator('corridas-change', stats.variacaoCorridas);
        
        // Update recent rides table
        if (stats.ultimasCorridas) {
            this.renderRecentRides(stats.ultimasCorridas);
        }
        
        // Update active drivers
        this.updateElementText('motoristas-ativos', stats.motoristasAtivos || 0);
    }
    
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
    
    formatDate(date) {
        return new Date(date).toLocaleDateString('pt-BR');
    }
    
    formatDateTime(date) {
        return new Date(date).toLocaleString('pt-BR');
    }
    
    updateChangeIndicator(elementId, change) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        if (change > 0) {
            element.className = 'stats-change positive';
            element.innerHTML = `<i class="fas fa-arrow-up"></i><span>${Math.abs(change)}%</span>`;
        } else if (change < 0) {
            element.className = 'stats-change negative';
            element.innerHTML = `<i class="fas fa-arrow-down"></i><span>${Math.abs(change)}%</span>`;
        } else {
            element.className = 'stats-change';
            element.innerHTML = `<span>—</span>`;
        }
    }
    
    updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }
    
    renderRecentRides(corridas) {
        const tbody = document.querySelector('#recent-rides-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (!corridas || corridas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        <i class="fas fa-taxi fa-2x mb-2"></i>
                        <div>Nenhuma corrida registrada</div>
                    </td>
                </tr>
            `;
            return;
        }
        
        corridas.forEach(corrida => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${corrida.motorista || '—'}</td>
                <td>${corrida.bairro || '—'}</td>
                <td>${corrida.funcionarios || '—'}</td>
                <td>${this.formatCurrency(corrida.valor || 0)}</td>
                <td>${this.formatDateTime(corrida.data)}</td>
                <td>
                    <div class="table-actions">
                        <button class="table-action-btn edit" data-action="edit-corrida" data-id="${corrida.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="table-action-btn delete" data-action="delete-corrida" data-id="${corrida.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    // ===== Registrar Page Rendering =====
    
    renderCorridasTable(corridas) {
        const tbody = document.querySelector('#corridas-hoje-table tbody');
        const countElement = document.getElementById('corridas-count');
        
        if (!tbody || !countElement) return;
        
        tbody.innerHTML = '';
        
        if (!corridas || corridas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        <i class="fas fa-car fa-2x mb-2"></i>
                        <div>Nenhuma corrida registrada hoje</div>
                    </td>
                </tr>
            `;
            countElement.textContent = '0 corridas registradas hoje';
            return;
        }
        
        corridas.forEach(corrida => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${corrida.motorista || '—'}</td>
                <td>${corrida.bairro || '—'}</td>
                <td>${corrida.funcionarios || '—'}</td>
                <td>${this.formatCurrency(corrida.valor || 0)}</td>
                <td>${new Date(corrida.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                <td>
                    <div class="table-actions">
                        <button class="table-action-btn edit" data-action="edit-corrida" data-id="${corrida.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="table-action-btn delete" data-action="delete-corrida" data-id="${corrida.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        countElement.textContent = `${corridas.length} corrida${corridas.length !== 1 ? 's' : ''} registrada${corridas.length !== 1 ? 's' : ''} hoje`;
    }
    
    // ===== Motoristas Page Rendering =====
    
    renderMotoristasTable(motoristas) {
        const tbody = document.querySelector('#motoristas-table tbody');
        const countElement = document.getElementById('motoristas-count');
        
        if (!tbody || !countElement) return;
        
        tbody.innerHTML = '';
        
        if (!motoristas || motoristas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="fas fa-users fa-2x mb-2"></i>
                        <div>Nenhum motorista cadastrado</div>
                    </td>
                </tr>
            `;
            countElement.textContent = '0 motoristas encontrados';
            return;
        }
        
        // This is a simplified version - in the real implementation,
        // you would fetch corridas data for each motorista
        motoristas.forEach(motorista => {
            const row = document.createElement('tr');
            const statusClass = this.getStatusClass(motorista.status);
            const statusText = this.getStatusText(motorista.status);
            
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div class="avatar avatar-sm bg-primary">
                            <span>${motorista.nome.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <div class="fw-semibold">${motorista.nome}</div>
                            ${motorista.cpf ? `<small class="text-muted">${motorista.cpf}</small>` : ''}
                        </div>
                    </div>
                </td>
                <td>${motorista.telefone || '—'}</td>
                <td>${motorista.email || '—'}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td class="text-center">—</td>
                <td class="text-center">—</td>
                <td>
                    <div class="table-actions">
                        <button class="table-action-btn view" data-action="view-motorista" data-id="${motorista.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="table-action-btn edit" data-action="edit-motorista" data-id="${motorista.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="table-action-btn delete" data-action="delete-motorista" data-id="${motorista.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        countElement.textContent = `${motoristas.length} motorista${motoristas.length !== 1 ? 's' : ''} encontrado${motoristas.length !== 1 ? 's' : ''}`;
    }
    
    getStatusClass(status) {
        switch (status) {
            case 'ativo': return 'badge-success';
            case 'inativo': return 'badge-danger';
            case 'ferias': return 'badge-warning';
            default: return 'badge-secondary';
        }
    }
    
    getStatusText(status) {
        switch (status) {
            case 'ativo': return 'Ativo';
            case 'inativo': return 'Inativo';
            case 'ferias': return 'Férias';
            default: return status;
        }
    }
    
    // ===== Relatorios Page Rendering =====
    
    renderRelatorios(data) {
        // Update summary cards
        this.updateElementText('report-total-corridas', data.totalCorridas || 0);
        this.updateElementText('report-total-faturamento', this.formatCurrency(data.totalFaturamento || 0));
        this.updateElementText('report-media-valor', this.formatCurrency(data.faturamentoMedio || 0));
        this.updateElementText('report-total-motoristas', data.totalMotoristas || 0);
        
        // Update details count
        this.updateElementText('report-details-count', `${data.corridas?.length || 0} registros encontrados`);
        
        // Render top motoristas
        this.renderTopMotoristas(data.rankingMotoristas);
        
        // Render top bairros
        this.renderTopBairros(data.rankingBairros);
        
        // Render details table
        this.renderReportDetails(data.corridas);
    }
    
    renderTopMotoristas(motoristas) {
        const container = document.getElementById('top-motoristas-list');
        if (!container) return;
        
        if (!motoristas || motoristas.length === 0) {
            container.innerHTML = '<div class="text-muted text-center py-3">Nenhum dado disponível</div>';
            return;
        }
        
        const top5 = motoristas.slice(0, 5);
        container.innerHTML = top5.map((motorista, index) => `
            <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-primary">${index + 1}</span>
                    <div>
                        <div class="fw-semibold">${motorista.motorista}</div>
                        <small class="text-muted">${motorista.corridas} corridas</small>
                    </div>
                </div>
                <div class="text-end">
                    <div class="fw-semibold">${this.formatCurrency(motorista.faturamento)}</div>
                    <small class="text-muted">${this.formatCurrency(motorista.media)}/corrida</small>
                </div>
            </div>
        `).join('');
    }
    
    renderTopBairros(bairros) {
        const container = document.getElementById('top-bairros-list');
        if (!container) return;
        
        if (!bairros || bairros.length === 0) {
            container.innerHTML = '<div class="text-muted text-center py-3">Nenhum dado disponível</div>';
            return;
        }
        
        const top5 = bairros.slice(0, 5);
        container.innerHTML = top5.map((bairro, index) => `
            <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-primary">${index + 1}</span>
                    <div>
                        <div class="fw-semibold">${bairro.bairro}</div>
                        <small class="text-muted">${bairro.corridas} corridas</small>
                    </div>
                </div>
                <div class="text-end">
                    <div class="fw-semibold">${this.formatCurrency(bairro.faturamento)}</div>
                    <small class="text-muted">${this.formatCurrency(bairro.media)}/corrida</small>
                </div>
            </div>
        `).join('');
    }
    
    renderReportDetails(corridas) {
        const tbody = document.querySelector('#report-details-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (!corridas || corridas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        Nenhuma corrida encontrada
                    </td>
                </tr>
            `;
            return;
        }
        
        corridas.forEach(corrida => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(corrida.data)}</td>
                <td>${corrida.motorista || '—'}</td>
                <td>${corrida.bairro || '—'}</td>
                <td>${corrida.funcionarios || '—'}</td>
                <td>${this.formatCurrency(corrida.valor || 0)}</td>
                <td>
                    <div class="table-actions">
                        <button class="table-action-btn edit" data-action="edit-corrida" data-id="${corrida.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    // ===== Financeiro Page Rendering =====
    
    renderFinanceiro(data) {
        if (!data) return;
        
        // Update summary cards
        this.updateElementText('total-receitas', this.formatCurrency(data.totais?.receitas || 0));
        this.updateElementText('total-despesas', this.formatCurrency(data.totais?.despesas || 0));
        this.updateElementText('saldo-total', this.formatCurrency(data.totais?.saldo || 0));
        
        // Calculate and update margin
        const receitas = data.totais?.receitas || 0;
        const lucro = data.totais?.saldo || 0;
        const margem = receitas > 0 ? (lucro / receitas) * 100 : 0;
        this.updateElementText('margem-lucro', `${margem.toFixed(1)}%`);
        
        // Update transactions count
        this.updateElementText('transactions-count', `${data.transacoes?.length || 0} transações encontradas`);
        
        // Render transactions
        this.renderTransactions(data.transacoes);
        
        // Render categories
        this.renderFinanceCategories(data.categorias);
    }
    
    renderTransactions(transacoes) {
        const tbody = document.querySelector('#transactions-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (!transacoes || transacoes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        Nenhuma transação encontrada
                    </td>
                </tr>
            `;
            return;
        }
        
        transacoes.forEach(transacao => {
            const row = document.createElement('tr');
            const tipoClass = transacao.tipo === 'revenue' ? 'success' : 'danger';
            const tipoIcon = transacao.tipo === 'revenue' ? 'fa-arrow-up' : 'fa-arrow-down';
            const tipoText = transacao.tipo === 'revenue' ? 'Receita' : 'Despesa';
            
            row.innerHTML = `
                <td>${this.formatDate(transacao.data)}</td>
                <td>
                    <span class="badge bg-${tipoClass}">
                        <i class="fas ${tipoIcon}"></i> ${tipoText}
                    </span>
                </td>
                <td>${transacao.description || '—'}</td>
                <td>${transacao.category || '—'}</td>
                <td class="${tipoClass === 'success' ? 'text-success' : 'text-danger'}">
                    ${tipoIcon === 'fa-arrow-up' ? '+' : '-'} ${this.formatCurrency(transacao.valor || 0)}
                </td>
                <td>
                    <span class="badge bg-success">Concluída</span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="table-action-btn view" data-action="view-transaction" data-id="${transacao.id}" title="Ver Detalhes">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="table-action-btn edit" data-action="edit-transaction" data-id="${transacao.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="table-action-btn delete" data-action="delete-transaction" data-id="${transacao.id}" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderFinanceCategories(categorias) {
        const revenueContainer = document.getElementById('revenue-categories-list');
        const expenseContainer = document.getElementById('expense-categories-list');

        if (revenueContainer) {
            revenueContainer.innerHTML = this.getCategoryHTML(categorias.receitas, 'revenue');
        }

        if (expenseContainer) {
            expenseContainer.innerHTML = this.getCategoryHTML(categorias.despesas, 'expense');
        }
    }

    getCategoryHTML(categories, type) {
        if (!categories || Object.keys(categories).length === 0) {
            return `<div class="text-muted text-center py-3">Nenhuma categoria encontrada</div>`;
        }

        const sortedCategories = Object.entries(categories).sort(([, a], [, b]) => b.total - a.total);

        return sortedCategories.map(([category, data]) => `
            <div class="category-item">
                <div class="category-info">
                    <div class="category-name">${category}</div>
                    <div class="category-count text-muted">${data.count} transaç${data.count > 1 ? 'ões' : 'ão'}</div>
                </div>
                <div class="category-amount text-${type === 'revenue' ? 'success' : 'danger'}">
                    ${this.formatCurrency(data.total)}
                </div>
            </div>
        `).join('');
    }

    // ===== Configurações Page Rendering =====

    renderConfiguracoes(settings) {
        if (!settings) return;

        Object.keys(settings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = settings[key] === 'true';
                } else {
                    element.value = settings[key];
                }
            }
        });
    }

    renderPricesTable(prices) {
        const tbody = document.querySelector('#prices-table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (!prices || prices.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-muted py-3">
                        Nenhum preço por bairro definido.
                    </td>
                </tr>
            `;
            return;
        }

        prices.sort((a, b) => a.bairro.localeCompare(b.bairro)).forEach(price => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${price.bairro}</td>
                <td>${this.formatCurrency(price.valor)}</td>
                <td>
                    <div class="table-actions">
                        <button class="table-action-btn edit" data-action="edit-price" data-bairro="${price.bairro}" title="Editar Preço">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="table-action-btn delete" data-action="delete-price" data-bairro="${price.bairro}" title="Excluir Preço">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // ===== Backup Page Rendering =====

    renderBackupInfo(backupInfo) {
        if (!backupInfo) return;

        const statusDiv = document.getElementById('backup-status');
        if (statusDiv) {
            if (backupInfo.lastBackup) {
                statusDiv.innerHTML = `
                    Último backup realizado em <strong>${backupInfo.lastBackup.date}</strong>.
                    Total de ${backupInfo.totalBackups} backups armazenados.
                `;
            } else {
                statusDiv.innerHTML = 'Nenhum backup encontrado. Crie um backup para proteger seus dados.';
            }
        }

        this.updateElementText('total-backups', backupInfo.totalBackups);
        this.updateElementText('last-backup-date', backupInfo.lastBackup?.date || '—');
        this.updateElementText('total-backup-size', backupInfo.totalSize ? `${(backupInfo.totalSize / 1024).toFixed(2)} KB` : '—');

        const autoBackupStatus = document.getElementById('auto-backup-status');
        if (autoBackupStatus) {
            autoBackupStatus.textContent = backupInfo.autoBackupEnabled ? 'Ativo' : 'Inativo';
            autoBackupStatus.className = `badge bg-${backupInfo.autoBackupEnabled ? 'success' : 'danger'}`;
        }
    }

    // ===== Modals =====

    openModal(options) {
        // Close existing modal if any
        if (this.currentModal) {
            this.modalStack.push(this.currentModal);
            this.currentModal.style.display = 'none';
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-dialog modal-${options.size || 'md'}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${options.title}</h5>
                        <button type="button" class="btn-close" data-action="close"></button>
                    </div>
                    <div class="modal-body">
                        ${options.content}
                    </div>
                    ${options.buttons ? `
                        <div class="modal-footer">
                            ${options.buttons.map(btn => `
                                <button type="button" 
                                        class="btn btn-${btn.type}" 
                                        data-action="${btn.action}"
                                        ${btn.disabled ? 'disabled' : ''}>
                                    ${btn.text}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.currentModal = modal;

        // Handle events
        modal.addEventListener('click', e => {
            const actionTarget = e.target.closest('[data-action]');
            if (actionTarget) {
                const action = actionTarget.dataset.action;
                switch (action) {
                    case 'close':
                        this.closeModal();
                        break;
                    case 'confirm':
                        this.triggerEvent('modal:confirm', options.buttons.find(b => b.action === 'confirm').data);
                        break;
                    case 'submit':
                        const formId = options.buttons.find(b => b.action === 'submit').formId;
                        document.getElementById(formId)?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                        break;
                    case 'custom':
                        const customBtn = options.buttons.find(b => b.action === 'custom' && b.text === actionTarget.textContent);
                        customBtn?.callback();
                        break;
                }
            } else if (e.target === modal) {
                // Click outside to close
                this.closeModal();
            }
        });

        if (options.onOpen) {
            options.onOpen();
        }
    }

    closeModal() {
        if (this.currentModal) {
            this.currentModal.remove();
            this.currentModal = null;
        }

        // Restore previous modal from stack
        if (this.modalStack.length > 0) {
            this.currentModal = this.modalStack.pop();
            this.currentModal.style.display = '';
        }
    }

    // ===== Sidebar & Mobile Menu =====

    toggleSidebar(isCollapsed) {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        if (sidebar && mainContent) {
            sidebar.classList.toggle('collapsed', isCollapsed);
            mainContent.classList.toggle('sidebar-collapsed', isCollapsed);
        }
    }

    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('mobile-open');
        }
    }

    hideMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('mobile-open');
        }
    }

    // ===== Notifications =====

    showNotificationsPanel(notifications) {
        // This would render a side panel with notifications
        console.log('Mostrando painel de notificações:', notifications);
    }

    // ===== Search =====

    getSearchResults(corridas, motoristas, searchTerm) {
        if (corridas.length === 0 && motoristas.length === 0) {
            return `
                <div class="text-center py-4">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <p>Nenhum resultado encontrado para <strong>"${searchTerm}"</strong></p>
                </div>
            `;
        }

        return `
            ${corridas.length > 0 ? `
                <h6 class="mb-3">Corridas (${corridas.length})</h6>
                <div class="list-group mb-4">
                    ${corridas.map(c => `
                        <a href="#" class="list-group-item list-group-item-action" data-action="view-corrida" data-id="${c.id}">
                            <div class="d-flex w-100 justify-content-between">
                                <h6 class="mb-1">${c.motorista} para ${c.bairro}</h6>
                                <small>${this.formatDate(c.data)}</small>
                            </div>
                            <p class="mb-1">Funcionários: ${c.funcionarios}</p>
                            <small class="text-success">${this.formatCurrency(c.valor)}</small>
                        </a>
                    `).join('')}
                </div>
            ` : ''}

            ${motoristas.length > 0 ? `
                <h6 class="mb-3">Motoristas (${motoristas.length})</h6>
                <div class="list-group">
                    ${motoristas.map(m => `
                        <a href="#" class="list-group-item list-group-item-action" data-action="view-motorista" data-id="${m.id}">
                            <div class="d-flex w-100 justify-content-between">
                                <h6 class="mb-1">${m.nome}</h6>
                                <small class="badge ${this.getStatusClass(m.status)}">${this.getStatusText(m.status)}</small>
                            </div>
                            <p class="mb-1">${m.telefone || ''} - ${m.email || ''}</p>
                        </a>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }

    // ===== Utility =====

    triggerEvent(eventName, detail = {}) {
        document.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
}