// Charts Management using Chart.js
export default class Charts {
    constructor(app) {
        this.app = app;
        this.db = app.db;
        this.charts = {}; // To store chart instances for updates

        // Default chart options
        this.defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                if (context.dataset.isCurrency) {
                                    label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                                } else {
                                    label += context.parsed.y;
                                }
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            if (this.chart.data.datasets[0].isCurrency) {
                                return 'R$ ' + value;
                            }
                            return value;
                        }
                    }
                }
            }
        };
    }

    // ===== Dashboard Charts =====

    async initDashboardCharts() {
        try {
            const stats = await this.db.getDashboardStats();
            if (stats) {
                this.createLineChart(stats.last7Days);
                this.createPieChart(stats.distribuicaoBairros);
            }
        } catch (error) {
            console.error('❌ Erro ao inicializar gráficos do dashboard:', error);
        }
    }

    createLineChart(chartData) {
        const ctx = document.getElementById('lineChart')?.getContext('2d');
        if (!ctx) return;

        if (this.charts.lineChart) {
            this.charts.lineChart.destroy();
        }

        this.charts.lineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Corridas',
                    data: chartData.data,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: true,
                    tension: 0.3,
                    isCurrency: false
                }]
            },
            options: { ...this.defaultOptions }
        });
    }

    createPieChart(chartData) {
        const ctx = document.getElementById('pieChart')?.getContext('2d');
        if (!ctx) return;

        if (this.charts.pieChart) {
            this.charts.pieChart.destroy();
        }

        const labels = chartData.map(d => d.bairro);
        const data = chartData.map(d => d.count);

        this.charts.pieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Distribuição por Bairro',
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                        'rgba(255, 159, 64, 0.8)'
                    ],
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                    borderWidth: 2,
                    isCurrency: false
                }]
            },
            options: {
                ...this.defaultOptions,
                scales: { y: { display: false } }
            }
        });
    }

    async updateCharts() {
        if (this.app.currentPage !== 'dashboard') return;

        try {
            const stats = await this.db.getDashboardStats();
            if (stats) {
                // Update Line Chart
                if (this.charts.lineChart) {
                    this.charts.lineChart.data.labels = stats.last7Days.labels;
                    this.charts.lineChart.data.datasets[0].data = stats.last7Days.data;
                    this.charts.lineChart.update();
                }

                // Update Pie Chart
                if (this.charts.pieChart) {
                    this.charts.pieChart.data.labels = stats.distribuicaoBairros.map(d => d.bairro);
                    this.charts.pieChart.data.datasets[0].data = stats.distribuicaoBairros.map(d => d.count);
                    this.charts.pieChart.update();
                }
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar gráficos do dashboard:', error);
        }
    }

    // ===== Financeiro Charts =====

    async initFinanceiroCharts() {
        try {
            const data = await this.db.getFinanceiroData();
            if (data) {
                this.createFinanceTrendChart(data.transacoes);
                this.createExpenseCategoryChart(data.categorias.despesas);
            }
        } catch (error) {
            console.error('❌ Erro ao inicializar gráficos financeiros:', error);
        }
    }

    createFinanceTrendChart(transacoes) {
        const ctx = document.getElementById('finance-trend-chart')?.getContext('2d');
        if (!ctx) return;

        if (this.charts.financeTrendChart) {
            this.charts.financeTrendChart.destroy();
        }

        // Group data by month
        const monthlyData = transacoes.reduce((acc, t) => {
            const month = new Date(t.data).toLocaleString('default', { month: 'short', year: '2-digit' });
            if (!acc[month]) {
                acc[month] = { revenue: 0, expense: 0 };
            }
            if (t.tipo === 'revenue') {
                acc[month].revenue += t.valor;
            } else {
                acc[month].expense += t.valor;
            }
            return acc;
        }, {});

        const labels = Object.keys(monthlyData).reverse();
        const revenues = labels.map(l => monthlyData[l].revenue);
        const expenses = labels.map(l => monthlyData[l].expense);

        this.charts.financeTrendChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Receitas',
                        data: revenues,
                        backgroundColor: 'rgba(75, 192, 192, 0.8)',
                        isCurrency: true
                    },
                    {
                        label: 'Despesas',
                        data: expenses,
                        backgroundColor: 'rgba(255, 99, 132, 0.8)',
                        isCurrency: true
                    }
                ]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    x: { stacked: true },
                    y: { stacked: true, ...this.defaultOptions.scales.y }
                }
            }
        });
    }

    createExpenseCategoryChart(categorias) {
        const ctx = document.getElementById('expense-category-chart')?.getContext('2d');
        if (!ctx) return;

        if (this.charts.expenseCategoryChart) {
            this.charts.expenseCategoryChart.destroy();
        }

        const labels = Object.keys(categorias);
        const data = Object.values(categorias).map(c => c.total);

        this.charts.expenseCategoryChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Despesas por Categoria',
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(255, 159, 64, 0.8)',
                        'rgba(255, 205, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(153, 102, 255, 0.8)'
                    ],
                    isCurrency: true
                }]
            },
            options: {
                ...this.defaultOptions,
                scales: { y: { display: false } }
            }
        });
    }

    async updateFinanceiroCharts() {
        if (this.app.currentPage !== 'financeiro') return;

        try {
            const data = await this.db.getFinanceiroData();
            if (data) {
                // For simplicity, we re-create the charts.
                // A more optimized approach would be to update data and call .update()
                this.createFinanceTrendChart(data.transacoes);
                this.createExpenseCategoryChart(data.categorias.despesas);
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar gráficos financeiros:', error);
        }
    }

    destroyChart(chartName) {
        if (this.charts[chartName]) {
            this.charts[chartName].destroy();
            delete this.charts[chartName];
        }
    }
}