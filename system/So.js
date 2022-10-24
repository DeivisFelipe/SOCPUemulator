import Erro from "./../core/Erro.js";
import Controlador from "./../core/Controlador.js";
import Memoria from "./../core/Memoria.js";

import fs from "fs";

/**
 * SO
 * Simula o sistema operacional
 * É chamado na inicialização (quando deve colocar um programa na memória), e
 * depois só quando houver interrupção
 * Por enquanto não faz quase nada
 */
class So {
  /**
   * Contrustutor
   * @param {Controle} controle
   * @param {String} arquivo
   */
  constructor(controle, arquivo) {
    /**
     * Controle
     * @var {Controle} controle
     */
    this.controle = controle;

    this.paniquei = false;

    this.arquivo = arquivo;

    this.iniciaMemoria();
  }

  /**
   * Houve uma interrupção do tipo err — trate-a
   * @param {Erro} erro
   * @returns
   */
  interrupcao(erro) {
    //console.log("SO: interrupção");
    this.paniquei = true;
  }

  /**
   * Retorna false se o sistema deve ser desligado
   * @returns {Boolean}
   */
  ok() {
    return !this.paniquei;
  }

  /**
   * Carrega um programa na memória
   * @returns
   */
  iniciaMemoria() {
    // programa para executar na nossa
    const data = fs
      .readFileSync("./bin/" + this.arquivo + ".maq", "utf8")
      .split("\n")
      .filter(Boolean);

    // cria a memória
    let memoria = new Memoria();

    let instrucoes = [];
    // Percorre todas as linhas do arquivo asm
    data.forEach((linha, index) => {
      linha = linha.split("*/")[1].trim();
      linha = linha.split(", ");
      linha = linha.map((item) => {
        return parseFloat(item.split(",")[0]);
      });
      instrucoes = instrucoes.concat(linha);
    });

    // cria uma memória e inicializa com o programa
    instrucoes.forEach((instrucao, index) => {
      /** @var {Erro} erro */
      let erro = memoria.escreve(index, instrucao);
      if (erro.valor !== "ERR_OK") {
        //console.log("Erro de memória, endereco " + index);
        this.panico();
      }
    });
  }

  /**
   *
   * @returns
   */
  panico() {
    //console.log("Problema irrecuperável no SO");
    this.paniquei = true;
  }
}

export default So;
