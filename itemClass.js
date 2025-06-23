export class Item {
    constructor(nome, tipo, valor = 0, usar = null) {
        this.nome = nome;
        this.tipo = tipo;
        this.valor = valor;
        this.usar = usar; 
    }
}