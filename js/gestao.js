
const database = firebase.database();

window.onload = function() {
  const menuBtn = document.getElementById('menu-btn');
  const menu = document.getElementById('menu');
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => menu.classList.toggle('hidden'));
  }

  firebase.database().ref('convidados').on('value', snapshot => {
    const convidados = snapshot.val() || {};
    atualizarDashboard(convidados);
  });
};

function atualizarDashboard(convidados) {
  const lista = Object.values(convidados);

  // Filtra apenas os confirmados
  const confirmados = lista.filter(c => c.presente);
  const totalConfirmados = confirmados.length;

  // Atualiza o total geral
  document.getElementById('totalPessoas').textContent = `${totalConfirmados} pessoa${totalConfirmados !== 1 ? 's' : ''}`;
  document.getElementById('totalPercent').textContent = '100%';

  // Contagem de tipos
  const tiposContagem = {};
  confirmados.forEach(c => {
    const tipo = c.tipo || 'NÃO INFORMADO';
    tiposContagem[tipo] = (tiposContagem[tipo] || 0) + 1;
  });

  // Atualiza os círculos por tipo
  const tiposContainer = document.getElementById('tiposContainer');
  tiposContainer.innerHTML = '';

  for (const tipo in tiposContagem) {
    const qtd = tiposContagem[tipo];
    const perc = totalConfirmados > 0 ? ((qtd / totalConfirmados) * 100).toFixed(1) : 0;

    const tipoCard = document.createElement('div');
    tipoCard.className = 'circle-card';
    tipoCard.innerHTML = `
      <h3>${tipo}</h3>
      <div class="circle tipo">
        <span>${perc}%</span>
      </div>
      <p>${qtd} pessoa${qtd !== 1 ? 's' : ''}</p>
    `;
    tiposContainer.appendChild(tipoCard);
  }
}
