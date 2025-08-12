document.addEventListener('DOMContentLoaded', function () {
    let valorAdicional = 0; // Variável para armazenar o valor fixo de 30 reais (adicional)

    // Função para adicionar registro
    document.getElementById('form-corrida').addEventListener('submit', function (event) {
        event.preventDefault();

        const motorista = document.getElementById('motorista').value;
        const bairro = document.getElementById('bairro').value;
        const funcionarios = document.getElementById('funcionarios').value;
        const horario = document.getElementById('horario').value;

        if (!motorista || !bairro || !funcionarios || !horario) {
            alert("Por favor, preencha todos os campos!");
            return;
        }

        // Calcula o preço com o valor adicional (se houver)
        const precoBairro = calcularPreco(bairro);
        const precoFinal = precoBairro + valorAdicional;

        const tabela = document.getElementById('tabela-corridas').getElementsByTagName('tbody')[0];
        const novaLinha = tabela.insertRow();

        novaLinha.insertCell(0).textContent = motorista;
        novaLinha.insertCell(1).textContent = bairro;
        novaLinha.insertCell(2).textContent = funcionarios;
        novaLinha.insertCell(3).textContent = horario;
        novaLinha.insertCell(4).textContent = precoFinal.toFixed(2);

        const acoesCell = novaLinha.insertCell(5);
        const excluirBtn = document.createElement('button');
        excluirBtn.textContent = 'Excluir';
        excluirBtn.classList.add('excluir-btn');
        excluirBtn.onclick = () => excluirCorrida(novaLinha);
        acoesCell.appendChild(excluirBtn);

        document.getElementById('form-corrida').reset();
        valorAdicional = 0; // Resetar o valor fixo após adicionar o registro
    });

    // Função para calcular preço baseado no bairro
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

    // Função para excluir registro
    function excluirCorrida(linha) {
        if (confirm("Tem certeza que deseja excluir este registro?")) {
            linha.remove();
        }
    }

    // Adiciona valor fixo de 30 reais ao valor do bairro
    document.getElementById('adicionar-contagem').addEventListener('click', function () {
        valorAdicional = 30;
        alert("Valor fixo de R$30 adicionado à contagem de carros.");
    });

    // Função para gerar planilha
    document.getElementById('gerar-planilha').addEventListener('click', function () {
        const tabela = document.getElementById('tabela-corridas');
        const workbook = XLSX.utils.table_to_book(tabela, { sheet: "Registros" });
        XLSX.writeFile(workbook, "registros.xlsx");
    });
});
