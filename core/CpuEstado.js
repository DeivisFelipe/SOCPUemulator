import Erro from "./Erro.js";

// TAD para manter o estado interno da CPU (valores dos registradores, modo de execução, etc)
class CpuEstado {
  /**
   * Contrustutor
   */
  constructor() {
    this.PC = 0;
    this.A = 0;
    this.X = 0;
    this.erro = new Erro("ERR_OK");
    this.complemento = 0;
  }

  /**
   * Copia um descritor de estado para outro
   * @returns
   * */
  copia() {
    let novaCpuEstado = new CpuEstado();
    novaCpuEstado.PC = this.PC;
    novaCpuEstado.A = this.A;
    novaCpuEstado.X = this.X;
    novaCpuEstado.erro = this.erro;
    novaCpuEstado.complemento = this.complemento;
    return novaCpuEstado;
  }

  /**
   * Retorna o valor do contador de programa
   * @returns {Number}
   * */
  pegaPC() {
    return this.PC;
  }

  /**
   * Retorna o valor do registrador 'A'
   * @returns {Number}
   * */
  pegaA() {
    return this.A;
  }

  /**
   * Retorna o valor do registrador 'X'
   * @returns {Number}
   * */
  pegaX() {
    return this.X;
  }

  /**
   * Retorna o valor do erro interno da CPU
   * @returns {Erro}
   * */
  pegaErro() {
    return this.erro;
  }

  /**
   * Retorna o valor do complemento do erro (por exemplo, o endereço em que ocorreu um erro
   * de acesso à memória
   * @returns {Number}
   * */
  pegaComplemento() {
    return this.complemento;
  }

  /**
   * Altera o valor do registrador PC
   * @param {Number} valor
   * @returns
   * */
  mudaPC(valor) {
    this.PC = valor;
  }

  /**
   * Altera o valor do registrador A
   * @param {Number} valor
   * @returns
   * */
  mudaA(valor) {
    this.A = valor;
  }

  /**
   * Altera o valor do registrador X
   * @param {Number} valor
   * @returns
   * */
  mudaA(valor) {
    this.X = valor;
  }

  /**
   * Altera o valor do erro e do complemento
   * @param {Erro} erro
   * @param {Number} complemento
   * @returns
   * */
  mudaErro(erro, complemento) {
    this.erro = erro;
    this.complemento = complemento;
  }
}

export default CpuEstado;
