import CpuEstado from "./CpuEstado.js";
import { EntradaSaida } from "./EntradaSaida.js";
import Memoria from "./Memoria.js";
import Erro from "./Erro.js";

// Simulador do executor de instruções de uma CPU
// Executa a instrução no PC se possível, ou retorna erro

// Tem acesso a
// - controlador de ES para as instruções de ES
// - memória, onde está o programa e os dados -- alterável pelas instruções
// - estado da CPU, onde estão os registradores -- alterável pelas instruções

class Executor {
  /**
   * Construtor
   * lê um inteiro de um dispositivo
   * @param {Memoria} memoria
   * @param {EntradaSaida} entradaSaida
   * @return
   * */
  constructor(memoria, entradaSaida) {
    this.cpuEstado = new CpuEstado();
    /** @var Memoria this.memoria */
    this.memoria = memoria;
    /** @var EntradaSaida this.entradaSaida */
    this.entradaSaida = entradaSaida;

    /**
     * array de instruções
     * @var {Array} instrucoes
     */
    this.instrucoes = [
      "NOP",
      "PARA",
      "CARGI",
      "CARGM",
      "CARGX",
      "ARMM",
      "ARMX",
      "MVAX",
      "MVXA",
      "INCX",
      "SOMA",
      "SUB",
      "MULT",
      "DIV",
      "RESTO",
      "NEG",
      "DESV",
      "DESVZ",
      "DESVNZ",
      "LE",
      "ESCR",
    ];
  }

  /**
   * O CpuEstado faz uma copia do CpuEstado do executor
   * @param {CpuEstado} estado
   * @return
   * */
  copiaEstadoCpuEstado(estado) {
    estado = this.cpuEstado.copia();
  }

  /**
   * Faz a copia de uma CpuEstado para a CpuEstado do executor
   * @param {CpuEstado} estado
   * @return
   * */
  alteraEstado(estado) {
    this.cpuEstado = estado.copia();
  }

  // ---------------------------------------------------------------------
  // Funções auxiliares para usar durante a execução das instruções
  // Alteram o estado da CPU caso ocorra erro

  /**
   * Lê um valor da memória
   * @param {Number} endereco
   * @param {Object} ObjetoValor
   * @return bool
   * */
  pegaMemoria(endereco, ObjetoValor) {
    /** @var Erro *erro */
    let erro = this.memoria.le(endereco, ObjetoValor);
    if (erro.valor !== "ERR_OK") {
      this.cpuEstado.mudaErro(erro, endereco);
    }
    return erro.valor == "ERR_OK";
  }

  /**
   * lê o opcode da instrução no PC
   * @param {Object} ObjetoValor
   * @return {Boolean}
   * */
  pegaOpcode(ObjetoValor) {
    return this.pegaMemoria(this.cpuEstado.pegaPC(), ObjetoValor);
  }

  /**
   * Pega o valor da proxima possição da memoria depois do PC
   * Representando o A1
   * @param {Object} ObjetoValor
   * @return {Boolean}
   * */
  pegaA1(ObjetoValor) {
    return this.pegaMemoria(this.cpuEstado.pegaPC() + 1, ObjetoValor);
  }

  /**
   * Incrementa o valor do PC
   * @return
   * */
  incrementaPC() {
    this.cpuEstado.mudaPC(this.cpuEstado.pegaPC() + 1);
  }

  /**
   * Incrementa em 2 o valor do PC
   * @return void
   * */
  incrementaPC2() {
    this.cpuEstado.mudaPC(this.cpuEstado.pegaPC() + 2);
  }

  /**
   * Escreve um valor na memória
   * @param {Number} endereco
   * @param {Number} valor
   * @return {Boolean}
   * */
  poeMemoria(endereco, valor) {
    /** @var {Erro} *erro */
    let erro = this.memoria.escreve(endereco, valor);
    if (erro.valor !== "ERR_OK") {
      this.cpuEstado.mudaErro(erro, endereco);
    }
    return erro.valor === "ERR_OK";
  }

  /**
   * Lê um valor da E/S
   * @param {Number} dispositivo
   * @param {Object} ObjetoValor
   * @return {Boolean}
   * */
  pegaEntradaSaida(dispositivo, ObjetoValor) {
    /** @var {Erro} *erro */
    let erro = this.entradaSaida.le(dispositivo, ObjetoValor);
    if (erro.valor !== "ERR_OK") {
      this.cpuEstado.mudaErro(erro, dispositivo);
    }
    return erro.valor === "ERR_OK";
  }

  /**
   * Escreve um valor na E/S
   * @param {Number} dispositivo
   * @param {Object} ObjetoValor
   * @return {Boolean}
   * */
  poeEntradaSaida(dispositivo, ObjetoValor) {
    /** @var {Erro} *erro */
    let erro = this.entradaSaida.escreve(dispositivo, ObjetoValor);
    if (erro.valor !== "ERR_OK") {
      this.cpuEstado.mudaErro(erro, dispositivo);
    }
    return erro.valor === "ERR_OK";
  }

  // ---------------------------------------------------------------------
  // Funções auxiliares para implementação de cada instrução

  /**
   * Escreve um valor na E/S
   * @return
   * */
  operacaoNOP() {
    // não faz nada
    this.incrementaPC();
  }

  /**
   * Para a CPU
   * @return
   * */
  operacaoPARA() {
    this.cpuEstado.mudaErro(new Erro("ERR_CPU_PARADA"), 0);
  }

  /**
   * Carrega imediato
   * Pega o próxima valor depois da intrução do PC e bota dentro do registrador A
   * ** Testado e funcionando ***
   * @return
   * */
  operacaoCARGI() {
    /** @var {Object} ObjetoValorA1 */
    let ObjetoValorA1 = {
      valor: null,
    };
    if (this.pegaA1(ObjetoValorA1)) {
      this.cpuEstado.mudaA(ObjetoValorA1.valor);
      this.incrementaPC2();
    }
  }

  /**
   * Carrega da memória
   * @return
   * */
  operacaoCARGM() {
    /** @var {Object} ObjetoValorA1 */
    /** @var {Object} ObjetoValorMA1 */
    let ObjetoValorA1 = {
      valor: null,
    };
    let ObjetoValorMA1 = {
      valor: null,
    };
    if (
      this.pegaA1(ObjetoValorA1) &&
      this.pegaMemoria(ObjetoValorA1.valor, ObjetoValorMA1)
    ) {
      this.cpuEstado.mudaA(ObjetoValorMA1);
      this.incrementaPC2();
    }
  }

  /**
   * Carrega indexado
   * @return
   * */
  operacaoCARGX() {
    /** @var {Object} ObjetoValorA1 */
    /** @var {Object} ObjetoValorMA1MX */
    let ObjetoValorA1 = {
      valor: null,
    };
    let ObjetoValorMA1MX = {
      valor: null,
    };
    /** @var int X */
    let X = this.cpuEstado.pegaX();
    if (
      this.pegaA1(ObjetoValorA1) &&
      this.pegaMemoria(ObjetoValorA1.valor + X, ObjetoValorMA1MX)
    ) {
      this.cpuEstado.mudaA(ObjetoValorMA1MX);
      this.incrementaPC2();
    }
  }

  /**
   * Armazena na memória
   * @return
   * */
  operacaoARMM() {
    /** @var {Object} ObjetoValorA1 */
    let ObjetoValorA1 = {
      valor: null,
    };
    if (
      this.pegaA1(ObjetoValorA1) &&
      this.poeMemoria(ObjetoValorA1.valor, this.cpuEstado.pegaA())
    ) {
      this.incrementaPC2();
    }
  }

  /**
   * Armazena indexado
   * @return
   * */
  operacaoARMX() {
    /** @var {Object} ObjetoValorA1 */
    let ObjetoValorA1 = {
      valor: null,
    };
    /** @var int X */
    let X = this.cpuEstado.pegaX();
    if (
      this.pegaA1(ObjetoValorA1) &&
      this.poeMemoria(ObjetoValorA1.valor + X, this.cpuEstado.pegaA())
    ) {
      this.incrementaPC2();
    }
  }

  /**
   * Copia A para X
   * E aumenta o PC
   * ** Testado e Funcionando ***
   * @return
   * */
  operacaoMVAX() {
    this.cpuEstado.mudaX(this.cpuEstado.pegaA());
    this.incrementaPC();
  }

  /**
   * Copia X para A
   * @return
   * */
  operacaoMVXA() {
    this.cpuEstado.mudaA(this.cpuEstado.pegaX());
    this.incrementaPC();
  }

  /**
   * Incrementa X
   * *** Testado e Funcionando ***
   * @return
   * */
  operacaoINCX() {
    this.cpuEstado.mudaX(this.cpuEstado.pegaX() + 1);
    this.incrementaPC();
  }

  /**
   * Soma
   * @return
   * */
  operacaoSOMA() {
    /** @var {Object} ObjetoValorA1 */
    let ObjetoValorA1 = {
      valor: null,
    };
    /** @var {Object} ObjetoValorMA1 */
    let ObjetoValorMA1 = {
      valor: null,
    };
    if (
      this.pegaA1(ObjetoValorA1) &&
      this.pegaMemoria(ObjetoValorA1.valor, ObjetoValorMA1)
    ) {
      this.cpuEstado.mudaA(this.cpuEstado.pegaA() + ObjetoValorMA1.valor);
      this.incrementaPC2();
    }
  }

  /**
   * Subtração
   * Pega o proximo valor do PC, que esse valor significa o endereço do dado que sera pega na memoria
   * Depois muda o valor do registrador A para A - valor carregado da memoria
   * *** Testado e Funcionando ***
   * @return
   * */
  operacaoSUB() {
    /** @var {Object} ObjetoValorA1 */
    let ObjetoValorA1 = {
      valor: null,
    };
    /** @var {Object} ObjetoValorMA1 */
    let ObjetoValorMA1 = {
      valor: null,
    };
    if (
      this.pegaA1(ObjetoValorA1) &&
      this.pegaMemoria(ObjetoValorA1.valor, ObjetoValorMA1)
    ) {
      this.cpuEstado.mudaA(this.cpuEstado.pegaA() - ObjetoValorMA1.valor);
      this.incrementaPC2();
    }
  }

  /**
   * Multiplicação
   * @return
   * */
  operacaoMULT() {
    /** @var {Object} ObjetoValorA1 */
    let ObjetoValorA1 = {
      valor: null,
    };
    /** @var {Object} ObjetoValorMA1 */
    let ObjetoValorMA1 = {
      valor: null,
    };
    if (
      this.pegaA1(ObjetoValorA1) &&
      this.pegaMemoria(ObjetoValorA1.valor, ObjetoValorMA1)
    ) {
      this.cpuEstado.mudaA(this.cpuEstado.pegaA() * ObjetoValorMA1.valor);
      this.incrementaPC2();
    }
  }

  /**
   * Divisão
   * @return
   * */
  operacaoDIV() {
    /** @var {Object} ObjetoValorA1 */
    let ObjetoValorA1 = {
      valor: null,
    };
    /** @var {Object} ObjetoValorMA1 */
    let ObjetoValorMA1 = {
      valor: null,
    };
    if (
      this.pegaA1(ObjetoValorA1) &&
      this.pegaMemoria(ObjetoValorA1.valor, ObjetoValorMA1)
    ) {
      this.cpuEstado.mudaA(this.cpuEstado.pegaA() / ObjetoValorMA1.valor);
      this.incrementaPC2();
    }
  }

  /**
   * Resto
   * @return
   * */
  peracaoRESTO() {
    /** @var {Object} ObjetoValorA1 */
    let ObjetoValorA1 = {
      valor: null,
    };
    /** @var {Object} ObjetoValorMA1 */
    let ObjetoValorMA1 = {
      valor: null,
    };
    if (
      this.pegaA1(ObjetoValorA1) &&
      this.pegaMemoria(ObjetoValorA1.valor, ObjetoValorMA1)
    ) {
      this.cpuEstado.mudaA(this.cpuEstado.pegaA() % ObjetoValorMA1.valor);
      this.incrementaPC2();
    }
  }

  /**
   * Inverte sinal
   * @return
   * */
  operacaoNEG() {
    this.cpuEstado.mudaA(-this.cpuEstado.pegaA());
    this.incrementaPC();
  }

  /**
   * Desvio incondicional
   * @return
   * */
  operacaoDESV() {
    /** @var {Object} ObjetoValorA1 */
    let ObjetoValorA1 = {
      valor: null,
    };
    if (this.pegaA1(ObjetoValorA1)) {
      this.cpuEstado.mudaPC(ObjetoValorA1.valor);
    }
  }

  /**
   * Desvio condicional
   * @return
   * */
  operacaoDESVZ() {
    /** @var {Number} a1 */
    let a1 = this.cpuEstado.pegaA();
    if (a1 === 0) {
      this.operacaoDESV();
    } else {
      this.incrementaPC2();
    }
  }

  /**
   * Desvio condicional
   * @return
   * */
  operacaoDESVNZ() {
    /** @var {Number} a1 */
    let a1 = this.cpuEstado.pegaA();
    if (a1 !== 0) {
      this.operacaoDESV();
    } else {
      this.incrementaPC2();
    }
  }

  /**
   * leitura de E/S
   * @return
   * */
  operacaoLE() {
    /** @var {Object} ObjetoValorA1 */
    /** @var {Object} ObjetoValorDado */
    let ObjetoValorA1 = {
      valor: null,
    };
    let ObjetoValorDado = {
      valor: null,
    };
    if (
      this.pegaA1(ObjetoValorA1) &&
      this.pegaEntradaSaida(ObjetoValorA1.valor, ObjetoValorDado)
    ) {
      this.cpuEstado.mudaA(ObjetoValorDado.valor);
      this.incrementaPC2();
    }
  }

  /**
   * Escrita de E/S
   * @return
   * */
  operacaoESCR() {
    /** @var {Object} ObjetoValorA1 */
    let ObjetoValorA1 = {
      valor: null,
    };

    if (
      this.pegaA1(ObjetoValorA1) &&
      this.poeEntradaSaida(ObjetoValorA1.valor, this.cpuEstado.pegaA())
    ) {
      this.incrementaPC2();
    }
  }

  /**
   * Executa a instrução
   * @return {Erro}
   * */
  executa() {
    // Não executa se CPU já estiver em erro
    if (this.cpuEstado.pegaErro().valor !== "ERR_OK") {
      return this.cpuEstado.pegaErro();
    }

    /** @var {Object} ObjetoValorOpcode */
    let ObjetoValorOpcode = {
      valor: null,
    };
    if (!this.pegaOpcode(ObjetoValorOpcode)) {
      return this.cpuEstado.pegaErro();
    }

    switch (this.instrucoes[ObjetoValorOpcode.valor]) {
      case "NOP":
        this.operacaoNOP();
        break;
      case "PARA":
        this.operacaoPARA();
        break;
      case "CARGI":
        this.operacaoCARGI();
        break;
      case "CARGM":
        this.operacaoCARGM();
        break;
      case "CARGX":
        this.operacaoCARGX();
        break;
      case "ARMM":
        this.operacaoARMM();
        break;
      case "ARMX":
        this.operacaoARMX();
        break;
      case "MVAX":
        this.operacaoMVAX();
        break;
      case "MVXA":
        this.operacaoMVXA();
        break;
      case "INCX":
        this.operacaoINCX();
        break;
      case "SOMA":
        this.operacaoSOMA();
        break;
      case "SUB":
        this.operacaoSUB();
        break;
      case "MULT":
        this.operacaoMULT();
        break;
      case "DIV":
        this.operacaoDIV();
        break;
      case "RESTO":
        this.operacaoRESTO();
        break;
      case "NEG":
        this.operacaoNEG();
        break;
      case "DESV":
        this.operacaoDESV();
        break;
      case "DESVZ":
        this.operacaoDESVZ();
        break;
      case "DESVNZ":
        this.operacaoDESVNZ();
        break;
      case "LE":
        this.operacaoLE();
        break;
      case "ESCR":
        this.operacaoESCR();
        break;
      default:
        this.cpuEstado.mudaErro(new Error("ERR_INSTR_INV"), 0);
    }
    return this.cpuEstado.pegaErro();
  }
}

export default Executor;
