import Erro from "./Erro.js";

const MAXIMO_DISPOSITIVOS = 10; // Número máximo de dispositivos suportados

/**
 * Controlador de dispositivos de entrada e saida
 */
class EntradaSaida {
  /**
   * Inicializa um controlador de E/S
   */
  constructor() {
    /**
     * Array de dispositivos
     * Objeto:
     * {
     *  le, // Função para ler um inteiro do dispositivo
     *  escreve, // Função para escrever um inteiro no dispositivo
     *  controle, // Descritor do dispositivo (arg das f acima)
     *  id // Identificador do (sub)dispositivo (arg das f acima)
     * }
     * @var {array} dispositivos
     */
    this.dispositivos = [];
  }

  /**
   * Registra um dispositivo, identificado com o valor 'dispositivo', e que
   * será acessado através das funções apontadas por 'funcaoLe' e
   * 'funcaoEscreve'
   * se 'funcaoLe' ou 'funcaoEscreve' for NULL, considera-se que a operação correspondente
   * é inválida nesse dispositivo.
   * retorna false se não foi possível registrar
   * @param {Number} dispositivo
   * @param {void} controle
   * @param {Number} id
   * @param {Function} funcaoLe
   * @param {Function} funcaoEscreve
   * @return {Boolean}
   * */
  registraDispositivo(dispositivo, controle, id, funcaoLe, funcaoEscreve) {
    if (dispositivo < 0 || dispositivo >= MAXIMO_DISPOSITIVOS) return false;
    let novoDispositivo = {
      le: funcaoLe,
      escreve: funcaoEscreve,
      controle: controle,
      id: id,
    };
    this.dispositivos.push(novoDispositivo);
    return true;
  }

  /**
   * Função auxiliar, para verificar se tal acesso a tal dispositivo é ok
   * @param {Number} dispositivo
   * @param {String} tipo
   * @return {Erro}
   * */
  verificaAcesso(dispositivo, tipo) {
    if (dispositivo < 0 || dispositivo >= MAXIMO_DISPOSITIVOS)
      return new Erro("ERR_END_INV");
    if (tipo === "leitura" && this.dispositivos[dispositivo].le === null) {
      return new Erro("ERR_OP_INV");
    }
    if (tipo === "escrita" && this.dispositivos[dispositivo].escreve === null) {
      return new Erro("ERR_OP_INV");
    }
    return new Erro("ERR_OK");
  }

  /**
   * Lê um inteiro de um dispositivo
   * Retorna ERR_OK se bem sucedido, ou
   * ERR_END_INV se dispositivo desconhecido
   * ERR_OP_INV se operação inválida
   * @param {Number} dispositivo
   * @param {Number} *pvalor
   * @return {Erro}
   * */
  le(dispositivo, pvalor) {
    /** @var {Erro} erro */
    let erro = this.verificaAcesso(dispositivo, leitura);
    if (erro.valor !== "ERR_OK") return erro;
    let controle = this.dispositivos[dispositivo].controle;
    let id = this.dispositivos[dispositivo].id;
    return this.dispositivos[dispositivo].le(controle, id, pvalor);
  }

  /**
   * Escreve um inteiro em um dispositivo
   * Retorna ERR_OK se bem sucedido, ou
   * ERR_END_INV se dispositivo desconhecido
   * ERR_OP_INV se operação inválida
   * @param {Number} dispositivo
   * @param {Number} valor
   * @return {Erro}
   * */
  escreve(dispositivo, valor) {
    /** @var {Erro} erro */
    let erro = this.verificaAcesso(dispositivo, escrita);
    if (erro.valor !== "ERR_OK") return erro;
    let controle = this.dispositivos[dispositivo].controle;
    let id = this.dispositivos[dispositivo].id;
    return this.dispositivos[dispositivo].escreve(controle, id, valor);
  }
}

export { EntradaSaida, MAXIMO_DISPOSITIVOS };
