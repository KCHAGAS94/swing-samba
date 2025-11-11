const database = firebase.database()


  window.onload = function () {
  const menuBtn = document.getElementById('menu-btn');
  const menu = document.getElementById('menu');

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
  }

  // Atualiza lista na carga inicial
  firebase.database().ref('convidados').on('value', snapshot => {
    atualizarLista(snapshot.val());
  });
};


function adicionarConvidado() {
  const nomeInput = document.getElementById('nomeInput')
  const tipoInput = document.getElementById('tipoInput')
  const docInput = document.getElementById('documentoInput')

  const nome = nomeInput.value.trim().toUpperCase()
  const tipo = tipoInput.value.trim().toUpperCase()
  const documento = docInput.value.trim().toUpperCase()

  if (nome === '' || documento === '' || tipo === '') {
    alert('Preencha todos os campos antes de adicionar um convidado.')
    return
  }

  const id = Date.now().toString()

  const novoConvidado = {
    id,
    tipo,
    nome,
    documento,
    presente: false
  }

  database.ref('convidados/' + id).set(novoConvidado)

  tipoInput.value = ''
  nomeInput.value = ''
  docInput.value = ''
}

function confirmarPresenca(id) {
  database.ref('convidados/' + id + '/presente').set(true)
}

function desmarcarPresenca(id) {
  database.ref('convidados/' + id + '/presente').set(false)
}

function excluirConvidado(id) {
  if (confirm('Tem certeza que deseja excluir este convidado?')) {
    database.ref('convidados/' + id).remove()
  }
}

function atualizarLista(convidados) {
  const lista = document.getElementById('listaConvidados')
  lista.innerHTML = ''

  const listaOrdenada = Object.values(convidados || {}).sort((a, b) => {
    if (a.presente !== b.presente) {
      return a.presente - b.presente
    }
    return a.nome.localeCompare(b.nome)
  })

  listaOrdenada.forEach(convidado => {
    const item = document.createElement('li')
    item.className = convidado.presente ? 'presente' : ''
    item.innerHTML = `
      <span>
        <small>Tipo: ${convidado.tipo}</small><br />
        <strong>${convidado.nome}</strong><br />
        <small>${convidado.documento}</small>
      </span>
      <div>
        ${
          convidado.presente
            ? `<button class="desmarcar" onclick="desmarcarPresenca('${convidado.id}')">Desmarcar</button>`
            : `<button class="confirmar" onclick="confirmarPresenca('${convidado.id}')">Confirmar</button>`
        }
        <button class="excluir" onclick="excluirConvidado('${convidado.id}')">Excluir</button>
      </div>
    `

    lista.appendChild(item)
  })

  filtrarConvidados()
}

function filtrarConvidados() {
  const termo = document.getElementById('pesquisaInput').value.toLowerCase()
  const itens = document.querySelectorAll('#listaConvidados li')

  itens.forEach(item => {
    const nome = item.querySelector('span').textContent.toLowerCase()
    item.style.display = nome.includes(termo) ? '' : 'none'
  })
}

// Sempre que mudar no Firebase, atualiza a lista
firebase.database().ref('convidados').on('value', snapshot => {
  atualizarLista(snapshot.val())
})

// ---------------------------
// Sugestões dinâmicas para tipoInput (baseado nos tipos salvos no Firebase)
// ---------------------------

const tiposSetGlobal = new Set(); // armazena tipos únicos

function carregarTiposDeVendaRealtime() {
  const ref = firebase.database().ref('convidados');
  ref.on('value', snapshot => {
    tiposSetGlobal.clear();
    snapshot.forEach(childSnap => {
      const convidado = childSnap.val();
      if (convidado && convidado.tipo && convidado.tipo.toString().trim() !== '') {
        tiposSetGlobal.add(convidado.tipo.toString().trim());
      }
    });
    renderSuggestions(); // atualiza se já estiver aberto
  });
}

// Renderiza a lista de sugestões (todos)
function renderSuggestions(filter = '') {
  const container = document.getElementById('tipoSuggestions');
  if (!container) return;

  const list = Array.from(tiposSetGlobal)
    .filter(t => t.toLowerCase().includes(filter.toLowerCase()))
    .sort((a,b) => a.localeCompare(b));

  if (list.length === 0) {
    container.innerHTML = `<div class="list"><div class="empty">Nenhuma sugestão</div></div>`;
    container.style.display = 'none';
    container.setAttribute('aria-hidden', 'true');
    return;
  }

  const itemsHtml = list.map(t => `<div class="item" data-tipo="${escapeHtml(t)}">${escapeHtml(t)}</div>`).join('');
  container.innerHTML = `<div class="list">${itemsHtml}</div>`;
  container.style.display = 'block';
  container.setAttribute('aria-hidden', 'false');

  // adiciona eventos de clique em cada item
  const nodes = container.querySelectorAll('.item');
  nodes.forEach(node => {
    node.addEventListener('click', (e) => {
      const valor = e.currentTarget.getAttribute('data-tipo') || '';
      const tipoInput = document.getElementById('tipoInput');
      tipoInput.value = valor;
      hideSuggestions();
      tipoInput.focus();
    });
  });
}

function hideSuggestions() {
  const container = document.getElementById('tipoSuggestions');
  if (!container) return;
  container.style.display = 'none';
  container.setAttribute('aria-hidden', 'true');
}

// Função utilitária para escapar texto (evita problemas com caracteres)
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Filtra sugestões enquanto digita
function setupTipoInputAutocomplete() {
  const tipoInput = document.getElementById('tipoInput');
  const container = document.getElementById('tipoSuggestions');
  if (!tipoInput || !container) return;

  tipoInput.addEventListener('input', () => {
    const val = tipoInput.value.trim();
    if (val === '') {
      // mostra todas as opções se houver alguma
      if (tiposSetGlobal.size > 0) renderSuggestions('');
      else hideSuggestions();
    } else {
      renderSuggestions(val);
    }
  });

  tipoInput.addEventListener('focus', () => {
    // ao focar, mostrar todas se estiver vazio
    if (tipoInput.value.trim() === '') {
      if (tiposSetGlobal.size > 0) renderSuggestions('');
    } else {
      renderSuggestions(tipoInput.value.trim());
    }
  });

  // Esconder ao desfocar, com pequena espera para permitir click
  document.addEventListener('click', (e) => {
    const within = e.target === container || container.contains(e.target) || e.target === tipoInput;
    if (!within) hideSuggestions();
  });

  // tecla ESC fecha
  tipoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideSuggestions();
  });
}

// inicialização: chama ao final do arquivo
carregarTiposDeVendaRealtime();
setupTipoInputAutocomplete();
