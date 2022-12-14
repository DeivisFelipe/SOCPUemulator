import Erro from "../core/Erro.js";

/**
 * Dispositivo Relógio
 * Simulador do relógio
 * Registra a passagem do tempo
 */
class Relogio {
  /**
   * Contrustutor
   */
  constructor() {
    this.agora = 0;
    this.milisegundosInicial = Date.now();
  }

  /**
   * Registra a passagem de uma unidade de tempo
   * Esta função é chamada pelo controlador após a execução de cada instrução
   */
  tictac() {
    this.agora++;
  }

  /**
   * Retorna a hora atual do sistema, em unidades de tempo
   * @returns {Number}
   */
  pegaAgora() {
    return this.agora;
  }

  /**
   * Função para acessar o relógio como um dispositivo de E/S
   * Só tem leitura, e dois dispositivos, '0' para ler o relógio local
   * (contador de instruções) e '1' para ler o relógio de tempo de CPU
   * consumido pelo simulador (em ms)
   * @param {Relogio} controle
   * @param {Number} id
   * @param {Object} ObjetoValor
   * @returns {Erro}
   */
  le(controle, id, ObjetoValor) {
    let erro = new Erro("ERR_OK");
    switch (id) {
      case 0:
        ObjetoValor.valor = controle.pegaAgora();
        break;
      case 1:
        const clock = new Date();
        ObjetoValor.valor = clock.getTime() - controle.milisegundosInicial;
        break;
      default:
        erro.valor = "ERR_END_INV";
    }
    return erro;
  }
}

export default Relogio;
