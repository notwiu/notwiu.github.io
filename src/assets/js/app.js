// Main Application Controller - Top Táxi PRO
import Database from './database.js';
import UI from './ui.js';
import Charts from './charts.js';
import Export from './export.js';
import Notifications from './notifications.js';

class TaxiManagementSystem {
    constructor() {
        this.db = null;
        this.ui = null;
        this.charts = null;
        this.export = null;
        this.notifications = null;
        
        this.currentPage = 'dashboard';
        this.isSidebarCollapsed = false;
        this.theme = 'light';
        this.isInitialized = false;
        
        // State management
        this.state = {
            isLoading: false,
            isOnline: true,
            lastSync: null,
            user: {
                name: 'Administrador',
                role: 'Supervisor',
                avatar: 'A'
            }
        };
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    async init() {
        if (this.isInitialized) return;
        
        console.log('🚕 Inicializando Sistema Top Táxi PRO v2.0...');
        
        try {
            // Set initial loading state
            this.state.isLoading = true;
            
            // Initialize core modules
            await this.initModules();
            
            // Setup application
            await this.setupApplication();
            
            // Load initial page
            await this.loadPage(this.currentPage);
            
            // Mark as initialized
            this.isInitialized = true;
            
            // Update status
            this.updateApplicationStatus();
            
            console.log('✅ Sistema inicializado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro crítico na inicialização:', error);
            this.handleCriticalError(error);
        } finally {
            this.state.isLoading = false;
        }
    }
    
    async initModules() {
        console.log('📦 Inicializando módulos...');
        
        // Initialize database
        this.db = new Database();
        await this.db.init();
        console.log('✅ Banco de dados inicializado');
        
        // Initialize notifications first
        this.notifications = new Notifications();
        console.log('✅ Sistema de notificações inicializado');
        
        // Initialize UI
        this.ui = new UI(this);
        console.log('✅ Interface do usuário inicializada');
        
        // Initialize charts
        this.charts = new Charts(this);
        console.log('✅ Gráficos inicializados');
        
        // Initialize export
        this.export = new Export(this);
        console.log('✅ Sistema de exportação inicializado');
    }
    
    async setupApplication() {
        console.log('⚙️ Configurando aplicação...');
        
        // Apply saved theme
        this.loadTheme();
        
        // Setup global event listeners
        this.setupEventListeners();
        
        // Update UI elements
        this.updateUIElements();
        
        // Initialize auto-refresh
        this.setupAutoRefresh();
        
        // Check for updates
        this.checkForUpdates();
    }
    
    setupEventListeners() {
        console.log('🎯 Configurando eventos...');
        
        // Navigation events
        this.setupNavigationEvents();
        
        // UI control events
        this.setupUIControlEvents();
        
        // Global application events
        this.setupGlobalEvents();
        
        // Window events
        this.setupWindowEvents();
    }
    
    setupNavigationEvents() {
        // Page navigation
        document.addEventListener('click', (e) => {
            const pageLink = e.target.closest('[data-page]');
            if (pageLink) {
                e.preventDefault();
                const page = pageLink.dataset.page;
                if (page && page !== this.currentPage) {
                    this.loadPage(page);
                }
                return;
            }
            
            // Handle dynamic action buttons
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn) {
                this.handleAction(actionBtn.dataset.action, actionBtn.dataset);
                return;
            }
        });
        
        // Browser navigation (back/forward)
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.loadPage(e.state.page, false);
            }
        });
    }
    
    setupUIControlEvents() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
        
        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => this.ui.toggleMobileMenu());
        }
        
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        // Notifications button
        const notificationsBtn = document.getElementById('notifications-btn');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => this.showNotifications());
        }
        
        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch(e.target.value);
                }
            });
        }
    }
    
    setupGlobalEvents() {
        // Modal events
        document.addEventListener('modal:open', (e) => {
            this.ui.openModal(e.detail);
        });
        
        document.addEventListener('modal:close', () => {
            this.ui.closeModal();
        });
        
        document.addEventListener('modal:confirm', async (e) => {
            await this.handleModalConfirm(e.detail);
        });
        
        // Notification events
        document.addEventListener('notification:show', (e) => {
            this.notifications.show(e.detail);
        });
        
        // Export events
        document.addEventListener('export:excel', (e) => {
            this.export.exportToExcel(e.detail.type, e.detail.data);
        });
        
        document.addEventListener('export:pdf', (e) => {
            this.export.exportToPDF(e.detail.type, e.detail.data);
        });
        
        // Data update events
        document.addEventListener('data:updated', () => {
            this.handleDataUpdate();
        });
        
        // Error events
        document.addEventListener('app:error', (e) => {
            this.handleError(e.detail);
        });
    }
    
    setupWindowEvents() {
        // Window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
        
        // Online/offline detection
        window.addEventListener('online', () => {
            this.state.isOnline = true;
            this.updateApplicationStatus();
            this.notifications.show({
                type: 'success',
                message: 'Conexão restaurada'
            });
        });
        
        window.addEventListener('offline', () => {
            this.state.isOnline = false;
            this.updateApplicationStatus();
            this.notifications.show({
                type: 'warning',
                message: 'Você está offline'
            });
        });
        
        // Before unload
        window.addEventListener('beforeunload', (e) => {
            this.saveState();
            
            if (this.state.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = 'Você tem alterações não salvas. Tem certeza que deseja sair?';
            }
        });
        
        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.onAppFocus();
            }
        });
    }
    
    async loadPage(page, updateHistory = true) {
        if (this.state.isLoading) return;
        
        console.log(`📄 Carregando página: ${page}`);
        
        try {
            this.state.isLoading = true;
            this.currentPage = page;
            
            // Show loading state
            this.ui.showPageLoading();
            
            // Update browser history
            if (updateHistory) {
                window.history.pushState({ page }, '', `#${page}`);
            }
            
            // Update navigation
            this.ui.updateNavigation(page);
            
            // Update page title
            this.ui.updatePageTitle(page);
            
            // Load page content
            await this.ui.loadPageContent(page);
            
            // Initialize page-specific features
            await this.initializePage(page);
            
            // Update last update time
            this.updateLastUpdateTime();
            
            // Scroll to top smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
        } catch (error) {
            console.error(`❌ Erro ao carregar página ${page}:`, error);
            
            this.notifications.show({
                type: 'error',
                title: 'Erro ao carregar página',
                message: error.message || 'Não foi possível carregar a página solicitada',
                actions: [{
                    text: 'Recarregar',
                    type: 'primary',
                    action: 'reload'
                }]
            });
            
            // Fallback to dashboard if error occurs
            if (page !== 'dashboard') {
                this.loadPage('dashboard');
            }
        } finally {
            this.state.isLoading = false;
            this.ui.hidePageLoading();
        }
    }
    
    async initializePage(page) {
        console.log(`🔄 Inicializando página: ${page}`);
        
        try {
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
        } catch (error) {
            console.error(`❌ Erro ao inicializar página ${page}:`, error);
            throw error;
        }
    }
    
    async initializeDashboard() {
        console.log('📊 Inicializando Dashboard...');
        
        try {
            // Load dashboard stats
            await this.loadDashboardStats();
            
            // Initialize charts
            await this.charts.initDashboardCharts();
            
            // Load recent rides
            await this.loadRecentRides();
            
            // Update notifications count
            await this.updateNotificationsCount();
            
            // Setup dashboard event listeners
            this.setupDashboardEvents();
            
        } catch (error) {
            console.error('❌ Erro ao inicializar dashboard:', error);
            throw error;
        }
    }
    
    async loadDashboardStats() {
        try {
            const stats = await this.db.getDashboardStats();
            this.ui.updateDashboardStats(stats);
        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao carregar estatísticas do dashboard'
            });
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
    
    setupDashboardEvents() {
        // Refresh chart button
        const refreshBtn = document.getElementById('refresh-chart');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.charts.updateCharts();
                this.notifications.show({
                    type: 'info',
                    message: 'Gráficos atualizados'
                });
            });
        }
        
        // View all rides button
        const viewAllBtn = document.getElementById('view-all-corridas');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                this.loadPage('registrar');
            });
        }
        
        // Quick action buttons
        const quickActions = document.querySelectorAll('.btn-outline-primary, .btn-outline-success, .btn-outline-warning, .btn-outline-info');
        quickActions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!e.target.closest('[onclick]')) {
                    e.preventDefault();
                }
            });
        });
    }
    
    async initializeRegistrar() {
        console.log('📝 Inicializando Registrar Corrida...');
        
        try {
            // Setup form
            this.setupRegistrarForm();
            
            // Load required data
            await Promise.all([
                this.loadBairros(),
                this.loadMotoristasForSelect(),
                this.loadCorridasHoje()
            ]);
            
            // Setup table events
            this.setupRegistrarTableEvents();
            
        } catch (error) {
            console.error('❌ Erro ao inicializar registrar:', error);
            throw error;
        }
    }
    
    setupRegistrarForm() {
        const form = document.getElementById('registrar-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = e.submitter;
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Validate form
            if (!this.validateCorridaForm(data)) {
                return;
            }
            
            try {
                // Show loading on button
                this.ui.showButtonLoading(submitBtn);
                
                // Add corrida
                await this.db.addCorrida(data);
                
                // Show success
                this.notifications.show({
                    type: 'success',
                    message: 'Corrida registrada com sucesso!'
                });
                
                // Reset form
                form.reset();
                
                // Refresh data
                await this.refreshRegistrarData();
                
            } catch (error) {
                console.error('❌ Erro ao registrar corrida:', error);
                this.notifications.show({
                    type: 'error',
                    message: `Erro: ${error.message}`
                });
            } finally {
                this.ui.hideButtonLoading(submitBtn);
            }
        });
        
        // Bairro change event for auto price
        const bairroSelect = document.getElementById('bairro');
        const valorInput = document.getElementById('valor');
        
        if (bairroSelect && valorInput) {
            bairroSelect.addEventListener('change', async () => {
                if (bairroSelect.value && !valorInput.value) {
                    const precoBase = await this.db.getPrecoBasePorBairro(bairroSelect.value);
                    if (precoBase) {
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
                this.notifications.show({
                    type: 'info',
                    message: 'Formulário limpo'
                });
            });
        }
    }
    
    validateCorridaForm(data) {
        const errors = [];
        
        if (!data.motorista?.trim()) {
            errors.push('Selecione um motorista');
        }
        
        if (!data.bairro?.trim()) {
            errors.push('Selecione um bairro');
        }
        
        if (!data.funcionarios?.trim()) {
            errors.push('Informe o número de funcionários');
        }
        
        if (data.valor && Number(data.valor) <= 0) {
            errors.push('Valor deve ser positivo');
        }
        
        if (errors.length > 0) {
            this.notifications.show({
                type: 'error',
                title: 'Corrija os seguintes erros:',
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
                // Keep first option, clear others
                while (select.options.length > 1) {
                    select.remove(1);
                }
                
                // Add bairros sorted
                bairros.sort((a, b) => a.nome.localeCompare(b.nome))
                    .forEach(bairro => {
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
                select.innerHTML = '<option value="">Selecione um motorista</option>';
                
                motoristas.sort((a, b) => a.nome.localeCompare(b.nome))
                    .forEach(motorista => {
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
    
    async loadCorridasHoje() {
        try {
            const corridas = await this.db.getCorridasHoje();
            this.ui.renderCorridasTable(corridas);
            
            // Update count
            const countElement = document.getElementById('corridas-count');
            if (countElement) {
                countElement.textContent = `${corridas.length} corrida${corridas.length !== 1 ? 's' : ''} registrada${corridas.length !== 1 ? 's' : ''} hoje`;
            }
        } catch (error) {
            console.error('❌ Erro ao carregar corridas de hoje:', error);
        }
    }
    
    setupRegistrarTableEvents() {
        // Event delegation for table actions
        document.addEventListener('click', async (e) => {
            const editBtn = e.target.closest('[data-action="edit-corrida"]');
            if (editBtn) {
                const id = editBtn.dataset.id;
                await this.editCorrida(id);
                return;
            }
            
            const deleteBtn = e.target.closest('[data-action="delete-corrida"]');
            if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                await this.deleteCorrida(id);
                return;
            }
        });
        
        // Export button
        const exportBtn = document.getElementById('export-hoje');
        if (exportBtn) {
            exportBtn.addEventListener('click', async () => {
                try {
                    const corridas = await this.db.getCorridasHoje();
                    await this.export.exportToExcel('corridas', corridas);
                } catch (error) {
                    console.error('❌ Erro ao exportar:', error);
                    this.notifications.show({
                        type: 'error',
                        message: 'Erro ao exportar corridas'
                    });
                }
            });
        }
        
        // Clear all button
        const clearAllBtn = document.getElementById('limpar-hoje');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.confirmClearTodayRides();
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
            
            // Open edit modal
            this.openEditCorridaModal(corrida);
            
        } catch (error) {
            console.error('❌ Erro ao editar corrida:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao carregar dados da corrida'
            });
        }
    }
    
    openEditCorridaModal(corrida) {
        // This would open a modal for editing
        // For now, show a notification
        this.notifications.show({
            type: 'info',
            message: `Editar corrida ${corrida.id} - Em desenvolvimento`
        });
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
            
            // Show confirmation
            this.ui.openModal({
                type: 'confirm',
                title: 'Confirmar Exclusão',
                content: `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>Tem certeza que deseja excluir esta corrida?</strong>
                    </div>
                    <div class="mt-3">
                        <strong>Detalhes:</strong><br>
                        Motorista: ${corrida.motorista}<br>
                        Bairro: ${corrida.bairro}<br>
                        Valor: R$ ${Number(corrida.valor).toFixed(2)}
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
    
    confirmClearTodayRides() {
        this.ui.openModal({
            type: 'confirm',
            title: 'Limpar Todas as Corridas de Hoje',
            content: `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Atenção!</strong><br>
                    Esta ação removerá todas as corridas registradas hoje.
                    Esta ação não pode ser desfeita.
                </div>
                <p>Deseja realmente continuar?</p>
            `,
            size: 'md',
            buttons: [
                {
                    text: 'Cancelar',
                    type: 'ghost',
                    action: 'close'
                },
                {
                    text: 'Limpar Tudo',
                    type: 'danger',
                    action: 'custom',
                    callback: async () => {
                        await this.clearTodayRides();
                    }
                }
            ]
        });
    }
    
    async clearTodayRides() {
        try {
            // Implement clearing logic here
            this.notifications.show({
                type: 'info',
                message: 'Funcionalidade em desenvolvimento'
            });
        } catch (error) {
            console.error('❌ Erro ao limpar corridas:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao limpar corridas'
            });
        }
    }
    
    async refreshRegistrarData() {
        await Promise.all([
            this.loadCorridasHoje(),
            this.loadDashboardStats()
        ]);
        
        // Update charts if on dashboard
        if (this.currentPage === 'dashboard') {
            this.charts.updateCharts();
        }
        
        // Trigger data update event
        this.triggerDataUpdate();
    }
    
    async initializeMotoristas() {
        console.log('👥 Inicializando Motoristas...');
        
        try {
            // Load motoristas
            await this.loadMotoristas();
            
            // Setup search and filters
            this.setupMotoristasFilters();
            
            // Setup event listeners
            this.setupMotoristasEvents();
            
        } catch (error) {
            console.error('❌ Erro ao inicializar motoristas:', error);
            throw error;
        }
    }
    
    async loadMotoristas() {
        try {
            const motoristas = await this.db.getMotoristas();
            this.ui.renderMotoristasTable(motoristas);
        } catch (error) {
            console.error('❌ Erro ao carregar motoristas:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao carregar lista de motoristas'
            });
        }
    }
    
    setupMotoristasFilters() {
        const searchInput = document.getElementById('motoristas-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filterMotoristas(e.target.value);
                }, 300);
            });
        }
        
        const filterSelect = document.getElementById('motoristas-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterMotoristasByStatus(e.target.value);
            });
        }
    }
    
    setupMotoristasEvents() {
        // Add motorista button
        const addBtn = document.getElementById('add-motorista-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.openAddMotoristaModal();
            });
        }
        
        // Export button
        const exportBtn = document.getElementById('export-motoristas');
        if (exportBtn) {
            exportBtn.addEventListener('click', async () => {
                try {
                    const motoristas = await this.db.getMotoristas();
                    await this.export.exportToExcel('motoristas', motoristas);
                } catch (error) {
                    console.error('❌ Erro ao exportar:', error);
                    this.notifications.show({
                        type: 'error',
                        message: 'Erro ao exportar motoristas'
                    });
                }
            });
        }
        
        // Event delegation for table actions
        document.addEventListener('click', async (e) => {
            const viewBtn = e.target.closest('[data-action="view-motorista"]');
            if (viewBtn) {
                const id = viewBtn.dataset.id;
                await this.viewMotoristaDetails(id);
                return;
            }
            
            const editBtn = e.target.closest('[data-action="edit-motorista"]');
            if (editBtn) {
                const id = editBtn.dataset.id;
                await this.editMotorista(id);
                return;
            }
            
            const deleteBtn = e.target.closest('[data-action="delete-motorista"]');
            if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                await this.deleteMotorista(id);
                return;
            }
        });
    }
    
    async filterMotoristas(searchTerm) {
        try {
            const motoristas = await this.db.getMotoristas();
            const filtered = motoristas.filter(motorista => {
                const term = searchTerm.toLowerCase();
                return motorista.nome?.toLowerCase().includes(term) ||
                       motorista.telefone?.toLowerCase().includes(term) ||
                       motorista.email?.toLowerCase().includes(term) ||
                       motorista.cpf?.toLowerCase().includes(term);
            });
            
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
                : motoristas.filter(m => m.status === status);
            
            this.ui.renderMotoristasTable(filtered);
        } catch (error) {
            console.error('❌ Erro ao filtrar por status:', error);
        }
    }
    
    openAddMotoristaModal() {
        this.ui.openModal({
            type: 'add-motorista',
            title: 'Adicionar Novo Motorista',
            content: `
                <form id="add-motorista-form">
                    <div class="form-group">
                        <label for="nome" class="form-label">Nome Completo *</label>
                        <input type="text" id="nome" class="form-control" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="telefone" class="form-label">Telefone</label>
                            <input type="tel" id="telefone" class="form-control">
                        </div>
                        
                        <div class="form-group">
                            <label for="email" class="form-label">E-mail</label>
                            <input type="email" id="email" class="form-control">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="cpf" class="form-label">CPF</label>
                        <input type="text" id="cpf" class="form-control" placeholder="000.000.000-00">
                    </div>
                    
                    <div class="form-group">
                        <label for="status" class="form-label">Status</label>
                        <select id="status" class="form-control">
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                            <option value="ferias">Férias</option>
                        </select>
                    </div>
                </form>
            `,
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
            ],
            onOpen: () => {
                const form = document.getElementById('add-motorista-form');
                if (form) {
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        await this.saveNewMotorista(new FormData(form));
                    });
                }
            }
        });
    }
    
    async saveNewMotorista(formData) {
        try {
            const data = {
                nome: formData.get('nome'),
                telefone: formData.get('telefone'),
                email: formData.get('email'),
                cpf: formData.get('cpf'),
                status: formData.get('status')
            };
            
            await this.db.addMotorista(data);
            
            this.notifications.show({
                type: 'success',
                message: 'Motorista adicionado com sucesso!'
            });
            
            this.ui.closeModal();
            await this.loadMotoristas();
            
        } catch (error) {
            console.error('❌ Erro ao salvar motorista:', error);
            this.notifications.show({
                type: 'error',
                message: `Erro: ${error.message}`
            });
        }
    }
    
    async viewMotoristaDetails(id) {
        try {
            const motorista = await this.db.getMotorista(id);
            if (!motorista) return;
            
            const corridas = await this.db.getCorridasPorMotorista(motorista.nome);
            
            this.ui.openModal({
                type: 'info',
                title: `Detalhes: ${motorista.nome}`,
                content: `
                    <div class="motorista-details">
                        <div class="text-center mb-4">
                            <div class="avatar avatar-xl bg-primary mb-3">
                                <span>${motorista.nome.charAt(0)}</span>
                            </div>
                            <h4>${motorista.nome}</h4>
                            <span class="badge ${this.getStatusClass(motorista.status)}">
                                ${this.getStatusText(motorista.status)}
                            </span>
                        </div>
                        
                        <div class="row mb-4">
                            <div class="col-6 text-center">
                                <div class="h4 mb-1">${corridas.length}</div>
                                <small class="text-muted">Total de Corridas</small>
                            </div>
                            <div class="col-6 text-center">
                                <div class="h4 mb-1">
                                    R$ ${corridas.reduce((sum, c) => sum + (Number(c.valor) || 0), 0).toFixed(2)}
                                </div>
                                <small class="text-muted">Faturamento Total</small>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <h6>Informações de Contato</h6>
                            <div class="list-group list-group-flush">
                                ${motorista.telefone ? `
                                    <div class="list-group-item d-flex justify-content-between">
                                        <span>Telefone:</span>
                                        <strong>${motorista.telefone}</strong>
                                    </div>
                                ` : ''}
                                ${motorista.email ? `
                                    <div class="list-group-item d-flex justify-content-between">
                                        <span>E-mail:</span>
                                        <strong>${motorista.email}</strong>
                                    </div>
                                ` : ''}
                                ${motorista.cpf ? `
                                    <div class="list-group-item d-flex justify-content-between">
                                        <span>CPF:</span>
                                        <strong>${motorista.cpf}</strong>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `,
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
            console.error('❌ Erro ao visualizar motorista:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao carregar detalhes do motorista'
            });
        }
    }
    
    async editMotorista(id) {
        // Similar to add modal but with existing data
        this.notifications.show({
            type: 'info',
            message: 'Editar motorista - Em desenvolvimento'
        });
    }
    
    async deleteMotorista(id) {
        try {
            const motorista = await this.db.getMotorista(id);
            if (!motorista) return;
            
            this.ui.openModal({
                type: 'confirm',
                title: 'Excluir Motorista',
                content: `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>Esta ação não pode ser desfeita!</strong>
                    </div>
                    <p>Tem certeza que deseja excluir o motorista <strong>${motorista.nome}</strong>?</p>
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
    
    async initializeRotas() {
        console.log('🗺️ Inicializando Rotas...');
        
        // Placeholder for routes functionality
        this.notifications.show({
            type: 'info',
            message: 'Módulo de rotas em desenvolvimento'
        });
    }
    
    async initializeVeiculos() {
        console.log('🚗 Inicializando Veículos...');
        
        // Placeholder for vehicles functionality
        this.notifications.show({
            type: 'info',
            message: 'Módulo de veículos em desenvolvimento'
        });
    }
    
    async initializeRelatorios() {
        console.log('📈 Inicializando Relatórios...');
        
        try {
            // Load report data
            await this.loadRelatoriosData();
            
            // Setup report filters and events
            this.setupRelatoriosEvents();
            
        } catch (error) {
            console.error('❌ Erro ao inicializar relatórios:', error);
            throw error;
        }
    }
    
    async loadRelatoriosData() {
        try {
            const reports = await this.db.getRelatoriosData();
            this.ui.renderRelatorios(reports);
        } catch (error) {
            console.error('❌ Erro ao carregar relatórios:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao carregar dados de relatórios'
            });
        }
    }
    
    setupRelatoriosEvents() {
        // Apply filter button
        const applyFilterBtn = document.getElementById('apply-filter');
        if (applyFilterBtn) {
            applyFilterBtn.addEventListener('click', async () => {
                await this.applyReportFilters();
            });
        }
        
        // Export buttons
        const excelBtn = document.getElementById('export-excel');
        if (excelBtn) {
            excelBtn.addEventListener('click', async () => {
                try {
                    const filters = this.getReportFilters();
                    const data = await this.db.getRelatoriosData(filters);
                    await this.export.exportToExcel('relatorios', data);
                } catch (error) {
                    console.error('❌ Erro ao exportar:', error);
                    this.notifications.show({
                        type: 'error',
                        message: 'Erro ao exportar relatório'
                    });
                }
            });
        }
        
        const pdfBtn = document.getElementById('export-pdf');
        if (pdfBtn) {
            pdfBtn.addEventListener('click', async () => {
                try {
                    const filters = this.getReportFilters();
                    const data = await this.db.getRelatoriosData(filters);
                    await this.export.exportToPDF('relatorios', data);
                } catch (error) {
                    console.error('❌ Erro ao exportar:', error);
                    this.notifications.show({
                        type: 'error',
                        message: 'Erro ao exportar relatório'
                    });
                }
            });
        }
    }
    
    getReportFilters() {
        const filters = {};
        
        const startDate = document.getElementById('report-start-date');
        const endDate = document.getElementById('report-end-date');
        const motorista = document.getElementById('report-motorista');
        const bairro = document.getElementById('report-bairro');
        
        if (startDate && startDate.value) filters.startDate = startDate.value;
        if (endDate && endDate.value) filters.endDate = endDate.value;
        if (motorista && motorista.value) filters.motorista = motorista.value;
        if (bairro && bairro.value) filters.bairro = bairro.value;
        
        return filters;
    }
    
    async applyReportFilters() {
        try {
            const filters = this.getReportFilters();
            const reports = await this.db.getRelatoriosData(filters);
            this.ui.renderRelatorios(reports);
            
            this.notifications.show({
                type: 'success',
                message: 'Filtros aplicados com sucesso'
            });
        } catch (error) {
            console.error('❌ Erro ao aplicar filtros:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao aplicar filtros'
            });
        }
    }
    
    async initializeFinanceiro() {
        console.log('💰 Inicializando Financeiro...');
        
        try {
            // Load financial data
            await this.loadFinanceiroData();
            
            // Setup financial charts
            await this.charts.initFinanceiroCharts();
            
            // Setup events
            this.setupFinanceiroEvents();
            
        } catch (error) {
            console.error('❌ Erro ao inicializar financeiro:', error);
            throw error;
        }
    }
    
    async loadFinanceiroData() {
        try {
            const financeiro = await this.db.getFinanceiroData();
            this.ui.renderFinanceiro(financeiro);
        } catch (error) {
            console.error('❌ Erro ao carregar dados financeiros:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao carregar dados financeiros'
            });
        }
    }
    
    setupFinanceiroEvents() {
        // Add revenue button
        const addRevenueBtn = document.getElementById('add-revenue');
        if (addRevenueBtn) {
            addRevenueBtn.addEventListener('click', () => {
                this.openAddTransactionModal('revenue');
            });
        }
        
        // Add expense button
        const addExpenseBtn = document.getElementById('add-expense');
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => {
                this.openAddTransactionModal('expense');
            });
        }
        
        // Export buttons
        const exportExcelBtn = document.getElementById('export-finance-excel');
        if (exportExcelBtn) {
            exportExcelBtn.addEventListener('click', async () => {
                try {
                    const data = await this.db.getFinanceiroData();
                    await this.export.exportToExcel('financeiro', data);
                } catch (error) {
                    console.error('❌ Erro ao exportar:', error);
                    this.notifications.show({
                        type: 'error',
                        message: 'Erro ao exportar dados financeiros'
                    });
                }
            });
        }
        
        const exportPdfBtn = document.getElementById('export-finance-pdf');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', async () => {
                try {
                    const data = await this.db.getFinanceiroData();
                    await this.export.exportToPDF('financeiro', data);
                } catch (error) {
                    console.error('❌ Erro ao exportar:', error);
                    this.notifications.show({
                        type: 'error',
                        message: 'Erro ao exportar dados financeiros'
                    });
                }
            });
        }
    }
    
    openAddTransactionModal(type) {
        const isRevenue = type === 'revenue';
        const title = isRevenue ? 'Adicionar Receita' : 'Adicionar Despesa';
        const categories = isRevenue 
            ? ['corridas', 'mensalidades', 'outros']
            : ['combustivel', 'manutencao', 'seguro', 'impostos', 'salarios', 'outros'];
        
        this.ui.openModal({
            type: 'add-transaction',
            title: title,
            content: `
                <form id="add-transaction-form">
                    <div class="form-group">
                        <label for="description" class="form-label">Descrição *</label>
                        <input type="text" id="description" class="form-control" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="amount" class="form-label">Valor (R$) *</label>
                            <input type="number" id="amount" class="form-control" step="0.01" min="0" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="category" class="form-label">Categoria *</label>
                            <select id="category" class="form-control" required>
                                <option value="">Selecione...</option>
                                ${categories.map(cat => `
                                    <option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="date" class="form-label">Data *</label>
                        <input type="date" id="date" class="form-control" required value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    
                    <div class="form-group">
                        <label for="notes" class="form-label">Observações</label>
                        <textarea id="notes" class="form-control" rows="3"></textarea>
                    </div>
                </form>
            `,
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
                    formId: 'add-transaction-form'
                }
            ],
            onOpen: () => {
                const form = document.getElementById('add-transaction-form');
                if (form) {
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        await this.saveTransaction(type, new FormData(form));
                    });
                }
            }
        });
    }
    
    async saveTransaction(type, formData) {
        try {
            const data = {
                tipo: type,
                description: formData.get('description'),
                amount: formData.get('amount'),
                category: formData.get('category'),
                date: formData.get('date'),
                notes: formData.get('notes')
            };
            
            await this.db.addFinancialTransaction(data);
            
            this.notifications.show({
                type: 'success',
                message: `${type === 'revenue' ? 'Receita' : 'Despesa'} adicionada com sucesso!`
            });
            
            this.ui.closeModal();
            await this.loadFinanceiroData();
            this.charts.updateFinanceiroCharts();
            
        } catch (error) {
            console.error('❌ Erro ao salvar transação:', error);
            this.notifications.show({
                type: 'error',
                message: `Erro: ${error.message}`
            });
        }
    }
    
    async initializeConfiguracoes() {
        console.log('⚙️ Inicializando Configurações...');
        
        try {
            // Load settings
            await this.loadConfiguracoes();
            
            // Setup settings form
            this.setupConfiguracoesForm();
            
            // Load prices
            await this.loadPrices();
            
            // Setup events
            this.setupConfiguracoesEvents();
            
        } catch (error) {
            console.error('❌ Erro ao inicializar configurações:', error);
            throw error;
        }
    }
    
    async loadConfiguracoes() {
        try {
            const settings = await this.db.getConfiguracoes();
            this.ui.renderConfiguracoes(settings);
        } catch (error) {
            console.error('❌ Erro ao carregar configurações:', error);
        }
    }
    
    async loadPrices() {
        try {
            const prices = await this.db.getPrecosBase();
            this.ui.renderPricesTable(prices);
        } catch (error) {
            console.error('❌ Erro ao carregar preços:', error);
        }
    }
    
    setupConfiguracoesForm() {
        const form = document.getElementById('configuracoes-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
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
                    message: 'Erro ao salvar configurações'
                });
            }
        });
    }
    
    setupConfiguracoesEvents() {
        // Add price button
        const addPriceBtn = document.getElementById('add-price');
        if (addPriceBtn) {
            addPriceBtn.addEventListener('click', () => {
                this.openAddPriceModal();
            });
        }
        
        // Reset settings button
        const resetBtn = document.getElementById('reset-configuracoes');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.confirmResetSettings();
            });
        }
        
        // Check consistency button
        const checkBtn = document.getElementById('check-consistency');
        if (checkBtn) {
            checkBtn.addEventListener('click', async () => {
                await this.checkDataConsistency();
            });
        }
        
        // Clear cache button
        const clearCacheBtn = document.getElementById('clear-cache');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => {
                this.clearCache();
            });
        }
    }
    
    openAddPriceModal() {
        this.ui.openModal({
            type: 'add-price',
            title: 'Adicionar Preço por Bairro',
            content: `
                <form id="add-price-form">
                    <div class="form-group">
                        <label for="bairro" class="form-label">Bairro *</label>
                        <input type="text" id="bairro" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="valor" class="form-label">Valor (R$) *</label>
                        <input type="number" id="valor" class="form-control" step="0.01" min="0" required>
                    </div>
                </form>
            `,
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
            ],
            onOpen: () => {
                const form = document.getElementById('add-price-form');
                if (form) {
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        await this.savePrice(new FormData(form));
                    });
                }
            }
        });
    }
    
    async savePrice(formData) {
        try {
            const data = {
                bairro: formData.get('bairro'),
                valor: formData.get('valor')
            };
            
            await this.db.addPreco(data);
            
            this.notifications.show({
                type: 'success',
                message: 'Preço adicionado com sucesso!'
            });
            
            this.ui.closeModal();
            await this.loadPrices();
            
        } catch (error) {
            console.error('❌ Erro ao salvar preço:', error);
            this.notifications.show({
                type: 'error',
                message: `Erro: ${error.message}`
            });
        }
    }
    
    confirmResetSettings() {
        this.ui.openModal({
            type: 'confirm',
            title: 'Restaurar Configurações Padrão',
            content: `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Atenção!</strong><br>
                    Esta ação restaurará todas as configurações para os valores padrão.
                    Suas configurações personalizadas serão perdidas.
                </div>
                <p>Deseja realmente continuar?</p>
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
                        await this.resetSettings();
                    }
                }
            ]
        });
    }
    
    async resetSettings() {
        try {
            await this.db.resetConfiguracoes();
            
            this.notifications.show({
                type: 'success',
                message: 'Configurações restauradas para padrão!'
            });
            
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
    
    async checkDataConsistency() {
        try {
            const result = await this.db.checkDataConsistency();
            
            if (result.hasIssues) {
                this.ui.openModal({
                    type: 'info',
                    title: 'Verificação de Dados',
                    content: `
                        <div class="alert alert-${result.issues.length > 0 ? 'warning' : 'success'}">
                            <i class="fas fa-${result.issues.length > 0 ? 'exclamation-triangle' : 'check-circle'}"></i>
                            <strong>${result.issues.length > 0 ? 'Problemas encontrados!' : 'Dados consistentes!'}</strong>
                        </div>
                        <div class="mt-3">
                            <strong>Resumo:</strong><br>
                            • Corridas: ${result.summary.totalCorridas}<br>
                            • Motoristas: ${result.summary.totalMotoristas}<br>
                            • Preços: ${result.summary.totalPrecos}<br>
                            • Problemas: ${result.summary.totalIssues}
                        </div>
                        ${result.issues.length > 0 ? `
                            <div class="mt-3">
                                <strong>Problemas encontrados:</strong>
                                <div class="mt-2" style="max-height: 200px; overflow-y: auto;">
                                    ${result.issues.map((issue, i) => `
                                        <div class="alert alert-sm alert-warning mb-1">
                                            ${i + 1}. ${issue.message}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    `,
                    size: 'md',
                    buttons: [
                        {
                            text: 'Fechar',
                            type: 'ghost',
                            action: 'close'
                        },
                        result.issues.length > 0 ? {
                            text: 'Corrigir Automaticamente',
                            type: 'primary',
                            action: 'custom',
                            callback: async () => {
                                await this.fixDataIssues(result.issues);
                            }
                        } : null
                    ].filter(Boolean)
                });
            } else {
                this.notifications.show({
                    type: 'success',
                    message: 'Verificação concluída: Dados consistentes!'
                });
            }
            
        } catch (error) {
            console.error('❌ Erro ao verificar consistência:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao verificar consistência dos dados'
            });
        }
    }
    
    async fixDataIssues(issues) {
        try {
            const fixes = await this.db.fixDataIssues(issues);
            
            this.notifications.show({
                type: 'success',
                message: `${fixes.length} problemas corrigidos automaticamente`
            });
            
            this.ui.closeModal();
            
            // Refresh current page
            await this.loadPage(this.currentPage);
            
        } catch (error) {
            console.error('❌ Erro ao corrigir problemas:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao corrigir problemas de dados'
            });
        }
    }
    
    clearCache() {
        try {
            // Clear page templates cache
            if (this.ui.pageTemplates) {
                this.ui.pageTemplates.clear();
            }
            
            // Clear browser cache for CSS/JS
            if ('caches' in window) {
                caches.keys().then(cacheNames => {
                    cacheNames.forEach(cacheName => {
                        caches.delete(cacheName);
                    });
                });
            }
            
            this.notifications.show({
                type: 'success',
                message: 'Cache limpo com sucesso!'
            });
            
            // Suggest page reload
            setTimeout(() => {
                this.ui.openModal({
                    type: 'info',
                    title: 'Recarregar Página',
                    content: `
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle"></i>
                            <strong>Cache limpo!</strong><br>
                            Para aplicar completamente as alterações, recomenda-se recarregar a página.
                        </div>
                    `,
                    size: 'sm',
                    buttons: [
                        {
                            text: 'Agora não',
                            type: 'ghost',
                            action: 'close'
                        },
                        {
                            text: 'Recarregar',
                            type: 'primary',
                            action: 'custom',
                            callback: () => {
                                window.location.reload();
                            }
                        }
                    ]
                });
            }, 1000);
            
        } catch (error) {
            console.error('❌ Erro ao limpar cache:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao limpar cache'
            });
        }
    }
    
    async initializeBackup() {
        console.log('💾 Inicializando Backup...');
        
        try {
            // Load backup info
            await this.loadBackupInfo();
            
            // Setup backup events
            this.setupBackupEvents();
            
        } catch (error) {
            console.error('❌ Erro ao inicializar backup:', error);
            throw error;
        }
    }
    
    async loadBackupInfo() {
        try {
            const backupInfo = await this.db.getBackupInfo();
            this.ui.renderBackupInfo(backupInfo);
        } catch (error) {
            console.error('❌ Erro ao carregar informações de backup:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao carregar informações de backup'
            });
        }
    }
    
    setupBackupEvents() {
        // Create backup button
        const backupBtn = document.getElementById('backup-btn');
        if (backupBtn) {
            backupBtn.addEventListener('click', async () => {
                await this.createBackup();
            });
        }
        
        // Import backup button
        const importBtn = document.getElementById('import-backup');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.openImportBackupModal();
            });
        }
        
        // Export backup button
        const exportBtn = document.getElementById('export-backup');
        if (exportBtn) {
            exportBtn.addEventListener('click', async () => {
                await this.exportBackup();
            });
        }
        
        // Restore backup button
        const restoreBtn = document.getElementById('restore-btn');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', () => {
                this.openRestoreModal();
            });
        }
        
        // Reset data button
        const resetBtn = document.getElementById('reset-data');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.confirmResetData();
            });
        }
    }
    
    async createBackup() {
        try {
            await this.db.createBackup();
            
            this.notifications.show({
                type: 'success',
                message: 'Backup criado com sucesso!'
            });
            
            await this.loadBackupInfo();
            
        } catch (error) {
            console.error('❌ Erro ao criar backup:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao criar backup'
            });
        }
    }
    
    async exportBackup() {
        try {
            const backupData = await this.db.backupData();
            await this.export.exportBackup(backupData);
            
        } catch (error) {
            console.error('❌ Erro ao exportar backup:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao exportar backup'
            });
        }
    }
    
    openImportBackupModal() {
        this.notifications.show({
            type: 'info',
            message: 'Importar backup - Em desenvolvimento'
        });
    }
    
    openRestoreModal() {
        this.notifications.show({
            type: 'info',
            message: 'Restaurar backup - Em desenvolvimento'
        });
    }
    
    confirmResetData() {
        this.ui.openModal({
            type: 'confirm',
            title: 'Resetar Todos os Dados',
            content: `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>ATENÇÃO CRÍTICA!</strong><br>
                    Esta ação removerá permanentemente TODOS os dados do sistema.
                    <br><br>
                    <strong>Esta ação não pode ser desfeita!</strong>
                </div>
                <div class="mt-3">
                    <strong>Serão removidos:</strong><br>
                    • Todas as corridas<br>
                    • Todos os motoristas<br>
                    • Todos os dados financeiros<br>
                    • Todos os backups<br>
                    • Configurações personalizadas
                </div>
                <div class="mt-3">
                    <div class="form-check">
                        <input type="checkbox" id="confirm-understand" class="form-check-input">
                        <label for="confirm-understand" class="form-check-label">
                            Eu entendo que todos os dados serão perdidos permanentemente
                        </label>
                    </div>
                    <div class="form-check mt-2">
                        <input type="checkbox" id="confirm-backup" class="form-check-input" checked>
                        <label for="confirm-backup" class="form-check-label">
                            Exportar backup antes de resetar (recomendado)
                        </label>
                    </div>
                </div>
            `,
            size: 'lg',
            buttons: [
                {
                    text: 'Cancelar',
                    type: 'ghost',
                    action: 'close'
                },
                {
                    text: 'Resetar Dados',
                    type: 'danger',
                    action: 'custom',
                    callback: () => {
                        this.resetAllData();
                    },
                    disabled: true
                }
            ],
            onOpen: () => {
                const confirmCheckbox = document.getElementById('confirm-understand');
                const resetBtn = document.querySelector('.modal-footer .btn-danger');
                
                if (confirmCheckbox && resetBtn) {
                    confirmCheckbox.addEventListener('change', (e) => {
                        resetBtn.disabled = !e.target.checked;
                    });
                }
            }
        });
    }
    
    async resetAllData() {
        try {
            const exportBackup = document.getElementById('confirm-backup')?.checked;
            
            if (exportBackup) {
                await this.exportBackup();
            }
            
            await this.db.resetData('todos');
            
            this.notifications.show({
                type: 'success',
                message: 'Todos os dados foram resetados!'
            });
            
            this.ui.closeModal();
            
            // Reload application
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('❌ Erro ao resetar dados:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao resetar dados'
            });
        }
    }
    
    async handleModalConfirm(data) {
        const { id, type } = data;
        
        try {
            switch(type) {
                case 'corrida':
                    await this.confirmDeleteCorrida(id);
                    break;
                    
                case 'motorista':
                    await this.confirmDeleteMotorista(id);
                    break;
                    
                default:
                    console.warn(`⚠️ Tipo de confirmação não reconhecido: ${type}`);
            }
        } catch (error) {
            console.error('❌ Erro ao processar confirmação:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao processar ação'
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
            
            this.ui.closeModal();
            await this.refreshRegistrarData();
            
        } catch (error) {
            console.error('❌ Erro ao excluir corrida:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao excluir corrida'
            });
        }
    }
    
    async confirmDeleteMotorista(id) {
        try {
            await this.db.deleteMotorista(id);
            
            this.notifications.show({
                type: 'success',
                message: 'Motorista excluído com sucesso!'
            });
            
            this.ui.closeModal();
            await this.loadMotoristas();
            await this.loadDashboardStats();
            
        } catch (error) {
            console.error('❌ Erro ao excluir motorista:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao excluir motorista'
            });
        }
    }
    
    handleAction(action, data) {
        console.log(`🎯 Ação: ${action}`, data);
        
        switch(action) {
            case 'reload':
                window.location.reload();
                break;
                
            case 'print':
                window.print();
                break;
                
            case 'help':
                this.showHelp();
                break;
                
            default:
                console.warn(`⚠️ Ação não reconhecida: ${action}`);
        }
    }
    
    async handleSearch(searchTerm) {
        if (!searchTerm.trim()) return;
        
        try {
            const [corridas, motoristas] = await Promise.all([
                this.db.searchCorridas(searchTerm),
                this.db.searchMotoristas(searchTerm)
            ]);
            
            this.ui.openModal({
                type: 'search',
                title: `Resultados para: "${searchTerm}"`,
                content: this.getSearchResultsContent(corridas, motoristas, searchTerm),
                size: 'lg'
            });
            
        } catch (error) {
            console.error('❌ Erro na busca:', error);
            this.notifications.show({
                type: 'error',
                message: 'Erro ao realizar busca'
            });
        }
    }
    
    getSearchResultsContent(corridas, motoristas, searchTerm) {
        if (corridas.length === 0 && motoristas.length === 0) {
            return `
                <div class="text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4>Nenhum resultado encontrado</h4>
                    <p class="text-muted">Não foram encontrados resultados para "${searchTerm}"</p>
                </div>
            `;
        }
        
        return `
            <div class="search-results">
                ${corridas.length > 0 ? `
                    <div class="mb-4">
                        <h5>Corridas (${corridas.length})</h5>
                        <div class="list-group">
                            ${corridas.slice(0, 5).map(c => `
                                <a href="#" class="list-group-item list-group-item-action" data-action="view-corrida" data-id="${c.id}">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">${c.motorista} → ${c.bairro}</h6>
                                        <small class="text-success">R$ ${Number(c.valor).toFixed(2)}</small>
                                    </div>
                                    <p class="mb-1">${c.funcionarios} • ${new Date(c.data).toLocaleDateString('pt-BR')}</p>
                                </a>
                            `).join('')}
                        </div>
                        ${corridas.length > 5 ? `<p class="text-muted mt-2">... e mais ${corridas.length - 5} resultados</p>` : ''}
                    </div>
                ` : ''}
                
                ${motoristas.length > 0 ? `
                    <div>
                        <h5>Motoristas (${motoristas.length})</h5>
                        <div class="list-group">
                            ${motoristas.slice(0, 5).map(m => `
                                <a href="#" class="list-group-item list-group-item-action" data-action="view-motorista" data-id="${m.id}">
                                    <div class="d-flex w-100 justify-content-between align-items-center">
                                        <div>
                                            <h6 class="mb-1">${m.nome}</h6>
                                            <small class="text-muted">${m.telefone || 'Sem telefone'}</small>
                                        </div>
                                        <span class="badge ${this.getStatusClass(m.status)}">
                                            ${this.getStatusText(m.status)}
                                        </span>
                                    </div>
                                </a>
                            `).join('')}
                        </div>
                        ${motoristas.length > 5 ? `<p class="text-muted mt-2">... e mais ${motoristas.length - 5} resultados</p>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    showHelp() {
        this.ui.openModal({
            type: 'help',
            title: 'Ajuda - Top Táxi PRO',
            content: `
                <div class="help-content">
                    <h5>Como usar o sistema:</h5>
                    <div class="accordion mt-3" id="help-accordion">
                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#help-dashboard">
                                    <i class="fas fa-home me-2"></i> Dashboard
                                </button>
                            </h2>
                            <div id="help-dashboard" class="accordion-collapse collapse show" data-bs-parent="#help-accordion">
                                <div class="accordion-body">
                                    <p>O Dashboard mostra uma visão geral do sistema:</p>
                                    <ul>
                                        <li>Estatísticas atualizadas</li>
                                        <li>Gráficos de desempenho</li>
                                        <li>Últimas corridas</li>
                                        <li>Ações rápidas</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#help-registrar">
                                    <i class="fas fa-plus-circle me-2"></i> Registrar Corrida
                                </button>
                            </h2>
                            <div id="help-registrar" class="accordion-collapse collapse" data-bs-parent="#help-accordion">
                                <div class="accordion-body">
                                    <p>Para registrar uma nova corrida:</p>
                                    <ol>
                                        <li>Selecione o motorista</li>
                                        <li>Escolha o bairro de destino</li>
                                        <li>Informe o número de funcionários</li>
                                        <li>O valor será calculado automaticamente</li>
                                        <li>Clique em "Salvar Corrida"</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="alert alert-info mt-4">
                        <i class="fas fa-life-ring"></i>
                        <strong>Precisa de mais ajuda?</strong><br>
                        Entre em contato com o suporte: suporte@toptaxi.com
                    </div>
                </div>
            `,
            size: 'lg',
            buttons: [
                {
                    text: 'Fechar',
                    type: 'ghost',
                    action: 'close'
                }
            ]
        });
    }
    
    async showNotifications() {
        try {
            const notifications = await this.db.getNotifications({ limit: 10 });
            
            if (notifications.length === 0) {
                this.notifications.show({
                    type: 'info',
                    message: 'Nenhuma notificação pendente'
                });
                return;
            }
            
            this.ui.openModal({
                type: 'notifications',
                title: `Notificações (${notifications.length})`,
                content: `
                    <div class="notifications-list">
                        ${notifications.map(notif => `
                            <div class="notification-item ${notif.lida ? 'read' : 'unread'}">
                                <div class="notification-icon">
                                    <i class="fas fa-${this.getNotificationIcon(notif.tipo)}"></i>
                                </div>
                                <div class="notification-content">
                                    <div class="notification-title">${notif.titulo}</div>
                                    <div class="notification-message">${notif.mensagem}</div>
                                    <div class="notification-time">
                                        ${new Date(notif.data || notif.createdAt).toLocaleString('pt-BR')}
                                    </div>
                                </div>
                                ${!notif.lida ? `
                                    <button class="btn btn-sm btn-ghost" data-action="mark-read" data-id="${notif.id}">
                                        <i class="fas fa-check"></i>
                                    </button>` : ''}
                        </div>
                    `).join('')}
                </div>
            `,
            size: 'md',
            buttons: [
                {
                    text: 'Marcar todas como lidas',
                    type: 'ghost',
                    action: 'custom',
                    callback: async () => {
                        await this.markAllNotificationsAsRead();
                    }
                },
                {
                    text: 'Fechar',
                    type: 'primary',
                    action: 'close'
                }
            ]
        });

    } catch (error) {
        console.error('❌ Erro ao mostrar notificações:', error);
    }
}

getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        case 'info':
        default:
            return 'info-circle';
    }
}

async markAllNotificationsAsRead() {
    try {
        await this.db.markAllNotificationsAsRead();
        this.notifications.show({
            type: 'success',
            message: 'Todas as notificações foram marcadas como lidas.'
        });
        this.ui.closeModal();
        await this.updateNotificationsCount();
    } catch (error) {
        console.error('❌ Erro ao marcar notificações como lidas:', error);
    }
}

async updateNotificationsCount() {
    try {
        const unread = await this.db.getUnreadNotifications();
        const count = unread.length;
        const badge = document.getElementById('notifications-badge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar contagem de notificações:', error);
    }
}

// ===== Theme Management =====

loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.theme = savedTheme;
    this.applyTheme();
}

toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme();
    localStorage.setItem('theme', this.theme);
    this.notifications.show({
        type: 'info',
        message: `Tema alterado para ${this.theme === 'light' ? 'Claro' : 'Escuro'}`
    });
}

applyTheme() {
    document.body.className = `theme-${this.theme}`;
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.className = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// ===== UI & State Updates =====

updateUIElements() {
    // Update user info in sidebar
    const userName = document.getElementById('user-name');
    const userRole = document.getElementById('user-role');
    if (userName) userName.textContent = this.state.user.name;
    if (userRole) userRole.textContent = this.state.user.role;
}

updateApplicationStatus() {
    const statusIndicator = document.getElementById('status-indicator');
    if (statusIndicator) {
        statusIndicator.className = `status-indicator ${this.state.isOnline ? 'online' : 'offline'}`;
        statusIndicator.title = this.state.isOnline ? 'Online' : 'Offline';
    }
}

updateLastUpdateTime() {
    const lastUpdateElement = document.getElementById('last-update-time');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = new Date().toLocaleTimeString('pt-BR');
    }
}

toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.ui.toggleSidebar(this.isSidebarCollapsed);
    localStorage.setItem('sidebarCollapsed', this.isSidebarCollapsed);
}

// ===== Data & Event Handling =====

async handleDataUpdate() {
    console.log('🔄 Dados atualizados, recarregando página...');
    await this.loadPage(this.currentPage, false);
}

triggerDataUpdate() {
    document.dispatchEvent(new CustomEvent('data:updated'));
}

onAppFocus() {
    console.log('✨ Aplicação em foco, verificando atualizações...');
    this.handleDataUpdate();
}

handleResize() {
    // Handle responsive changes if needed
    if (window.innerWidth < 768) {
        this.ui.hideMobileMenu();
    }
}

// ===== Application Lifecycle =====

setupAutoRefresh() {
    // Refresh data every 5 minutes
    setInterval(() => {
        if (this.currentPage === 'dashboard') {
            this.handleDataUpdate();
        }
    }, 300000);
}

checkForUpdates() {
    // Placeholder for version checking or PWA updates
    console.log('🔍 Verificando atualizações...');
}

saveState() {
    // Save any important state before unload
    localStorage.setItem('lastPage', this.currentPage);
}

logout() {
    this.notifications.show({
        type: 'info',
        message: 'Saindo do sistema...'
    });
    // In a real app, this would clear session/token and redirect
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

// ===== Error Handling =====

handleError(error) {
    console.error('❗ Erro na aplicação:', error);
    this.notifications.show({
        type: 'error',
        title: error.title || 'Ocorreu um Erro',
        message: error.message || 'Uma operação falhou. Tente novamente.'
    });
}

handleCriticalError(error) {
    console.error('💥 Erro Crítico:', error);
    const errorOverlay = document.createElement('div');
    errorOverlay.id = 'critical-error-overlay';
    errorOverlay.innerHTML = `
        <div class="error-content">
            <i class="fas fa-bomb fa-3x"></i>
            <h2>Erro Crítico</h2>
            <p>O sistema encontrou um erro fatal e não pode continuar.</p>
            <p class="error-message"><strong>Detalhes:</strong> ${error.message}</p>
            <div class="error-actions">
                <button onclick="location.reload()">
                    <i class="fas fa-sync-alt"></i> Recarregar
                </button>
                <button onclick="localStorage.clear(); location.reload();">
                    <i class="fas fa-trash"></i> Limpar Dados e Recarregar
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(errorOverlay);
}
}

// ===== Initialize Application =====

window.app = new TaxiManagementSystem();