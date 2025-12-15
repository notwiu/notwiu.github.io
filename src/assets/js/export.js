// Export Management
export default class Export {
    constructor(app) {
        this.app = app;
    }
    
    async exportToExcel(type, data = null) {
        try {
            let exportData;
            
            switch(type) {
                case 'relatorios':
                    exportData = data || await this.app.db.getRelatoriosData();
                    await this.exportRelatoriosExcel(exportData);
                    break;
                    
                case 'corridas':
                    exportData = data || await this.app.db.getCorridas();
                    await this.exportCorridasExcel(exportData);
                    break;
                    
                case 'motoristas':
                    exportData = data || await this.app.db.getMotoristas();
                    await this.exportMotoristasExcel(exportData);
                    break;
                    
                case 'financeiro':
                    exportData = data || await this.app.db.getFinanceiroData();
                    await this.exportFinanceiroExcel(exportData);
                    break;
                    
                default:
                    throw new Error(`Tipo de exportação não suportado: ${type}`);
            }
            
        } catch (error) {
            console.error('❌ Erro ao exportar para Excel:', error);
            throw error;
        }
    }
    
    async exportToPDF(type, data = null) {
        try {
            let exportData;
            
            switch(type) {
                case 'relatorios':
                    exportData = data || await this.app.db.getRelatoriosData();
                    await this.exportRelatoriosPDF(exportData);
                    break;
                    
                case 'corridas':
                    exportData = data || await this.app.db.getCorridas();
                    await this.exportCorridasPDF(exportData);
                    break;
                    
                case 'motoristas':
                    exportData = data || await this.app.db.getMotoristas();
                    await this.exportMotoristasPDF(exportData);
                    break;
                    
                case 'financeiro':
                    exportData = data || await this.app.db.getFinanceiroData();
                    await this.exportFinanceiroPDF(exportData);
                    break;
                    
                default:
                    throw new Error(`Tipo de exportação não suportado: ${type}`);
            }
            
        } catch (error) {
            console.error('❌ Erro ao exportar para PDF:', error);
            throw error;
        }
    }
    
    async exportBackup(backupData) {
        try {
            // Create a JSON file
            const dataStr = JSON.stringify(backupData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            // Create download link
            const exportFileDefaultName = `backup_taximetro_${new Date().toISOString().slice(0,10)}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
        } catch (error) {
            console.error('❌ Erro ao exportar backup:', error);
            throw error;
        }
    }
    
    async exportRelatoriosExcel(data) {
        // Create workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Relatório');
        
        // Add title
        worksheet.mergeCells('A1:F1');
        worksheet.getCell('A1').value = `Relatório Top Táxi PRO - ${new Date().toLocaleDateString('pt-BR')}`;
        worksheet.getCell('A1').font = { size: 16, bold: true };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };
        
        // Add period
        worksheet.mergeCells('A2:F2');
        worksheet.getCell('A2').value = `Período: ${data.periodo}`;
        worksheet.getCell('A2').font = { italic: true };
        worksheet.getCell('A2').alignment = { horizontal: 'center' };
        
        // Add summary
        worksheet.addRow([]);
        
        const summaryRow = worksheet.addRow([
            'Total de Corridas', 
            'Faturamento Total', 
            'Faturamento Médio', 
            'Receitas', 
            'Despesas', 
            'Lucro'
        ]);
        
        summaryRow.font = { bold: true };
        summaryRow.eachCell(cell => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };
        });
        
        worksheet.addRow([
            data.totalCorridas,
            data.totalFaturamento,
            data.faturamentoMedio,
            data.financeiro?.receitas || 0,
            data.financeiro?.despesas || 0,
            data.financeiro?.lucro || 0
        ]);
        
        worksheet.addRow([]);
        worksheet.addRow([]);
        
        // Add corridas table
        if (data.corridas && data.corridas.length > 0) {
            worksheet.addRow(['Detalhes das Corridas:']);
            worksheet.getRow(worksheet.rowCount).font = { bold: true };
            
            const corridasHeader = worksheet.addRow(['Data', 'Motorista', 'Bairro', 'Funcionários', 'Valor']);
            corridasHeader.font = { bold: true };
            
            data.corridas.forEach(corrida => {
                worksheet.addRow([
                    new Date(corrida.data).toLocaleDateString('pt-BR'),
                    corrida.motorista,
                    corrida.bairro,
                    corrida.funcionarios,
                    corrida.valor
                ]);
            });
            
            // Add total row
            const totalRow = worksheet.addRow([
                '', '', '', 'TOTAL:',
                { formula: `SUM(E${corridasHeader.number + 1}:E${worksheet.rowCount})` }
            ]);
            totalRow.font = { bold: true };
        }
        
        // Auto-size columns
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                const cellLength = cell.value ? cell.value.toString().length : 0;
                if (cellLength > maxLength) {
                    maxLength = cellLength;
                }
            });
            column.width = Math.min(maxLength + 2, 30);
        });
        
        // Generate file
        const buffer = await workbook.xlsx.writeBuffer();
        this.downloadFile(buffer, `relatorio_${new Date().toISOString().slice(0,10)}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
    
    async exportCorridasExcel(corridas) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Corridas');
        
        // Header
        const header = worksheet.addRow(['ID', 'Data', 'Motorista', 'Bairro', 'Funcionários', 'Valor', 'Observações']);
        header.font = { bold: true };
        
        // Data
        corridas.forEach(corrida => {
            worksheet.addRow([
                corrida.id,
                new Date(corrida.data).toLocaleDateString('pt-BR'),
                corrida.motorista,
                corrida.bairro,
                corrida.funcionarios,
                corrida.valor,
                corrida.observacoes || ''
            ]);
        });
        
        // Add totals
        const totalRow = worksheet.addRow([
            '', '', '', '', 'TOTAL:',
            { formula: `SUM(F2:F${worksheet.rowCount})` },
            ''
        ]);
        totalRow.font = { bold: true };
        
        // Auto-size columns
        worksheet.columns.forEach((column, index) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                const cellLength = cell.value ? cell.value.toString().length : 0;
                if (cellLength > maxLength) {
                    maxLength = cellLength;
                }
            });
            column.width = Math.min(maxLength + 2, index === 6 ? 40 : 15);
        });
        
        const buffer = await workbook.xlsx.writeBuffer();
        this.downloadFile(buffer, `corridas_${new Date().toISOString().slice(0,10)}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
    
    async exportMotoristasExcel(motoristas) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Motoristas');
        
        // Header
        const header = worksheet.addRow(['ID', 'Nome', 'Telefone', 'E-mail', 'CPF', 'Status', 'Cadastrado em']);
        header.font = { bold: true };
        
        // Data
        motoristas.forEach(motorista => {
            worksheet.addRow([
                motorista.id,
                motorista.nome,
                motorista.telefone || '',
                motorista.email || '',
                motorista.cpf || '',
                motorista.status,
                new Date(motorista.createdAt).toLocaleDateString('pt-BR')
            ]);
        });
        
        // Auto-size columns
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                const cellLength = cell.value ? cell.value.toString().length : 0;
                if (cellLength > maxLength) {
                    maxLength = cellLength;
                }
            });
            column.width = Math.min(maxLength + 2, 20);
        });
        
        const buffer = await workbook.xlsx.writeBuffer();
        this.downloadFile(buffer, `motoristas_${new Date().toISOString().slice(0,10)}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
    
    async exportFinanceiroExcel(financeiro) {
        const workbook = new ExcelJS.Workbook();
        
        // Summary sheet
        const summarySheet = workbook.addWorksheet('Resumo');
        
        summarySheet.mergeCells('A1:D1');
        summarySheet.getCell('A1').value = 'Resumo Financeiro';
        summarySheet.getCell('A1').font = { size: 16, bold: true };
        
        summarySheet.addRow(['Receitas', 'Despesas', 'Saldo', 'Margem de Lucro']);
        summarySheet.addRow([
            financeiro.totais.receitas,
            financeiro.totais.despesas,
            financeiro.totais.saldo,
            `${((financeiro.totais.saldo / financeiro.totais.receitas) * 100 || 0).toFixed(2)}%`
        ]);
        
        // Transactions sheet
        const transSheet = workbook.addWorksheet('Transações');
        
        const header = transSheet.addRow(['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor', 'Observações']);
        header.font = { bold: true };
        
        financeiro.transacoes.forEach(transacao => {
            transSheet.addRow([
                new Date(transacao.data).toLocaleDateString('pt-BR'),
                transacao.tipo === 'revenue' ? 'Receita' : 'Despesa',
                transacao.description,
                transacao.category,
                transacao.valor,
                transacao.notes || ''
            ]);
        });
        
        // Add totals
        const revenueTotal = financeiro.transacoes
            .filter(t => t.tipo === 'revenue')
            .reduce((sum, t) => sum + Number(t.valor), 0);
        
        const expenseTotal = financeiro.transacoes
            .filter(t => t.tipo === 'expense')
            .reduce((sum, t) => sum + Number(t.valor), 0);
        
        transSheet.addRow([]);
        transSheet.addRow(['', '', '', 'Total Receitas:', revenueTotal]);
        transSheet.addRow(['', '', '', 'Total Despesas:', expenseTotal]);
        transSheet.addRow(['', '', '', 'Saldo:', revenueTotal - expenseTotal]);
        
        // Auto-size columns
        [summarySheet, transSheet].forEach(sheet => {
            sheet.columns.forEach(column => {
                let maxLength = 0;
                column.eachCell({ includeEmpty: true }, cell => {
                    const cellLength = cell.value ? cell.value.toString().length : 0;
                    if (cellLength > maxLength) {
                        maxLength = cellLength;
                    }
                });
                column.width = Math.min(maxLength + 2, 30);
            });
        });
        
        const buffer = await workbook.xlsx.writeBuffer();
        this.downloadFile(buffer, `financeiro_${new Date().toISOString().slice(0,10)}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
    
    async exportRelatoriosPDF(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(20);
        doc.text('Relatório Top Táxi PRO', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 30, { align: 'center' });
        doc.text(`Período: ${data.periodo}`, 105, 35, { align: 'center' });
        
        // Summary
        doc.setFontSize(14);
        doc.text('Resumo', 20, 50);
        
        doc.setFontSize(11);
        const summaryY = 60;
        doc.text(`Total de Corridas: ${data.totalCorridas}`, 20, summaryY);
        doc.text(`Faturamento Total: R$ ${data.totalFaturamento.toFixed(2)}`, 20, summaryY + 6);
        doc.text(`Faturamento Médio: R$ ${data.faturamentoMedio.toFixed(2)}`, 20, summaryY + 12);
        doc.text(`Receitas: R$ ${data.financeiro?.receitas.toFixed(2) || '0.00'}`, 100, summaryY);
        doc.text(`Despesas: R$ ${data.financeiro?.despesas.toFixed(2) || '0.00'}`, 100, summaryY + 6);
        doc.text(`Lucro: R$ ${data.financeiro?.lucro.toFixed(2) || '0.00'}`, 100, summaryY + 12);
        
        // Top Motoristas
        if (data.rankingMotoristas && data.rankingMotoristas.length > 0) {
            const motoristasY = summaryY + 25;
            doc.setFontSize(14);
            doc.text('Top Motoristas', 20, motoristasY);
            
            doc.setFontSize(10);
            let currentY = motoristasY + 8;
            data.rankingMotoristas.slice(0, 5).forEach((motorista, index) => {
                doc.text(`${index + 1}. ${motorista.motorista}`, 20, currentY);
                doc.text(`Corridas: ${motorista.corridas}`, 80, currentY);
                doc.text(`Faturamento: R$ ${motorista.faturamento.toFixed(2)}`, 120, currentY);
                currentY += 6;
            });
        }
        
        // Corridas Table
        if (data.corridas && data.corridas.length > 0) {
            const tableY = summaryY + (data.rankingMotoristas?.length > 0 ? 65 : 40);
            doc.setFontSize(14);
            doc.text('Corridas', 20, tableY);
            
            // Simple table for PDF
            const startY = tableY + 10;
            let currentY = startY;
            
            // Table header
            doc.setFont(undefined, 'bold');
            doc.text('Data', 20, currentY);
            doc.text('Motorista', 50, currentY);
            doc.text('Bairro', 100, currentY);
            doc.text('Valor', 150, currentY);
            currentY += 6;
            
            doc.setFont(undefined, 'normal');
            data.corridas.slice(0, 20).forEach(corrida => {
                if (currentY > 280) {
                    doc.addPage();
                    currentY = 20;
                }
                
                doc.text(new Date(corrida.data).toLocaleDateString('pt-BR'), 20, currentY);
                doc.text(corrida.motorista.substring(0, 15), 50, currentY);
                doc.text(corrida.bairro.substring(0, 15), 100, currentY);
                doc.text(`R$ ${Number(corrida.valor).toFixed(2)}`, 150, currentY);
                currentY += 6;
            });
        }
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text(`Página ${i} de ${pageCount}`, 195, 290, { align: 'right' });
        }
        
        // Save PDF
        doc.save(`relatorio_${new Date().toISOString().slice(0,10)}.pdf`);
    }
    
    async exportCorridasPDF(corridas) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text('Relatório de Corridas', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Total: ${corridas.length} corridas`, 105, 30, { align: 'center' });
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 35, { align: 'center' });
        
        // Summary
        const totalFaturamento = corridas.reduce((sum, c) => sum + Number(c.valor), 0);
        const avgFaturamento = corridas.length > 0 ? totalFaturamento / corridas.length : 0;
        
        doc.setFontSize(14);
        doc.text('Resumo', 20, 50);
        
        doc.setFontSize(11);
        doc.text(`Total de Corridas: ${corridas.length}`, 20, 60);
        doc.text(`Faturamento Total: R$ ${totalFaturamento.toFixed(2)}`, 20, 66);
        doc.text(`Faturamento Médio: R$ ${avgFaturamento.toFixed(2)}`, 20, 72);
        
        // Table
        const startY = 90;
        let currentY = startY;
        
        doc.setFont(undefined, 'bold');
        doc.text('Data', 20, currentY);
        doc.text('Motorista', 50, currentY);
        doc.text('Bairro', 100, currentY);
        doc.text('Valor', 150, currentY);
        currentY += 6;
        
        doc.setFont(undefined, 'normal');
        corridas.forEach(corrida => {
            if (currentY > 280) {
                doc.addPage();
                currentY = 20;
            }
            
            doc.text(new Date(corrida.data).toLocaleDateString('pt-BR'), 20, currentY);
            doc.text(corrida.motorista.substring(0, 15), 50, currentY);
            doc.text(corrida.bairro.substring(0, 15), 100, currentY);
            doc.text(`R$ ${Number(corrida.valor).toFixed(2)}`, 150, currentY);
            currentY += 6;
        });
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text(`Página ${i} de ${pageCount}`, 195, 290, { align: 'right' });
        }
        
        doc.save(`corridas_${new Date().toISOString().slice(0,10)}.pdf`);
    }
    
    async exportMotoristasPDF(motoristas) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text('Relatório de Motoristas', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Total: ${motoristas.length} motoristas`, 105, 30, { align: 'center' });
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 35, { align: 'center' });
        
        // Summary by status
        const statusCount = motoristas.reduce((acc, m) => {
            acc[m.status] = (acc[m.status] || 0) + 1;
            return acc;
        }, {});
        
        doc.setFontSize(14);
        doc.text('Resumo por Status', 20, 50);
        
        doc.setFontSize(11);
        let currentY = 60;
        Object.entries(statusCount).forEach(([status, count]) => {
            doc.text(`${status.charAt(0).toUpperCase() + status.slice(1)}: ${count}`, 20, currentY);
            currentY += 6;
        });
        
        // Table
        const startY = currentY + 10;
        currentY = startY;
        
        doc.setFont(undefined, 'bold');
        doc.text('Nome', 20, currentY);
        doc.text('Telefone', 80, currentY);
        doc.text('Status', 140, currentY);
        currentY += 6;
        
        doc.setFont(undefined, 'normal');
        motoristas.forEach(motorista => {
            if (currentY > 280) {
                doc.addPage();
                currentY = 20;
            }
            
            doc.text(motorista.nome.substring(0, 20), 20, currentY);
            doc.text(motorista.telefone || '—', 80, currentY);
            doc.text(motorista.status, 140, currentY);
            currentY += 6;
        });
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text(`Página ${i} de ${pageCount}`, 195, 290, { align: 'right' });
        }
        
        doc.save(`motoristas_${new Date().toISOString().slice(0,10)}.pdf`);
    }
    
    async exportFinanceiroPDF(financeiro) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text('Relatório Financeiro', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 30, { align: 'center' });
        
        // Summary
        doc.setFontSize(14);
        doc.text('Resumo Financeiro', 20, 50);
        
        doc.setFontSize(11);
        const summaryY = 60;
        doc.text(`Receitas: R$ ${financeiro.totais.receitas.toFixed(2)}`, 20, summaryY);
        doc.text(`Despesas: R$ ${financeiro.totais.despesas.toFixed(2)}`, 20, summaryY + 6);
        doc.text(`Saldo: R$ ${financeiro.totais.saldo.toFixed(2)}`, 20, summaryY + 12);
        
        const margin = financeiro.totais.receitas > 0 
            ? (financeiro.totais.saldo / financeiro.totais.receitas) * 100 
            : 0;
        doc.text(`Margem de Lucro: ${margin.toFixed(2)}%`, 20, summaryY + 18);
        
        // Transactions
        const tableY = summaryY + 30;
        doc.setFontSize(14);
        doc.text('Transações', 20, tableY);
        
        let currentY = tableY + 10;
        
        doc.setFont(undefined, 'bold');
        doc.text('Data', 20, currentY);
        doc.text('Tipo', 50, currentY);
        doc.text('Descrição', 80, currentY);
        doc.text('Valor', 150, currentY);
        currentY += 6;
        
        doc.setFont(undefined, 'normal');
        financeiro.transacoes.forEach(transacao => {
            if (currentY > 280) {
                doc.addPage();
                currentY = 20;
            }
            
            doc.text(new Date(transacao.data).toLocaleDateString('pt-BR'), 20, currentY);
            doc.text(transacao.tipo === 'revenue' ? 'Receita' : 'Despesa', 50, currentY);
            doc.text(transacao.description.substring(0, 20), 80, currentY);
            doc.text(`R$ ${Number(transacao.valor).toFixed(2)}`, 150, currentY);
            currentY += 6;
        });
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text(`Página ${i} de ${pageCount}`, 195, 290, { align: 'right' });
        }
        
        doc.save(`financeiro_${new Date().toISOString().slice(0,10)}.pdf`);
    }
    
    downloadFile(data, filename, mimeType) {
        const blob = new Blob([data], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(url);
    }
    
    async exportToCSV(type, data = null) {
        try {
            let exportData;
            let filename;
            let headers;
            let rows;
            
            switch(type) {
                case 'corridas':
                    exportData = data || await this.app.db.getCorridas();
                    filename = `corridas_${new Date().toISOString().slice(0,10)}.csv`;
                    headers = ['ID', 'Data', 'Motorista', 'Bairro', 'Funcionários', 'Valor', 'Observações'];
                    rows = exportData.map(c => [
                        c.id,
                        new Date(c.data).toLocaleDateString('pt-BR'),
                        c.motorista,
                        c.bairro,
                        c.funcionarios,
                        c.valor,
                        c.observacoes || ''
                    ]);
                    break;
                    
                case 'motoristas':
                    exportData = data || await this.app.db.getMotoristas();
                    filename = `motoristas_${new Date().toISOString().slice(0,10)}.csv`;
                    headers = ['ID', 'Nome', 'Telefone', 'E-mail', 'CPF', 'Status', 'Cadastrado em'];
                    rows = exportData.map(m => [
                        m.id,
                        m.nome,
                        m.telefone || '',
                        m.email || '',
                        m.cpf || '',
                        m.status,
                        new Date(m.createdAt).toLocaleDateString('pt-BR')
                    ]);
                    break;
                    
                default:
                    throw new Error(`Tipo de exportação CSV não suportado: ${type}`);
            }
            
            // Convert to CSV
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => 
                    typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
                ).join(','))
            ].join('\n');
            
            this.downloadFile(csvContent, filename, 'text/csv');
            
        } catch (error) {
            console.error('❌ Erro ao exportar para CSV:', error);
            throw error;
        }
    }
}