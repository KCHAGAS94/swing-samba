// Inicializa Firebase
const database = firebase.database();

window.onload = function () {
  const menuBtn = document.getElementById('menu-btn');
  const menu = document.getElementById('menu');
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
  }

  renderizarCompromissos(); // Inicia a lista da agenda
};


function formatarDataBR(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function adicionarCompromisso() {
  const titulo = document.getElementById("titulo").value.trim();
  const cidade = document.getElementById("cidade").value.trim();
  const data = document.getElementById("data").value;
  const hora = document.getElementById("hora").value;
  if (!titulo || !cidade || !data || !hora) {
    alert("Preencha todos os campos!");
    return;
  }
  const id = Date.now().toString();
  const compromisso = { id, titulo, cidade, data, hora };
  database.ref("compromissos/" + id).set(compromisso);
  document.getElementById("titulo").value = "";
  document.getElementById("cidade").value = "";
  document.getElementById("data").value = "";
  document.getElementById("hora").value = "";
}

function removerCompromisso(id) {
  if (confirm("Tem certeza que deseja excluir este compromisso?")) {
    database.ref("compromissos/" + id).remove();
  }
}

function editarCompromisso(id, compromisso) {
  const novoTitulo = prompt("Editar título:", compromisso.titulo);
  if (novoTitulo !== null && novoTitulo.trim() !== "") {
    compromisso.titulo = novoTitulo;
    database.ref("compromissos/" + id).set(compromisso);
  }
}

function renderizarCompromissos() {
  const lista = document.getElementById("listaCompromissos");
  database.ref("compromissos").on("value", (snapshot) => {
    lista.innerHTML = "";
    const arr = [];
    snapshot.forEach(item => {
      const dados = item.val();
      const dt = new Date(`${dados.data}T${dados.hora}`);
      arr.push({ ...dados, timestamp: dt.getTime() });
    });
    const now = Date.now();
    const futuros = arr.filter(item => item.timestamp >= now).sort((a, b) => a.timestamp - b.timestamp);
    const passados = arr.filter(item => item.timestamp < now).sort((a, b) => b.timestamp - a.timestamp);
    const ordenados = futuros.concat(passados);
    ordenados.forEach(dados => {
      const li = document.createElement("li");
      // Data - Hora na mesma linha
      const spanDataHora = document.createElement("div");
      spanDataHora.className = "data-hora";
      spanDataHora.innerText = `${formatarDataBR(dados.data)} - ${dados.hora}`;
      li.appendChild(spanDataHora);
      // Título em linha abaixo
      const spanTitulo = document.createElement("div");
      spanTitulo.className = "titulo";
      spanTitulo.innerText = dados.titulo;
      li.appendChild(spanTitulo);
      // Cidade em linha abaixo
      const spanCidade = document.createElement("div");
      spanCidade.className = "cidade";
      spanCidade.innerText = dados.cidade;
      li.appendChild(spanCidade);
      // Botões em linhas separadas
      // Só mostra os botões se estiver na agenda.html
    if (window.location.pathname.includes("agenda.html")) {
      const btnEditar = document.createElement("button");
      btnEditar.innerText = "Editar";
      btnEditar.className = "editar";
      btnEditar.onclick = () => editarCompromisso(dados.id, dados);
      li.appendChild(btnEditar);

      const btnExcluir = document.createElement("button");
      btnExcluir.innerText = "Excluir";
      btnExcluir.className = "excluir";
      btnExcluir.onclick = () => removerCompromisso(dados.id);
      li.appendChild(btnExcluir);
    }

          lista.appendChild(li);
        });
      });
    }

