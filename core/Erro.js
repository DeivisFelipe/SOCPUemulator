/**
 * Class que representa um erro
 */
class Erro {
  /**
   * Contrustutor
   * Valores possiveis
   *
   * [ERR_OK]         = "OK",
   * [ERR_END_INV]    = "Endereço inválido",
   * [ERR_OP_INV]     = "Operação inválida",
   * [ERR_OCUP]       = "Dispositivo ocupado",
   * [ERR_CPU_PARADA] = "CPU parada",
   * [ERR_INSTR_INV]  = "Instrução inválida",
   * [N_ERR]          = número de erros
   * @param {string} valor
   */
  constructor(valor = "ERR_OK") {
    this.valor = valor;
  }
}

export default Erro;
