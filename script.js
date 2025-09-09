/**
 * WordListApp - Gerencia a lista de palavras, renderização, validação e persistência.
 * Encapsula todo o estado e métodos do app.
 */
const WordListApp = {
    /**
     * Mapa que armazena os itens inseridos (ID como chave)
     */
    itens: new Map(),
    /**
     * ID do item em edição
     */
    idEmEdicao: null,

    /**
     * Inicializa o app, recupera dados, configura eventos e renderiza tabela.
     */
    init() {
        this.loadFromStorage();
        this.setupEvents();
        this.renderTable();
        this.applyTheme();
    },

    /**
     * Recupera itens do localStorage e atualiza o Map.
     */
    loadFromStorage() {
        const dadosSalvos = localStorage.getItem('itens');
        if (dadosSalvos) {
            const arr = JSON.parse(dadosSalvos);
            this.itens = new Map(arr.map(item => [item.ID, item]));
        }
    },

    /**
     * Salva o array de itens no localStorage.
     */
    saveToStorage() {
        localStorage.setItem('itens', JSON.stringify(Array.from(this.itens.values())));
    },

    /**
     * Configura eventos dos inputs, botões e tema.
     */
    setupEvents() {
        document.getElementById('btn-busca').addEventListener('click', () => this.renderTable());
        document.getElementById('busca').addEventListener('input', () => this.renderTable());
        document.getElementById('english_word').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addItem();
        });
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('add-item').onclick = () => this.addItem();
        document.getElementById('save-item').onclick = () => this.saveEdit();
        document.getElementById('cancel-edit').onclick = () => this.cancelEdit();
    },

    /**
     * Aplica o tema salvo no localStorage.
     */
    applyTheme() {
        const temaSalvo = localStorage.getItem('tema');
        if (temaSalvo === 'claro') {
            document.body.classList.add('light-theme');
        }
    },

    /**
     * Alterna o tema entre claro e escuro, salvando a preferência.
     */
    toggleTheme() {
        document.body.classList.toggle('light-theme');
        localStorage.setItem('tema', document.body.classList.contains('light-theme') ? 'claro' : 'escuro');
    },

    /**
     * Valida os campos de entrada e verifica duplicidade.
     * @param {string} english_word
     * @param {string} portuguese_word
     * @returns {string|null} - Mensagem de erro ou null se válido
     */
    validateFields(english_word, portuguese_word) {
        if (!english_word || !portuguese_word) {
            return 'Please write in both fields to save.';
        }
        for (let item of this.itens.values()) {
            if (item.English_word.toLowerCase() === english_word.toLowerCase()) {
                return `The word "${english_word}" has already been added (ID: ${item.ID}). Please try again with another word.`;
            }
        }
        return null;
    },

    /**
     * Exibe mensagem de erro ou sucesso.
     * @param {string} msg
     * @param {string} color
     */
    showMessage(msg, color = '#ff4d4d') {
        const mensagemErro = document.getElementById('mensagem-erro');
        mensagemErro.textContent = msg;
        mensagemErro.style.display = 'block';
        mensagemErro.style.color = color;
        if (color === '#4caf50') {
            setTimeout(() => {
                mensagemErro.style.display = 'none';
                mensagemErro.style.color = '#ff4d4d';
            }, 2000);
        }
    },

    /**
     * Limpa os campos de entrada.
     */
    clearFields() {
        document.getElementById('english_word').value = '';
        document.getElementById('portuguese_word').value = '';
    },

    /**
     * Busca itens no Map que correspondem ao termo informado (case insensitive) em English_word ou Portuguese_word.
     * @param {string} termo - O termo de busca.
     * @returns {Array} - Array de itens que correspondem à busca.
     */
    searchItems(termo) {
        termo = termo.trim().toLowerCase();
        if (termo.length < 3) return Array.from(this.itens.values());
        return Array.from(this.itens.values()).filter(
            item => item.English_word.toLowerCase().includes(termo) || item.Portuguese_word.toLowerCase().includes(termo)
        );
    },

    /**
     * Adiciona um novo item à lista, valida campos e atualiza a tabela.
     */
    addItem() {
        const english_word = document.getElementById('english_word').value.trim();
        const portuguese_word = document.getElementById('portuguese_word').value.trim();
        const error = this.validateFields(english_word, portuguese_word);
        if (error) {
            this.showMessage(error);
            return;
        }
        // Calcula o próximo ID sequencial
        const nextID = this.itens.size > 0 ? Math.max(...Array.from(this.itens.values()).map(i => i.ID)) + 1 : 1;
        const novoItem = {
            ID: nextID,
            English_word: english_word,
            Portuguese_word: portuguese_word,
        };
        this.itens.set(novoItem.ID, novoItem);
        this.saveToStorage();
        this.renderTable();
        this.clearFields();
    },

    /**
     * Prepara os campos para edição de um item.
     * @param {object} item - O item a ser editado
     */
    startEdit(item) {
        document.getElementById('english_word').value = item.English_word;
        document.getElementById('portuguese_word').value = item.Portuguese_word;
        this.idEmEdicao = item.ID;
        document.getElementById('add-item')?.setAttribute('hidden', '');
        document.getElementById('save-item')?.removeAttribute('hidden');
        document.getElementById('cancel-edit')?.removeAttribute('hidden');
        this.showMessage('', '#ff4d4d');
        document.getElementById('mensagem-erro').style.display = 'none';
    },

    /**
     * Salva as edições feitas no item selecionado e atualiza a tabela.
     */
    saveEdit() {
        const english_word = document.getElementById('english_word').value.trim();
        const portuguese_word = document.getElementById('portuguese_word').value.trim();
        const error = this.validateFields(english_word, portuguese_word);
        if (error) {
            this.showMessage(error);
            return;
        }
        if (this.idEmEdicao !== null) {
            this.editItem(this.idEmEdicao, english_word, portuguese_word);
            this.showMessage('Edit saved successfully!', '#4caf50');
            this.clearFields();
            document.getElementById('save-item')?.setAttribute('hidden', '');
            document.getElementById('cancel-edit')?.setAttribute('hidden', '');
            document.getElementById('add-item')?.removeAttribute('hidden');
            this.idEmEdicao = null;
        }
    },

    /**
     * Edita um item existente no Map.
     * @param {number} id
     * @param {string} newEnglish
     * @param {string} newPortuguese
     */
    editItem(id, newEnglish, newPortuguese) {
        if (!this.itens.has(id)) return false;
        const item = this.itens.get(id);
        item.English_word = newEnglish;
        item.Portuguese_word = newPortuguese;
        this.itens.set(id, item);
        this.saveToStorage();
        this.renderTable();
        return true;
    },

    /**
     * Remove um item do Map pelo ID, atualiza localStorage e tabela.
     * Após a remoção, atualiza os IDs dos itens restantes para manter a sequência.
     * @param {number} id - O ID do item a ser removido.
     */
    removeItem(id) {
        if (this.itens.has(id)) {
            this.itens.delete(id);
            // Atualiza os IDs dos itens restantes para manter sequência
            const novosItens = Array.from(this.itens.values())
                .sort((a, b) => a.ID - b.ID)
                .map((item, idx) => ({
                    ...item,
                    ID: idx + 1
                }));
            this.itens = new Map(novosItens.map(item => [item.ID, item]));
            this.saveToStorage();
            this.renderTable();
        }
    },

    /**
     * Cancela a edição, limpa campos e retorna ao modo de adição.
     */
    cancelEdit() {
        this.clearFields();
        document.getElementById('save-item')?.setAttribute('hidden', '');
        document.getElementById('cancel-edit')?.setAttribute('hidden', '');
        document.getElementById('add-item')?.removeAttribute('hidden');
        this.idEmEdicao = null;
        this.showMessage('', '#ff4d4d');
        document.getElementById('mensagem-erro').style.display = 'none';
    },

    /**
     * Renderiza a tabela de itens, filtrando se houver termo de busca.
     */
    renderTable() {
        const tabelaBody = document.getElementById('tabela').getElementsByTagName('tbody')[0];
        tabelaBody.innerHTML = '';
        const termo = document.getElementById('busca').value;
        const itemsArray = this.searchItems(termo).sort((a, b) => b.ID - a.ID);
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
            // Botão de edição
            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Edit';
			btnEditar.className = 'edit';
            btnEditar.onclick = () => this.startEdit(item);
            tableEditCol.appendChild(btnEditar);
            // Botão de remover
            const btnRemover = document.createElement('button');
            btnRemover.textContent = 'Remove';
			btnRemover.className = 'remove';
            btnRemover.onclick = () => this.removeItem(item.ID);
            tableRemoveCol.appendChild(btnRemover);
        });
    }
};

// Inicializa o app ao carregar a página
window.onload = () => WordListApp.init();