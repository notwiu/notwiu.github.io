document.getElementById('form-corrida').addEventListener('submit', function(event) {
    event.preventDefault();

    const motorista = document.getElementById('motorista').value;
    const bairro = document.getElementById('bairro').value;
    const funcionarios = document.getElementById('funcionarios').value;

    if (!motorista || !bairro || !funcionarios) {
        alert("Por favor, preencha todos os campos!");
        return;
    }

    const preco = calcularPreco(bairro);

    const tabela = document.getElementById('tabela-corridas').getElementsByTagName('tbody')[0];
    const novaLinha = tabela.insertRow();

    novaLinha.insertCell(0).textContent = motorista;
    novaLinha.insertCell(1).textContent = bairro;
    novaLinha.insertCell(2).textContent = funcionarios;
    novaLinha.insertCell(3).textContent = preco.toFixed(2);

    const acoesCell = novaLinha.insertCell(4);
    const excluirBtn = document.createElement('button');
    excluirBtn.textContent = 'Excluir';
    excluirBtn.classList.add('excluir-btn');
    excluirBtn.onclick = () => excluirCorrida(novaLinha);
    acoesCell.appendChild(excluirBtn);

    document.getElementById('form-corrida').reset();
});

function calcularPreco(bairro) {
    const precos = {
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
    return precos[bairro] || 0;
}

document.getElementById('gerar-planilha').addEventListener('click', function() {
    const tabela = document.getElementById('tabela-corridas');
    const corridas = [];

    for (let i = 1; i < tabela.rows.length; i++) {
        const row = tabela.rows[i];
        const corrida = {
            Motorista: row.cells[0].textContent,
            Bairro: row.cells[1].textContent,
            Funcionários: row.cells[2].textContent,
            Preço: row.cells[3].textContent
        };
        corridas.push(corrida);
    }

    if (corridas.length === 0) {
        alert("Nenhuma corrida registrada!");
        return;
    }

    gerarExcel(corridas);
});

function gerarExcel(dados) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dados);
    XLSX.utils.book_append_sheet(wb, ws, "Corridas");

    XLSX.writeFile(wb, "corridas_taxista.xlsx");
}

function excluirCorrida(linha) {
    if (confirm("Tem certeza que deseja excluir esta corrida?")) {
        linha.remove();
    }
}
