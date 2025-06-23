export class Item {
    constructor(id, nome, tipo, valor, usar) {
        this.id = id;
        this.nome = nome;
        this.tipo = tipo;
        this.valor = valor;
        this.usar = usar;
    }
}

export class Person {
    static nextId = 1;

    constructor(name, classe) {
        this.id = Person.nextId++;
        this.name = name;
        this.classe = classe;
        this.inventario = [];
        this.localizacao = 'vila_inicial';
        this.quests = {};
        this.status = {
            envenenado: false,
            buff_forca: false
        };
        this.exp = 0;
        this.level = 1;
        this.moedas = 50;

        this.equipamento = {
            arma: null,
            escudo: null,
        };
    }
    atualizarStats() {

        this.ataque = this.baseAtaque;
        this.defesa = this.baseDefesa;

        if (this.equipamento.arma) {
            this.ataque += this.equipamento.arma.valor || 0;
        }

        if (this.equipamento.escudo) {
            this.defesa += this.equipamento.escudo.valor || 0;
        }
    }
}

export class Guerreiro extends Person {
    constructor(name) {
        super(name, 'guerreiro');
        this.life = 1000;
        this.baseAtaque = 10;
        this.baseDefesa = 12; 
        this.atualizarStats();
    }
}

export class Mago extends Person {
    constructor(name) {
        super(name, 'mago');
        this.life = 80;
        this.baseAtaque = 10;
        this.baseDefesa = 12;
        this.atualizarStats();
    }
}

export class Cenario {
    static line = '';
    constructor(id, nome, descricao, locais = {}, objetos = [], npcs = [], tipo) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.locais = locais;
        this.objetos = objetos;
        this.npcs = npcs;
        this.visivel = true;
        this.tipo = tipo;

        this.itensPossiveis = [];
    }
    setItensPossiveis(itensComChance) {
        this.itensPossiveis = itensComChance;
    }

    gerarObjetos({ limitesPrecos, gerarValorEntre }) {
        this.objetos = this.itensPossiveis
            .map(({ item, chance }) => {
                const roll = Math.random() * 100;
                if (roll <= chance) {
                    const novoItem = new Item(item.id, item.nome, item.tipo, item.valor, item.usar);


                    const chave = item.nome.toLowerCase();
                    if (limitesPrecos[chave]) {
                        const [min, max] = limitesPrecos[chave];
                        novoItem.valor = gerarValorEntre(min, max);
                    }

                    return novoItem;
                }
                return null;
            })
            .filter(i => i !== null);
    }



    renderizar() {
        if (!this.visivel) return ['Você não está aqui.'];
        const locaisNomes = Object.keys(this.locais);
        const li = document.createElement('li');
        li.innerHTML = '';
        let linhas = [
            `${this.nome.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
            '\u200B',
            `${this.descricao}`,
            '\u200B'
        ];

        if (this.objetos.length > 0) {
            linhas.push('Objetos visíveis:');
            linhas.push('\u200B');
            this.objetos.forEach(obj => {
                linhas.push(` - ${obj.nome} (${obj.tipo})${obj.valor ? ` | preço: ${obj.valor} moedas` : ''}`);

            });
        }
        console.log('NPCs no cenário:', this.npcs);
        if (this.npcs.length > 0) {
            linhas.push('\u200B');
            linhas.push('Criaturas aqui:');
            linhas.push('\u200B');
            this.npcs.forEach(npc => {
                linhas.push(` - ${npc.nome}`);
            });
        }

        if (locaisNomes.length > 0) {
            linhas.push('\u200B');
            linhas.push('Locais acessíveis:');

            const internos = [];
            const externos = [];

            locaisNomes.forEach(nome => {
                const cenarioLocal = this.locais[nome];
                if (cenarioLocal.tipo === 'interno') {
                    internos.push(nome);
                } else {
                    externos.push(nome);
                }
            });

            if (internos.length > 0) {
                linhas.push('..Interno:');
                linhas.push('\u200B');
                internos.forEach(nome => {
                    const cenarioLocal = this.locais[nome];
                    linhas.push(` - ${cenarioLocal.nome}`);
                });
            }

            if (externos.length > 0) {
                linhas.push('..Externo:');
                linhas.push('\u200B');
                externos.forEach(nome => {
                    const cenarioLocal = this.locais[nome];
                    linhas.push(` - ${cenarioLocal.nome}`);
                });

            }
        }


        return linhas;
    }

    interagir(nome) {
        const obj = this.objetos.find(o => o.nome.toLowerCase() === nome.toLowerCase());
        const npc = this.npcs.find(n => n.nome.toLowerCase() === nome.toLowerCase());

        if (obj) return [`Você interage com o objeto: ${obj.nome}`];
        if (npc) return [`${npc.interagir()}`];

        return ['Não há nada assim aqui...'];
    }
}



export class Npc {
    constructor({
        nome,
        falaPadrao = '...',
        estado = 'neutro', 
        vida = null,
        ataque = 0,
        defesa = 0,
        falas = [],
        condicoes = { periodos: ['dia', 'noite'], regioes: [], evento: null },
        dialogo = {},
        drops = []
    }) {
        this.nome = nome;
        this.falaPadrao = falaPadrao;
        this.estado = estado;
        this.vida = vida;
        this.ataque = ataque;
        this.defesa = defesa;
        this.falas = falas;
        this.condicoes = condicoes;
        this.dialogo = dialogo;
        this.falaAtual = 'inicio';
        this.drops = drops;

    }

    adicionarCondicoes({ periodos = ['dia', 'noite'], regioes = [], evento = null }) {
        this.condicoes = { periodos, regioes, evento };
    }
    responder(opcao, contexto = {}) {
        const trecho = this.dialogo[this.falaAtual];
        const resposta = trecho.respostas[opcao];

        if (!resposta) return [`${this.nome} não entendeu sua resposta.`];

        if (typeof resposta.acao === 'function') {
            const resultado = resposta.acao(this, contexto.personagem, contexto.jogo || null);
            if (resultado) {
                
                if (contexto.jogo && contexto.jogo.estado.interacaoAtual === null) {
                    return Array.isArray(resultado) ? resultado : [resultado];
                }
                
                this.falaAtual = resposta.proximo;
                return [...(Array.isArray(resultado) ? resultado : [resultado]), ...this.interagir()];
            }
        }

        this.falaAtual = resposta.proximo;
        return this.interagir();
    }




    obterFalasDaFalaAtual() {
        const trecho = this.dialogo[this.falaAtual];
        if (!trecho) return [`${this.nome} parece confuso.`];

        const linhas = [`${this.nome} diz: "${trecho.fala}"`];
        for (const [key, resp] of Object.entries(trecho.respostas)) {
            linhas.push(`  [${key}] ${resp.texto}`);
        }
        return linhas;
    }


    fala() {
        if (this.falas.length > 0) {
            const idx = Math.floor(Math.random() * this.falas.length);
            return this.falas[idx];
        }
        return this.falaPadrao;
    }

    adicionarFala(novaFala) {
        this.falas.push(novaFala);
    }

    setEstado(novoEstado) {
        this.estado = novoEstado;
    }

    descrever() {
        const estadoTxt = this.estado === 'morto' ? '⚰️ Morto' : this.estado;
        return `${this.nome} (${estadoTxt})${this.vida !== null ? ` | HP: ${this.vida}` : ''}`;
    }

    interagir() {
        const trecho = this.dialogo[this.falaAtual];
        if (!trecho) return [`${this.nome} não tem nada a dizer agora.`];

        const linhas = [`${this.nome} diz: "${trecho.fala}"`];
        for (const [chave, r] of Object.entries(trecho.respostas)) {
            linhas.push(`  [${chave}] ${r.texto}`);
        }
        return linhas;
    }



    podeSerAtacado() {
        
        return ['hostil', 'desconfiado'].includes(this.estado) && this.vida !== null && this.vida > 0;
    }

    receberDano(valor) {
        if (!this.podeSerAtacado()) {
            return `${this.nome} não pode ser atacado.`;
        }
        this.vida -= valor;
        if (this.vida <= 0) {
            this.vida = 0;
            this.estado = 'morto';
            return `${this.nome} foi derrotado!`;
        }
        return `${this.nome} sofreu ${valor} de dano. Vida restante: ${this.vida}`;
    }

    atacar(alvo) {
        if (!this.podeSerAtacado()) {
            return {
                dano: 0,
                texto: `${this.nome} não está em condição de atacar.`
            };
        }
        const dano = Math.max(0, this.ataque - (alvo.defesa || 0));
        return {
            dano,
            texto: `${this.nome} ataca ${alvo.nome || 'você'} causando ${dano} de dano!`
        };
    }

    gerarDrop() {
        console.log('Drops disponíveis neste NPC:', this.drops);
        return this.drops
            .map(drop => {
                const chance = Number(drop.chance ?? 100);
                const roll = Math.random() * 100;
                console.log(`→ Tentando dropar ${typeof drop.item === 'function' ? 'item dinâmico' : drop.item?.nome ?? '??'} | Roll: ${roll.toFixed(2)} / Chance: ${chance}`);

                if (roll >= chance) return null; 

                
                let itemGerado = typeof drop.item === 'function' ? drop.item() : drop.item;

                if (!itemGerado) return null; 

                
                return new Item(
                    itemGerado.id ?? null,
                    itemGerado.nome ?? '',
                    itemGerado.tipo ?? '',
                    itemGerado.valor ?? 0,
                    itemGerado.usar ?? null
                );
            })
            .filter(item => item !== null);
    }


}


export function clonarItem(item) {
    return new Item(item.id, item.nome, item.tipo, item.valor, item.usar);
}





