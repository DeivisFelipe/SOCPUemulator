import Erro from "./Erro";

/**
 * Simulador da memória principal
 * É um vetor de inteiros
 */
class Memoria {
  /**
   * Contrustutor
   */
  constructor(tamanho) {
    /**
     * Tamanho da memoria
     * @var {Number} tamanho
     */
    this.tamanho = tamanho;

    /**
     * Array com o conteudo da memoria
     * Tipo {Number}
     */
    this.conteudo = [];
  }

  /**
   * Retorna o tamanho da memoria
   * @returns {Number}
   */
  tamanho() {
    return this.tamanho;
  }

  /**
   * Função auxiliar, verifica se endereço é válido
   * @param {Number} endereco
   * @return ErroType
   */
  permissao(endereco) {
    if (endereco < 0 || endereco >= this.tamanho) {
      return new Erro("ERR_END_INV");
    }
    return new Erro("ERR_OK");
  }

  /**
   * Le um valor na memoria, caso não encontre retorna um erro
   * @param {Number} endereco
   * @return {Object|Number}
   */
  le(endereco) {
    /** @var {Erro} erro */
    let erro = this.permissao(endereco);
    if (erro.valor === "ERR_OK") {
      return this.conteudo[endereco];
    }
    return erro;
  }

  /**
   * Escreve um valor na memoria, caso não encontre o endereço retorna um erro
   * @param {Number} endereco
   * @param {Number} valor
   * @return {Object|Number}
   */
  escreve(endereco, valor) {
    let erro = this.permissao(endereco);
    if (erro.valor === "ERR_OK") {
      this.conteudo[endereco] = valor;
    }
    return erro;
  }
}

export default Memoria;
