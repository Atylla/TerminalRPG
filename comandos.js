import { estado } from './estado.js';
import { Item, clonarItem } from "./class.js";
import { Itens } from './itens.js';
import { uLista, uListaR } from './script.js';
import { mapa } from './mapa.js';
import { povoarCenarioComNpcs } from './script.js';
import { NPCsPorRegiao } from './npcFactory.js';
import { Guerreiro, Mago } from './class.js';
import { limitesPrecos, gerarValorEntre, definirPrecosAleatorios } from './itens.js';

export const buscarCenario = (id, cenario = mapa, visitados = new Set()) => {
    if (!cenario || visitados.has(cenario)) return null;

    visitados.add(cenario);

    if (cenario.id === id) {
        // Tenta restaurar objetos do localStorage
        const dadosSalvos = localStorage.getItem(`cen_${id}`);
        if (dadosSalvos) {
            try {
                const objetos = JSON.parse(dadosSalvos);
                cenario.objetos = objetos.map(obj => new Item(obj.nome, obj.tipo, obj.valor));
            } catch (e) {
                console.warn(`Erro ao carregar objetos do cenário ${id}:`, e);
            }
        }
        return cenario;
    }

    for (let key in cenario.locais) {
        const encontrado = buscarCenario(id, cenario.locais[key], visitados);
        if (encontrado) return encontrado;
    }

    return null;
};




export const comandos = {

    help() {
        uLista.innerHTML = '';
        return [
            'COMANDOS DISPONÍVEIS:',
            'help',
            'clear',
            'list',
            'create',
            'delete'
        ];
    },
    ultimo() {
        const p = estado.personagemAtivo;
        if (!p) return ['Nenhum personagem ativo.'];

        if (!estado.emCombate) return ['Você não está em combate ou morto.'];

        p.life = Math.max(1, p.life); 
        estado.emCombate = false;

        return [`${p.name} foi salvo no último segundo! Volte à luta!`];
    },
    clear(arg) {
        if (arg === 'console') {
            uListaR.innerHTML = '';
            return [];
        } else if (arg === 'all') {
            uListaR.innerHTML = '';
            uLista.innerHTML = '';
            return [];
        } else {
            uLista.innerHTML = '';
            return [];
        }
    },
    exit() {
        window.electronAPI.sair();
    },
    config() {

    },
    newGame() {
        estado.personagens = [];
        estado.personagemAtivo = null;
        estado.cenarioAtual = null;
        localStorage.clear();
        uListaR.innerHTML = '';
        uLista.innerHTML = '';
        return [];
    },
    save() {
        const p = estado.personagemAtivo;

        if (!p) return ['Nenhum personagem selecionado. Use "select [nome]".'];

        const data = JSON.stringify(p);
        localStorage.setItem(`save_${p.id}`, data);

        if (estado.cenarioAtual) {
            const nomeCenario = estado.cenarioAtual.id;
            const objetos = estado.cenarioAtual.objetos.map(obj => ({
                nome: obj.nome,
                tipo: obj.tipo,
                valor: obj.valor,
            }));

            localStorage.setItem(`cen_${nomeCenario}`, JSON.stringify(objetos));
        }
        return [`Progresso de ${p.name} salvo.`];
    },
    select(name) {
        uListaR.innerHTML = '';
        const personagem = estado.personagens.find(p => p.name === name);

        if (!personagem) {
            return [`Personagem ${name} não encontrado`];
        }

        if (estado.personagemAtivo?.id === personagem.id) {
            return [`${personagem.name} já está selecionado.`];
        }

        estado.personagemAtivo = personagem;
        estado.cenarioAtual = buscarCenario(personagem.localizacao || 'vila inicial');

        const save = localStorage.getItem(`save_${personagem.id}`);
        if (save) {
            const data = JSON.parse(save);
            Object.assign(personagem, data); 
        }

        this.load();

        const nomeCenario = estado.cenarioAtual?.nome?.toLowerCase().trim() || '';
        const palavras = nomeCenario.split(' ');
        const mensagensCd = this.cd(...palavras);

        return [
            `${personagem.name} foi selecionado.`,
            ...mensagensCd
        ];
    },


    load() {
        const p = estado.personagemAtivo;
        if (!p) return ['Nenhum personagem selecionado.'];

        const raw = localStorage.getItem(`save_${p.id}`);
        if (!raw) return [`Nenhum save encontrado para ${p.name}.`];

        const data = JSON.parse(raw);

   
        let novoPersonagem;
        if (data.classe === 'guerreiro') {
            novoPersonagem = new Guerreiro(data.name);
        } else if (data.classe === 'mago') {
            novoPersonagem = new Mago(data.name);
        }


        Object.assign(novoPersonagem, data);

 
        novoPersonagem.inventario = data.inventario.map(i => {
            const itemBase = Itens[i.id] || Itens[i.nome.toLowerCase().replaceAll(' ', '_')];
            return {
                ...itemBase,
                ...i
            };
        });


        estado.personagemAtivo = novoPersonagem;


        const index = estado.personagens.findIndex(p => p.id === novoPersonagem.id);
        if (index !== -1) {
            estado.personagens[index] = novoPersonagem;
        }


        estado.cenarioAtual = buscarCenario(novoPersonagem.localizacao);

        return [`Save de ${novoPersonagem.name} carregado com sucesso.`];
    },



    create(...par1) {
        uListaR.innerHTML = '';

     
        if (par1.length < 2) {
            return ['Uso: create [nome] [classe]'];
        }

        const classe = par1[1].toLowerCase();

        if (classe !== 'guerreiro' && classe !== 'mago') {
            return ['Classe inválida. Use "guerreiro" ou "mago".'];
        }

        let p;

        if (classe === 'guerreiro') {
            p = new Guerreiro(...par1);
        } else if (classe === 'mago') {
            p = new Mago(...par1);
        }

        p.localizacao = 'vila_macaDourada';

        estado.personagens.push(p);
        localStorage.setItem('personagens', JSON.stringify(estado.personagens));
        estado.personagemAtivo = p;

        estado.cenarioAtual = buscarCenario(p.localizacao);

        return [`${p.name} criado com id ${p.id}`];
    },


    list() {
        uListaR.innerHTML = '';
        if (estado.personagens.length > 0) {
            return estado.personagens.map(p => `#${p.id} - - ${p.name}`);
        } else {
            return 'Não existe personagens criados'
        }
    },
    delete(name) {
        uListaR.innerHTML = '';
        const index = estado.personagens.findIndex(p => p.name === name);

        if (index === -1) {
            return [`Personagem "${name}" não encontrado.`];
        }

        const [removido] = estado.personagens.splice(index, 1);
        localStorage.setItem('personagens', JSON.stringify(estado.personagens));
        return [`${removido.name} deletado com sucesso.`];
    },

   
    status() {
        const p = estado.personagemAtivo;

        if (!p) return ['Nenhum personagem selecionado.'];

       
        const questsFormatadas = Object.keys(p.quests).length > 0
            ? Object.entries(p.quests)
                .map(([nome, estado]) => ` - ${nome}: ${estado}`)
                .join('\n')
            : ' - Nenhuma';

     
        const statusAtivos = Object.entries(p.status)
            .filter(([_, ativo]) => ativo)
            .map(([nome]) => nome)
            .join(', ') || 'Nenhum';

        return [
            `#${p.id} - ${p.name} (${p.classe})`,
            `Vida: ${p.life}`,
            `Defesa: ${p.defesa}`,
            `Ataque: ${p.ataque}`,
            `Localização: ${p.localizacao}`,
            `Quests:\n${questsFormatadas}`,
            `Status: ${statusAtivos}`,
            `XP: ${p.exp}`,
            `Level: ${p.level}`,
            `Dinheiro: ${p.moedas}`,
            `Equipamento: Arma - ${p.equipamento?.arma?.nome || 'Nenhuma'}, Escudo - ${p.equipamento?.escudo?.nome || 'Nenhum'}`,
        ];

    },

    inventory(comand, ...item) {
        const p = estado.personagemAtivo;
        if (!p) return ['Nenhum personagem selecionado.'];

        const nomeItem = item.join(' ').toLowerCase();

        switch (comand) {
            case 'add':
                if (!nomeItem || !Itens[nomeItem]) return ['Uso: inventary add [item] (válido)'];
                const itemOrig = Itens[nomeItem];
              
                const itemObj = new Item(itemOrig.nome, itemOrig.tipo, itemOrig.valor, itemOrig.usar);
                p.inventario.push(itemObj);
                return [`${itemObj.nome} adicionado ao inventário.`];

            case 'use':
                if (!nomeItem) return ['Uso: inventary use [item]'];

                let indexUse = p.inventario.findIndex(i => i.nome.toLowerCase() === nomeItem);
                let estaEquipado = false;
                let item;

                if (indexUse === -1) {
                    if (p.equipamento.arma && p.equipamento.arma.nome.toLowerCase() === nomeItem) {
                        estaEquipado = true;
                        item = p.equipamento.arma;
                    } else if (p.equipamento.escudo && p.equipamento.escudo.nome.toLowerCase() === nomeItem) {
                        estaEquipado = true;
                        item = p.equipamento.escudo;
                    } else {
                        return [`Item "${nomeItem}" não encontrado no inventário nem equipado.`];
                    }
                } else {
                    item = p.inventario[indexUse];
                }

          
                function equipar(item) {
                    if (item.tipo === 'arma') {
                        if (p.equipamento.arma) {
                      
                            p.inventario.push(p.equipamento.arma);
                        }
                        p.equipamento.arma = item;
                        p.inventario.splice(indexUse, 1);
                        p.atualizarStats();
                        return `Você equipou ${item.nome}. (+${item.valor} ataque)`;
                    }
                    if (item.tipo === 'defesa') {
                        if (p.equipamento.escudo) {
                            p.inventario.push(p.equipamento.escudo);
                        }
                        p.equipamento.escudo = item;
                        p.inventario.splice(indexUse, 1);
                        p.atualizarStats();
                        return `Você equipou ${item.nome}. (+${item.valor} defesa)`;
                    }
                    return null;
                }

                function desequipar(item) {
                    if (item.tipo === 'arma' && p.equipamento.arma === item) {
                        p.equipamento.arma = null;
                        p.inventario.push(item);
                        p.atualizarStats();
                        return `Você desequipou ${item.nome}. (-${item.valor} ataque)`;
                    }
                    if (item.tipo === 'defesa' && p.equipamento.escudo === item) {
                        p.equipamento.escudo = null;
                        p.inventario.push(item);
                        p.atualizarStats();
                        return `Você desequipou ${item.nome}. (-${item.valor} defesa)`;
                    }
                    return null;
                }

                if (estaEquipado) {
              
                    const msg = desequipar(item);
                    return [msg];
                } else {
             
                    if (item.tipo === 'arma' || item.tipo === 'defesa') {
                        const msg = equipar(item);
                        return [msg];
                    } else if (typeof item.usar === 'function') {
               
                        p.inventario.splice(indexUse, 1);
                        const resultado = item.usar(p);
                        return [resultado];
                    } else {
                        return [`Você usou ${item.nome}. Mas nada aconteceu...`];
                    }
                }

            case 'drop':
                if (!nomeItem) return ['Uso: inventary drop [item]'];
                const indexDrop = p.inventario.findIndex(i =>
                    i.nome.toLowerCase() === nomeItem
                );
                if (indexDrop === -1) return [`Item "${nomeItem}" não encontrado no inventário.`];

                const descartado = p.inventario.splice(indexDrop, 1)[0];
                if (estado.cenarioAtual) {
                    estado.cenarioAtual.objetos.push(descartado);
                }
                return [`Você descartou ${descartado.nome}.`];

            default:
                if (p.inventario.length === 0) return ['Inventário vazio.'];

                const lista = p.inventario.map(i =>
                    ` - ${i.nome} (${i.tipo})${i.valor ? ` | valor: ${i.valor}` : ''}`
                ).join('\n');
                return [
                    `Inventário de ${p.name}:`,
                    ...p.inventario.map(i =>
                        ` - ${i.nome} (${i.tipo})${i.valor ? ` | valor: ${i.valor}` : ''}`
                    )
                ];
        }
    },

    look() {
        uListaR.innerHTML = '';
        const atual = estado.cenarioAtual;

        if (!atual) return ['Você está no vazio.'];

        if (estado.emCombate) {
            return ['Você está concentrado demais para observar os arredores, primeiro derrote o inimigo.'];
        }
        /*
                // Repovoa os NPCs
                if (atual.npcs.length === 0) {
                    povoarCenarioComNpcs({
                        npcsPossiveis: NPCsPorRegiao[atual.id] || [],
                        cenario: atual,
                        max: 3,
                        eventoAtual: estado.eventoAtual || null
                    });
                }
        */
        return atual.renderizar();
    },
    cd(...local) {
        uListaR.innerHTML = '';
        const atual = estado.cenarioAtual;
        const p = estado.personagemAtivo;
        if (!atual) {
            return ['Você não está em nenhum local atual. Use "load" ou "select" para carregar um personagem.'];
        }
        const hostisVivos = atual.npcs.some(npc =>
            ['hostil', 'desconfiado'].includes(npc.estado) && npc.vida > 0
        );

        if (hostisVivos) {
            if (estado.fugaBloqueada) {
                return [
                    'Você já tentou fugir e falhou. Agora só pode sair derrotando todos os inimigos hostis.'
                ];
            }

            const chanceFuga = Math.min(90, 30 + p.defesa * 2);
            const rolar = Math.random() * 100;

            if (rolar > chanceFuga) {
                estado.fugaBloqueada = true; 
                this.save();
                return [
                    `Você tentou fugir, mas falhou! (Chance de fuga: ${chanceFuga.toFixed(0)}%)`,
                    'Você deve derrotar todos os inimigos hostis para sair.'
                ];

            } else {
                estado.emCombate = false;
                estado.fugaBloqueada = false;
                console.log('fuga bem sucedida');
            }
        } else {
           
            estado.emCombate = false;
            estado.fugaBloqueada = false;
            console.log('sem hostis');
        }
       
        const nomeDigitado = local.join(' ').toLowerCase().trim();

        const nomeAtual = atual.nome.toLowerCase().trim();
        if (nomeDigitado === nomeAtual) {
            atual.gerarObjetos({ limitesPrecos, gerarValorEntre }); 
            povoarCenarioComNpcs({
                npcsPossiveis: NPCsPorRegiao[atual.id] || [],
                cenario: atual,
                max: 3,
                eventoAtual: estado.eventoAtual || null
            });
            return atual.renderizar();
        }

        const entradaEncontrada = Object.entries(atual.locais).find(([id, cenario]) => {

            const nomeCenarioNormalizado = cenario.nome.toLowerCase().trim();
            return nomeCenarioNormalizado === nomeDigitado;
        });

        if (!entradaEncontrada) {
            return [`Não existe esse local chamado "${nomeDigitado}".`];
        }

        const [destinoId, destinoCenario] = entradaEncontrada;

        if (estado.emCombate) {
            return ['Você está em combate e não pode sair daqui! Use um item especial para fugir.'];
        }

        const novoCenario = estado.cenarios[destinoId];
        if (!novoCenario) {
            return [`Cenário "${destinoId}" não encontrado no estado.`];
        }

        estado.cenarioAtual = novoCenario;
        estado.personagemAtivo.localizacao = novoCenario.id;

        if (novoCenario.id === 'loja') {
            definirPrecosAleatorios();
            novoCenario.objetos.forEach(obj => {
                const precoItemAtualizado = Itens[obj.id]?.valor;
                if (precoItemAtualizado != null) {
                    obj.valor = precoItemAtualizado;
                }
            });
        }

        povoarCenarioComNpcs({
            npcsPossiveis: NPCsPorRegiao[novoCenario.id] || [],
            cenario: novoCenario,
            max: 3,
            eventoAtual: estado.eventoAtual || null
        });
        novoCenario.gerarObjetos({ limitesPrecos, gerarValorEntre });
        return novoCenario.renderizar();
    },





    pickup(...nomeItem) {
        const nomeLower = nomeItem.join(' ').toLowerCase().trim();

        uListaR.innerHTML = '';
        const p = estado.personagemAtivo;
        if (!p) return ['Nenhum personagem selecionado.'];

        const cenario = estado.cenarioAtual;
        if (!cenario) return ['Você não está em nenhum cenário.'];

        if (cenario.id === 'loja') {
            return ['Você não pode pegar itens da loja! Use "store buy [nome]" para comprá-los.'];
        }


        const indexObj = cenario.objetos.findIndex(o => o.nome.toLowerCase() === nomeLower);
        if (indexObj === -1) return [`Não há "${nomeLower}" aqui.`];


        const obj = cenario.objetos.splice(indexObj, 1)[0];

        if (obj.nome.toLowerCase() === 'moeda') {
            p.moedas = (p.moedas || 0) + (obj.valor || 1);
            this.save();
            return [`Você encontrou uma moeda e agora tem ${p.moedas} moedas.`];
        }

        const itemReal = new Item(obj.id, obj.nome, obj.tipo, obj.valor, obj.usar);


        p.inventario.push(itemReal);

 
        this.save();

        return [`Você pegou ${itemReal.nome}.`];
    },

    store(acao, ...nomeItem) {
        const p = estado.personagemAtivo;
        if (!p) return ['Nenhum personagem selecionado.'];

        const itemNome = nomeItem.join(' ').toLowerCase();

        if (!acao) return ['Uso: store [buy|sell|saldo] [nome do item]'];

        switch (acao) {
            case 'buy':
                if (!itemNome) return ['Use: store buy [nome do item]'];


                const objIndex = estado.cenarioAtual.objetos.findIndex(o => o.nome.toLowerCase() === itemNome);
                if (objIndex === -1) return [`O item "${itemNome}" não está disponível para compra aqui.`];

                const itemComprar = estado.cenarioAtual.objetos[objIndex];
                if (p.moedas < itemComprar.valor) return ['Você não tem moedas suficientes para comprar esse item.'];


                p.moedas -= itemComprar.valor;


                estado.cenarioAtual.objetos.splice(objIndex, 1);
                p.inventario.push(itemComprar);

                this.save();

                return [`Você comprou ${itemComprar.nome} por ${itemComprar.valor} moedas. Agora você tem ${p.moedas} moedas.`];

            case 'sell':
                if (!itemNome) return ['Use: store sell [nome do item]'];


                const indexSell = p.inventario.findIndex(i => i.nome.toLowerCase() === itemNome);
                if (indexSell === -1) return [`Você não tem "${itemNome}" no inventário para vender.`];

                const itemVender = p.inventario[indexSell];


                p.moedas += itemVender.valor;


                p.inventario.splice(indexSell, 1);

                estado.cenarioAtual.objetos.push(itemVender);

                this.save();

                return [`Você vendeu ${itemVender.nome} por ${itemVender.valor} moedas. Agora você tem ${p.moedas} moedas.`];

            case 'saldo':
                return [`Você tem ${p.moedas} moedas.`];

            default:
                return ['Comando inválido. Use: store [buy|sell|saldo] [nome do item]'];
        }
    },





    interact(...args) {
        if (args.length === 0) return ['Uso: interact [npc | resp1 | resp2 | exit]'];

        const input = args.join(' ').toLowerCase();

        if (input === 'exit' && estado.interacaoAtual) {
            const npc = estado.interacaoAtual.npc;
            estado.interacaoAtual = null;
            return [`Conversa com ${npc.nome} encerrada.`];
        }

        if (input.startsWith('resp') && estado.interacaoAtual) {
            const npc = estado.interacaoAtual.npc;
            const mensagens = npc.responder(input, {
                personagem: estado.personagemAtivo,
                jogo: { ...this, estado }
            });

            const extra = estado.personagemAtivo.__mensagemExtra || [];
            delete estado.personagemAtivo.__mensagemExtra;

            return [...mensagens, ...extra];
        }


        const nome = input;
        const npc = estado.cenarioAtual?.npcs.find(n => n.nome.toLowerCase() === nome);

        if (!npc) return [`Não há nenhum "${nome}" aqui.`];

        npc.falaAtual = 'inicio';
        estado.interacaoAtual = { npc };
        return npc.interagir();
    },



    talk() {

    },
    quest() {

    },
    attack(...args) {
        estado.emCombate = true;
        const p = estado.personagemAtivo;
        const c = estado.cenarioAtual;

        if (!p) return ['Nenhum personagem selecionado.'];
        if (!c) return ['Você não está em nenhum cenário.'];

        const nomeAlvo = args.join(' ').toLowerCase();
        const alvo = c.npcs.find(npc => npc.nome.toLowerCase() === nomeAlvo);

        if (!alvo) return [`Não há nenhum "${nomeAlvo}" aqui.`];
        if (!['hostil', 'desconfiado'].includes(alvo.estado)) return [`${alvo.nome} não parece querer lutar com você.`];
        if (alvo.estado === 'morto') return [`${alvo.nome} já está derrotado.`];
        if (typeof alvo.receberDano !== 'function') return [`${alvo.nome} não pode ser atacado.`];

        const mensagens = [];

        function rolarDado(max = 20) {
            return Math.floor(Math.random() * max) + 1;
        }

        const ataqueAleatorio = rolarDado();
        const defesaAleatoria = rolarDado();

        const danoJogador = Math.max(0, (p.ataque + ataqueAleatorio) - (alvo.defesa + defesaAleatoria));
        const resultadoAtaque = alvo.receberDano(danoJogador);
        mensagens.push(`\u200B`);
        mensagens.push(`${p.name} ataca ${alvo.nome} (Ataque base: ${p.ataque} + Dado: ${ataqueAleatorio}) contra (Defesa base: ${alvo.defesa} + Dado: ${defesaAleatoria}).`);
        mensagens.push(`${p.name} causa ${danoJogador} de dano em ${alvo.nome}!`);
        mensagens.push(resultadoAtaque);

        if (alvo.estado === 'morto') {
            const itensDropados = alvo.gerarDrop();
            const itensClonados = itensDropados.map(clonarItem);

            if (itensClonados.length > 0) {
                estado.cenarioAtual.objetos.push(...itensClonados);
                const nomes = itensClonados.map(item => `${item.nome} (${item.tipo}) | preço: ${item.valor} moedas`).join(', ');

                mensagens.push(`${alvo.nome} deixou cair: ${nomes}.`);
            } else {
                mensagens.push(`${alvo.nome} não deixou cair nada.`);
            }

            const index = c.npcs.indexOf(alvo);
            if (index !== -1) {
                c.npcs.splice(index, 1);
                mensagens.push(`${alvo.nome} foi removido do cenário.`);
            }
        }


        const npcsHostis = c.npcs.filter(npc =>
            ['hostil', 'desconfiado'].includes(npc.estado) &&
            npc.vida > 0
        );

        for (const inimigo of npcsHostis) {
            const ataqueMonstro = rolarDado();
            const defesaPersonagem = rolarDado();

            const danoMonstro = Math.max(0, (inimigo.ataque + ataqueMonstro) - (p.defesa + defesaPersonagem));
            p.life -= danoMonstro;
            mensagens.push(`\u200B`);
            mensagens.push(`${inimigo.nome} ataca (Ataque base: ${inimigo.ataque} + Dado: ${ataqueMonstro}) contra (Defesa base: ${p.defesa} + Dado: ${defesaPersonagem}).`);
            mensagens.push(`${inimigo.nome} causa ${danoMonstro} de dano em ${p.name}!`);
            mensagens.push(`Sua vida agora é ${p.life}`);

            if (p.life <= 0) {
                mensagens.push(`${p.name} foi derrotado... F.`);
                estado.emCombate = false;
                break;
            }
        }

        const inimigosRestantes = c.npcs.some(npc =>
            ['hostil', 'desconfiado'].includes(npc.estado) && npc.vida > 0
        );

        if (!inimigosRestantes) {
            mensagens.push('Você observa o local após a batalha...');
            mensagens.push(...estado.cenarioAtual.renderizar());
            estado.emCombate = false;
            estado.fugaBloqueada = false;
        }

        this.save?.();
        return mensagens;
    },


    defend() {

    },

    hack() {

    },
    decrypt() {

    },
    scan() {

    },
    analyze() {

    }

}