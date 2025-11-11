// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  databaseURL: "https://SEU_PROJETO.firebaseio.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Carrega agenda de shows
const lista = document.getElementById('lista-shows');

const container = document.getElementById('listaCompromissos');

function carregarAgenda() {
  db.ref('agenda').on('value', snapshot => {
    container.innerHTML = '';
    const dados = snapshot.val();
    if (!dados) {
      container.innerHTML = '<p>Nenhum show encontrado</p>';
      return;
    }

    Object.values(dados).forEach(show => {
      const card = document.createElement('div');
      card.classList.add('card-show');

      card.innerHTML = `
        <h3>${show.data}</h3>
        <p><strong>${show.titulo || ''}</strong></p>
        <p>${show.hora || ''}</p>
        <p>${show.local}</p>
      `;

      container.appendChild(card);
    });
  });
}

carregarAgenda();


