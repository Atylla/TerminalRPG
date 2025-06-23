import { Npc } from "./class.js";
import { estado } from './estado.js';
import { Itens } from './itens.js';
import { gerarMoedaAleatoria } from "./itens.js";

export const rogerio = new Npc({
    nome: 'Rogerio',
    falaPadrao: 'Bem-vindo vila!',
    condicoes: { periodos: ['noite', 'dia'], regioes: ['vila_inicial', 'taverna'], evento: null }
});

export const camila = new Npc({
    nome: 'Camila',
    falaPadrao: 'Bem-vindo vila!',
    condicoes: { periodos: ['noite', 'dia'], regioes: ['vila_inicial', 'praça', 'taverna'], evento: null }
});

export const ferreiro = new Npc({
    nome: 'Ferreiro',
    falaPadrao: 'Minhas espadas cortam até pedra!',
    condicoes: { periodos: ['noite', 'dia'], regioes: ['vila_inicial', 'taverna'], evento: null }
});

export const profeta = new Npc({
    nome: 'Profeta Louco',
    falaPadrao: 'O fim se aproxima!',
    condicoes: { periodos: ['noite', 'dia'], regioes: ['praça'], evento: 'eclipse' }
});

export const NPCConfigs = {
    camile: {
        nome: 'Camile, a chefe da vila',
        falaPadrao: 'Bem vindo a minha vila, forasteiro!',
        estado: 'amigável',
        condicoes: { periodos: ['noite', 'dia'], regioes: ['vila_macaDourada'], evento: null },
        dialogo: {
            inicio: {
                fala: "Bem vindo a minha vila, forasteiro!",
                respostas: {
                    resp1: { texto: "Ouvir avisos", proximo: "avisos" },
                    resp2: { texto: "Obrigado, até mais!", proximo: "fim" }
                }
            },
            avisos: {
                fala: "Não se aventure muito na floresta sombria, camarada, pode ser sua ultima aventura.",
                respostas: {
                    resp1: { texto: "Por que?", proximo: "porque" },
                    resp2: { texto: "Obrigado, até mais!", proximo: "fim" }
                }
            },
            porque: {
                fala: "La é o covil dos goblins",
                respostas: {
                    resp1: { texto: "Valeu!", proximo: "fim" }
                }
            },
            fim: {
                fala: "Até mais!",
                respostas: {},

            }
        }
    },

    bart: {
        nome: 'Bart',
        falaPadrao: 'Bem-vindo à taverna!',
        estado: 'amigável',
        condicoes: { periodos: ['noite', 'dia'], regioes: ['taverna', 'vila_macaDourada'], evento: null },
        dialogo: {
            inicio: {
                fala: "Bem-vindo à taverna! O que você quer saber?",
                respostas: {
                    resp1: { texto: "Ouvir rumores", proximo: "rumores" },
                    resp2: {
                        texto: "Comprar bebida",
                        proximo: "bebida",
                        acao: (npc, personagem, jogo) => {
                            if (!jogo) return;
                            const mensagens = jogo.cd('Taverna pequena');
                            personagem.__mensagemExtra = mensagens; 
                        }
                    }
                }
            },
            rumores: {
                fala: "Ouvi dizer que há monstros nas redondezas.",
                respostas: {
                    resp1: { texto: "Onde exatamente?", proximo: "onde" },
                    resp2: { texto: "Obrigado, até mais!", proximo: "fim" }
                }
            },
            onde: {
                fala: "Na floresta ao norte. Tenha cuidado.",
                respostas: {
                    resp1: { texto: "Valeu!", proximo: "fim" }
                }
            },
            bebida: {
                fala: "Escolha sua bebida amigo, por um preço é claor!",
                respostas: {
                    resp1: {
                        texto: "obrigado",
                        proximo: "fim",
                        acao: (npc, personagem, jogo) => {
                            if (!jogo) return;

                            const mensagens = jogo.cd('taverna');

                            jogo.estado.interacaoAtual = null;

                            return mensagens;
                        }

                    }
                }
            },
            fim: {
                fala: "Até mais!",
                respostas: {},

            }
        }
    },

    goblin: {
        nome: 'Goblin',
        vida: 15,
        ataque: 20,
        defesa: 0,
        falaPadrao: 'Sshraaak! Humanos fedidos!',
        estado: 'hostil',
        condicoes: { periodos: ['dia', 'noite'], regioes: ['vila_macaDourada'], evento: null },
        drops: [
            { item: Itens['pocao'], chance: 100 },
            { item: () => gerarMoedaAleatoria(0, 6), chance: 99 }
        ]
    },
    goblinChefe: {
        nome: 'Goblin Chefe',
        vida: 15,
        ataque: 20,
        defesa: 0,
        falaPadrao: 'Sshraaak! Humanos fedidos!',
        estado: 'hostil',
        condicoes: { periodos: ['dia', 'noite'], regioes: [], evento: null },
        drops: [
            { item: Itens['pocao'], chance: 100 },
            { item: Itens['gema_fuga'], chance: 100 }
        ]
    },

};

