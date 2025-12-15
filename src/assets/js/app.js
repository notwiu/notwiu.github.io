// Main Application Controller
import Database from './database.js';
import UI from './ui.js';
import Charts from './charts.js';
import Export from './export.js';
import Notifications from './notifications.js';

class TaxiManagementSystem {
    constructor() {
        this.db = new Database();
        this.ui = new UI(this);
        this.charts = new Charts(this);
        this.export = new Export(this);
        this.notifications = new Notifications();
        
        this.currentPage = 'dashboard';
        this.isSidebarCollapsed = false;
        this.theme = 'light';
        
        this.init();
    }
    
    async init() {
        console.log('🚕 Inicializando Sistema Top Táxi PRO...');
        
        // Show loading overlay
        this.ui.showLoading();
        
        try {
            // Initialize database
            await this.db.init();
            console.log('✅ Banco de dados inicializado');
            
            // Load saved theme
            this.loadTheme();
            
            // Setup event listeners
            this.setupEventListeners();
            console.log('✅ Event listeners configurados');
            
            // Update footer year
            this.updateFooterYear();
            
            // Load initial page
            await this.loadPage(this.currentPage);
            console.log('✅ Página inicial carregada');
            
            // Update data status
            this.updateDataStatus();
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao inicializar o sistema. Por favor, recarregue a página.'
            });
        } finally {
            // Hide loading overlay
            setTimeout(() => {
                this.ui.hideLoading();
                console.log('🎉 Sistema inicializado com sucesso!');
            }, 800);
        }
    }
    
    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-page]') || e.target.closest('[data-page]')) {
                const element = e.target.matches('[data-page]') ? e.target : e.target.closest('[data-page]');
                const page = element.dataset.page;
                e.preventDefault();
                this.loadPage(page);
            }
        });
        
        // Sidebar toggle
        document.addEventListener('click', (e) => {
            if (e.target.matches('#sidebar-toggle') || e.target.closest('#sidebar-toggle')) {
                this.toggleSidebar();
            }
            
            // Mobile menu toggle
            if (e.target.matches('#mobile-menu-toggle') || e.target.closest('#mobile-menu-toggle')) {
                this.ui.toggleMobileMenu();
            }
        });
        
        // Theme toggle
        document.addEventListener('click', (e) => {
            if (e.target.matches('#theme-toggle') || e.target.closest('#theme-toggle')) {
                this.toggleTheme();
            }
        });
        
        // Logout button
        document.addEventListener('click', (e) => {
            if (e.target.matches('#logout-btn') || e.target.closest('#logout-btn')) {
                this.logout();
            }
        });
        
        // Notifications button
        document.addEventListener('click', (e) => {
            if (e.target.matches('#notifications-btn') || e.target.closest('#notifications-btn')) {
                this.showNotifications();
            }
        });
        
        // Search input
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch(e.target.value);
                }
            });
        }
        
        // Global modal events
        document.addEventListener('modal:open', (e) => {
            this.ui.openModal(e.detail);
        });
        
        document.addEventListener('modal:close', () => {
            this.ui.closeModal();
        });
        
        document.addEventListener('modal:confirm', async (e) => {
            await this.handleModalConfirm(e.detail);
        });
        
        // Global notification events
        document.addEventListener('notification:show', (e) => {
            this.notifications.show(e.detail);
        });
        
        // Global export events
        document.addEventListener('export:excel', (e) => {
            this.export.exportToExcel(e.detail);
        });
        
        document.addEventListener('export:pdf', (e) => {
            this.export.exportToPDF(e.detail);
        });
        
        // Data update events
        document.addEventListener('data:updated', () => {
            this.updateDataStatus();
            this.updateDashboardStats();
            this.charts.updateCharts();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Before unload
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });
    }
    
    async loadPage(page) {
        console.log(`📄 Carregando página: ${page}`);
        
        this.currentPage = page;
        
        // Show page loading
        this.ui.showPageLoading();
        
        try {
            // Update active navigation
            this.ui.updateNavigation(page);
            
            // Update page title and subtitle
            this.ui.updatePageTitle(page);
            
            // Load page content
            await this.ui.loadPageContent(page);
            
            // Initialize page-specific functionality
            await this.initializePage(page);
            
            // Update last update time
            this.updateLastUpdateTime();
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
        } catch (error) {
            console.error(`❌ Erro ao carregar página ${page}:`, error);
            this.notifications.show({
                type: 'error',
                message: `Erro ao carregar página: ${page}`
            });
            
            // Fallback to dashboard
            if (page !== 'dashboard') {
                this.loadPage('dashboard');
            }
        } finally {
            // Hide page loading
            this.ui.hidePageLoading();
        }
    }
    
    async initializePage(page) {
        switch(page) {
            case 'dashboard':
                await this.initializeDashboard();
                break;
                
            case 'registrar':
                await this.initializeRegistrar();
                break;
                
            case 'motoristas':
                await this.initializeMotoristas();
                break;
                
            case 'rotas':
                await this.initializeRotas();
                break;
                
            case 'veiculos':
                await this.initializeVeiculos();
                break;
                
            case 'relatorios':
                await this.initializeRelatorios();
                break;
                
            case 'financeiro':
                await this.initializeFinanceiro();
                break;
                
            case 'configuracoes':
                await this.initializeConfiguracoes();
                break;
                
            case 'backup':
                await this.initializeBackup();
                break;
                
            default:
                console.warn(`⚠️ Página não reconhecida: ${page}`);
        }
    }
    
    async initializeDashboard() {
        console.log('📊 Inicializando Dashboard...');
        
        // Load dashboard stats
        await this.updateDashboardStats();
        
        // Initialize charts
        await this.charts.initDashboardCharts();
        
        // Load recent rides
        await this.loadRecentRides();
        
        // Load notifications count
        await this.updateNotificationsCount();
        
        // Start auto-refresh for dashboard
        this.startDashboardAutoRefresh();
    }
    
    async updateDashboardStats() {
        try {
            const stats = await this.db.getDashboardStats();
            this.ui.updateDashboardStats(stats);
        } catch (error) {
            console.error('❌ Erro ao atualizar estatísticas:', error);
        }
    }
    
    async loadRecentRides() {
        try {
            const rides = await this.db.getRecentRides(10);
            this.ui.renderRecentRides(rides);
        } catch (error) {
            console.error('❌ Erro ao carregar corridas recentes:', error);
        }
    }
    
    async initializeRegistrar() {
        console.log('📝 Inicializando Registrar Corrida...');
        
        // Setup form
        this.setupRegistrarForm();
        
        // Load bairros
        await this.loadBairros();
        
        // Load motoristas
        await this.loadMotoristasForSelect();
        
        // Load current rides
        await this.renderRegistrarTable();
        
        // Setup form validation
        this.setupFormValidation();
    }
    
    setupRegistrarForm() {
        const form = document.getElementById('registrar-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Validate form
            if (!this.validateCorridaForm(data)) {
                return;
            }
            
            try {
                // Show loading
                this.ui.showButtonLoading(e.submitter);
                
                // Add corrida
                await this.db.addCorrida(data);
                
                // Show success notification
                this.notifications.show({
                    type: 'success',
                    message: 'Corrida registrada com sucesso!'
                });
                
                // Reset form
                form.reset();
                
                // Update tables
                await this.renderRegistrarTable();
                await this.updateDashboardStats();
                
                // Update charts
                this.charts.updateCharts();
                
                // Trigger data update event
                this.ui.triggerEvent('data:updated');
                
            } catch (error) {
                console.error('❌ Erro ao registrar corrida:', error);
                this.notifications.show({
                    type: 'error',
                    message: 'Erro ao registrar corrida: ' + error.message
                });
            } finally {
                // Hide loading
                this.ui.hideButtonLoading(e.submitter);
            }
        });
        
        // Auto-calculate price based on neighborhood
        const bairroSelect = document.getElementById('bairro');
        const valorInput = document.getElementById('valor');
        
        if (bairroSelect && valorInput) {
            bairroSelect.addEventListener('change', async () => {
                if (bairroSelect.value) {
                    const precoBase = await this.db.getPrecoBasePorBairro(bairroSelect.value);
                    if (precoBase && !valorInput.value) {
                        valorInput.value = precoBase;
                    }
                }
            });
        }
        
        // Clear form button
        const clearBtn = document.getElementById('clear-form');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                form.reset();
            });
        }
    }
    
    validateCorridaForm(data) {
        const errors = [];
        
        if (!data.motorista?.trim()) {
            errors.push('Motorista é obrigatório');
        }
        
        if (!data.bairro?.trim()) {
            errors.push('Bairro é obrigatório');
        }
        
        if (!data.funcionarios?.trim()) {
            errors.push('Número de funcionários é obrigatório');
        }
        
        if (data.valor && Number(data.valor) <= 0) {
            errors.push('Valor deve ser maior que zero');
        }
        
        if (errors.length > 0) {
            this.notifications.show({
                type: 'error',
                message: errors.join(', ')
            });
            return false;
        }
        
        return true;
    }
    
    async loadBairros() {
        try {
            const bairros = await this.db.getBairros();
            const select = document.getElementById('bairro');
            if (select) {
                // Clear existing options except the first one
                while (select.options.length > 1) {
                    select.remove(1);
                }
                
                // Add bairros
                bairros.forEach(bairro => {
                    const option = document.createElement('option');
                    option.value = bairro.nome;
                    option.textContent = bairro.nome;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('❌ Erro ao carregar bairros:', error);
        }
    }
    
    async loadMotoristasForSelect() {
        try {
            const motoristas = await this.db.getMotoristasAtivos();
            const select = document.getElementById('motorista');
            if (select) {
                // Clear existing options
                select.innerHTML = '<option value="">Selecione um motorista</option>';
                
                // Add motoristas
                motoristas.forEach(motorista => {
                    const option = document.createElement('option');
                    option.value = motorista.nome;
                    option.textContent = motorista.nome;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('❌ Erro ao carregar motoristas:', error);
        }
    }
    
    async renderRegistrarTable() {
        try {
            const corridas = await this.db.getCorridasHoje();
            this.ui.renderCorridasTable(corridas);
        } catch (error) {
            console.error('❌ Erro ao renderizar tabela de corridas:', error);
        }
    }
    
    async initializeMotoristas() {
        console.log('👥 Inicializando Motoristas...');
        
        // Load motoristas
        await this.renderMotoristasTable();
        
        // Setup actions
        this.setupMotoristasActions();
        
        // Setup search
        this.setupMotoristasSearch();
        
        // Setup filters
        this.setupMotoristasFilters();
    }
    
    async renderMotoristasTable() {
        try {
            const motoristas = await this.db.getMotoristas();
            this.ui.renderMotoristasTable(motoristas);
        } catch (error) {
            console.error('❌ Erro ao renderizar tabela de motoristas:', error);
        }
    }
    
    setupMotoristasActions() {
        // Add driver button
        const addBtn = document.getElementById('add-motorista-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.openAddMotoristaModal();
            });
        }
        
        // Edit/Delete buttons are handled by event delegation
        document.addEventListener('click', async (e) => {
            // Edit motorista
            if (e.target.matches('[data-action="edit-motorista"]') || e.target.closest('[data-action="edit-motorista"]')) {
                const element = e.target.matches('[data-action="edit-motorista"]') ? e.target : e.target.closest('[data-action="edit-motorista"]');
                const id = element.dataset.id;
                await this.editMotorista(id);
            }
            
            // Delete motorista
            if (e.target.matches('[data-action="delete-motorista"]') || e.target.closest('[data-action="delete-motorista"]')) {
                const element = e.target.matches('[data-action="delete-motorista"]') ? e.target : e.target.closest('[data-action="delete-motorista"]');
                const id = element.dataset.id;
                await this.deleteMotorista(id);
            }
            
            // View motorista details
            if (e.target.matches('[data-action="view-motorista"]') || e.target.closest('[data-action="view-motorista"]')) {
                const element = e.target.matches('[data-action="view-motorista"]') ? e.target : e.target.closest('[data-action="view-motorista"]');
                const id = element.dataset.id;
                await this.viewMotoristaDetails(id);
            }
            
            // Edit corrida
            if (e.target.matches('[data-action="edit-corrida"]') || e.target.closest('[data-action="edit-corrida"]')) {
                const element = e.target.matches('[data-action="edit-corrida"]') ? e.target : e.target.closest('[data-action="edit-corrida"]');
                const id = element.dataset.id;
                await this.editCorrida(id);
            }
            
            // Delete corrida
            if (e.target.matches('[data-action="delete-corrida"]') || e.target.closest('[data-action="delete-corrida"]')) {
                const element = e.target.matches('[data-action="delete-corrida"]') ? e.target : e.target.closest('[data-action="delete-corrida"]');
                const id = element.dataset.id;
                await this.deleteCorrida(id);
            }
        });
    }
    
    async openAddMotoristaModal() {
        const modalContent = `
            <form id="add-motorista-form">
                <div class="form-group">
                    <label for="motorista-nome" class="form-label">Nome *</label>
                    <input type="text" id="motorista-nome" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="motorista-telefone" class="form-label">Telefone</label>
                    <input type="tel" id="motorista-telefone" class="form-control">
                </div>
                
                <div class="form-group">
                    <label for="motorista-email" class="form-label">E-mail</label>
                    <input type="email" id="motorista-email" class="form-control">
                </div>
                
                <div class="form-group">
                    <label for="motorista-cpf" class="form-label">CPF</label>
                    <input type="text" id="motorista-cpf" class="form-control" maxlength="14">
                </div>
                
                <div class="form-group">
                    <label for="motorista-status" class="form-label">Status</label>
                    <select id="motorista-status" class="form-control">
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                        <option value="ferias">Férias</option>
                    </select>
                </div>
            </form>
        `;
        
        this.ui.openModal({
            type: 'add-motorista',
            title: 'Adicionar Motorista',
            content: modalContent,
            size: 'md',
            buttons: [
                {
                    text: 'Cancelar',
                    type: 'ghost',
                    action: 'close'
                },
                {
                    text: 'Salvar',
                    type: 'primary',
                    action: 'submit',
                    formId: 'add-motorista-form'
                }
            ]
        });
        
        // Setup form submission
        const form = document.getElementById('add-motorista-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(form);
                const data = {
                    nome: formData.get('motorista-nome'),
                    telefone: formData.get('motorista-telefone'),
                    email: formData.get('motorista-email'),
                    cpf: formData.get('motorista-cpf'),
                    status: formData.get('motorista-status')
                };
                
                try {
                    await this.db.addMotorista(data);
                    this.notifications.show({
                        type: 'success',
                        message: 'Motorista adicionado com sucesso!'
                    });
                    
                    // Close modal
                    this.ui.closeModal();
                    
                    // Refresh table
                    await this.renderMotoristasTable();
                    
                    // Update dashboard
                    await this.updateDashboardStats();
                    
                } catch (error) {
                    console.error('❌ Erro ao adicionar motorista:', error);
                    this.notifications.show({
                        type: 'error',
                        message: 'Erro ao adicionar motorista: ' + error.message
                    });
                }
            });
        }
    }
    
    async editMotorista(id) {
        try {
            const motorista = await this.db.getMotorista(id);
            if (!motorista) {
                this.notifications.show({
                    type: 'error',
                    message: 'Motorista não encontrado'
                });
                return;
            }
            
            const modalContent = `
                <form id="edit-motorista-form">
                    <div class="form-group">
                        <label for="edit-motorista-nome" class="form-label">Nome *</label>
                        <input type="text" id="edit-motorista-nome" class="form-control" value="${motorista.nome}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-motorista-telefone" class="form-label">Telefone</label>
                        <input type="tel" id="edit-motorista-telefone" class="form-control" value="${motorista.telefone || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-motorista-email" class="form-label">E-mail</label>
                        <input type="email" id="edit-motorista-email" class="form-control" value="${motorista.email || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-motorista-cpf" class="form-label">CPF</label>
                        <input type="text" id="edit-motorista-cpf" class="form-control" value="${motorista.cpf || ''}" maxlength="14">
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-motorista-status" class="form-label">Status</label>
                        <select id="edit-motorista-status" class="form-control">
                            <option value="ativo" ${motorista.status === 'ativo' ? 'selected' : ''}>Ativo</option>
                            <option value="inativo" ${motorista.status === 'inativo' ? 'selected' : ''}>Inativo</option>
                            <option value="ferias" ${motorista.status === 'ferias' ? 'selected' : ''}>Férias</option>
                        </select>
                    </div>
                </form>
            `;
            
            this.ui.openModal({
                type: 'edit-motorista',
                title: 'Editar Motorista',
                content: modalContent,
                size: 'md',
                buttons: [
                    {
                        text: 'Cancelar',
                        type: 'ghost',
                        action: 'close'
                    },
                    {
                        text: 'Salvar',
                        type: 'primary',
                        action: 'submit',
                        formId: 'edit-motorista-form'
                    }
                ]
            });
            
            // Setup form submission
            const form = document.getElementById('edit-motorista-form');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const formData = new FormData(form);
                    const data = {
                        nome: formData.get('edit-motorista-nome'),
                        telefone: formData.get('edit-motorista-telefone'),
                        email: formData.get('edit-motorista-email'),
                        cpf: formData.get('edit-motorista-cpf'),
                        status: formData.get('edit-motorista-status')
                    };
                    
                    try {
                        await this.db.updateMotorista(id, data);
                        this.notifications.show({
                            type: 'success',
                            message: 'Motorista atualizado com sucesso!'
                        });
                        
                        // Close modal
                        this.ui.closeModal();
                        
                        // Refresh table
                        await this.renderMotoristasTable();
                        
                        // Update dashboard
                        await this.updateDashboardStats();
                        
                    } catch (error) {
                        console.error('❌ Erro ao atualizar motorista:', error);
                        this.notifications.show({
                            type: 'error',
                            message: 'Erro ao atualizar motorista: ' + error.message
                        });
                    }
                });
            }
            
        } catch (error) {
            console.error('❌ Erro ao editar motorista:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao carregar dados do motorista'
            });
        }
    }
    
    async deleteMotorista(id) {
        try {
            const motorista = await this.db.getMotorista(id);
            if (!motorista) {
                this.notifications.show({
                    type: 'error',
                    message: 'Motorista não encontrado'
                });
                return;
            }
            
            // Show confirmation modal
            this.ui.openModal({
                type: 'confirm',
                title: 'Excluir Motorista',
                content: `
                    <p>Tem certeza que deseja excluir o motorista <strong>${motorista.nome}</strong>?</p>
                    <p class="text-danger">Esta ação não pode ser desfeita.</p>
                `,
                size: 'sm',
                buttons: [
                    {
                        text: 'Cancelar',
                        type: 'ghost',
                        action: 'close'
                    },
                    {
                        text: 'Excluir',
                        type: 'danger',
                        action: 'confirm',
                        data: { id, type: 'motorista' }
                    }
                ]
            });
            
        } catch (error) {
            console.error('❌ Erro ao excluir motorista:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao carregar dados do motorista'
            });
        }
    }
    
    async viewMotoristaDetails(id) {
        try {
            const motorista = await this.db.getMotorista(id);
            if (!motorista) {
                this.notifications.show({
                    type: 'error',
                    message: 'Motorista não encontrado'
                });
                return;
            }
            
            const corridas = await this.db.getCorridasPorMotorista(motorista.nome);
            const totalCorridas = corridas.length;
            const totalFaturamento = corridas.reduce((sum, c) => sum + (Number(c.valor) || 0), 0);
            
            const modalContent = `
                <div class="motorista-details">
                    <div class="text-center mb-4">
                        <div class="avatar avatar-xl bg-primary mb-3">
                            <span>${motorista.nome.charAt(0).toUpperCase()}</span>
                        </div>
                        <h3>${motorista.nome}</h3>
                        <span class="badge ${motorista.status === 'ativo' ? 'badge-success' : 'badge-warning'}">
                            ${motorista.status}
                        </span>
                    </div>
                    
                    <div class="row mb-4">
                        <div class="col-6">
                            <div class="text-center">
                                <h4 class="mb-1">${totalCorridas}</h4>
                                <small class="text-muted">Total de Corridas</small>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-center">
                                <h4 class="mb-1">R$ ${totalFaturamento.toFixed(2)}</h4>
                                <small class="text-muted">Faturamento Total</small>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <h6>Informações de Contato</h6>
                        <ul class="list-unstyled">
                            ${motorista.telefone ? `<li><i class="fas fa-phone me-2"></i> ${motorista.telefone}</li>` : ''}
                            ${motorista.email ? `<li><i class="fas fa-envelope me-2"></i> ${motorista.email}</li>` : ''}
                            ${motorista.cpf ? `<li><i class="fas fa-id-card me-2"></i> ${motorista.cpf}</li>` : ''}
                        </ul>
                    </div>
                    
                    ${corridas.length > 0 ? `
                        <div class="mt-4">
                            <h6>Últimas Corridas</h6>
                            <div class="table-container" style="max-height: 200px; overflow-y: auto;">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Bairro</th>
                                            <th>Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${corridas.slice(0, 5).map(corrida => `
                                            <tr>
                                                <td>${new Date(corrida.data).toLocaleDateString('pt-BR')}</td>
                                                <td>${corrida.bairro}</td>
                                                <td>R$ ${Number(corrida.valor).toFixed(2)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
            
            this.ui.openModal({
                type: 'info',
                title: 'Detalhes do Motorista',
                content: modalContent,
                size: 'md',
                buttons: [
                    {
                        text: 'Fechar',
                        type: 'ghost',
                        action: 'close'
                    },
                    {
                        text: 'Editar',
                        type: 'primary',
                        action: 'custom',
                        callback: () => {
                            this.ui.closeModal();
                            this.editMotorista(id);
                        }
                    }
                ]
            });
            
        } catch (error) {
            console.error('❌ Erro ao visualizar detalhes do motorista:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao carregar detalhes do motorista'
            });
        }
    }
    
    async editCorrida(id) {
        try {
            const corrida = await this.db.getCorrida(id);
            if (!corrida) {
                this.notifications.show({
                    type: 'error',
                    message: 'Corrida não encontrada'
                });
                return;
            }
            
            const motoristas = await this.db.getMotoristasAtivos();
            const bairros = await this.db.getBairros();
            
            const modalContent = `
                <form id="edit-corrida-form">
                    <div class="form-group">
                        <label for="edit-corrida-motorista" class="form-label">Motorista *</label>
                        <select id="edit-corrida-motorista" class="form-control" required>
                            <option value="">Selecione um motorista</option>
                            ${motoristas.map(m => `
                                <option value="${m.nome}" ${m.nome === corrida.motorista ? 'selected' : ''}>${m.nome}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-corrida-bairro" class="form-label">Bairro *</label>
                        <select id="edit-corrida-bairro" class="form-control" required>
                            <option value="">Selecione um bairro</option>
                            ${bairros.map(b => `
                                <option value="${b.nome}" ${b.nome === corrida.bairro ? 'selected' : ''}>${b.nome}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-corrida-funcionarios" class="form-label">Funcionários *</label>
                        <input type="text" id="edit-corrida-funcionarios" class="form-control" value="${corrida.funcionarios}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-corrida-valor" class="form-label">Valor (R$) *</label>
                        <input type="number" id="edit-corrida-valor" class="form-control" value="${corrida.valor}" step="0.01" min="0" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-corrida-data" class="form-label">Data</label>
                        <input type="datetime-local" id="edit-corrida-data" class="form-control" value="${corrida.data.slice(0, 16)}">
                    </div>
                </form>
            `;
            
            this.ui.openModal({
                type: 'edit-corrida',
                title: 'Editar Corrida',
                content: modalContent,
                size: 'md',
                buttons: [
                    {
                        text: 'Cancelar',
                        type: 'ghost',
                        action: 'close'
                    },
                    {
                        text: 'Salvar',
                        type: 'primary',
                        action: 'submit',
                        formId: 'edit-corrida-form'
                    }
                ]
            });
            
            // Setup form submission
            const form = document.getElementById('edit-corrida-form');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const formData = new FormData(form);
                    const data = {
                        motorista: formData.get('edit-corrida-motorista'),
                        bairro: formData.get('edit-corrida-bairro'),
                        funcionarios: formData.get('edit-corrida-funcionarios'),
                        valor: formData.get('edit-corrida-valor'),
                        data: formData.get('edit-corrida-data') || new Date().toISOString()
                    };
                    
                    try {
                        await this.db.updateCorrida(id, data);
                        this.notifications.show({
                            type: 'success',
                            message: 'Corrida atualizada com sucesso!'
                        });
                        
                        // Close modal
                        this.ui.closeModal();
                        
                        // Refresh tables
                        await this.renderRegistrarTable();
                        await this.updateDashboardStats();
                        
                        // Update charts
                        this.charts.updateCharts();
                        
                        // Trigger data update event
                        this.ui.triggerEvent('data:updated');
                        
                    } catch (error) {
                        console.error('❌ Erro ao atualizar corrida:', error);
                        this.notifications.show({
                            type: 'error',
                            message: 'Erro ao atualizar corrida: ' + error.message
                        });
                    }
                });
            }
            
        } catch (error) {
            console.error('❌ Erro ao editar corrida:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao carregar dados da corrida'
            });
        }
    }
    
    async deleteCorrida(id) {
        try {
            const corrida = await this.db.getCorrida(id);
            if (!corrida) {
                this.notifications.show({
                    type: 'error',
                    message: 'Corrida não encontrada'
                });
                return;
            }
            
            // Show confirmation modal
            this.ui.openModal({
                type: 'confirm',
                title: 'Excluir Corrida',
                content: `
                    <p>Tem certeza que deseja excluir esta corrida?</p>
                    <div class="alert alert-warning">
                        <strong>Detalhes da Corrida:</strong><br>
                        Motorista: ${corrida.motorista}<br>
                        Bairro: ${corrida.bairro}<br>
                        Valor: R$ ${Number(corrida.valor).toFixed(2)}
                    </div>
                    <p class="text-danger">Esta ação não pode ser desfeita.</p>
                `,
                size: 'md',
                buttons: [
                    {
                        text: 'Cancelar',
                        type: 'ghost',
                        action: 'close'
                    },
                    {
                        text: 'Excluir',
                        type: 'danger',
                        action: 'confirm',
                        data: { id, type: 'corrida' }
                    }
                ]
            });
            
        } catch (error) {
            console.error('❌ Erro ao excluir corrida:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao carregar dados da corrida'
            });
        }
    }
    
    setupMotoristasSearch() {
        const searchInput = document.getElementById('motoristas-search');
        if (searchInput) {
            searchInput.addEventListener('input', async (e) => {
                const searchTerm = e.target.value.toLowerCase();
                await this.filterMotoristas(searchTerm);
            });
        }
    }
    
    setupMotoristasFilters() {
        const filterSelect = document.getElementById('motoristas-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', async (e) => {
                const filterValue = e.target.value;
                await this.filterMotoristasByStatus(filterValue);
            });
        }
    }
    
    async filterMotoristas(searchTerm) {
        try {
            const motoristas = await this.db.getMotoristas();
            const filtered = motoristas.filter(motorista =>
                motorista.nome.toLowerCase().includes(searchTerm) ||
                motorista.telefone?.toLowerCase().includes(searchTerm) ||
                motorista.email?.toLowerCase().includes(searchTerm) ||
                motorista.cpf?.toLowerCase().includes(searchTerm)
            );
            this.ui.renderMotoristasTable(filtered);
        } catch (error) {
            console.error('❌ Erro ao filtrar motoristas:', error);
        }
    }
    
    async filterMotoristasByStatus(status) {
        try {
            const motoristas = await this.db.getMotoristas();
            const filtered = status === 'todos' 
                ? motoristas 
                : motoristas.filter(motorista => motorista.status === status);
            this.ui.renderMotoristasTable(filtered);
        } catch (error) {
            console.error('❌ Erro ao filtrar motoristas por status:', error);
        }
    }
    
    setupFormValidation() {
        // Add custom validation for CPF
        const cpfInput = document.getElementById('motorista-cpf');
        if (cpfInput) {
            cpfInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 11) {
                    value = value.slice(0, 11);
                }
                
                // Format CPF: 000.000.000-00
                if (value.length > 9) {
                    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                } else if (value.length > 6) {
                    value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
                } else if (value.length > 3) {
                    value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
                }
                
                e.target.value = value;
            });
        }
        
        // Add custom validation for phone
        const phoneInput = document.getElementById('motorista-telefone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 11) {
                    value = value.slice(0, 11);
                }
                
                // Format phone: (00) 00000-0000
                if (value.length > 10) {
                    value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                } else if (value.length > 6) {
                    value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
                } else if (value.length > 2) {
                    value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
                } else if (value.length > 0) {
                    value = value.replace(/(\d{0,2})/, '($1');
                }
                
                e.target.value = value;
            });
        }
    }
    
    async initializeRotas() {
        console.log('🗺️ Inicializando Rotas...');
        
        // This would initialize a map component
        // For now, just show a placeholder
        this.ui.showPageContent(`
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fas fa-map-marked-alt"></i>
                        Mapa de Rotas
                    </div>
                </div>
                <div class="card-body">
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i class="fas fa-map"></i>
                        </div>
                        <h3 class="empty-state-title">Mapa em Desenvolvimento</h3>
                        <p class="empty-state-description">
                            O mapa interativo de rotas está em desenvolvimento.
                            Em breve você poderá visualizar todas as rotas e otimizar trajetos.
                        </p>
                        <div class="empty-state-actions">
                            <button class="btn btn-primary" onclick="app.loadPage('registrar')">
                                <i class="fas fa-car"></i>
                                Registrar Corrida
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }
    
    async initializeVeiculos() {
        console.log('🚗 Inicializando Veículos...');
        
        // This would initialize vehicles management
        // For now, just show a placeholder
        this.ui.showPageContent(`
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fas fa-car-side"></i>
                        Gestão de Veículos
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
                        <div class="empty-state-actions">
                            <button class="btn btn-primary" onclick="app.loadPage('motoristas')">
                                <i class="fas fa-users"></i>
                                Gerenciar Motoristas
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        // Add vehicle button event
        const addBtn = document.getElementById('add-veiculo-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.notifications.show({
                    type: 'info',
                    message: 'Módulo de veículos em desenvolvimento'
                });
            });
        }
    }
    
    async initializeRelatorios() {
        console.log('📈 Inicializando Relatórios...');
        
        // Load reports data
        await this.loadRelatoriosData();
        
        // Setup export buttons
        this.setupExportButtons();
        
        // Setup date filters
        this.setupDateFilters();
    }
    
    async loadRelatoriosData() {
        try {
            const reports = await this.db.getRelatoriosData();
            this.ui.renderRelatorios(reports);
        } catch (error) {
            console.error('❌ Erro ao carregar dados de relatórios:', error);
        }
    }
    
    setupExportButtons() {
        // Excel export
        const excelBtn = document.getElementById('export-excel');
        if (excelBtn) {
            excelBtn.addEventListener('click', async () => {
                try {
                    await this.export.exportToExcel('relatorios');
                    this.notifications.show({
                        type: 'success',
                        message: 'Relatório exportado em Excel com sucesso!'
                    });
                } catch (error) {
                    console.error('❌ Erro ao exportar Excel:', error);
                    this.notifications.show({
                        type: 'error',
                        message: 'Erro ao exportar relatório'
                    });
                }
            });
        }
        
        // PDF export
        const pdfBtn = document.getElementById('export-pdf');
        if (pdfBtn) {
            pdfBtn.addEventListener('click', async () => {
                try {
                    await this.export.exportToPDF('relatorios');
                    this.notifications.show({
                        type: 'success',
                        message: 'Relatório exportado em PDF com sucesso!'
                    });
                } catch (error) {
                    console.error('❌ Erro ao exportar PDF:', error);
                    this.notifications.show({
                        type: 'error',
                        message: 'Erro ao exportar relatório'
                    });
                }
            });
        }
    }
    
    setupDateFilters() {
        const startDate = document.getElementById('report-start-date');
        const endDate = document.getElementById('report-end-date');
        const applyFilterBtn = document.getElementById('apply-filter');
        
        if (startDate && endDate && applyFilterBtn) {
            // Set default dates (last 30 days)
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 30);
            
            startDate.value = start.toISOString().split('T')[0];
            endDate.value = end.toISOString().split('T')[0];
            
            applyFilterBtn.addEventListener('click', async () => {
                const filters = {
                    startDate: startDate.value,
                    endDate: endDate.value
                };
                
                try {
                    const reports = await this.db.getRelatoriosData(filters);
                    this.ui.renderRelatorios(reports);
                    this.notifications.show({
                        type: 'success',
                        message: 'Filtro aplicado com sucesso!'
                    });
                } catch (error) {
                    console.error('❌ Erro ao aplicar filtro:', error);
                    this.notifications.show({
                        type: 'error',
                        message: 'Erro ao aplicar filtro'
                    });
                }
            });
        }
    }
    
    async initializeFinanceiro() {
        console.log('💰 Inicializando Financeiro...');
        
        // Load financial data
        await this.loadFinanceiroData();
        
        // Setup financial charts
        await this.charts.initFinanceiroCharts();
        
        // Setup financial actions
        this.setupFinanceiroActions();
    }
    
    async loadFinanceiroData() {
        try {
            const financeiro = await this.db.getFinanceiroData();
            this.ui.renderFinanceiro(financeiro);
        } catch (error) {
            console.error('❌ Erro ao carregar dados financeiros:', error);
        }
    }
    
    setupFinanceiroActions() {
        // Add expense button
        const addExpenseBtn = document.getElementById('add-expense');
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => {
                this.openAddExpenseModal();
            });
        }
        
        // Add revenue button
        const addRevenueBtn = document.getElementById('add-revenue');
        if (addRevenueBtn) {
            addRevenueBtn.addEventListener('click', () => {
                this.openAddRevenueModal();
            });
        }
    }
    
    openAddExpenseModal() {
        const modalContent = `
            <form id="add-expense-form">
                <div class="form-group">
                    <label for="expense-description" class="form-label">Descrição *</label>
                    <input type="text" id="expense-description" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="expense-amount" class="form-label">Valor (R$) *</label>
                    <input type="number" id="expense-amount" class="form-control" step="0.01" min="0" required>
                </div>
                
                <div class="form-group">
                    <label for="expense-category" class="form-label">Categoria *</label>
                    <select id="expense-category" class="form-control" required>
                        <option value="">Selecione uma categoria</option>
                        <option value="combustivel">Combustível</option>
                        <option value="manutencao">Manutenção</option>
                        <option value="seguro">Seguro</option>
                        <option value="impostos">Impostos</option>
                        <option value="salarios">Salários</option>
                        <option value="outros">Outros</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="expense-date" class="form-label">Data *</label>
                    <input type="date" id="expense-date" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="expense-notes" class="form-label">Observações</label>
                    <textarea id="expense-notes" class="form-control" rows="3"></textarea>
                </div>
            </form>
        `;
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        
        this.ui.openModal({
            type: 'add-expense',
            title: 'Adicionar Despesa',
            content: modalContent,
            size: 'md',
            onOpen: () => {
                const dateInput = document.getElementById('expense-date');
                if (dateInput) {
                    dateInput.value = today;
                }
            },
            buttons: [
                {
                    text: 'Cancelar',
                    type: 'ghost',
                    action: 'close'
                },
                {
                    text: 'Salvar',
                    type: 'primary',
                    action: 'submit',
                    formId: 'add-expense-form'
                }
            ]
        });
        
        // Setup form submission
        const form = document.getElementById('add-expense-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(form);
                const data = {
                    type: 'expense',
                    description: formData.get('expense-description'),
                    amount: formData.get('expense-amount'),
                    category: formData.get('expense-category'),
                    date: formData.get('expense-date'),
                    notes: formData.get('expense-notes')
                };
                
                try {
                    await this.db.addFinancialTransaction(data);
                    this.notifications.show({
                        type: 'success',
                        message: 'Despesa adicionada com sucesso!'
                    });
                    
                    // Close modal
                    this.ui.closeModal();
                    
                    // Refresh financial data
                    await this.loadFinanceiroData();
                    
                    // Update charts
                    this.charts.updateFinanceiroCharts();
                    
                } catch (error) {
                    console.error('❌ Erro ao adicionar despesa:', error);
                    this.notifications.show({
                        type: 'error',
                        message: 'Erro ao adicionar despesa: ' + error.message
                    });
                }
            });
        }
    }
    
    openAddRevenueModal() {
        const modalContent = `
            <form id="add-revenue-form">
                <div class="form-group">
                    <label for="revenue-description" class="form-label">Descrição *</label>
                    <input type="text" id="revenue-description" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="revenue-amount" class="form-label">Valor (R$) *</label>
                    <input type="number" id="revenue-amount" class="form-control" step="0.01" min="0" required>
                </div>
                
                <div class="form-group">
                    <label for="revenue-category" class="form-label">Categoria *</label>
                    <select id="revenue-category" class="form-control" required>
                        <option value="">Selecione uma categoria</option>
                        <option value="corridas">Corridas</option>
                        <option value="mensalidades">Mensalidades</option>
                        <option value="outros">Outros</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="revenue-date" class="form-label">Data *</label>
                    <input type="date" id="revenue-date" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="revenue-notes" class="form-label">Observações</label>
                    <textarea id="revenue-notes" class="form-control" rows="3"></textarea>
                </div>
            </form>
        `;
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        
        this.ui.openModal({
            type: 'add-revenue',
            title: 'Adicionar Receita',
            content: modalContent,
            size: 'md',
            onOpen: () => {
                const dateInput = document.getElementById('revenue-date');
                if (dateInput) {
                    dateInput.value = today;
                }
            },
            buttons: [
                {
                    text: 'Cancelar',
                    type: 'ghost',
                    action: 'close'
                },
                {
                    text: 'Salvar',
                    type: 'primary',
                    action: 'submit',
                    formId: 'add-revenue-form'
                }
            ]
        });
        
        // Setup form submission
        const form = document.getElementById('add-revenue-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(form);
                const data = {
                    type: 'revenue',
                    description: formData.get('revenue-description'),
                    amount: formData.get('revenue-amount'),
                    category: formData.get('revenue-category'),
                    date: formData.get('revenue-date'),
                    notes: formData.get('revenue-notes')
                };
                
                try {
                    await this.db.addFinancialTransaction(data);
                    this.notifications.show({
                        type: 'success',
                        message: 'Receita adicionada com sucesso!'
                    });
                    
                    // Close modal
                    this.ui.closeModal();
                    
                    // Refresh financial data
                    await this.loadFinanceiroData();
                    
                    // Update charts
                    this.charts.updateFinanceiroCharts();
                    
                } catch (error) {
                    console.error('❌ Erro ao adicionar receita:', error);
                    this.notifications.show({
                        type: 'error',
                        message: 'Erro ao adicionar receita: ' + error.message
                    });
                }
            });
        }
    }
    
    async initializeConfiguracoes() {
        console.log('⚙️ Inicializando Configurações...');
        
        // Load settings
        await this.loadConfiguracoes();
        
        // Setup settings form
        this.setupConfiguracoesForm();
        
        // Setup price management
        this.setupPriceManagement();
    }
    
    async loadConfiguracoes() {
        try {
            const settings = await this.db.getConfiguracoes();
            this.ui.renderConfiguracoes(settings);
        } catch (error) {
            console.error('❌ Erro ao carregar configurações:', error);
        }
    }
    
    setupConfiguracoesForm() {
        const form = document.getElementById('configuracoes-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await this.db.saveConfiguracoes(data);
                this.notifications.show({
                    type: 'success',
                    message: 'Configurações salvas com sucesso!'
                });
                
                // Update theme if changed
                if (data.theme && data.theme !== this.theme) {
                    this.theme = data.theme;
                    this.applyTheme();
                }
                
            } catch (error) {
                console.error('❌ Erro ao salvar configurações:', error);
                this.notifications.show({
                    type: 'error',
                    message: 'Erro ao salvar configurações: ' + error.message
                });
            }
        });
        
        // Reset button
        const resetBtn = document.getElementById('reset-configuracoes');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
                    this.resetConfiguracoes();
                }
            });
        }
    }
    
    async resetConfiguracoes() {
        try {
            await this.db.resetConfiguracoes();
            this.notifications.show({
                type: 'success',
                message: 'Configurações restauradas para padrão!'
            });
            
            // Reload settings
            await this.loadConfiguracoes();
            
            // Reset theme
            this.theme = 'light';
            this.applyTheme();
            
        } catch (error) {
            console.error('❌ Erro ao resetar configurações:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao resetar configurações'
            });
        }
    }
    
    setupPriceManagement() {
        // Load prices
        this.loadPrices();
        
        // Add price button
        const addPriceBtn = document.getElementById('add-price');
        if (addPriceBtn) {
            addPriceBtn.addEventListener('click', () => {
                this.openAddPriceModal();
            });
        }
        
        // Edit/Delete price buttons
        document.addEventListener('click', async (e) => {
            // Edit price
            if (e.target.matches('[data-action="edit-price"]') || e.target.closest('[data-action="edit-price"]')) {
                const element = e.target.matches('[data-action="edit-price"]') ? e.target : e.target.closest('[data-action="edit-price"]');
                const bairro = element.dataset.bairro;
                await this.editPrice(bairro);
            }
            
            // Delete price
            if (e.target.matches('[data-action="delete-price"]') || e.target.closest('[data-action="delete-price"]')) {
                const element = e.target.matches('[data-action="delete-price"]') ? e.target : e.target.closest('[data-action="delete-price"]');
                const bairro = element.dataset.bairro;
                await this.deletePrice(bairro);
            }
        });
    }
    
    async loadPrices() {
        try {
            const prices = await this.db.getPrecosBase();
            this.ui.renderPricesTable(prices);
        } catch (error) {
            console.error('❌ Erro ao carregar preços:', error);
        }
    }
    
    openAddPriceModal() {
        const modalContent = `
            <form id="add-price-form">
                <div class="form-group">
                    <label for="price-bairro" class="form-label">Bairro *</label>
                    <input type="text" id="price-bairro" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="price-valor" class="form-label">Valor (R$) *</label>
                    <input type="number" id="price-valor" class="form-control" step="0.01" min="0" required>
                </div>
            </form>
        `;
        
        this.ui.openModal({
            type: 'add-price',
            title: 'Adicionar Preço por Bairro',
            content: modalContent,
            size: 'sm',
            buttons: [
                {
                    text: 'Cancelar',
                    type: 'ghost',
                    action: 'close'
                },
                {
                    text: 'Salvar',
                    type: 'primary',
                    action: 'submit',
                    formId: 'add-price-form'
                }
            ]
        });
        
        // Setup form submission
        const form = document.getElementById('add-price-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(form);
                const data = {
                    bairro: formData.get('price-bairro'),
                    valor: formData.get('price-valor')
                };
                
                try {
                    await this.db.addPreco(data);
                    this.notifications.show({
                        type: 'success',
                        message: 'Preço adicionado com sucesso!'
                    });
                    
                    // Close modal
                    this.ui.closeModal();
                    
                    // Refresh prices table
                    await this.loadPrices();
                    
                } catch (error) {
                    console.error('❌ Erro ao adicionar preço:', error);
                    this.notifications.show({
                        type: 'error',
                        message: 'Erro ao adicionar preço: ' + error.message
                    });
                }
            });
        }
    }
    
    async editPrice(bairro) {
        try {
            const price = await this.db.getPreco(bairro);
            if (!price) {
                this.notifications.show({
                    type: 'error',
                    message: 'Preço não encontrado'
                });
                return;
            }
            
            const modalContent = `
                <form id="edit-price-form">
                    <div class="form-group">
                        <label for="edit-price-bairro" class="form-label">Bairro *</label>
                        <input type="text" id="edit-price-bairro" class="form-control" value="${price.bairro}" readonly>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-price-valor" class="form-label">Valor (R$) *</label>
                        <input type="number" id="edit-price-valor" class="form-control" value="${price.valor}" step="0.01" min="0" required>
                    </div>
                </form>
            `;
            
            this.ui.openModal({
                type: 'edit-price',
                title: 'Editar Preço por Bairro',
                content: modalContent,
                size: 'sm',
                buttons: [
                    {
                        text: 'Cancelar',
                        type: 'ghost',
                        action: 'close'
                    },
                    {
                        text: 'Salvar',
                        type: 'primary',
                        action: 'submit',
                        formId: 'edit-price-form'
                    }
                ]
            });
            
            // Setup form submission
            const form = document.getElementById('edit-price-form');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const formData = new FormData(form);
                    const data = {
                        bairro: formData.get('edit-price-bairro'),
                        valor: formData.get('edit-price-valor')
                    };
                    
                    try {
                        await this.db.updatePreco(data);
                        this.notifications.show({
                            type: 'success',
                            message: 'Preço atualizado com sucesso!'
                        });
                        
                        // Close modal
                        this.ui.closeModal();
                        
                        // Refresh prices table
                        await this.loadPrices();
                        
                    } catch (error) {
                        console.error('❌ Erro ao atualizar preço:', error);
                        this.notifications.show({
                            type: 'error',
                            message: 'Erro ao atualizar preço: ' + error.message
                        });
                    }
                });
            }
            
        } catch (error) {
            console.error('❌ Erro ao editar preço:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao carregar dados do preço'
            });
        }
    }
    
    async deletePrice(bairro) {
        try {
            const price = await this.db.getPreco(bairro);
            if (!price) {
                this.notifications.show({
                    type: 'error',
                    message: 'Preço não encontrado'
                });
                return;
            }
            
            // Show confirmation modal
            this.ui.openModal({
                type: 'confirm',
                title: 'Excluir Preço',
                content: `
                    <p>Tem certeza que deseja excluir o preço para <strong>${price.bairro}</strong>?</p>
                    <p class="text-danger">Esta ação não pode ser desfeita.</p>
                `,
                size: 'sm',
                buttons: [
                    {
                        text: 'Cancelar',
                        type: 'ghost',
                        action: 'close'
                    },
                    {
                        text: 'Excluir',
                        type: 'danger',
                        action: 'confirm',
                        data: { bairro, type: 'preco' }
                    }
                ]
            });
            
        } catch (error) {
            console.error('❌ Erro ao excluir preço:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao carregar dados do preço'
            });
        }
    }
    
    async initializeBackup() {
        console.log('💾 Inicializando Backup...');
        
        // Load backup data
        await this.loadBackupInfo();
        
        // Setup backup actions
        this.setupBackupActions();
        
        // Setup restore actions
        this.setupRestoreActions();
    }
    
    async loadBackupInfo() {
        try {
            const backupInfo = await this.db.getBackupInfo();
            this.ui.renderBackupInfo(backupInfo);
        } catch (error) {
            console.error('❌ Erro ao carregar informações de backup:', error);
        }
    }
    
    setupBackupActions() {
        // Backup button
        const backupBtn = document.getElementById('backup-btn');
        if (backupBtn) {
            backupBtn.addEventListener('click', async () => {
                try {
                    await this.createBackup();
                    this.notifications.show({
                        type: 'success',
                        message: 'Backup criado com sucesso!'
                    });
                    
                    // Refresh backup info
                    await this.loadBackupInfo();
                    
                } catch (error) {
                    console.error('❌ Erro ao criar backup:', error);
                    this.notifications.show({
                        type: 'error',
                        message: 'Erro ao criar backup: ' + error.message
                    });
                }
            });
        }
        
        // Export backup button
        const exportBackupBtn = document.getElementById('export-backup');
        if (exportBackupBtn) {
            exportBackupBtn.addEventListener('click', async () => {
                try {
                    await this.exportBackup();
                    this.notifications.show({
                        type: 'success',
                        message: 'Backup exportado com sucesso!'
                    });
                } catch (error) {
                    console.error('❌ Erro ao exportar backup:', error);
                    this.notifications.show({
                        type: 'error',
                        message: 'Erro ao exportar backup: ' + error.message
                    });
                }
            });
        }
    }
    
    setupRestoreActions() {
        // Restore button
        const restoreBtn = document.getElementById('restore-btn');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', () => {
                this.openRestoreModal();
            });
        }
        
        // Import backup button
        const importBackupBtn = document.getElementById('import-backup');
        if (importBackupBtn) {
            importBackupBtn.addEventListener('click', () => {
                this.openImportBackupModal();
            });
        }
        
        // Reset data button
        const resetDataBtn = document.getElementById('reset-data');
        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', () => {
                this.openResetDataModal();
            });
        }
    }
    
    async createBackup() {
        try {
            const backupData = await this.db.backupData();
            const backup = {
                ...backupData,
                createdAt: new Date().toISOString(),
                size: JSON.stringify(backupData).length
            };
            
            await this.db.saveBackup(backup);
            
        } catch (error) {
            throw error;
        }
    }
    
    async exportBackup() {
        try {
            const backupData = await this.db.backupData();
            await this.export.exportBackup(backupData);
            
        } catch (error) {
            throw error;
        }
    }
    
    openRestoreModal() {
        this.ui.openModal({
            type: 'restore',
            title: 'Restaurar Backup',
            content: `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Atenção:</strong> Restaurar um backup substituirá todos os dados atuais.
                    Certifique-se de fazer um backup atual antes de prosseguir.
                </div>
                
                <div class="form-group">
                    <label for="restore-backup" class="form-label">Selecionar Backup</label>
                    <select id="restore-backup" class="form-control">
                        <option value="">Selecione um backup...</option>
                        <!-- Backups will be loaded dynamically -->
                    </select>
                </div>
                
                <div id="backup-details" style="display: none;">
                    <h6>Detalhes do Backup:</h6>
                    <div id="backup-info"></div>
                </div>
            `,
            size: 'md',
            onOpen: async () => {
                await this.loadBackupOptions();
            },
            buttons: [
                {
                    text: 'Cancelar',
                    type: 'ghost',
                    action: 'close'
                },
                {
                    text: 'Restaurar',
                    type: 'primary',
                    action: 'custom',
                    callback: () => {
                        this.restoreBackup();
                    },
                    disabled: true
                }
            ]
        });
    }
    
    async loadBackupOptions() {
        try {
            const backups = await this.db.getBackups();
            const select = document.getElementById('restore-backup');
            const restoreBtn = document.querySelector('.modal-footer .btn-primary');
            
            if (select && restoreBtn) {
                // Clear existing options
                while (select.options.length > 1) {
                    select.remove(1);
                }
                
                // Add backups
                backups.forEach(backup => {
                    const option = document.createElement('option');
                    option.value = backup.id;
                    option.textContent = `${new Date(backup.createdAt).toLocaleString()} (${backup.size} bytes)`;
                    select.appendChild(option);
                });
                
                // Add change event
                select.addEventListener('change', (e) => {
                    const backupId = e.target.value;
                    if (backupId) {
                        this.showBackupDetails(backupId);
                        restoreBtn.disabled = false;
                    } else {
                        document.getElementById('backup-details').style.display = 'none';
                        restoreBtn.disabled = true;
                    }
                });
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar backups:', error);
        }
    }
    
    async showBackupDetails(backupId) {
        try {
            const backup = await this.db.getBackup(backupId);
            if (!backup) return;
            
            const detailsDiv = document.getElementById('backup-info');
            const detailsContainer = document.getElementById('backup-details');
            
            if (detailsDiv && detailsContainer) {
                detailsDiv.innerHTML = `
                    <ul class="list-unstyled">
                        <li><strong>Data:</strong> ${new Date(backup.createdAt).toLocaleString()}</li>
                        <li><strong>Tamanho:</strong> ${backup.size} bytes</li>
                        <li><strong>Corridas:</strong> ${backup.corridas?.length || 0}</li>
                        <li><strong>Motoristas:</strong> ${backup.motoristas?.length || 0}</li>
                        <li><strong>Versão:</strong> ${backup.version || '1.0'}</li>
                    </ul>
                `;
                
                detailsContainer.style.display = 'block';
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar detalhes do backup:', error);
        }
    }
    
    async restoreBackup() {
        const select = document.getElementById('restore-backup');
        if (!select || !select.value) return;
        
        const backupId = select.value;
        
        // Show confirmation
        this.ui.openModal({
            type: 'confirm',
            title: 'Confirmar Restauração',
            content: `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Atenção:</strong> Esta ação substituirá todos os dados atuais pelos dados do backup.
                    Esta ação não pode ser desfeita.
                </div>
                <p>Tem certeza que deseja restaurar este backup?</p>
            `,
            size: 'sm',
            buttons: [
                {
                    text: 'Cancelar',
                    type: 'ghost',
                    action: 'close'
                },
                {
                    text: 'Restaurar',
                    type: 'danger',
                    action: 'custom',
                    callback: async () => {
                        await this.performRestore(backupId);
                    }
                }
            ]
        });
    }
    
    async performRestore(backupId) {
        try {
            // Close all modals
            this.ui.closeModal();
            
            // Show loading
            this.ui.showLoading();
            
            // Restore backup
            await this.db.restoreBackup(backupId);
            
            // Show success notification
            this.notifications.show({
                type: 'success',
                message: 'Backup restaurado com sucesso!'
            });
            
            // Reload current page
            await this.loadPage(this.currentPage);
            
            // Update data status
            this.updateDataStatus();
            
        } catch (error) {
            console.error('❌ Erro ao restaurar backup:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao restaurar backup: ' + error.message
            });
        } finally {
            // Hide loading
            this.ui.hideLoading();
        }
    }
    
    openImportBackupModal() {
        const modalContent = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                <strong>Importar Backup:</strong> Selecione um arquivo de backup (.json) para importar.
            </div>
            
            <div class="file-upload">
                <input type="file" id="import-file" class="file-upload-input" accept=".json">
                <label for="import-file" class="file-upload-label" id="file-upload-label">
                    <div class="file-upload-icon">
                        <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <div class="file-upload-text">Arraste e solte ou clique para selecionar</div>
                    <div class="file-upload-hint">Arquivo .json (máx. 10MB)</div>
                </label>
            </div>
            
            <div id="file-preview" style="display: none;"></div>
        `;
        
        this.ui.openModal({
            type: 'import',
            title: 'Importar Backup',
            content: modalContent,
            size: 'md',
            onOpen: () => {
                this.setupFileUpload();
            },
            buttons: [
                {
                    text: 'Cancelar',
                    type: 'ghost',
                    action: 'close'
                },
                {
                    text: 'Importar',
                    type: 'primary',
                    action: 'custom',
                    callback: () => {
                        this.importBackup();
                    },
                    disabled: true
                }
            ]
        });
    }
    
    setupFileUpload() {
        const fileInput = document.getElementById('import-file');
        const fileLabel = document.getElementById('file-upload-label');
        const previewDiv = document.getElementById('file-preview');
        const importBtn = document.querySelector('.modal-footer .btn-primary');
        
        if (!fileInput || !fileLabel || !previewDiv || !importBtn) return;
        
        let selectedFile = null;
        
        // Drag and drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileLabel.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            fileLabel.addEventListener(eventName, () => {
                fileLabel.classList.add('drag-over');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            fileLabel.addEventListener(eventName, () => {
                fileLabel.classList.remove('drag-over');
            });
        });
        
        // Drop file
        fileLabel.addEventListener('drop', (e) => {
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'application/json') {
                handleFile(file);
            }
        });
        
        // Click to select
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleFile(file);
            }
        });
        
        function handleFile(file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                alert('Arquivo muito grande. O limite é 10MB.');
                return;
            }
            
            selectedFile = file;
            
            // Update label
            fileLabel.innerHTML = `
                <div class="file-upload-icon">
                    <i class="fas fa-file-alt"></i>
                </div>
                <div class="file-upload-text">${file.name}</div>
                <div class="file-upload-hint">${(file.size / 1024).toFixed(2)} KB</div>
            `;
            
            // Show preview
            previewDiv.style.display = 'block';
            previewDiv.innerHTML = `
                <div class="file-upload-preview">
                    <div class="file-upload-preview-icon">
                        <i class="fas fa-file-json"></i>
                    </div>
                    <div class="file-upload-preview-info">
                        <div class="file-upload-preview-name">${file.name}</div>
                        <div class="file-upload-preview-size">${(file.size / 1024).toFixed(2)} KB</div>
                    </div>
                    <button type="button" class="file-upload-remove" id="remove-file">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            // Enable import button
            importBtn.disabled = false;
            
            // Remove file button
            const removeBtn = document.getElementById('remove-file');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    selectedFile = null;
                    fileInput.value = '';
                    fileLabel.innerHTML = `
                        <div class="file-upload-icon">
                            <i class="fas fa-cloud-upload-alt"></i>
                        </div>
                        <div class="file-upload-text">Arraste e solte ou clique para selecionar</div>
                        <div class="file-upload-hint">Arquivo .json (máx. 10MB)</div>
                    `;
                    previewDiv.style.display = 'none';
                    importBtn.disabled = true;
                });
            }
        }
        
        // Store selected file in modal instance
        this.modalData = { selectedFile };
    }
    
    async importBackup() {
        const { selectedFile } = this.modalData || {};
        
        if (!selectedFile) {
            this.notifications.show({
                type: 'error',
                message: 'Nenhum arquivo selecionado'
            });
            return;
        }
        
        try {
            // Read file
            const text = await selectedFile.text();
            const backupData = JSON.parse(text);
            
            // Validate backup data
            if (!this.validateBackupData(backupData)) {
                this.notifications.show({
                    type: 'error',
                    message: 'Arquivo de backup inválido'
                });
                return;
            }
            
            // Show confirmation
            this.ui.openModal({
                type: 'confirm',
                title: 'Confirmar Importação',
                content: `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>Atenção:</strong> Esta ação substituirá todos os dados atuais pelos dados do backup.
                        Esta ação não pode ser desfeita.
                    </div>
                    <p>Tem certeza que deseja importar este backup?</p>
                    <div class="alert alert-info">
                        <strong>Detalhes do Backup:</strong><br>
                        Corridas: ${backupData.corridas?.length || 0}<br>
                        Motoristas: ${backupData.motoristas?.length || 0}<br>
                        Data: ${backupData.exportedAt ? new Date(backupData.exportedAt).toLocaleString() : 'Desconhecida'}
                    </div>
                `,
                size: 'md',
                buttons: [
                    {
                        text: 'Cancelar',
                        type: 'ghost',
                        action: 'close'
                    },
                    {
                        text: 'Importar',
                        type: 'danger',
                        action: 'custom',
                        callback: async () => {
                            await this.performImport(backupData);
                        }
                    }
                ]
            });
            
        } catch (error) {
            console.error('❌ Erro ao ler arquivo de backup:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao ler arquivo de backup: ' + error.message
            });
        }
    }
    
    validateBackupData(data) {
        return (
            data &&
            typeof data === 'object' &&
            Array.isArray(data.corridas) &&
            Array.isArray(data.motoristas)
        );
    }
    
    async performImport(backupData) {
        try {
            // Close all modals
            this.ui.closeModal();
            
            // Show loading
            this.ui.showLoading();
            
            // Import backup
            await this.db.importBackup(backupData);
            
            // Show success notification
            this.notifications.show({
                type: 'success',
                message: 'Backup importado com sucesso!'
            });
            
            // Reload current page
            await this.loadPage(this.currentPage);
            
            // Update data status
            this.updateDataStatus();
            
        } catch (error) {
            console.error('❌ Erro ao importar backup:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao importar backup: ' + error.message
            });
        } finally {
            // Hide loading
            this.ui.hideLoading();
        }
    }
    
    openResetDataModal() {
        this.ui.openModal({
            type: 'reset',
            title: 'Resetar Dados',
            content: `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Atenção Crítica:</strong> Esta ação removerá permanentemente todos os dados do sistema.
                    Esta ação não pode ser desfeita.
                </div>
                
                <div class="form-group">
                    <label class="form-check">
                        <input type="checkbox" id="confirm-reset" class="form-check-input">
                        <span class="form-check-label">Eu entendo que todos os dados serão perdidos permanentemente</span>
                    </label>
                </div>
                
                <div class="form-group">
                    <label class="form-check">
                        <input type="checkbox" id="export-before-reset" class="form-check-input" checked>
                        <span class="form-check-label">Exportar backup antes de resetar</span>
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="reset-type" class="form-label">Tipo de Reset</label>
                    <select id="reset-type" class="form-control">
                        <option value="corridas">Apenas Corridas</option>
                        <option value="motoristas">Apenas Motoristas</option>
                        <option value="todos">Todos os Dados</option>
                    </select>
                </div>
            `,
            size: 'md',
            buttons: [
                {
                    text: 'Cancelar',
                    type: 'ghost',
                    action: 'close'
                },
                {
                    text: 'Resetar',
                    type: 'danger',
                    action: 'custom',
                    callback: () => {
                        this.resetData();
                    },
                    disabled: true
                }
            ],
            onOpen: () => {
                // Enable/disable reset button based on confirmation
                const confirmCheckbox = document.getElementById('confirm-reset');
                const resetBtn = document.querySelector('.modal-footer .btn-danger');
                
                if (confirmCheckbox && resetBtn) {
                    confirmCheckbox.addEventListener('change', (e) => {
                        resetBtn.disabled = !e.target.checked;
                    });
                }
            }
        });
    }
    
    async resetData() {
        const resetType = document.getElementById('reset-type').value;
        const exportBefore = document.getElementById('export-before-reset').checked;
        
        try {
            // Close modal
            this.ui.closeModal();
            
            // Show loading
            this.ui.showLoading();
            
            // Export backup if requested
            if (exportBefore) {
                await this.createBackup();
                this.notifications.show({
                    type: 'info',
                    message: 'Backup criado antes do reset'
                });
            }
            
            // Reset data
            await this.db.resetData(resetType);
            
            // Show success notification
            this.notifications.show({
                type: 'success',
                message: 'Dados resetados com sucesso!'
            });
            
            // Reload current page
            await this.loadPage(this.currentPage);
            
            // Update data status
            this.updateDataStatus();
            
        } catch (error) {
            console.error('❌ Erro ao resetar dados:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao resetar dados: ' + error.message
            });
        } finally {
            // Hide loading
            this.ui.hideLoading();
        }
    }
    
    async handleModalConfirm(data) {
        const { id, type } = data;
        
        switch (type) {
            case 'motorista':
                await this.confirmDeleteMotorista(id);
                break;
                
            case 'corrida':
                await this.confirmDeleteCorrida(id);
                break;
                
            case 'preco':
                await this.confirmDeletePrice(id);
                break;
                
            default:
                console.warn(`⚠️ Tipo de confirmação não reconhecido: ${type}`);
        }
    }
    
    async confirmDeleteMotorista(id) {
        try {
            await this.db.deleteMotorista(id);
            this.notifications.show({
                type: 'success',
                message: 'Motorista excluído com sucesso!'
            });
            
            // Close modal
            this.ui.closeModal();
            
            // Refresh tables
            await this.renderMotoristasTable();
            await this.updateDashboardStats();
            
            // Trigger data update event
            this.ui.triggerEvent('data:updated');
            
        } catch (error) {
            console.error('❌ Erro ao excluir motorista:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao excluir motorista: ' + error.message
            });
        }
    }
    
    async confirmDeleteCorrida(id) {
        try {
            await this.db.deleteCorrida(id);
            this.notifications.show({
                type: 'success',
                message: 'Corrida excluída com sucesso!'
            });
            
            // Close modal
            this.ui.closeModal();
            
            // Refresh tables
            await this.renderRegistrarTable();
            await this.updateDashboardStats();
            
            // Update charts
            this.charts.updateCharts();
            
            // Trigger data update event
            this.ui.triggerEvent('data:updated');
            
        } catch (error) {
            console.error('❌ Erro ao excluir corrida:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao excluir corrida: ' + error.message
            });
        }
    }
    
    async confirmDeletePrice(bairro) {
        try {
            await this.db.deletePreco(bairro);
            this.notifications.show({
                type: 'success',
                message: 'Preço excluído com sucesso!'
            });
            
            // Close modal
            this.ui.closeModal();
            
            // Refresh prices table
            await this.loadPrices();
            
        } catch (error) {
            console.error('❌ Erro ao excluir preço:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao excluir preço: ' + error.message
            });
        }
    }
    
    toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
        this.ui.toggleSidebar(this.isSidebarCollapsed);
        
        // Save sidebar state
        localStorage.setItem('sidebarCollapsed', this.isSidebarCollapsed);
    }
    
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        
        // Save theme
        localStorage.setItem('theme', this.theme);
        
        // Update button icon
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            const icon = themeBtn.querySelector('i');
            if (icon) {
                icon.className = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.theme = savedTheme;
        } else {
            // Check for system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.theme = prefersDark ? 'dark' : 'light';
        }
        
        this.applyTheme();
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        
        // Update button icon
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            const icon = themeBtn.querySelector('i');
            if (icon) {
                icon.className = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
    }
    
    logout() {
        this.ui.openModal({
            type: 'confirm',
            title: 'Confirmar Saída',
            content: `
                <p>Tem certeza que deseja sair do sistema?</p>
                <p class="text-muted">Você será redirecionado para a tela de login.</p>
            `,
            size: 'sm',
            buttons: [
                {
                    text: 'Cancelar',
                    type: 'ghost',
                    action: 'close'
                },
                {
                    text: 'Sair',
                    type: 'primary',
                    action: 'custom',
                    callback: () => {
                        this.performLogout();
                    }
                }
            ]
        });
    }
    
    performLogout() {
        // Show loading
        this.ui.showLoading();
        
        // Clear sensitive data
        localStorage.removeItem('session');
        
        // Show logout message
        setTimeout(() => {
            this.notifications.show({
                type: 'info',
                message: 'Logout realizado com sucesso'
            });
            
            // In a real app, this would redirect to login
            // For now, just reload the app
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        }, 500);
    }
    
    async showNotifications() {
        try {
            const notifications = await this.db.getNotifications();
            this.ui.showNotificationsPanel(notifications);
        } catch (error) {
            console.error('❌ Erro ao carregar notificações:', error);
        }
    }
    
    async updateNotificationsCount() {
        try {
            const notifications = await this.db.getUnreadNotifications();
            const badge = document.getElementById('notification-count');
            if (badge) {
                badge.textContent = notifications.length;
                badge.style.display = notifications.length > 0 ? 'flex' : 'none';
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar contador de notificações:', error);
        }
    }
    
    handleSearch(searchTerm) {
        if (searchTerm.trim() === '') return;
        
        // Show search results modal
        this.ui.openModal({
            type: 'search',
            title: `Resultados para: "${searchTerm}"`,
            content: `
                <div class="text-center py-4">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <p>Buscando por: <strong>${searchTerm}</strong></p>
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                </div>
            `,
            size: 'lg',
            onOpen: async () => {
                await this.performSearch(searchTerm);
            }
        });
    }
    
    async performSearch(searchTerm) {
        try {
            const [corridas, motoristas] = await Promise.all([
                this.db.searchCorridas(searchTerm),
                this.db.searchMotoristas(searchTerm)
            ]);
            
            const modalContent = this.ui.getSearchResults(corridas, motoristas, searchTerm);
            
            // Update modal content
            const modalBody = document.querySelector('.modal-body');
            if (modalBody) {
                modalBody.innerHTML = modalContent;
            }
            
        } catch (error) {
            console.error('❌ Erro na busca:', error);
            
            const modalBody = document.querySelector('.modal-body');
            if (modalBody) {
                modalBody.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle"></i>
                        Erro ao realizar busca: ${error.message}
                    </div>
                `;
            }
        }
    }
    
    handleResize() {
        // Auto-collapse sidebar on mobile
        if (window.innerWidth < 768 && !this.isSidebarCollapsed) {
            this.ui.toggleSidebar(true);
        }
    }
    
    saveState() {
        // Save current page
        localStorage.setItem('currentPage', this.currentPage);
        
        // Save sidebar state
        localStorage.setItem('sidebarCollapsed', this.isSidebarCollapsed);
        
        // Save theme
        localStorage.setItem('theme', this.theme);
    }
    
    updateFooterYear() {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }
    
    updateLastUpdateTime() {
        const updateSpan = document.getElementById('last-update');
        if (updateSpan) {
            const now = new Date();
            updateSpan.textContent = now.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
    }
    
    updateDataStatus() {
        const statusSpan = document.getElementById('data-status');
        if (statusSpan) {
            // In a real app, this would check online/offline status
            // For now, just show online
            statusSpan.textContent = 'Dados: Online';
            statusSpan.style.color = 'var(--success-600)';
        }
    }
    
    startDashboardAutoRefresh() {
        // Auto-refresh dashboard every 30 seconds
        this.dashboardRefreshInterval = setInterval(() => {
            if (this.currentPage === 'dashboard') {
                this.updateDashboardStats();
                this.charts.updateCharts();
                this.updateLastUpdateTime();
            }
        }, 30000); // 30 seconds
    }
    
    stopDashboardAutoRefresh() {
        if (this.dashboardRefreshInterval) {
            clearInterval(this.dashboardRefreshInterval);
        }
    }
    
    // Cleanup
    destroy() {
        this.stopDashboardAutoRefresh();
        this.saveState();
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TaxiManagementSystem();
});

// Make app available globally
export default TaxiManagementSystem;