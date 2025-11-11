const database = firebase.database();

window.addEventListener('DOMContentLoaded', () => {
  // Controle do menu
  const menuBtn = document.getElementById('menu-btn');
  const menu = document.getElementById('menu');

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
  }

  // Monitora mudanças no banco de dados
  database.ref('convidados').on('value', snapshot => {
    const convidados = snapshot.val();
    atualizarPainel(convidados);
  });
});

function atualizarPainel(convidados) {
  const tiposContainer = document.getElementById("tiposContainer");
  const totalPessoasEl = document.getElementById("totalPessoas");

  if (!convidados || Object.keys(convidados).length === 0) {
    totalPessoasEl.textContent = "0 pessoas";
    tiposContainer.innerHTML = "<p style='text-align:center;color:#666;'>Nenhum convidado adicionado ainda.</p>";
    atualizarCirculoTotal(0);
    return;
  }

  const convidadosArray = Object.values(convidados);
  const total = convidadosArray.length;

  // Atualiza total geral
  totalPessoasEl.textContent = `${total} pessoa${total > 1 ? 's' : ''}`;
  atualizarCirculoTotal(100);

  // Agrupa por tipo
  const tipos = {};
  convidadosArray.forEach(c => {
    const tipo = (c.tipo || "NÃO INFORMADO").toUpperCase();
    tipos[tipo] = (tipos[tipo] || 0) + 1;
  });

  // Cria os círculos por tipo
  tiposContainer.innerHTML = "";
  Object.entries(tipos).forEach(([tipo, qtd]) => {
    const porcentagem = (qtd / total) * 100;
    const cor = gerarCorPorTipo(tipo); // cor personalizada

    const tipoDiv = document.createElement("div");
    tipoDiv.className = "circle-card flex flex-col items-center m-4";

    tipoDiv.innerHTML = `
      <div class="relative w-32 h-32 flex items-center justify-center">
        <svg class="absolute top-0 left-0" width="128" height="128">
          <circle cx="64" cy="64" r="56" stroke="#e5e7eb" stroke-width="12" fill="none" />
          <circle cx="64" cy="64" r="56" stroke="${cor}" stroke-width="12" fill="none"
            stroke-linecap="round" stroke-dasharray="352" stroke-dashoffset="${352 - (352 * porcentagem) / 100}"
            style="transition: stroke-dashoffset 0.8s ease;" />
        </svg>
        <div class="text-center">
          <p class="text-xl font-bold" style="color:${cor};">${porcentagem.toFixed(0)}%</p>
          <p class="text-xs text-gray-600 mt-1">${qtd} pessoa${qtd > 1 ? 's' : ''}</p>
        </div>
      </div>
      <p class="mt-2 text-sm font-semibold">${tipo}</p>
    `;

    tiposContainer.appendChild(tipoDiv);
  });
}

// Atualiza o círculo principal
function atualizarCirculoTotal(percentual) {
  const circle = document.getElementById("circleTotal");
  const percentEl = document.getElementById("totalPercent");

  if (circle && percentEl) {
    const offset = 440 - (440 * percentual) / 100;
    circle.style.strokeDashoffset = offset;
    percentEl.textContent = `${percentual.toFixed(0)}%`;
  }
}

// Gera uma cor diferente por tipo
function gerarCorPorTipo(tipo) {
  const cores = {
    CAMAROTE: "#a855f7",
    VIP: "#f59e0b",
    PISTA: "#3b82f6",
    PREMIUM: "#10b981",
    "NÃO INFORMADO": "#9ca3af"
  };
  return cores[tipo] || "#06b6d4";
}
