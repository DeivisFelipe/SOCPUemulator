/**
 * Class que representa um erro
 */
class Erro {
  /**
   * Contrustutor
   * Valores possiveis
   * ERR_OK, // sem erro
   * ERR_END_INV, // endereço inválido
   * ERR_OP_INV, // operação inválida
   * ERR_CPU_PARADA, // CPU está com execução suspensa
   * ERR_INSTR_INV, // instrução inválida
   * @param {string} valor
   */
  constructor(valor = "ERR_OK") {
    this.valor = valor;
  }
}

export default Erro;
