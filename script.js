/**
 * Edita um item existente no Map, atualizando os campos English_word e Portuguese_word.
 * @param {number} id - O ID do item a ser editado.
 * @param {string} newEnglish - Novo valor para English_word.
 * @param {string} newPortuguese - Novo valor para Portuguese_word.
 */
function editarItem(id, newEnglish, newPortuguese) {
	if (!itens.has(id)) return false;
	const item = itens.get(id);
	item.English_word = newEnglish;
	item.Portuguese_word = newPortuguese;
	itens.set(id, item);
	salvarLocalStorage();
	atualizarTabela();
	return true;
}

/**
 * Busca itens no Map que correspondem ao termo informado (case insensitive) em English_word ou Portuguese_word.
 * @param {string} termo - O termo de busca.
 * @returns {Array} - Array de itens que correspondem à busca.
 */
function buscarItens(termo) {
	termo = termo.trim().toLowerCase();
	if (termo.length < 3) return Array.from(itens.values());
	return Array.from(itens.values()).filter(
		(item) =>
			item.English_word.toLowerCase().includes(termo) ||
			item.Portuguese_word.toLowerCase().includes(termo)
	);
}

// Atualiza a tabela exibindo apenas os itens filtrados pela busca
function atualizarTabelaFiltrada(itensFiltrados) {
	const tabelaBody = document
		.getElementById('tabela')
		.getElementsByTagName('tbody')[0];
	tabelaBody.innerHTML = '';
	const itemsArray = itensFiltrados.sort((a, b) => b.ID - a.ID);
	itemsArray.forEach((item) => {
		const novaLinha = tabelaBody.insertRow();
		const tableIDCol = novaLinha.insertCell(0);
		const tableEnglishWordCol = novaLinha.insertCell(1);
		const tablePortugueseWordCol = novaLinha.insertCell(2);
		const tableEditCol = novaLinha.insertCell(3);
		const tableRemoveCol = novaLinha.insertCell(4);

		tableIDCol.textContent = item.ID;
		tableEnglishWordCol.textContent = item.English_word;
		tablePortugueseWordCol.textContent = item.Portuguese_word;

		// Botão de edição para cada linha
		const btnEditar = document.createElement('button');
		btnEditar.textContent = 'Edit';
		btnEditar.onclick = function () {
			document.getElementById('english_word').value = item.English_word;
			document.getElementById('portuguese_word').value =
				item.Portuguese_word;
			idEmEdicao = item.ID;
			document
				.querySelector('button[onclick="adicionarEntrada()"]')
				?.setAttribute('hidden', '');
			document
				.querySelector('button[onclick="salvarEdicao()"]')
				?.removeAttribute('hidden');
			const mensagemErro = document.getElementById('mensagem-erro');
			mensagemErro.style.display = 'none';
			mensagemErro.textContent = '';
		};
		tableEditCol.appendChild(btnEditar);

		// Botão de remover para cada linha
		const btnRemover = document.createElement('button');
		btnRemover.textContent = 'Remove';
		btnRemover.onclick = function () {
			removerItem(item.ID);
		};
		tableRemoveCol.appendChild(btnRemover);
	});
}
// Contador para gerar IDs únicos para cada entrada
let contador = 0;
// Mapa que armazena os itens inseridos (ID como chave)
let itens = new Map();
let idEmEdicao = null;

// Ao carregar a página, recupera os dados salvos no localStorage e atualiza a tabela
window.onload = function onload() {
	// Integração do campo de busca
	const buscaInput = document.getElementById('busca');
	const btnBusca = document.getElementById('btn-busca');

	function filtrarTabela() {
		const termo = buscaInput.value;
		const filtrados = buscarItens(termo);
		atualizarTabelaFiltrada(filtrados);
	}

	// Busca ao clicar no botão
	btnBusca.addEventListener('click', filtrarTabela);
	// Busca ao digitar (mínimo 3 letras)
	buscaInput.addEventListener('input', function () {
		if (buscaInput.value.length >= 3 || buscaInput.value.length === 0) {
			filtrarTabela();
		}
	});

	// Exibe todos ao carregar
	filtrarTabela();
	const dadosSalvos = localStorage.getItem('itens');
	if (dadosSalvos) {
		// Recupera array salvo e converte para Map
		const arr = JSON.parse(dadosSalvos);
		itens = new Map(arr.map((item) => [item.ID, item]));
		// Atualiza o contador com base no maior ID salvo
		contador = arr.length > 0 ? Math.max(...arr.map((i) => i.ID)) : 0;
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
	// Salva os itens como array no localStorage
	localStorage.setItem('itens', JSON.stringify(Array.from(itens.values())));
}

// Adiciona uma nova entrada à lista e atualiza a tabela e o localStorage
function adicionarEntrada() {
	// Obtém e limpa os valores dos campos de entrada
	// Referência aos campos de entrada e à área de mensagem de erro
	const english_word = document.getElementById('english_word').value.trim();
	const portuguese_word = document
		.getElementById('portuguese_word')
		.value.trim();
	const mensagemErro = document.getElementById('mensagem-erro');

	// Limpa mensagem de erro anterior
	mensagemErro.style.display = 'none';
	mensagemErro.textContent = '';

	// Se algum dos campos estiver vazio, interrompe a execução da função
	if (!english_word || !portuguese_word) {
		mensagemErro.textContent = 'Please write in both fields to save.';
		mensagemErro.style.display = 'block';
		mensagemErro.style.color = '#ff4d4d';
		return;
	}

	// Verifica se english_word já existe no Map de itens
	let itemExistente = null;
	for (let item of itens.values()) {
		if (item.English_word.toLowerCase() === english_word.toLowerCase()) {
			itemExistente = item;
			break;
		}
	}
	if (itemExistente) {
		// Exibe mensagem de erro se a palavra já existe
		mensagemErro.textContent = `The word "${english_word}" has already been added (ID: ${itemExistente.ID}). Please try again with another word.`;
		mensagemErro.style.display = 'block';
		// Limpa os campos de entrada para nova inserção
		document.getElementById('english_word').value = '';
		document.getElementById('portuguese_word').value = '';
		return;
	}

	// Incrementa o contador para gerar um novo ID
	contador++;
	// Cria o objeto do novo item
	// Monta o novo objeto de item
	const novoItem = {
		ID: contador,
		English_word: english_word,
		Portuguese_word: portuguese_word,
	};

	// Adiciona o novo item ao Map
	itens.set(novoItem.ID, novoItem);
	// Salva os itens atualizados no localStorage
	salvarLocalStorage();
	// Atualiza a tabela exibida
	atualizarTabela();

	// Limpa os campos de entrada para nova inserção
	document.getElementById('english_word').value = '';
	document.getElementById('portuguese_word').value = '';
}

// Atualiza a tabela HTML com os itens do array
function atualizarTabela() {
	// Seleciona o corpo da tabela
	// Obtém referência ao corpo da tabela
	const tabelaBody = document
		.getElementById('tabela')
		.getElementsByTagName('tbody')[0];
	tabelaBody.innerHTML = '';

	// Insere cada item como uma nova linha na tabela (ordem decrescente de ID)
	const itemsArray = Array.from(itens.values()).sort((a, b) => b.ID - a.ID);
	itemsArray.forEach((item) => {
		const novaLinha = tabelaBody.insertRow();
		const tableIDCol = novaLinha.insertCell(0);
		const tableEnglishWordCol = novaLinha.insertCell(1);
		const tablePortugueseWordCol = novaLinha.insertCell(2);
		const tableEditCol = novaLinha.insertCell(3);
		const tableRemoveCol = novaLinha.insertCell(4);

		// Preenche as células com os dados do item
		tableIDCol.textContent = item.ID;
		tableEnglishWordCol.textContent = item.English_word;
		tablePortugueseWordCol.textContent = item.Portuguese_word;

		// Botão de edição para cada linha
		const btnEditar = document.createElement('button');
		btnEditar.textContent = 'Edit';
		btnEditar.onclick = function () {
			document.getElementById('english_word').value = item.English_word;
			document.getElementById('portuguese_word').value =
				item.Portuguese_word;
			idEmEdicao = item.ID;
			document
				.querySelector('button[onclick="adicionarEntrada()"]')
				?.setAttribute('hidden', '');
			document
				.querySelector('button[onclick="salvarEdicao()"]')
				?.removeAttribute('hidden');
			const mensagemErro = document.getElementById('mensagem-erro');
			mensagemErro.style.display = 'none';
			mensagemErro.textContent = '';
		};
		tableEditCol.appendChild(btnEditar);

		// Botão de remover para cada linha
		const btnRemover = document.createElement('button');
		btnRemover.textContent = 'Remove';
		btnRemover.onclick = function () {
			removerItem(item.ID);
		};
		tableRemoveCol.appendChild(btnRemover);
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

function salvarEdicao() {
	const english_word = document.getElementById('english_word').value.trim();
	const portuguese_word = document
		.getElementById('portuguese_word')
		.value.trim();
	const mensagemErro = document.getElementById('mensagem-erro');

	if (!english_word || !portuguese_word) {
		mensagemErro.textContent = 'Please write in both fields to save.';
		mensagemErro.style.display = 'block';
		mensagemErro.style.color = '#ff4d4d';
		return;
	}

	// Verifica se english_word já existe no Map de itens
	let itemExistente = null;
	for (let item of itens.values()) {
		if (item.English_word.toLowerCase() === english_word.toLowerCase()) {
			itemExistente = item;
			break;
		}
	}
	if (itemExistente) {
		// Exibe mensagem de erro se a palavra já existe
		mensagemErro.textContent = `The word "${english_word}" has already been added (ID: ${itemExistente.ID}). Please try again with another word.`;
		mensagemErro.style.display = 'block';
		// Limpa os campos de entrada para nova inserção
		document.getElementById('english_word').value = '';
		document.getElementById('portuguese_word').value = '';
		return;
	}

	if (idEmEdicao !== null) {
		editarItem(idEmEdicao, english_word, portuguese_word);
		mensagemErro.textContent = 'Edit saved successfully!';
		mensagemErro.style.display = 'block';
		mensagemErro.style.color = '#4caf50';
		document.getElementById('english_word').value = '';
		document.getElementById('portuguese_word').value = '';
		document
			.querySelector('button[onclick="salvarEdicao()"]')
			?.setAttribute('hidden', '');
		document
			.querySelector('button[onclick="adicionarEntrada()"]')
			?.removeAttribute('hidden');
		idEmEdicao = null;
		setTimeout(() => {
			mensagemErro.style.display = 'none';
			mensagemErro.style.color = '#ff4d4d';
		}, 2000);
	}
}

/**
 * Remove um item do Map pelo ID, atualiza localStorage e tabela.
 * @param {number} id - O ID do item a ser removido.
 */
function removerItem(id) {
	if (itens.has(id)) {
		itens.delete(id);
		contador--;
		salvarLocalStorage();
		atualizarTabela();
		// Se estiver filtrando, atualiza a tabela filtrada
		const buscaInput = document.getElementById('busca');
		if (buscaInput && buscaInput.value.length >= 3) {
			const filtrados = buscarItens(buscaInput.value);
			atualizarTabelaFiltrada(filtrados);
		}
	}
}

// Adiciona evento de tecla Enter para adicionar entrada
document.getElementById('english_word').addEventListener('keypress', function (e) {
		if (e.key === 'Enter') {
			adicionarEntrada();
		};
	});

// Atualiza o ano de criação no rodapé
const anoDeCriacao = document.getElementById('ano-de-criacao');
const anoCriacaoProjeto = 2025; // Defina o ano de criação do projeto
const anoAtual = new Date().getFullYear();

anoDeCriacao.textContent =
	anoCriacaoProjeto > anoAtual || anoCriacaoProjeto === anoAtual ? anoCriacaoProjeto : `${anoCriacaoProjeto} - ${anoAtual}`;