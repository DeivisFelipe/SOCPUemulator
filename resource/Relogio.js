/**
 * Dispositivo Relógio
 */
class Relogio {
  /**
   * Contrustutor
   */
  constructor() {
    this.agora = 0;
  }

  /**
   * Aumenta o agora em 1
   */
  tictac() {
    this.agora++;
  }

  /**
   * Retorna o agora
   * @returns {Number}
   */
  pegaAgora() {
    return this.agora;
  }

  /**
   * Função le do Relogio
   * @param {Number} id
   * @param {Object} *ObjetoValor
   * @returns {Erro}
   */
  le(id, ObjetoValor) {
    let erro = new Erro("ERR_OK");
    switch (id) {
      case 0:
        ObjetoValor.valor = this.agora;
        break;
      case 1:
        ObjetoValor.valor = clock() / (CLOCKS_PER_SEC / 1000);
        break;
      default:
        erro.valor = "ERR_END_INV";
    }
    return erro;
  }
}

export default Relogio;
