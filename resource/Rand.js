import Erro from "../core/Erro.js";

/**
 * Dispositivo Relógio
 * Simulador do relógio
 * Registra a passagem do tempo
 */
class Rand {
  /**
   * Contrustutor
   */
  constructor() {}

  /**
   * Função para gerar valor aleatório
   * @param {Relogio} controle
   * @param {Number} id
   * @param {Object} ObjetoValor
   * @returns {Erro}
   */
  le(controle, id, ObjetoValor) {
    let erro = new Erro("ERR_OK");
    ObjetoValor.valor = Math.floor(Math.random() * 65536);
    return erro;
  }
}

export default Rand;
