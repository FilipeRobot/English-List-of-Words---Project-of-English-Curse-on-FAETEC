// Contador para gerar IDs únicos para cada entrada
let contador = 0;
// Array que armazena os itens inseridos
let itens = [];

// Ao carregar a página, recupera os dados salvos no localStorage e atualiza a tabela
window.onload = function () {
	const dadosSalvos = localStorage.getItem('itens');
	if (dadosSalvos) {
		itens = JSON.parse(dadosSalvos);
		// Atualiza o contador com base no último ID salvo
		contador = itens.length > 0 ? itens[0].ID : 0;
		atualizarTabela();
	}

	// Recupera preferência de tema salva e aplica se necessário
	const temaSalvo = localStorage.getItem('tema');
	if (temaSalvo === 'claro') {
		document.body.classList.add('light-theme');
	}
};

// Salva o array de itens no localStorage
function salvarLocalStorage() {
	localStorage.setItem('itens', JSON.stringify(itens));
}

// Adiciona uma nova entrada à lista e atualiza a tabela e o localStorage
function adicionarEntrada() {
	// Obtém e limpa os valores dos campos de entrada
	// Referência aos campos de entrada e à área de mensagem de erro
	const campo1 = document.getElementById('campo1').value.trim();
	const campo2 = document.getElementById('campo2').value.trim();
	const mensagemErro = document.getElementById('mensagem-erro');

	// Limpa mensagem de erro anterior
	mensagemErro.style.display = 'none';
	mensagemErro.textContent = '';

	// Se algum dos campos estiver vazio, interrompe a execução da função
	if (!campo1 || !campo2) return;

	// Verifica se campo1 já existe no array de itens
	const itemExistente = itens.find(
		(item) => item.Campo1.toLowerCase() === campo1.toLowerCase()
	);

	if (itemExistente) {
		// Exibe mensagem de erro se a palavra já existe
		mensagemErro.textContent = `A palavra "${campo1}" já foi adicionada anteriormente (ID: ${itemExistente.ID}). Tente novamente com outra entrada.`;
		mensagemErro.style.display = 'block';
		// Limpa os campos de entrada para nova inserção
		document.getElementById('campo1').value = '';
		document.getElementById('campo2').value = '';
		return;
	}

	// Incrementa o contador para gerar um novo ID
	contador++;
	// Cria o objeto do novo item
	// Monta o novo objeto de item
	const novoItem = {
		ID: contador,
		Campo1: campo1,
		Campo2: campo2,
	};

	// Adiciona o novo item no início do array
	itens.unshift(novoItem);
	// Salva os itens atualizados no localStorage
	salvarLocalStorage();
	// Atualiza a tabela exibida
	atualizarTabela();

	// Limpa os campos de entrada para nova inserção
	document.getElementById('campo1').value = '';
	document.getElementById('campo2').value = '';
}

// Atualiza a tabela HTML com os itens do array
function atualizarTabela() {
	// Seleciona o corpo da tabela
	// Obtém referência ao corpo da tabela
	const tabelaBody = document
		.getElementById('tabela')
		.getElementsByTagName('tbody')[0];
	// Limpa o conteúdo atual da tabela
	tabelaBody.innerHTML = '';

	// Insere cada item como uma nova linha na tabela
	itens.forEach((item) => {
		const novaLinha = tabelaBody.insertRow();
		const celulaId = novaLinha.insertCell(0);
		const celula1 = novaLinha.insertCell(1);
		const celula2 = novaLinha.insertCell(2);

		// Preenche as células com os dados do item
		celulaId.textContent = item.ID;
		celula1.textContent = item.Campo1;
		celula2.textContent = item.Campo2;
	});
}

// Alterna o tema entre claro e escuro
function alternarTema() {
	// Alterna a classe do body para mudar o tema
	document.body.classList.toggle('light-theme');
	// Salva a preferência do usuário no localStorage
	const tema = document.body.classList.contains('light-theme')
		? 'claro'
		: 'escuro';
	localStorage.setItem('tema', tema);
}
