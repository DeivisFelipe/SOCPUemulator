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
   * @param {Function} funcaoPronto
   * @return {Boolean}
   * */
  registraDispositivo(
    dispositivo,
    controle,
    id,
    funcaoLe,
    funcaoEscreve,
    funcaoPronto
  ) {
    if (dispositivo < 0 || dispositivo >= MAXIMO_DISPOSITIVOS) return false;
    let novoDispositivo = {
      le: funcaoLe,
      escreve: funcaoEscreve,
      pronto: funcaoPronto,
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
   * @param {Number} dispositivo
   * @param {Object} ObjetoValor
   * Le dispositivo virtual para estado de prontidão
   * cada dispositivo i tem dois dispositivos virtuais de leitura:
   * i+100 que fornece prontidão par leitura (1 ou 0)
   * i+200 que fornece prontidão par escrita (1 ou 0)
   */
  leVirtual(dispositivo, ObjetoValor) {
    let pronto;
    if (dispositivo < 200) {
      // prontidão para leitura
      pronto = this.pronto(self, dispositivo - 100, "leitura");
    } else {
      // prontidão para escrita
      pronto = this.pronto(self, dispositivo - 200, "escrita");
    }
    ObjetoValor = {
      valor: pronto ? 1 : 0,
    };
    return new Erro("ERR_OK");
  }

  /**
   * Lê um inteiro de um dispositivo
   * Retorna ERR_OK se bem sucedido, ou
   * ERR_END_INV se dispositivo desconhecido
   * ERR_OP_INV se operação inválida
   * @param {Number} dispositivo
   * @param {Object} ObjetoValor
   * @return {Erro}
   * */
  le(dispositivo, ObjetoValor) {
    // se for dispositivo "virtual", passa adiante
    if (dispositivo >= 100) return this.leVirtual(dispositivo, ObjetoValor);

    // dispositivo normal
    /** @var {Erro} erro */
    let erro = this.verificaAcesso(dispositivo, "leitura");
    if (erro.valor !== "ERR_OK") return erro;
    let id = this.dispositivos[dispositivo].id;
    let controle = this.dispositivos[dispositivo].controle;
    return this.dispositivos[dispositivo].le(controle, id, ObjetoValor);
  }

  /**
   * Escreve um inteiro em um dispositivo
   * Retorna ERR_OK se bem sucedido, ou
   * ERR_END_INV se dispositivo desconhecido
   * ERR_OP_INV se operação inválida
   * ERR_OCUP se dispositivo não estiver disponível
   * a identificação do dispositivo é a que foi registrada, ou pode ser um
   * id virtual (>=100), que disponibiliza a prontidão de um dispositivo:
   * - lendo de um id>=100, se está lendo o estado de prontidão (1=pronto) para leitura do dispositivo id-100
   * - lendo de um id>=200, se está lendo o estado de prontidão para escrita do dispositivo id-200
   * (gambiarras acontecem...)
   * @param {Number} dispositivo
   * @param {Number} valor
   * @return {Erro}
   * */
  escreve(dispositivo, valor) {
    /** @var {Erro} erro */
    let erro = this.verificaAcesso(dispositivo, "escrita");
    if (erro.valor !== "ERR_OK") return erro;
    let id = this.dispositivos[dispositivo].id;
    return this.dispositivos[dispositivo].escreve(id, valor);
  }

  /**
   * Retorna true se for possível realizar o acesso indicado
   * @param {Number} dispositivo
   * @param {String} tipoAcesso
   * @returns {Boolean}
   */
  pronto(dispositivo, tipoAcesso) {
    // se não for possível esse tipo de acesso, não está pronto
    let erro = this.verificaAcesso(dispositivo, tipoAcesso);
    if (erro.valor !== "ERR_OK") return false;
    // se não houver função de pronto, está sempre pronto
    if (this.dispositivos[dispositivo].pronto === null) return true;
    // pergunta ao dispositivo
    let controler = this.dispositivos[dispositivo].controle;
    let id = this.dispositivos[dispositivo].id;
    return controler.dispositivos[dispositivo].pronto(id, tipoAcesso);
  }
}

export { EntradaSaida, MAXIMO_DISPOSITIVOS };
