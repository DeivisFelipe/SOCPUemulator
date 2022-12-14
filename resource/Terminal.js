import Erro from "../core/Erro.js";
import readline from "readline";

// TODO: implementar suporte a múltiplos terminais

/**
 * Dispositivo Terminal
 * Simulador do terminal
 * Realiza a entrada e saída de valores numéricos
 * Por enquanto só suporta um terminal
 */
class Terminal {
  /**
   * Contrustutor
   */
  constructor() {}

  /**
   * Funções para implementar o protocolo de acesso a um dispositivo pelo
   * controlador de E/S
   * @param {Terminal} controle
   * @param {Number} id
   * @param {Object} ObjetoValor
   * @returns {Erro}
   */
  le(controle, id, ObjetoValor) {
    // Quando tiver suporte a múltiplos terminais, 'id' será usado para discriminar qual dos
    // Terminais está sendo acessado, e 'disp' dará acesso ao nosso descritor (term_t).
    // Por enquanto, são ignorados.
    var leitor = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    leitor.question("Digite um valor: \n", function (resposta) {
      ObjetoValor.valor = resposta;
      leitor.close();
    });
    return new Erro("ERR_OK");
  }

  /**
   * Escreve um valor na tela
   * @param {Number} id
   * @param {Number} valor
   * @returns {Erro}
   */
  escreve(id, valor) {
    console.log("[SAÍDA: " + valor + " ]");
    return new Erro("ERR_OK");
  }
}

export default Terminal;
