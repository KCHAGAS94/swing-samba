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
