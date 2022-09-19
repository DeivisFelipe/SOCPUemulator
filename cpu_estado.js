// estrutura opaca
class CpuEstadoTipo {
  PC = undefined;
  A = undefined;
  X = undefined;
  erro = undefined;
  complemento = undefined;
}

// TAD para manter o estado interno da CPU (valores dos registradores, modo de execução, etc)
class CpuEstado {
  /**
   * cria e inicializa um novo descritor de estado
   * @return CpuEstadoTipo
   * */
  static *cpue_cria() {
    let self = new CpuEstadoTipo();
    self.PC = 0;
    self.A = 0;
    self.X = 0;
    self.erro = ERR_OK;
    self.complemento = 0;
    return self;
  }

  /**
   * copia um descritor de estado para outro
   * @param CpuEstadoTipo *self
   * @param CpuEstadoTipo *outro
   * @return void
   * */
  static cpue_copia(self, outro) {
    outro = self;
  }

  /**
   * retorna o valor do contador de programa
   * @param CpuEstadoTipo *self
   * @return int
   * */
  static cpue_PC(self) {
    return self.PC;
  }

  /**
   * retorna o valor do registrador 'A'
   * @param CpuEstadoTipo *self
   * @return int
   * */
  static cpue_A(self) {
    return self.A;
  }

  /**
   * retorna o valor do registrador 'X'
   * @param CpuEstadoTipo *self
   * @return int
   * */
  static cpue_X(self) {
    return self.X;
  }

  /**
   * retorna o valor do erro interno da CPU
   * @param CpuEstadoTipo *self
   * @return int
   * */
  static cpue_erro(self) {
    return self.erro;
  }

  /**
   * retorna o valor do complemento do erro (por exemplo, o endereço em que ocorreu um erro
   * de acesso à memória
   * @param CpuEstadoTipo *self
   * @return int
   * */
  static cpue_complemento(self) {
    return self.complemento;
  }

  /**
   * @param CpuEstadoTipo *self
   * @param int val
   * @return int
   * */
  static cpue_muda_PC(self, val) {
    self.PC = val;
  }

  /**
   * funções para alterar partes do estado
   * @param CpuEstadoTipo *self
   * @param int val
   * @return void
   * */
  static cpue_muda_A(self, val) {
    self.A = val;
  }

  /**
   * funções para alterar partes do estado
   * @param CpuEstadoTipo *self
   * @param int val
   * @return void
   * */
  static cpue_muda_X(self, val) {
    self.X = val;
  }

  /**
   * funções para alterar partes do estado
   * @param CpuEstadoTipo *self
   * @param ErrTipo err
   * @param int complemento
   * @return void
   * */
  static cpue_muda_erro(self, err, complemento) {
    self.erro = err;
    self.complemento = complemento;
  }
}

export { CpuEstado, CpuEstadoTipo };
