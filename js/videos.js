
// videos.js

function carregarVideos() {
  const container = document.getElementById('videos-container');

  if (!container) return; // Proteção caso o elemento não exista na página

  firebase.database().ref('videos').on('value', snapshot => {
    container.innerHTML = ''; // limpa o container antes de preencher
    const dados = snapshot.val();

    if (!dados) {
      container.innerHTML = '<p>Nenhum vídeo disponível</p>';
      return;
    }

    Object.values(dados).forEach(video => {
      const div = document.createElement('div');
      div.style.marginBottom = '30px';

      const titulo = document.createElement('h3');
      titulo.innerText = video.titulo;
      titulo.style.marginBottom = '10px';

      const iframe = document.createElement('iframe');
      iframe.width = '300';
      iframe.height = '200';
      iframe.src = video.link;
      iframe.frameBorder = '0';
      iframe.allowFullscreen = true;

      div.appendChild(titulo);
      div.appendChild(iframe);
      container.appendChild(div);
    });
  });
}

// Chama a função quando a página carregar
window.addEventListener('load', carregarVideos);
