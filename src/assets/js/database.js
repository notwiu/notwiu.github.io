// Database Management with IndexedDB
const { DateTime } = luxon;

export default class Database {
    constructor() {
        this.dbName = 'taxi-management-system';
        this.version = 3; // Increment when schema changes
        this.db = null;
        
        // Default prices by neighborhood
        this.defaultPrices = {
            'Auto do Mateus': 70,
            'Bairro das Indústrias': 80,
            'Cristo': 60,
            'Funcionários': 50,
            'Geisel': 50,
            'João Paulo': 50,
            'Mangabeira': 40,
            'Praia do Sol': 50,
            'Valentina': 40,
            'Santa Rita': 100
        };
    }
    
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = (event) => {
                console.error('❌ Erro ao abrir IndexedDB:', event.target.error);
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✅ IndexedDB aberto com sucesso');
                
                // Initialize default data if needed
                this.initializeDefaultData().then(resolve).catch(reject);
            };
            
            request.onupgradeneeded = (event) => {
                console.log('🔄 Atualizando schema do IndexedDB...');
                this.upgradeDatabase(event);
            };
        });
    }
    
    upgradeDatabase(event) {
        const db = event.target.result;
        const oldVersion = event.oldVersion;
        const newVersion = event.newVersion;
        
        console.log(`📊 Atualizando de v${oldVersion} para v${newVersion}`);
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('corridas')) {
            console.log('📝 Criando store: corridas');
            const corridasStore = db.createObjectStore('corridas', { keyPath: 'id', autoIncrement: true });
            corridasStore.createIndex('data', 'data', { unique: false });
            corridasStore.createIndex('motorista', 'motorista', { unique: false });
            corridasStore.createIndex('bairro', 'bairro', { unique: false });
            corridasStore.createIndex('valor', 'valor', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('motoristas')) {
            console.log('👥 Criando store: motoristas');
            const motoristasStore = db.createObjectStore('motoristas', { keyPath: 'id', autoIncrement: true });
            motoristasStore.createIndex('nome', 'nome', { unique: true });
            motoristasStore.createIndex('status', 'status', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('configuracoes')) {
            console.log('⚙️ Criando store: configuracoes');
            const configStore = db.createObjectStore('configuracoes', { keyPath: 'key' });
        }
        
        if (!db.objectStoreNames.contains('precos')) {
            console.log('💰 Criando store: precos');
            const precosStore = db.createObjectStore('precos', { keyPath: 'bairro' });
        }
        
        if (!db.objectStoreNames.contains('backups')) {
            console.log('💾 Criando store: backups');
            const backupsStore = db.createObjectStore('backups', { keyPath: 'id', autoIncrement: true });
            backupsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('financeiro')) {
            console.log('📊 Criando store: financeiro');
            const financeiroStore = db.createObjectStore('financeiro', { keyPath: 'id', autoIncrement: true });
            financeiroStore.createIndex('data', 'data', { unique: false });
            financeiroStore.createIndex('tipo', 'tipo', { unique: false });
            financeiroStore.createIndex('categoria', 'categoria', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('notificacoes')) {
            console.log('🔔 Criando store: notificacoes');
            const notificacoesStore = db.createObjectStore('notificacoes', { keyPath: 'id', autoIncrement: true });
            notificacoesStore.createIndex('lida', 'lida', { unique: false });
            notificacoesStore.createIndex('data', 'data', { unique: false });
        }
        
        // Migrate data from old versions
        if (oldVersion < 1) {
            // Initial version - no migration needed
        }
        
        if (oldVersion < 2) {
            // Version 2 adds financeiro and notificacoes stores
            // Already created above
        }
        
        if (oldVersion < 3) {
            // Version 3 adds indexes to existing stores
            // Already created above
        }
    }
    
    async initializeDefaultData() {
        try {
            // Check if we need to seed default data
            const motoristasCount = await this.countMotoristas();
            const precosCount = await this.countPrecos();
            const configuracoesCount = await this.countConfiguracoes();
            
            // Seed default motoristas if empty
            if (motoristasCount === 0) {
                await this.seedDefaultMotoristas();
            }
            
            // Seed default prices if empty
            if (precosCount === 0) {
                await this.seedDefaultPrecos();
            }
            
            // Seed default settings if empty
            if (configuracoesCount === 0) {
                await this.seedDefaultConfiguracoes();
            }
            
            console.log('✅ Dados padrão inicializados');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar dados padrão:', error);
        }
    }
    
    async seedDefaultMotoristas() {
        const defaultMotoristas = [
            { nome: 'João Silva', telefone: '(83) 99999-9999', email: 'joao@email.com', cpf: '123.456.789-00', status: 'ativo' },
            { nome: 'Maria Souza', telefone: '(83) 98888-8888', email: 'maria@email.com', cpf: '987.654.321-00', status: 'ativo' },
            { nome: 'Carlos Oliveira', telefone: '(83) 97777-7777', email: 'carlos@email.com', cpf: '456.789.123-00', status: 'ferias' }
        ];
        
        for (const motorista of defaultMotoristas) {
            await this.addMotorista(motorista);
        }
    }
    
    async seedDefaultPrecos() {
        for (const [bairro, valor] of Object.entries(this.defaultPrices)) {
            await this.addPreco({ bairro, valor });
        }
    }
    
    async seedDefaultConfiguracoes() {
        const defaultConfigs = [
            { key: 'empresa_nome', value: 'Top Táxi PRO' },
            { key: 'empresa_cnpj', value: '12.345.678/0001-90' },
            { key: 'empresa_telefone', value: '(83) 3333-3333' },
            { key: 'empresa_email', value: 'contato@toptaxi.com' },
            { key: 'empresa_endereco', value: 'Rua Principal, 123 - Centro, João Pessoa - PB' },
            { key: 'moeda', value: 'R$' },
            { key: 'formato_data', value: 'dd/MM/yyyy' },
            { key: 'theme', value: 'light' },
            { key: 'auto_backup', value: 'true' },
            { key: 'backup_interval', value: '7' }, // days
            { key: 'notificacoes_email', value: 'false' },
            { key: 'notificacoes_push', value: 'true' }
        ];
        
        for (const config of defaultConfigs) {
            await this.setSetting(config.key, config.value);
        }
    }
    
    // ===== Helper Methods =====
    
    async countMotoristas() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['motoristas'], 'readonly');
            const store = transaction.objectStore('motoristas');
            const request = store.count();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async countPrecos() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['precos'], 'readonly');
            const store = transaction.objectStore('precos');
            const request = store.count();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async countConfiguracoes() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['configuracoes'], 'readonly');
            const store = transaction.objectStore('configuracoes');
            const request = store.count();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    // ===== Corridas Operations =====
    
    async addCorrida(corrida) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['corridas'], 'readwrite');
            const store = transaction.objectStore('corridas');
            
            // Add metadata
            const corridaCompleta = {
                ...corrida,
                data: corrida.data || new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                valor: Number(corrida.valor) || 0
            };
            
            const request = store.add(corridaCompleta);
            
            request.onsuccess = () => {
                console.log('✅ Corrida adicionada:', request.result);
                
                // Create notification for new ride
                this.createNotification({
                    titulo: 'Nova Corrida Registrada',
                    mensagem: `Motorista: ${corrida.motorista}, Bairro: ${corrida.bairro}, Valor: R$ ${Number(corrida.valor).toFixed(2)}`,
                    tipo: 'info',
                    data: new Date().toISOString(),
                    lida: false
                });
                
                resolve(request.result);
            };
            
            request.onerror = () => {
                console.error('❌ Erro ao adicionar corrida:', request.error);
                reject(request.error);
            };
        });
    }
    
    async getCorridas(filters = {}) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['corridas'], 'readonly');
            const store = transaction.objectStore('corridas');
            const request = store.getAll();
            
            request.onsuccess = () => {
                let corridas = request.result;
                
                // Apply filters
                if (filters.startDate) {
                    const start = new Date(filters.startDate);
                    start.setHours(0, 0, 0, 0);
                    corridas = corridas.filter(c => new Date(c.data) >= start);
                }
                
                if (filters.endDate) {
                    const end = new Date(filters.endDate);
                    end.setHours(23, 59, 59, 999);
                    corridas = corridas.filter(c => new Date(c.data) <= end);
                }
                
                if (filters.motorista) {
                    corridas = corridas.filter(c => c.motorista === filters.motorista);
                }
                
                if (filters.bairro) {
                    corridas = corridas.filter(c => c.bairro === filters.bairro);
                }
                
                if (filters.minValor) {
                    corridas = corridas.filter(c => Number(c.valor) >= Number(filters.minValor));
                }
                
                if (filters.maxValor) {
                    corridas = corridas.filter(c => Number(c.valor) <= Number(filters.maxValor));
                }
                
                // Sort by date descending (newest first)
                corridas.sort((a, b) => new Date(b.data) - new Date(a.data));
                
                resolve(corridas);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async getCorridasHoje() {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);
        
        return this.getCorridas({
            startDate: hoje.toISOString(),
            endDate: amanha.toISOString()
        });
    }
    
    async getCorridasPorMotorista(motorista) {
        return this.getCorridas({ motorista });
    }
    
    async getCorridasPorBairro(bairro) {
        return this.getCorridas({ bairro });
    }
    
    async getRecentRides(limit = 10) {
        const corridas = await this.getCorridas();
        return corridas.slice(0, limit);
    }
    
    async getCorrida(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['corridas'], 'readonly');
            const store = transaction.objectStore('corridas');
            const request = store.get(Number(id));
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async updateCorrida(id, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['corridas'], 'readwrite');
            const store = transaction.objectStore('corridas');
            
            // Get existing corrida
            const getRequest = store.get(Number(id));
            
            getRequest.onsuccess = () => {
                const corrida = getRequest.result;
                if (!corrida) {
                    reject(new Error('Corrida não encontrada'));
                    return;
                }
                
                // Update data
                const updatedCorrida = {
                    ...corrida,
                    ...data,
                    updatedAt: new Date().toISOString(),
                    valor: Number(data.valor) || corrida.valor
                };
                
                // Save updated corrida
                const updateRequest = store.put(updatedCorrida);
                
                updateRequest.onsuccess = () => {
                    console.log('✅ Corrida atualizada:', updateRequest.result);
                    
                    // Create notification for updated ride
                    this.createNotification({
                        titulo: 'Corrida Atualizada',
                        mensagem: `Corrida ID: ${id} foi atualizada`,
                        tipo: 'info',
                        data: new Date().toISOString(),
                        lida: false
                    });
                    
                    resolve(updateRequest.result);
                };
                
                updateRequest.onerror = () => reject(updateRequest.error);
            };
            
            getRequest.onerror = () => reject(getRequest.error);
        });
    }
    
    async deleteCorrida(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['corridas'], 'readwrite');
            const store = transaction.objectStore('corridas');
            const request = store.delete(Number(id));
            
            request.onsuccess = () => {
                console.log('✅ Corrida excluída:', id);
                
                // Create notification for deleted ride
                this.createNotification({
                    titulo: 'Corrida Excluída',
                    mensagem: `Corrida ID: ${id} foi excluída`,
                    tipo: 'warning',
                    data: new Date().toISOString(),
                    lida: false
                });
                
                resolve(true);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async searchCorridas(searchTerm) {
        const corridas = await this.getCorridas();
        const term = searchTerm.toLowerCase();
        
        return corridas.filter(corrida =>
            corrida.motorista?.toLowerCase().includes(term) ||
            corrida.bairro?.toLowerCase().includes(term) ||
            corrida.funcionarios?.toLowerCase().includes(term) ||
            corrida.id?.toString().includes(term)
        );
    }
    
    // ===== Motoristas Operations =====
    
    async addMotorista(motorista) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['motoristas'], 'readwrite');
            const store = transaction.objectStore('motoristas');
            
            // Add metadata
            const motoristaCompleto = {
                ...motorista,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: motorista.status || 'ativo'
            };
            
            const request = store.add(motoristaCompleto);
            
            request.onsuccess = () => {
                console.log('✅ Motorista adicionado:', request.result);
                
                // Create notification for new driver
                this.createNotification({
                    titulo: 'Novo Motorista Cadastrado',
                    mensagem: `Motorista: ${motorista.nome} foi cadastrado`,
                    tipo: 'info',
                    data: new Date().toISOString(),
                    lida: false
                });
                
                resolve(request.result);
            };
            
            request.onerror = () => {
                // Handle duplicate name error
                if (request.error.name === 'ConstraintError') {
                    reject(new Error('Já existe um motorista com este nome'));
                } else {
                    reject(request.error);
                }
            };
        });
    }
    
    async getMotoristas(filters = {}) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['motoristas'], 'readonly');
            const store = transaction.objectStore('motoristas');
            const request = store.getAll();
            
            request.onsuccess = () => {
                let motoristas = request.result;
                
                // Apply filters
                if (filters.status) {
                    motoristas = motoristas.filter(m => m.status === filters.status);
                }
                
                if (filters.search) {
                    const term = filters.search.toLowerCase();
                    motoristas = motoristas.filter(m =>
                        m.nome?.toLowerCase().includes(term) ||
                        m.telefone?.toLowerCase().includes(term) ||
                        m.email?.toLowerCase().includes(term) ||
                        m.cpf?.toLowerCase().includes(term)
                    );
                }
                
                // Sort by name
                motoristas.sort((a, b) => a.nome.localeCompare(b.nome));
                
                resolve(motoristas);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async getMotoristasAtivos() {
        return this.getMotoristas({ status: 'ativo' });
    }
    
    async getMotorista(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['motoristas'], 'readonly');
            const store = transaction.objectStore('motoristas');
            const request = store.get(Number(id));
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async getMotoristaByNome(nome) {
        const motoristas = await this.getMotoristas();
        return motoristas.find(m => m.nome === nome);
    }
    
    async updateMotorista(id, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['motoristas'], 'readwrite');
            const store = transaction.objectStore('motoristas');
            
            const getRequest = store.get(Number(id));
            
            getRequest.onsuccess = () => {
                const motorista = getRequest.result;
                if (!motorista) {
                    reject(new Error('Motorista não encontrado'));
                    return;
                }
                
                const updatedMotorista = {
                    ...motorista,
                    ...data,
                    updatedAt: new Date().toISOString()
                };
                
                const updateRequest = store.put(updatedMotorista);
                
                updateRequest.onsuccess = () => {
                    console.log('✅ Motorista atualizado:', updateRequest.result);
                    
                    // Create notification for updated driver
                    this.createNotification({
                        titulo: 'Motorista Atualizado',
                        mensagem: `Motorista: ${motorista.nome} foi atualizado`,
                        tipo: 'info',
                        data: new Date().toISOString(),
                        lida: false
                    });
                    
                    resolve(updateRequest.result);
                };
                
                updateRequest.onerror = () => reject(updateRequest.error);
            };
            
            getRequest.onerror = () => reject(getRequest.error);
        });
    }
    
    async deleteMotorista(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['motoristas'], 'readwrite');
            const store = transaction.objectStore('motoristas');
            const request = store.delete(Number(id));
            
            request.onsuccess = () => {
                console.log('✅ Motorista excluído:', id);
                
                // Create notification for deleted driver
                this.createNotification({
                    titulo: 'Motorista Excluído',
                    mensagem: `Motorista ID: ${id} foi excluído`,
                    tipo: 'warning',
                    data: new Date().toISOString(),
                    lida: false
                });
                
                resolve(true);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async searchMotoristas(searchTerm) {
        const motoristas = await this.getMotoristas();
        const term = searchTerm.toLowerCase();
        
        return motoristas.filter(motorista =>
            motorista.nome?.toLowerCase().includes(term) ||
            motorista.telefone?.toLowerCase().includes(term) ||
            motorista.email?.toLowerCase().includes(term) ||
            motorista.cpf?.toLowerCase().includes(term)
        );
    }
    
    // ===== Bairros Operations =====
    
    async getBairros() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['precos'], 'readonly');
            const store = transaction.objectStore('precos');
            const request = store.getAll();
            
            request.onsuccess = () => {
                const precos = request.result;
                const bairros = precos.map(p => ({ nome: p.bairro, valor: p.valor }));
                resolve(bairros);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    // ===== Precos Operations =====
    
    async addPreco(preco) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['precos'], 'readwrite');
            const store = transaction.objectStore('precos');
            
            const precoCompleto = {
                ...preco,
                valor: Number(preco.valor) || 0,
                updatedAt: new Date().toISOString()
            };
            
            const request = store.add(precoCompleto);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async getPrecosBase() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['precos'], 'readonly');
            const store = transaction.objectStore('precos');
            const request = store.getAll();
            
            request.onsuccess = () => {
                const precos = request.result;
                
                // If no prices in database, return default prices
                if (precos.length === 0) {
                    const defaultPrecos = Object.entries(this.defaultPrices).map(([bairro, valor]) => ({
                        bairro,
                        valor
                    }));
                    resolve(defaultPrecos);
                } else {
                    resolve(precos);
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async getPreco(bairro) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['precos'], 'readonly');
            const store = transaction.objectStore('precos');
            const request = store.get(bairro);
            
            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result);
                } else {
                    // Return default price if not found
                    const defaultPrice = this.defaultPrices[bairro];
                    if (defaultPrice !== undefined) {
                        resolve({ bairro, valor: defaultPrice });
                    } else {
                        resolve(null);
                    }
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async getPrecoBasePorBairro(bairro) {
        const preco = await this.getPreco(bairro);
        return preco ? preco.valor : 0;
    }
    
    async updatePreco(data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['precos'], 'readwrite');
            const store = transaction.objectStore('precos');
            
            const getRequest = store.get(data.bairro);
            
            getRequest.onsuccess = () => {
                const preco = getRequest.result || { bairro: data.bairro };
                
                const updatedPreco = {
                    ...preco,
                    valor: Number(data.valor) || 0,
                    updatedAt: new Date().toISOString()
                };
                
                const request = store.put(updatedPreco);
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            };
            
            getRequest.onerror = () => reject(getRequest.error);
        });
    }
    
    async deletePreco(bairro) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['precos'], 'readwrite');
            const store = transaction.objectStore('precos');
            const request = store.delete(bairro);
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
    
    // ===== Configuracoes Operations =====
    
    async getConfiguracoes() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['configuracoes'], 'readonly');
            const store = transaction.objectStore('configuracoes');
            const request = store.getAll();
            
            request.onsuccess = () => {
                const configs = request.result.reduce((acc, config) => {
                    acc[config.key] = config.value;
                    return acc;
                }, {});
                resolve(configs);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async getSetting(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['configuracoes'], 'readonly');
            const store = transaction.objectStore('configuracoes');
            const request = store.get(key);
            
            request.onsuccess = () => resolve(request.result ? request.result.value : null);
            request.onerror = () => reject(request.error);
        });
    }
    
    async setSetting(key, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['configuracoes'], 'readwrite');
            const store = transaction.objectStore('configuracoes');
            const request = store.put({ key, value });
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
    
    async saveConfiguracoes(data) {
        const promises = Object.entries(data).map(([key, value]) => 
            this.setSetting(key, value)
        );
        
        return Promise.all(promises);
    }
    
    async resetConfiguracoes() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['configuracoes'], 'readwrite');
            const store = transaction.objectStore('configuracoes');
            const request = store.clear();
            
            request.onsuccess = async () => {
                // Seed default configurations
                await this.seedDefaultConfiguracoes();
                resolve(true);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    // ===== Financeiro Operations =====
    
    async addFinancialTransaction(transactionData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['financeiro'], 'readwrite');
            const store = transaction.objectStore('financeiro');
            
            const transacaoCompleta = {
                ...transactionData,
                data: transactionData.data || new Date().toISOString(),
                createdAt: new Date().toISOString(),
                valor: Number(transactionData.amount) || 0
            };
            
            const request = store.add(transacaoCompleta);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async getFinanceiroData(filters = {}) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['financeiro'], 'readonly');
            const store = transaction.objectStore('financeiro');
            const request = store.getAll();
            
            request.onsuccess = () => {
                let transacoes = request.result;
                
                // Apply filters
                if (filters.startDate) {
                    const start = new Date(filters.startDate);
                    start.setHours(0, 0, 0, 0);
                    transacoes = transacoes.filter(t => new Date(t.data) >= start);
                }
                
                if (filters.endDate) {
                    const end = new Date(filters.endDate);
                    end.setHours(23, 59, 59, 999);
                    transacoes = transacoes.filter(t => new Date(t.data) <= end);
                }
                
                if (filters.tipo) {
                    transacoes = transacoes.filter(t => t.tipo === filters.tipo);
                }
                
                if (filters.categoria) {
                    transacoes = transacoes.filter(t => t.categoria === filters.categoria);
                }
                
                // Sort by date descending
                transacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
                
                // Calculate totals
                const receitas = transacoes.filter(t => t.tipo === 'revenue');
                const despesas = transacoes.filter(t => t.tipo === 'expense');
                
                const totalReceitas = receitas.reduce((sum, t) => sum + Number(t.valor), 0);
                const totalDespesas = despesas.reduce((sum, t) => sum + Number(t.valor), 0);
                const saldo = totalReceitas - totalDespesas;
                
                // Group by category
                const receitasPorCategoria = this.groupByCategory(receitas);
                const despesasPorCategoria = this.groupByCategory(despesas);
                
                resolve({
                    transacoes,
                    totais: {
                        receitas: totalReceitas,
                        despesas: totalDespesas,
                        saldo
                    },
                    categorias: {
                        receitas: receitasPorCategoria,
                        despesas: despesasPorCategoria
                    }
                });
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    groupByCategory(transacoes) {
        return transacoes.reduce((acc, transacao) => {
            const categoria = transacao.categoria || 'outros';
            if (!acc[categoria]) {
                acc[categoria] = {
                    total: 0,
                    count: 0,
                    transacoes: []
                };
            }
            
            acc[categoria].total += Number(transacao.valor);
            acc[categoria].count += 1;
            acc[categoria].transacoes.push(transacao);
            
            return acc;
        }, {});
    }
    
    // ===== Notificacoes Operations =====
    
    async createNotification(notification) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notificacoes'], 'readwrite');
            const store = transaction.objectStore('notificacoes');
            
            const notificacaoCompleta = {
                ...notification,
                createdAt: new Date().toISOString()
            };
            
            const request = store.add(notificacaoCompleta);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async getNotifications(filters = {}) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notificacoes'], 'readonly');
            const store = transaction.objectStore('notificacoes');
            const request = store.getAll();
            
            request.onsuccess = () => {
                let notificacoes = request.result;
                
                // Apply filters
                if (filters.lida !== undefined) {
                    notificacoes = notificacoes.filter(n => n.lida === filters.lida);
                }
                
                if (filters.tipo) {
                    notificacoes = notificacoes.filter(n => n.tipo === filters.tipo);
                }
                
                // Sort by date descending
                notificacoes.sort((a, b) => new Date(b.data || b.createdAt) - new Date(a.data || a.createdAt));
                
                // Limit results
                if (filters.limit) {
                    notificacoes = notificacoes.slice(0, filters.limit);
                }
                
                resolve(notificacoes);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async getUnreadNotifications() {
        return this.getNotifications({ lida: false });
    }
    
    async markNotificationAsRead(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notificacoes'], 'readwrite');
            const store = transaction.objectStore('notificacoes');
            
            const getRequest = store.get(Number(id));
            
            getRequest.onsuccess = () => {
                const notification = getRequest.result;
                if (!notification) {
                    reject(new Error('Notificação não encontrada'));
                    return;
                }
                
                const updatedNotification = {
                    ...notification,
                    lida: true,
                    readAt: new Date().toISOString()
                };
                
                const updateRequest = store.put(updatedNotification);
                
                updateRequest.onsuccess = () => resolve(updateRequest.result);
                updateRequest.onerror = () => reject(updateRequest.error);
            };
            
            getRequest.onerror = () => reject(getRequest.error);
        });
    }
    
    async markAllNotificationsAsRead() {
        const notifications = await this.getUnreadNotifications();
        
        const promises = notifications.map(notification =>
            this.markNotificationAsRead(notification.id)
        );
        
        return Promise.all(promises);
    }
    
    async deleteNotification(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notificacoes'], 'readwrite');
            const store = transaction.objectStore('notificacoes');
            const request = store.delete(Number(id));
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
    
    async clearOldNotifications(days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const notifications = await this.getNotifications();
        const oldNotifications = notifications.filter(n => 
            new Date(n.data || n.createdAt) < cutoffDate
        );
        
        const promises = oldNotifications.map(notification =>
            this.deleteNotification(notification.id)
        );
        
        return Promise.all(promises);
    }
    
    // ===== Dashboard Statistics =====
    
    async getDashboardStats() {
        try {
            const [
                corridas,
                motoristas,
                financeiro,
                notificacoes
            ] = await Promise.all([
                this.getCorridas(),
                this.getMotoristas(),
                this.getFinanceiroData(),
                this.getUnreadNotifications()
            ]);
            
            // Today's stats
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const amanha = new Date(hoje);
            amanha.setDate(amanha.getDate() + 1);
            
            const corridasHoje = corridas.filter(c => {
                const dataCorrida = new Date(c.data);
                return dataCorrida >= hoje && dataCorrida < amanha;
            });
            
            const faturamentoHoje = corridasHoje.reduce((total, c) => total + (Number(c.valor) || 0), 0);
            
            // Last 7 days data
            const last7Days = [];
            const last7DaysLabels = [];
            const last7DaysCounts = [];
            
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);
                
                const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                last7DaysLabels.push(dateStr);
                
                const start = new Date(date);
                const end = new Date(date);
                end.setHours(23, 59, 59, 999);
                
                const count = corridas.filter(c => {
                    const dataCorrida = new Date(c.data);
                    return dataCorrida >= start && dataCorrida <= end;
                }).length;
                
                last7DaysCounts.push(count);
                last7Days.push({ date: dateStr, count });
            }
            
            // Distribution by neighborhood
            const distribuicaoBairros = {};
            corridas.forEach(c => {
                distribuicaoBairros[c.bairro] = (distribuicaoBairros[c.bairro] || 0) + 1;
            });
            
            // Top drivers
            const corridasPorMotorista = {};
            corridas.forEach(c => {
                corridasPorMotorista[c.motorista] = (corridasPorMotorista[c.motorista] || 0) + 1;
            });
            
            const topMotoristas = Object.entries(corridasPorMotorista)
                .map(([nome, count]) => ({ nome, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
            
            // Monthly comparison
            const mesAtual = new Date().getMonth();
            const anoAtual = new Date().getFullYear();
            
            const corridasMesAtual = corridas.filter(c => {
                const data = new Date(c.data);
                return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
            });
            
            const corridasMesAnterior = corridas.filter(c => {
                const data = new Date(c.data);
                let mesAnterior = mesAtual - 1;
                let anoAnterior = anoAtual;
                
                if (mesAnterior < 0) {
                    mesAnterior = 11;
                    anoAnterior -= 1;
                }
                
                return data.getMonth() === mesAnterior && data.getFullYear() === anoAnterior;
            });
            
            const variacaoCorridas = corridasMesAnterior.length > 0 
                ? ((corridasMesAtual.length - corridasMesAnterior.length) / corridasMesAnterior.length) * 100
                : 100;
            
            // Financial stats
            const receitasMesAtual = financeiro.totais?.receitas || 0;
            const despesasMesAtual = financeiro.totais?.despesas || 0;
            const lucroMesAtual = receitasMesAtual - despesasMesAtual;
            
            return {
                // Totals
                totalCorridas: corridas.length,
                totalMotoristas: motoristas.length,
                totalReceitas: receitasMesAtual,
                totalDespesas: despesasMesAtual,
                lucroTotal: lucroMesAtual,
                
                // Today
                corridasHoje: corridasHoje.length,
                faturamentoHoje,
                
                // Trends
                variacaoCorridas: parseFloat(variacaoCorridas.toFixed(1)),
                
                // Charts data
                last7Days: {
                    labels: last7DaysLabels,
                    data: last7DaysCounts
                },
                
                distribuicaoBairros: Object.entries(distribuicaoBairros).map(([bairro, count]) => ({
                    bairro,
                    count
                })),
                
                topMotoristas,
                
                // Notifications
                notificacoesNaoLidas: notificacoes.length,
                
                // Performance metrics
                corridasPorDia: (corridas.length / 30).toFixed(1), // Average per day (last 30 days)
                faturamentoMedioPorCorrida: corridas.length > 0 
                    ? (corridas.reduce((sum, c) => sum + Number(c.valor), 0) / corridas.length).toFixed(2)
                    : 0,
                
                // Time-based data
                ultimasCorridas: corridas.slice(0, 5),
                motoristasAtivos: motoristas.filter(m => m.status === 'ativo').length,
                motoristasInativos: motoristas.filter(m => m.status === 'inativo').length,
                motoristasFerias: motoristas.filter(m => m.status === 'ferias').length
            };
            
        } catch (error) {
            console.error('❌ Erro ao calcular estatísticas do dashboard:', error);
            throw error;
        }
    }
    
    // ===== Relatorios Operations =====
    
    async getRelatoriosData(filters = {}) {
        try {
            const [
                corridas,
                motoristas,
                financeiro,
                precos
            ] = await Promise.all([
                this.getCorridas(filters),
                this.getMotoristas(),
                this.getFinanceiroData(filters),
                this.getPrecosBase()
            ]);
            
            // Summary statistics
            const totalCorridas = corridas.length;
            const totalFaturamento = corridas.reduce((sum, c) => sum + Number(c.valor), 0);
            const faturamentoMedio = totalCorridas > 0 ? totalFaturamento / totalCorridas : 0;
            
            // By driver
            const corridasPorMotorista = {};
            const faturamentoPorMotorista = {};
            
            corridas.forEach(c => {
                corridasPorMotorista[c.motorista] = (corridasPorMotorista[c.motorista] || 0) + 1;
                faturamentoPorMotorista[c.motorista] = (faturamentoPorMotorista[c.motorista] || 0) + Number(c.valor);
            });
            
            const rankingMotoristas = Object.entries(corridasPorMotorista)
                .map(([motorista, corridasCount]) => ({
                    motorista,
                    corridas: corridasCount,
                    faturamento: faturamentoPorMotorista[motorista] || 0,
                    media: faturamentoPorMotorista[motorista] / corridasCount || 0
                }))
                .sort((a, b) => b.faturamento - a.faturamento);
            
            // By neighborhood
            const corridasPorBairro = {};
            const faturamentoPorBairro = {};
            
            corridas.forEach(c => {
                corridasPorBairro[c.bairro] = (corridasPorBairro[c.bairro] || 0) + 1;
                faturamentoPorBairro[c.bairro] = (faturamentoPorBairro[c.bairro] || 0) + Number(c.valor);
            });
            
            const rankingBairros = Object.entries(corridasPorBairro)
                .map(([bairro, corridasCount]) => ({
                    bairro,
                    corridas: corridasCount,
                    faturamento: faturamentoPorBairro[bairro] || 0,
                    media: faturamentoPorBairro[bairro] / corridasCount || 0
                }))
                .sort((a, b) => b.faturamento - a.faturamento);
            
            // Time series data (last 30 days)
            const last30Days = [];
            const last30DaysLabels = [];
            const last30DaysData = [];
            
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);
                
                const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                last30DaysLabels.push(dateStr);
                
                const start = new Date(date);
                const end = new Date(date);
                end.setHours(23, 59, 59, 999);
                
                const dayCorridas = corridas.filter(c => {
                    const dataCorrida = new Date(c.data);
                    return dataCorrida >= start && dataCorrida <= end;
                });
                
                const dayFaturamento = dayCorridas.reduce((sum, c) => sum + Number(c.valor), 0);
                last30DaysData.push(dayFaturamento);
                
                last30Days.push({
                    date: dateStr,
                    corridas: dayCorridas.length,
                    faturamento: dayFaturamento
                });
            }
            
            // Financial summary
            const receitas = financeiro.totais?.receitas || 0;
            const despesas = financeiro.totais?.despesas || 0;
            const lucro = receitas - despesas;
            const margemLucro = receitas > 0 ? (lucro / receitas) * 100 : 0;
            
            return {
                // Summary
                periodo: filters.startDate && filters.endDate 
                    ? `${new Date(filters.startDate).toLocaleDateString('pt-BR')} - ${new Date(filters.endDate).toLocaleDateString('pt-BR')}`
                    : 'Todos os dados',
                
                // Totals
                totalCorridas,
                totalFaturamento,
                faturamentoMedio: parseFloat(faturamentoMedio.toFixed(2)),
                
                // Rankings
                rankingMotoristas: rankingMotoristas.slice(0, 10),
                rankingBairros: rankingBairros.slice(0, 10),
                
                // Time series
                last30Days: {
                    labels: last30DaysLabels,
                    data: last30DaysData
                },
                
                // Financial
                financeiro: {
                    receitas,
                    despesas,
                    lucro,
                    margemLucro: parseFloat(margemLucro.toFixed(2))
                },
                
                // Details
                corridas,
                motoristas,
                precos,
                
                // Generated at
                geradoEm: new Date().toISOString(),
                geradoPor: 'Sistema Top Táxi PRO'
            };
            
        } catch (error) {
            console.error('❌ Erro ao gerar dados de relatórios:', error);
            throw error;
        }
    }
    
    // ===== Backup Operations =====
    
    async backupData() {
        try {
            const [
                corridas,
                motoristas,
                configuracoes,
                precos,
                financeiro,
                notificacoes
            ] = await Promise.all([
                this.getCorridas(),
                this.getMotoristas(),
                this.getConfiguracoes(),
                this.getPrecosBase(),
                this.getFinanceiroData(),
                this.getNotifications()
            ]);
            
            const backup = {
                corridas,
                motoristas,
                configuracoes,
                precos,
                financeiro: financeiro.transacoes,
                notificacoes,
                version: this.version,
                exportedAt: new Date().toISOString(),
                totalSize: JSON.stringify({
                    corridas,
                    motoristas,
                    configuracoes,
                    precos,
                    financeiro: financeiro.transacoes,
                    notificacoes
                }).length
            };
            
            return backup;
            
        } catch (error) {
            console.error('❌ Erro ao criar backup:', error);
            throw error;
        }
    }
    
    async saveBackup(backupData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['backups'], 'readwrite');
            const store = transaction.objectStore('backups');
            
            const backup = {
                ...backupData,
                createdAt: new Date().toISOString(),
                size: backupData.totalSize || JSON.stringify(backupData).length
            };
            
            const request = store.add(backup);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async getBackupInfo() {
        try {
            const backups = await this.getBackups();
            const lastBackup = backups[0];
            const totalSize = backups.reduce((sum, b) => sum + (b.size || 0), 0);
            
            return {
                totalBackups: backups.length,
                lastBackup: lastBackup ? {
                    date: new Date(lastBackup.createdAt).toLocaleString(),
                    size: lastBackup.size,
                    items: {
                        corridas: lastBackup.corridas?.length || 0,
                        motoristas: lastBackup.motoristas?.length || 0
                    }
                } : null,
                totalSize,
                autoBackupEnabled: await this.getSetting('auto_backup') === 'true',
                backupInterval: await this.getSetting('backup_interval') || '7'
            };
            
        } catch (error) {
            console.error('❌ Erro ao obter informações de backup:', error);
            throw error;
        }
    }
    
    async getBackups() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['backups'], 'readonly');
            const store = transaction.objectStore('backups');
            const request = store.getAll();
            
            request.onsuccess = () => {
                const backups = request.result;
                // Sort by creation date descending
                backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                resolve(backups);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async getBackup(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['backups'], 'readonly');
            const store = transaction.objectStore('backups');
            const request = store.get(Number(id));
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async restoreBackup(backupId) {
        try {
            const backup = await this.getBackup(backupId);
            if (!backup) {
                throw new Error('Backup não encontrado');
            }
            
            // Clear all existing data
            await this.clearAllData();
            
            // Restore data
            const promises = [];
            
            if (backup.corridas && backup.corridas.length > 0) {
                promises.push(this.restoreCorridas(backup.corridas));
            }
            
            if (backup.motoristas && backup.motoristas.length > 0) {
                promises.push(this.restoreMotoristas(backup.motoristas));
            }
            
            if (backup.configuracoes) {
                promises.push(this.restoreConfiguracoes(backup.configuracoes));
            }
            
            if (backup.precos && backup.precos.length > 0) {
                promises.push(this.restorePrecos(backup.precos));
            }
            
            if (backup.financeiro && backup.financeiro.length > 0) {
                promises.push(this.restoreFinanceiro(backup.financeiro));
            }
            
            if (backup.notificacoes && backup.notificacoes.length > 0) {
                promises.push(this.restoreNotificacoes(backup.notificacoes));
            }
            
            await Promise.all(promises);
            
            // Create restoration notification
            await this.createNotification({
                titulo: 'Backup Restaurado',
                mensagem: `Backup de ${new Date(backup.createdAt).toLocaleString()} foi restaurado com sucesso`,
                tipo: 'success',
                data: new Date().toISOString(),
                lida: false
            });
            
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao restaurar backup:', error);
            throw error;
        }
    }
    
    async importBackup(backupData) {
        try {
            // Clear all existing data
            await this.clearAllData();
            
            // Import data
            const promises = [];
            
            if (backupData.corridas && backupData.corridas.length > 0) {
                promises.push(this.restoreCorridas(backupData.corridas));
            }
            
            if (backupData.motoristas && backupData.motoristas.length > 0) {
                promises.push(this.restoreMotoristas(backupData.motoristas));
            }
            
            if (backupData.configuracoes) {
                promises.push(this.restoreConfiguracoes(backupData.configuracoes));
            }
            
            if (backupData.precos && backupData.precos.length > 0) {
                promises.push(this.restorePrecos(backupData.precos));
            }
            
            if (backupData.financeiro && backupData.financeiro.length > 0) {
                promises.push(this.restoreFinanceiro(backupData.financeiro));
            }
            
            if (backupData.notificacoes && backupData.notificacoes.length > 0) {
                promises.push(this.restoreNotificacoes(backupData.notificacoes));
            }
            
            await Promise.all(promises);
            
            // Create import notification
            await this.createNotification({
                titulo: 'Backup Importado',
                mensagem: 'Backup externo foi importado com sucesso',
                tipo: 'success',
                data: new Date().toISOString(),
                lida: false
            });
            
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao importar backup:', error);
            throw error;
        }
    }
    
    async restoreCorridas(corridas) {
        const transaction = this.db.transaction(['corridas'], 'readwrite');
        const store = transaction.objectStore('corridas');
        
        return new Promise((resolve, reject) => {
            let completed = 0;
            const total = corridas.length;
            
            corridas.forEach(corrida => {
                const request = store.add(corrida);
                
                request.onsuccess = () => {
                    completed++;
                    if (completed === total) {
                        resolve();
                    }
                };
                
                request.onerror = () => {
                    console.warn('⚠️ Erro ao restaurar corrida:', request.error);
                    completed++;
                    if (completed === total) {
                        resolve();
                    }
                };
            });
        });
    }
    
    async restoreMotoristas(motoristas) {
        const transaction = this.db.transaction(['motoristas'], 'readwrite');
        const store = transaction.objectStore('motoristas');
        
        return new Promise((resolve, reject) => {
            let completed = 0;
            const total = motoristas.length;
            
            motoristas.forEach(motorista => {
                const request = store.add(motorista);
                
                request.onsuccess = () => {
                    completed++;
                    if (completed === total) {
                        resolve();
                    }
                };
                
                request.onerror = () => {
                    console.warn('⚠️ Erro ao restaurar motorista:', request.error);
                    completed++;
                    if (completed === total) {
                        resolve();
                    }
                };
            });
        });
    }
    
    async restoreConfiguracoes(configuracoes) {
        const promises = Object.entries(configuracoes).map(([key, value]) =>
            this.setSetting(key, value)
        );
        
        return Promise.all(promises);
    }
    
    async restorePrecos(precos) {
        const transaction = this.db.transaction(['precos'], 'readwrite');
        const store = transaction.objectStore('precos');
        
        return new Promise((resolve, reject) => {
            let completed = 0;
            const total = precos.length;
            
            precos.forEach(preco => {
                const request = store.put(preco);
                
                request.onsuccess = () => {
                    completed++;
                    if (completed === total) {
                        resolve();
                    }
                };
                
                request.onerror = () => {
                    console.warn('⚠️ Erro ao restaurar preço:', request.error);
                    completed++;
                    if (completed === total) {
                        resolve();
                    }
                };
            });
        });
    }
    
    async restoreFinanceiro(transacoes) {
        const transaction = this.db.transaction(['financeiro'], 'readwrite');
        const store = transaction.objectStore('financeiro');
        
        return new Promise((resolve, reject) => {
            let completed = 0;
            const total = transacoes.length;
            
            transacoes.forEach(transacao => {
                const request = store.add(transacao);
                
                request.onsuccess = () => {
                    completed++;
                    if (completed === total) {
                        resolve();
                    }
                };
                
                request.onerror = () => {
                    console.warn('⚠️ Erro ao restaurar transação financeira:', request.error);
                    completed++;
                    if (completed === total) {
                        resolve();
                    }
                };
            });
        });
    }
    
    async restoreNotificacoes(notificacoes) {
        const transaction = this.db.transaction(['notificacoes'], 'readwrite');
        const store = transaction.objectStore('notificacoes');
        
        return new Promise((resolve, reject) => {
            let completed = 0;
            const total = notificacoes.length;
            
            notificacoes.forEach(notificacao => {
                const request = store.add(notificacao);
                
                request.onsuccess = () => {
                    completed++;
                    if (completed === total) {
                        resolve();
                    }
                };
                
                request.onerror = () => {
                    console.warn('⚠️ Erro ao restaurar notificação:', request.error);
                    completed++;
                    if (completed === total) {
                        resolve();
                    }
                };
            });
        });
    }
    
    async clearAllData() {
        const stores = [
            'corridas',
            'motoristas',
            'configuracoes',
            'precos',
            'financeiro',
            'notificacoes',
            'backups'
        ];
        
        const promises = stores.map(storeName => 
            this.clearStore(storeName)
        );
        
        return Promise.all(promises);
    }
    
    async clearStore(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
    
    async resetData(type = 'corridas') {
        switch (type) {
            case 'corridas':
                await this.clearStore('corridas');
                await this.clearStore('financeiro');
                break;
                
            case 'motoristas':
                await this.clearStore('motoristas');
                break;
                
            case 'todos':
                await this.clearAllData();
                // Reinitialize default data
                await this.initializeDefaultData();
                break;
                
            default:
                throw new Error(`Tipo de reset não reconhecido: ${type}`);
        }
        
        // Create reset notification
        await this.createNotification({
            titulo: 'Dados Resetados',
            mensagem: `Dados do tipo "${type}" foram resetados`,
            tipo: 'warning',
            data: new Date().toISOString(),
            lida: false
        });
        
        return true;
    }
    
    // ===== Utility Methods =====
    
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
    
    formatDate(date, format = 'dd/MM/yyyy') {
        return DateTime.fromISO(date).toFormat(format);
    }
    
    formatDateTime(date, format = 'dd/MM/yyyy HH:mm') {
        return DateTime.fromISO(date).toFormat(format);
    }
    
    async checkDataConsistency() {
        try {
            const issues = [];
            
            // Check for orphaned data
            const corridas = await this.getCorridas();
            const motoristas = await this.getMotoristas();
            const motoristaNomes = new Set(motoristas.map(m => m.nome));
            
            // Check corridas with non-existent motoristas
            corridas.forEach(corrida => {
                if (!motoristaNomes.has(corrida.motorista)) {
                    issues.push({
                        type: 'orphaned_corrida',
                        message: `Corrida ${corrida.id} referencia motorista inexistente: ${corrida.motorista}`,
                        data: corrida
                    });
                }
            });
            
            // Check for duplicate motorista names
            const nomeCounts = {};
            motoristas.forEach(motorista => {
                nomeCounts[motorista.nome] = (nomeCounts[motorista.nome] || 0) + 1;
            });
            
            Object.entries(nomeCounts).forEach(([nome, count]) => {
                if (count > 1) {
                    issues.push({
                        type: 'duplicate_motorista',
                        message: `Nome duplicado: ${nome} (${count} ocorrências)`
                    });
                }
            });
            
            // Check for invalid prices
            const precos = await this.getPrecosBase();
            precos.forEach(preco => {
                if (preco.valor <= 0) {
                    issues.push({
                        type: 'invalid_price',
                        message: `Preço inválido para ${preco.bairro}: R$ ${preco.valor}`
                    });
                }
            });
            
            return {
                hasIssues: issues.length > 0,
                issues,
                summary: {
                    totalCorridas: corridas.length,
                    totalMotoristas: motoristas.length,
                    totalPrecos: precos.length,
                    totalIssues: issues.length
                }
            };
            
        } catch (error) {
            console.error('❌ Erro ao verificar consistência dos dados:', error);
            throw error;
        }
    }
    
    async fixDataIssues(issues) {
        try {
            const fixesApplied = [];
            
            for (const issue of issues) {
                switch (issue.type) {
                    case 'orphaned_corrida':
                        // Delete orphaned corridas
                        await this.deleteCorrida(issue.data.id);
                        fixesApplied.push({
                            type: issue.type,
                            action: 'deleted',
                            data: issue.data
                        });
                        break;
                        
                    case 'duplicate_motorista':
                        // This would require manual intervention
                        fixesApplied.push({
                            type: issue.type,
                            action: 'requires_manual_fix',
                            message: issue.message
                        });
                        break;
                        
                    case 'invalid_price':
                        // Set default price
                        const defaultPrice = this.defaultPrices[issue.data.bairro] || 50;
                        await this.updatePreco({
                            bairro: issue.data.bairro,
                            valor: defaultPrice
                        });
                        fixesApplied.push({
                            type: issue.type,
                            action: 'fixed',
                            bairro: issue.data.bairro,
                            oldValue: issue.data.valor,
                            newValue: defaultPrice
                        });
                        break;
                }
            }
            
            return fixesApplied;
            
        } catch (error) {
            console.error('❌ Erro ao corrigir problemas de dados:', error);
            throw error;
        }
    }
    
    // ===== Performance Monitoring =====
    
    async getPerformanceMetrics() {
        try {
            const startTime = performance.now();
            
            const [
                corridasCount,
                motoristasCount,
                precosCount,
                financeiroCount,
                notificacoesCount
            ] = await Promise.all([
                this.countStore('corridas'),
                this.countStore('motoristas'),
                this.countStore('precos'),
                this.countStore('financeiro'),
                this.countStore('notificacoes')
            ]);
            
            const endTime = performance.now();
            const queryTime = endTime - startTime;
            
            // Estimate storage size
            const sampleSize = 1000; // bytes per record (estimate)
            const estimatedSize = (corridasCount + motoristasCount + precosCount + financeiroCount + notificacoesCount) * sampleSize;
            
            return {
                queryPerformance: {
                    timeMs: queryTime,
                    queries: 5
                },
                dataSize: {
                    estimatedBytes: estimatedSize,
                    estimatedMB: (estimatedSize / (1024 * 1024)).toFixed(2)
                },
                recordCounts: {
                    corridas: corridasCount,
                    motoristas: motoristasCount,
                    precos: precosCount,
                    financeiro: financeiroCount,
                    notificacoes: notificacoesCount,
                    total: corridasCount + motoristasCount + precosCount + financeiroCount + notificacoesCount
                },
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Erro ao obter métricas de performance:', error);
            throw error;
        }
    }
    
    async countStore(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.count();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    // ===== Maintenance =====
    
    async performMaintenance() {
        try {
            const tasks = [];
            const results = [];
            
            // Task 1: Clear old notifications (older than 90 days)
            tasks.push(async () => {
                const deleted = await this.clearOldNotifications(90);
                results.push({
                    task: 'clear_old_notifications',
                    result: `${deleted.length} notificações antigas removidas`
                });
            });
            
            // Task 2: Check data consistency
            tasks.push(async () => {
                const consistency = await this.checkDataConsistency();
                results.push({
                    task: 'data_consistency_check',
                    result: consistency.hasIssues 
                        ? `${consistency.issues.length} problemas encontrados`
                        : 'Dados consistentes'
                });
            });
            
            // Task 3: Create auto-backup if enabled
            tasks.push(async () => {
                const autoBackup = await this.getSetting('auto_backup');
                if (autoBackup === 'true') {
                    const backup = await this.backupData();
                    await this.saveBackup(backup);
                    results.push({
                        task: 'auto_backup',
                        result: 'Backup automático criado'
                    });
                }
            });
            
            // Execute all tasks
            for (const task of tasks) {
                await task();
            }
            
            // Create maintenance notification
            await this.createNotification({
                titulo: 'Manutenção Realizada',
                mensagem: `Manutenção do banco de dados concluída: ${results.length} tarefas executadas`,
                tipo: 'info',
                data: new Date().toISOString(),
                lida: false
            });
            
            return {
                success: true,
                tasks: results,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Erro na manutenção:', error);
            
            // Create error notification
            await this.createNotification({
                titulo: 'Erro na Manutenção',
                mensagem: `Falha na manutenção do banco de dados: ${error.message}`,
                tipo: 'error',
                data: new Date().toISOString(),
                lida: false
            });
            
            throw error;
        }
    }
    
    // ===== Export/Import =====
    
    async exportToJSON() {
        const data = await this.backupData();
        return JSON.stringify(data, null, 2);
    }
    
    async importFromJSON(jsonString) {
        const data = JSON.parse(jsonString);
        await this.importBackup(data);
    }
    
    // ===== Cleanup =====
    
    async close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
    
    // ===== Event Handlers =====
    
    onDatabaseError(error) {
        console.error('💥 Erro crítico no banco de dados:', error);
        
        // Try to recover
        if (error.name === 'QuotaExceededError') {
            console.warn('⚠️ Quota excedida. Tentando limpar dados antigos...');
            this.clearOldNotifications(30).catch(console.error);
        }
    }
}