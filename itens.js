import { Item } from "./class.js";
import { estado } from './estado.js';

export const Itens = {
  'pocao': new Item(
    'pocao',
    'Pocao',
    'consumível',
    20,
    (p) => {
      p.life += 20;
      return 'Você usou uma Poção e recuperou 20 de vida!';
    }
  ),

  'superpoção': new Item(
    'Super Poção',
    'consumível',
    50,
    (p) => {
      p.life += 50;
      return 'Você usou uma Super Poção e recuperou 50 de vida!';
    }
  ),

  'espada de ferro': new Item(
    'espada de ferro',
    'Espada de Ferro',
    'arma',
    0,
    (p) => {
      p.ataque += 10;
      return 'Você equipou a Espada de Ferro. (+10 ataque)';
    }
  ),

  'escudo_madeira': new Item(
    'Escudo de Madeira',
    'defesa',
    0,
    (p) => {
      p.defesa += 5;
      return 'Você equipou o Escudo de Madeira. (+5 defesa)';
    }
  ),

  'gema_teleporte': new Item(
    'Gema de Teleporte',
    'consumível',
    0,
    (personagem) => {
      estado.cenarioAtual = mapaMundi;
      personagem.localizacao = 'mapa_mundi';
      return 'Você foi envolvido por uma luz azul e aparece no Mapa Místico!';
    }
  ),
  'gema_fuga': new Item(
    'Gema de Fuga',
    'consumível',
    0,
    (p) => {
      if (!estado.emCombate) return 'Você não está em combate agora.';
      estado.emCombate = false;
      return 'Você usou a Gema de Fuga e escapou do combate!';
    }
  ),
  'moeda': new Item(
    'Moeda',
    'Moeda',
    'moeda',
    1,
    () => 'Moedas nao podem ser usadas diretamente.'
  ),
};

export const limitesPrecos = {
  'pocao': [15, 20],
  'superpoção': [40, 60],
  'espada de ferro': [50, 70],
  'escudo_madeira': [30, 50],
  'gema_teleporte': [100, 150],
  'gema_fuga': [60, 90],
};

export function gerarValorEntre(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}





export function definirPrecosAleatorios() {
  for (const id in limitesPrecos) {
    const [min, max] = limitesPrecos[id];
    if (Itens[id]) {
      Itens[id].valor = gerarValorEntre(min, max);
    }
  }
}

export function gerarMoedaAleatoria(min, max) {
  const valor = Math.floor(Math.random() * (max - min + 1)) + min;
  if (valor === 0) return null; 
  return new Item(
    'Moeda',
    'Moeda',
    'moeda', 
    valor, 
    () => 'Moedas não podem ser usadas diretamente.');
}

