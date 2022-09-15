class Montador {
  /**
   *
   * @param {string} arquivo
   */
  inicia(arquivo) {
    this.monta_arquivo(arquivo);
    this.mem_imprime();
  }

  monta_arquivo(arquivo) {
    console.log(arquivo);
  }

  mem_imprime() {
    console.log("memoria");
  }
}

export default Montador;
