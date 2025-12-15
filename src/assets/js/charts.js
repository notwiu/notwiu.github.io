// Charts Management
export default class Charts {
    constructor(app) {
        this.app = app;
        this.charts = new Map();
        this.chartColors = {
            primary: 'rgba(59, 130, 246, 0.8)',
            success: 'rgba(34, 197, 94, 0.8)',
            warning: 'rgba(245, 158, 11, 0.8)',
            danger: 'rgba(239, 68, 68, 0.8)',
            info: 'rgba(14, 165, 233, 0.8)',
            purple: 'rgba(147, 51, 234, 0.8)',
            pink: 'rgba(236, 72, 153, 0.8)',
            teal: 'rgba(20, 184, 166, 0.8)'
        };
    }
    
    async initDashboardCharts() {
        try {
            const stats = await this.app.db.getDashboardStats();
            
            // Line chart for last 7 days
            await this.initLineChart(stats);
            
            // Pie chart for neighborhood distribution
            await this.initPieChart(stats);
            
        } catch (error) {
            console.error('❌ Erro ao inicializar gráficos:', error);
        }
    }
    
    async initLineChart(stats) {
        const ctx = document.getElementById('lineChart');
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.charts.has('lineChart')) {
            this.charts.get('lineChart').destroy();
        }
        
        const labels = stats.last7Days?.labels || [];
        const data = stats.last7Days?.data || [];
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Corridas por Dia',
                    data: data,
                    borderColor: this.chartColors.primary,
                    backgroundColor: this.chartColors.primary.replace('0.8', '0.1'),
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                }
            }
        });
        
        this.charts.set('lineChart', chart);
        
        // Add refresh button event
        const refreshBtn = document.getElementById('refresh-chart');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.updateCharts());
        }
    }
    
    async initPieChart(stats) {
        const ctx = document.getElementById('pieChart');
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.charts.has('pieChart')) {
            this.charts.get('pieChart').destroy();
        }
        
        const distribution = stats.distribuicaoBairros || [];
        const labels = distribution.map(item => item.bairro);
        const data = distribution.map(item => item.count);
        
        // Generate colors
        const backgroundColors = this.generateColors(labels.length);
        
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 1,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
        
        this.charts.set('pieChart', chart);
        
        // Add toggle chart type button
        const toggleBtn = document.getElementById('toggle-chart-type');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleChartType(chart));
        }
    }
    
    async initFinanceiroCharts() {
        try {
            const financeiro = await this.app.db.getFinanceiroData();
            
            // Trend chart
            await this.initFinanceTrendChart(financeiro);
            
            // Expense category chart
            await this.initExpenseCategoryChart(financeiro);
            
        } catch (error) {
            console.error('❌ Erro ao inicializar gráficos financeiros:', error);
        }
    }
    
    async initFinanceTrendChart(financeiro) {
        const ctx = document.getElementById('finance-trend-chart');
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.charts.has('financeTrendChart')) {
            this.charts.get('financeTrendChart').destroy();
        }
        
        // Get last 30 days of data
        const last30Days = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            last30Days.push(date.toISOString().split('T')[0]);
        }
        
        // Group data by day
        const dailyData = {};
        last30Days.forEach(date => {
            dailyData[date] = { revenue: 0, expense: 0 };
        });
        
        financeiro.transacoes?.forEach(transacao => {
            const date = transacao.data.split('T')[0];
            if (dailyData[date]) {
                if (transacao.tipo === 'revenue') {
                    dailyData[date].revenue += Number(transacao.valor);
                } else {
                    dailyData[date].expense += Number(transacao.valor);
                }
            }
        });
        
        const labels = last30Days.map(date => 
            new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
        );
        
        const revenueData = last30Days.map(date => dailyData[date].revenue);
        const expenseData = last30Days.map(date => dailyData[date].expense);
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Receitas',
                        data: revenueData,
                        borderColor: this.chartColors.success,
                        backgroundColor: this.chartColors.success.replace('0.8', '0.1'),
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Despesas',
                        data: expenseData,
                        borderColor: this.chartColors.danger,
                        backgroundColor: this.chartColors.danger.replace('0.8', '0.1'),
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                const value = context.raw || 0;
                                return `${context.dataset.label}: R$ ${value.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value;
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
        this.charts.set('financeTrendChart', chart);
    }
    
    async initExpenseCategoryChart(financeiro) {
        const ctx = document.getElementById('expense-category-chart');
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.charts.has('expenseCategoryChart')) {
            this.charts.get('expenseCategoryChart').destroy();
        }
        
        const categories = financeiro.categorias?.despesas || {};
        const labels = Object.keys(categories);
        const data = Object.values(categories).map(cat => cat.total);
        
        const chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: this.generateColors(labels.length),
                    borderWidth: 1,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: R$ ${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        this.charts.set('expenseCategoryChart', chart);
    }
    
    async initRelatoriosCharts(data) {
        // Daily chart
        await this.initReportDailyChart(data);
        
        // Driver chart
        await this.initReportDriverChart(data);
        
        // Revenue chart
        await this.initReportRevenueChart(data);
        
        // Monthly chart
        await this.initReportMonthlyChart(data);
    }
    
    async initReportDailyChart(data) {
        const ctx = document.getElementById('report-daily-chart');
        if (!ctx) return;
        
        if (this.charts.has('reportDailyChart')) {
            this.charts.get('reportDailyChart').destroy();
        }
        
        const last30Days = data.last30Days || { labels: [], data: [] };
        
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: last30Days.labels,
                datasets: [{
                    label: 'Corridas por Dia',
                    data: last30Days.data.map((_, i) => data.corridas?.filter(c => {
                        const date = new Date(c.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                        return date === last30Days.labels[i];
                    }).length || 0),
                    backgroundColor: this.chartColors.primary,
                    borderColor: this.chartColors.primary,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
        
        this.charts.set('reportDailyChart', chart);
    }
    
    async initReportDriverChart(data) {
        const ctx = document.getElementById('report-driver-chart');
        if (!ctx) return;
        
        if (this.charts.has('reportDriverChart')) {
            this.charts.get('reportDriverChart').destroy();
        }
        
        const topMotoristas = data.rankingMotoristas?.slice(0, 5) || [];
        const labels = topMotoristas.map(m => m.motorista);
        const values = topMotoristas.map(m => m.faturamento);
        
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: this.generateColors(labels.length)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
        
        this.charts.set('reportDriverChart', chart);
    }
    
    async initReportRevenueChart(data) {
        const ctx = document.getElementById('report-revenue-chart');
        if (!ctx) return;
        
        if (this.charts.has('reportRevenueChart')) {
            this.charts.get('reportRevenueChart').destroy();
        }
        
        const last30Days = data.last30Days || { labels: [], data: [] };
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last30Days.labels,
                datasets: [{
                    label: 'Faturamento Diário',
                    data: last30Days.data,
                    borderColor: this.chartColors.success,
                    backgroundColor: this.chartColors.success.replace('0.8', '0.1'),
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value;
                            }
                        }
                    }
                }
            }
        });
        
        this.charts.set('reportRevenueChart', chart);
    }
    
    async initReportMonthlyChart(data) {
        const ctx = document.getElementById('report-monthly-chart');
        if (!ctx) return;
        
        if (this.charts.has('reportMonthlyChart')) {
            this.charts.get('reportMonthlyChart').destroy();
        }
        
        // Get data for last 6 months
        const last6Months = [];
        const today = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(today);
            date.setMonth(date.getMonth() - i);
            last6Months.push({
                month: date.toLocaleDateString('pt-BR', { month: 'short' }),
                year: date.getFullYear()
            });
        }
        
        // Calculate monthly totals
        const monthlyData = last6Months.map(({ month, year }) => {
            const total = data.corridas?.filter(c => {
                const date = new Date(c.data);
                return date.getMonth() === new Date(`${month} 1, ${year}`).getMonth() &&
                       date.getFullYear() === year;
            }).reduce((sum, c) => sum + Number(c.valor), 0) || 0;
            
            return total;
        });
        
        const labels = last6Months.map(({ month, year }) => `${month}/${year.toString().slice(-2)}`);
        
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Faturamento Mensal',
                    data: monthlyData,
                    backgroundColor: this.generateColors(labels.length, 0.7),
                    borderColor: this.generateColors(labels.length, 1),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value;
                            }
                        }
                    }
                }
            }
        });
        
        this.charts.set('reportMonthlyChart', chart);
    }
    
    async updateCharts() {
        try {
            const stats = await this.app.db.getDashboardStats();
            
            // Update line chart
            const lineChart = this.charts.get('lineChart');
            if (lineChart && stats.last7Days) {
                lineChart.data.labels = stats.last7Days.labels;
                lineChart.data.datasets[0].data = stats.last7Days.data;
                lineChart.update();
            }
            
            // Update pie chart
            const pieChart = this.charts.get('pieChart');
            if (pieChart && stats.distribuicaoBairros) {
                const labels = stats.distribuicaoBairros.map(item => item.bairro);
                const data = stats.distribuicaoBairros.map(item => item.count);
                
                pieChart.data.labels = labels;
                pieChart.data.datasets[0].data = data;
                pieChart.update();
            }
            
        } catch (error) {
            console.error('❌ Erro ao atualizar gráficos:', error);
        }
    }
    
    async updateFinanceiroCharts() {
        try {
            const financeiro = await this.app.db.getFinanceiroData();
            
            // Update trend chart
            const trendChart = this.charts.get('financeTrendChart');
            if (trendChart) {
                // Reinitialize the chart with new data
                trendChart.destroy();
                await this.initFinanceTrendChart(financeiro);
            }
            
            // Update category chart
            const categoryChart = this.charts.get('expenseCategoryChart');
            if (categoryChart) {
                categoryChart.destroy();
                await this.initExpenseCategoryChart(financeiro);
            }
            
        } catch (error) {
            console.error('❌ Erro ao atualizar gráficos financeiros:', error);
        }
    }
    
    toggleChartType(chart) {
        const currentType = chart.config.type;
        const newType = currentType === 'doughnut' ? 'pie' : 'doughnut';
        
        chart.config.type = newType;
        chart.update();
        
        // Update button icon
        const toggleBtn = document.getElementById('toggle-chart-type');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.className = newType === 'doughnut' ? 'fas fa-exchange-alt' : 'fas fa-exchange-alt';
            }
        }
    }
    
    generateColors(count, alpha = 0.8) {
        const colors = [
            this.chartColors.primary,
            this.chartColors.success,
            this.chartColors.warning,
            this.chartColors.danger,
            this.chartColors.info,
            this.chartColors.purple,
            this.chartColors.pink,
            this.chartColors.teal
        ];
        
        // If we need more colors than available, generate variations
        const result = [];
        for (let i = 0; i < count; i++) {
            if (i < colors.length) {
                result.push(colors[i].replace('0.8', alpha.toString()));
            } else {
                // Generate random color
                const hue = (i * 137.508) % 360; // Use golden angle
                result.push(`hsla(${hue}, 70%, 65%, ${alpha})`);
            }
        }
        
        return result;
    }
    
    // Cleanup
    destroy() {
        this.charts.forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts.clear();
    }
}