import { Cenario } from "./class.js";
import { clonarItem } from "./class.js";
import { Itens, definirPrecosAleatorios } from "./itens.js";

definirPrecosAleatorios(); 

// ╔════════════════════════════════════════╗
// ║        CENÁRIOS PRINCIPAIS         ║
// ╚════════════════════════════════════════╝

export const vilaMacaDourada = new Cenario(
    'vila_macaDourada',
    'Vila Maca Dourada',
     `A Vila Maca Dourada vibra como um mercado em eterna manhã de feira. Ruas de paralelepípedos ecoam passos apressados, vozes em cantigas e o aroma doce das maçãs douradas — fruta símbolo da vila — paira no ar.

Barracas coloridas exibem especiarias e artesanatos enquanto crianças correm entre os adultos. No centro da praça, um velho carvalho encantado observa tudo em silêncio. Dizem que um espírito da colheita vive sob suas raízes, e que suas maçãs guardam segredos de outonos passados.

Nas vielas, duelos de bardos, forasteiros misteriosos e mãos rápidas criam uma dança constante entre rotina e surpresa. Todo morador parece esconder uma história — ou um segredo.`,

    {}, [], [], 'externo'
);
vilaMacaDourada.setItensPossiveis([
  { item: Itens['pocao'], chance: 99 },
  { item: Itens['espada de ferro'], chance: 99 }
]);

export const florestaSombria = new Cenario(
    'floresta_sombria',
    'Floresta Sombria',
    'Uma floresta escura ao oeste.',
    {}, [], [], 'externo'
);

export const cidadeThalarrar = new Cenario(
    'cidade_thalarrar',
    'Cidade Thalarrar',
    'Uma metrópole movimentada ao norte.',
    {}, [], [], 'externo'
);

export const baiaCrostaAzul = new Cenario(
    'baia_crosta_azul',
    'Baia Crosta Azul',
    'cidade portuaria maneira.',
    {}, [], [], 'externo'
);

export const desertoSul = new Cenario(
    'deserto_de_kratar',
    'Deserto de Kratar',
    'Dunas escaldantes ao sul.',
    {}, [], [], 'externo'
);

// ╔════════════════════════════════════════╗
// ║        CENÁRIOS LINKADOS         ║
// ╚════════════════════════════════════════╝
export const florestaSombriaCaminho1 = new Cenario(
    'floresta_sombria_densa',
    'Caminho Denso',
    'A luz do dia quase não passa por entre as arvores',
    {}, [], [], 'externo'
)

export const florestaSombriaCaminho2 = new Cenario(
    'floresta_sombria_densa2',
    'Riacho escuro',
    'A luz do dia quase não passa por entre as arvores',
    {}, [], [], 'externo'
)
export const florestaSombriaCaminho3 = new Cenario(
    'floresta_sombria_densa3',
    'Clareira Deserta',
    'A luz do dia quase não passa por entre as arvores',
    {}, [], [], 'externo'
)
export const florestaSombriaCaminho4 = new Cenario(
    'floresta_sombria_densa4',
    'Covil do goblin chefe',
    'A luz do dia quase não passa por entre as arvores',
    {}, [], [], 'externo'
)


// ╔════════════════════════════════════════╗
// ║        LOJAS E INTERIORES           ║
// ╚════════════════════════════════════════╝

export const loja = new Cenario(
    'loja',
    'Loja de Itens',
    'Uma lojinha simples, com uma prateleira cheia de equipamentos e consumíveis à venda.',
    {},
    [
        clonarItem(Itens['pocao']),
        clonarItem(Itens['superpoção']),
        clonarItem(Itens['espada de ferro'])
    ],
    [],
    'interno'
);

export const bebidas = new Cenario(
    'taverna_pequena',
    'Taverna pequena',
    'Bebidas',
    {},
    [
        clonarItem(Itens['pocao']),
        clonarItem(Itens['superpoção']),
        clonarItem(Itens['espada de ferro'])
    ],
    [],
    'interno'
);

// ╔════════════════════════════════════════╗
// ║         CENÁRIOS SECUNDÁRIOS        ║
// ╚════════════════════════════════════════╝

export const taverna = new Cenario(
    'taverna',
    'Taverna',
    'Uma taverna movimentada com cheiro de cerveja e histórias.',
    {}, [], [], 'interno'
);

export const ferraria = new Cenario(
    'ferraria',
    'Ferraria',
    'Um ferreiro suado martela uma lâmina incandescente.',
    {}, [], [], 'interno'
);

export const pracaCentral = new Cenario(
    'praca_central',
    'Praça Central',
    'Crianças brincam enquanto um bardo toca alaúde.',
    {}, [], [], 'interno'
);

// ╔════════════════════════════════════════╗
// ║        CONEXÕES ENTRE CENÁRIOS      ║
// ╚════════════════════════════════════════╝

// Ligações da vila inicial
vilaMacaDourada.locais = {
    'taverna': taverna,
    'ferraria': ferraria,
    'praca_central': pracaCentral,
    'floresta_sombria': florestaSombria,
    'cidade_thalarrar': cidadeThalarrar,
    'baia_crosta_azul': baiaCrostaAzul,
    'deserto_de_kratar': desertoSul,
    'loja': loja
};

// Sub-cenários se conectando entre si e de volta
taverna.locais = {
    'taverna_pequena': bebidas,
    'vila_macaDourada': vilaMacaDourada
};

loja.locais = {
    'vila_macaDourada': vilaMacaDourada
};

bebidas.locais = {
    'taverna': taverna
}

ferraria.locais = {
    'vila_macaDourada': vilaMacaDourada
};

pracaCentral.locais = {
    'vila_macaDourada': vilaMacaDourada
};

florestaSombria.locais = {
    'vila_macaDourada': vilaMacaDourada,
    'floresta_sombria_densa1': florestaSombriaCaminho1,
};
florestaSombriaCaminho1.locais = {
    'floresta_sombria_densa2': florestaSombriaCaminho2,
    'floresta_sombria': florestaSombria,
};
florestaSombriaCaminho2.locais = {
    'floresta_sombria_densa3': florestaSombriaCaminho3,
    'floresta_sombria_densa4': florestaSombriaCaminho4,
}
florestaSombriaCaminho3.locais = {
    'floresta_sombria_densa2': florestaSombriaCaminho2,
    'floresta_sombria_densa4': florestaSombriaCaminho4,
}
florestaSombriaCaminho4.locais = {
    'floresta_sombria_densa3': florestaSombriaCaminho3,
    'floresta_sombria_densa1': florestaSombriaCaminho1
}

cidadeThalarrar.locais = {
    'vila_macaDourada': vilaMacaDourada
};

baiaCrostaAzul.locais = {
    'vila_macaDourada': vilaMacaDourada
};

desertoSul.locais = {
    'vila_macaDourada': vilaMacaDourada
};

// ╔════════════════════════════════════════╗
// ║         MAPA MÚNDI E PORTAIS         ║
// ╚════════════════════════════════════════╝

export const mapaMundi = new Cenario(
    'mapa_mundi',
    'Mapa Místico dos Portais',
    'Use "cd [cidade]" para se teletransportar.',
    {
        'cidade_thalarrar': cidadeThalarrar,
        'cidade_do_deserto': desertoSul
    }
);

cidadeThalarrar.locais['portal'] = mapaMundi;
desertoSul.locais['portal'] = mapaMundi;

mapaMundi.locais = {
    'cidade_thalarrar': cidadeThalarrar,
    'deserto_de_kratar': desertoSul
};

// ╔════════════════════════════════════════╗
// ║         CENÁRIO RAIZ (ROOT)         ║
// ╚════════════════════════════════════════╝

export const rootCenario = new Cenario(
    'mundo',
    'Mundo',
    'Você está observando o mundo inteiro.',
    {
        'vila_macaDourada': vilaMacaDourada,
        'loja': loja,
        'taverna_pequena': bebidas,
        'taverna': taverna,
        'ferraria': ferraria,
        'praca_central': pracaCentral,
        'floresta_sombria': florestaSombria,
        'floresta_sombria_densa1': florestaSombriaCaminho1,
        'floresta_sombria_densa2': florestaSombriaCaminho2,
        'floresta_sombria_densa3': florestaSombriaCaminho3,
        'floresta_sombria_densa4': florestaSombriaCaminho4,

        'cidade_thalarrar': cidadeThalarrar,
        'baia_crosta_azul': baiaCrostaAzul,
        'deserto_de_kratar': desertoSul,
        'mapa_mundi': mapaMundi
    }
);

export const mapa = rootCenario;
