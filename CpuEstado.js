// TAD para manter o estado interno da CPU (valores dos registradores, modo de execução, etc)
class CpuEstado {
  /**
   * Contrustutor
   */
  constructor() {
    this.PC = 0;
    this.A = 0;
    this.X = 0;
    this.erro = "ERR_OK";
    this.complemento = 0;
  }

  /**
   * Copia um descritor de estado para outro
   * @return void
   * */
  cpuEstadoCopia() {
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
   * @return int
   * */
  cpuEstadoPC() {
    return this.PC;
  }

  /**
   * Retorna o valor do registrador 'A'
   * @return int
   * */
  cpuEstadoA() {
    return this.A;
  }

  /**
   * Retorna o valor do registrador 'X'
   * @return int
   * */
  cpuEstadoX() {
    return this.X;
  }

  /**
   * Retorna o valor do erro interno da CPU
   * @return int
   * */
  cpuEstadoErro() {
    return this.erro;
  }

  /**
   * Retorna o valor do complemento do erro (por exemplo, o endereço em que ocorreu um erro
   * de acesso à memória
   * @return int
   * */
  cpuEstadoComplemento() {
    return this.complemento;
  }

  /**
   * Altera o valor do registrador PC
   * @param int valor
   * @return int
   * */
  cpuEstadoMudaPC(valor) {
    this.PC = valor;
  }

  /**
   * Altera o valor do registrador A
   * @param int valor
   * @return void
   * */
  cpuEstadoMudaA(valor) {
    this.A = valor;
  }

  /**
   * Altera o valor do registrador X
   * @param int valor
   * @return void
   * */
  cpuEstadoMudaA(valor) {
    this.X = valor;
  }

  /**
   * Altera o valor do erro e do complemento
   * @param ErrTipo erro
   * @param int complemento
   * @return void
   * */
  cpuEstadoMudaErro(erro, complemento) {
    this.erro = erro;
    this.complemento = complemento;
  }
}

export default CpuEstado;
