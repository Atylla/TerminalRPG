import { vilaMacaDourada } from "./mapa.js";

import { florestaSombria } from "./mapa.js";
import { florestaSombriaCaminho1 } from "./mapa.js";
import { florestaSombriaCaminho2 } from "./mapa.js";
import { florestaSombriaCaminho3 } from "./mapa.js";
import { florestaSombriaCaminho4 } from "./mapa.js";

import { cidadeThalarrar } from "./mapa.js";
import { baiaCrostaAzul } from "./mapa.js";

import { taverna } from "./mapa.js";
import { loja } from "./mapa.js";
import { bebidas } from "./mapa.js";
import { ferraria } from "./mapa.js";
import { pracaCentral } from "./mapa.js";



import { desertoSul } from "./mapa.js";
import { mapaMundi } from "./mapa.js";
import { rootCenario } from "./mapa.js";


export const estado = {
    personagens: [],
    personagemAtivo: null,
    cenarioAtual: null,
    cenarios: {
        vila_macaDourada: vilaMacaDourada,
        loja: loja,
        taverna_pequena: bebidas,
        taverna: taverna,
        ferraria: ferraria,
        praca_central: pracaCentral,
        floresta_sombria: florestaSombria,
        floresta_sombria_densa1: florestaSombriaCaminho1,
        floresta_sombria_densa2: florestaSombriaCaminho2,
        floresta_sombria_densa3: florestaSombriaCaminho3,
        floresta_sombria_densa4: florestaSombriaCaminho4,
        cidade_thalarrar: cidadeThalarrar,
        baia_crosta_azul: baiaCrostaAzul,
        deserto_de_kratar: desertoSul,
        mapa_mundi: mapaMundi,
        mundo: rootCenario,
    },
    emCombate: false,
    interacaoAtual: null,
    fugaBloqueada: false
};