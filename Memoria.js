/**
 * Simulador da memória principal
 * É um vetor de inteiros
 */
class Memoria {
  /**
   * Contrustutor
   */
  constructor(tamanho) {
    this.tamanho = tamanho;
  }

  /**
   * Retorna o tamanho da memoria
   * @returns {Number}
   */
  memoriaTamanho() {
    return this.tamanho;
  }

  /**
   * Função auxiliar, verifica se endereço é válido
   * @param {Number} endereco
   * @return ErroType
   */
  verificaPermissao(endereco) {
    if (endereco < 0 || endereco >= this.tamanho) {
      return "ERR_END_INV";
    }
    return "ERR_OK";
  }

  /**
   * Le um valor na memoria, caso não encontre retorna um erro
   * @param {Number} endereco
   * @return {Object|Number}
   */
  memoriaLe(endereco) {
    let erro = verif_permissao(endereco);
    if (erro === "ERR_OK") {
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
  memoriaEscreve(endereco, valor) {
    let erro = verif_permissao(endereco);
    if (erro === "ERR_OK") {
      this.conteudo[endereco] = valor;
    }
    return erro;
  }
}

export default Memoria;
