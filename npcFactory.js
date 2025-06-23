import { NPCConfigs } from "./npc.js";
import { Npc } from "./class.js";

function criarNpc(nome) {
  const config = NPCConfigs[nome];
  if (!config) throw new Error(`NPC "${nome}" não encontrado.`);
  console.log(`Criando NPC ${nome}, drops:`, config.drops);
  return new Npc(config);
}

export const NPCsPorRegiao = {
  vila_macaDourada: ['camile', 'goblin', 'goblinChefe'].map(criarNpc),
  taverna: ['bart'].map(criarNpc),
  praça: [].map(criarNpc),
};