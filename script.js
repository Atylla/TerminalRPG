import { estado } from './estado.js';
import { Guerreiro, Mago } from './class.js';
import { comandos } from './comandos.js';
import { Npc } from './class.js';
const click = new Audio('./audio/keyAudio.wav');

document.body.addEventListener('keydown', (event) => {
  const key = event.key;
  const permitido = /^[a-zA-Z0-9 ]$/;

  if (permitido.test(key) || key === 'Backspace' || key === 'Enter') {
    codeLinha(key);
    click.currentTime = 0;
    click.play();
  }


})

function showIntro() {
  const intro = document.getElementById('introScreen');
  const terminal = document.querySelector('.terminal');
  const consoleDiv = document.querySelector('.console');

  intro.style.display = 'flex';
  terminal.style.display = 'none';
  consoleDiv.style.display = 'none';

  setTimeout(() => {
    intro.classList.add('fade-out');

    intro.addEventListener('animationend', () => {
      intro.style.display = 'none';
      intro.classList.remove('fade-out');
      terminal.style.display = 'block';
      consoleDiv.style.display = 'block';
      document.body.style.overflow = 'auto';
      sessionStorage.setItem('introShown', 'true');
    }, { once: true });
  }, 2000);
}



if (!sessionStorage.getItem('introShown')) {
  showIntro();
} else {
  document.getElementById('introScreen').style.display = 'none';
  document.querySelector('.terminal').style.display = 'block';
  document.querySelector('.console').style.display = 'block';
  document.body.style.overflow = 'auto';
}


document.body.style.cursor = 'none';

document.addEventListener('mousemove', () => {
  document.body.style.cursor = 'none';
});

document.addEventListener('click', () => {
  document.body.requestPointerLock?.();
});


let valor;
let pAtual;
export const uLista = document.querySelector('#listaLeft');
export const uListaR = document.querySelector('#listaRight')
let pAtualR;

const salvos = localStorage.getItem('personagens');
if (salvos) {
  estado.personagens = JSON.parse(salvos);
}

const codeLinha = (letra) => {
  if (letra === 'Backspace') {
    pAtual.textContent = pAtual.textContent.slice(0, -1);
  } else if (letra === 'Enter') {
    valor = pAtual.textContent;
    console.log('Comando executado:', valor);
    executar(valor);
    novaLinha();
  } else {
    pAtual.textContent += letra;
  }
  console.log(valor);
}

const novaLinha = () => {
  const cursorAntigo = document.querySelector('.cursor');
  if (cursorAntigo) {
    cursorAntigo.remove();
  }

  const lista = document.createElement('li');
  const linha = document.createElement('p');

  const nomePersonagem = estado.personagemAtivo?.name?.toLowerCase().replace(/\s/g, '-') || 'atlas-terminal';

  const prefixo = document.createElement('span');
  prefixo.textContent = `[root@${nomePersonagem}] $ : `;

  const entrada = document.createElement('span');
  entrada.classList.add('entrada');

  const cursor = document.createElement('span');
  cursor.textContent = '|';
  cursor.classList.add('cursor');

  linha.appendChild(prefixo);
  linha.appendChild(entrada);
  linha.appendChild(cursor);

  lista.appendChild(linha);
  uLista.appendChild(lista);

  pAtual = entrada;
};


const executar = (valor) => {
  const [comando, ...argumentos] = valor.trim().split(' ');
  /*
  if (estado.emCombate && comando !== 'ultimo') {
    const p = estado.personagemAtivo;
    if (p) {
      const idx = estado.personagens.findIndex(person => person.name === p.name);
      if (idx !== -1) estado.personagens.splice(idx, 1);
      estado.personagemAtivo = null;
      estado.emCombate = false;

      const li = document.createElement('li');
      li.textContent = `${p.name} foi deletado por não usar o comando 'ultimo' após morrer.`;
      uListaR.appendChild(li);
      return; 
    }
  }
*/


  const resultado = comandos[comando]?.(...argumentos);

  const li = document.createElement('li');
  try {
    if (resultado !== undefined) {
      const linhas = Array.isArray(resultado) ? resultado : [resultado];

      for (let linha of linhas) {
        const p = document.createElement('p');
        p.textContent = linha;
        li.appendChild(p);
      }

      uListaR.appendChild(li);

      const conteudoDiv = document.querySelector('.conteudo');
conteudoDiv.scrollTop = conteudoDiv.scrollHeight;

    } else {
      const liErro = document.createElement('li');
      liErro.textContent = `Comando "${comando}" não encontrado.`;
      uLista.appendChild(liErro);
    }
  } catch (err) {
    const liErro = document.createElement('li');
    liErro.textContent = `Erro no comando "${comando}": ${err.message}`;
    uLista.appendChild(liErro);
  }

  
}
function getPeriodoAtual() {
  const hora = new Date().getHours();
  return (hora >= 6 && hora < 18) ? 'dia' : 'noite';
}

export function povoarCenarioComNpcs({ npcsPossiveis = [], cenario, max = 3, eventoAtual = null }) {
  if (!cenario || typeof cenario !== 'object') return;

  const periodoAtual = getPeriodoAtual();

  const npcsFiltrados = npcsPossiveis.filter(npc => {
    const cond = npc.condicoes;

    const periodoOk = cond.periodos.includes(periodoAtual);
    const regiaoOk = cond.regioes.includes(cenario.id);
    const eventoOk = !cond.evento || cond.evento === eventoAtual;

    return periodoOk && regiaoOk && eventoOk;
  });

  cenario.npcs = [];

  const quantidade = Math.min(Math.floor(Math.random() * (max + 1)), npcsFiltrados.length);

  const usados = new Set();

  while (cenario.npcs.length < quantidade) {
    const npcAleatorio = npcsFiltrados[Math.floor(Math.random() * npcsFiltrados.length)];

    if (!npcAleatorio || usados.has(npcAleatorio.nome)) continue;

    usados.add(npcAleatorio.nome);

    const clone = new Npc({
      nome: npcAleatorio.nome,
      falaPadrao: npcAleatorio.falaPadrao,
      estado: npcAleatorio.estado,
      vida: npcAleatorio.vida,
      ataque: npcAleatorio.ataque,
      defesa: npcAleatorio.defesa,
      falas: [...npcAleatorio.falas],
      condicoes: { ...npcAleatorio.condicoes },
      dialogo: { ...npcAleatorio.dialogo },
      drops: [...npcAleatorio.drops]  
    });




    cenario.npcs.push(clone);
  }
}


function carregarPersonagens() {
  const dados = localStorage.getItem('personagens');
  if (!dados) return [];

  const arr = JSON.parse(dados);
  return arr.map(p => {
    if (p.classe === 'guerreiro') {
      const g = new Guerreiro(p.name, p.classe, p.id);
      Object.assign(g, p);
      return g;
    }
    if (p.classe === 'mago') {
      const m = new Mago(p.name, p.classe, p.id);
      Object.assign(m, p);
      return m;
    }
    return p;
  });
}


estado.personagens = carregarPersonagens();
novaLinha();