// Core
import Montador from "./Montador.js";
import CpuEstado from "./core/CpuEstado.js";
import Memoria from "./core/Memoria.js";
import { EntradaSaida } from "./core/EntradaSaida.js";
import Executor from "./core/Executor.js";
import Erro from "./core/Erro.js";

// Dispositivos
import Terminal from "./resource/Terminal.js";
import Relogio from "./resource/Relogio.js";

import fs from "fs";

const arquivo = "ex1";
function main() {
  let monstador = new Montador();
  monstador.inicia(arquivo);
  teste();
}

/**
 * Esse é a função teste do sistema
 * @returns
 */
function teste() {
  // cria o hardware
  // cria a memória
  let memoria = new Memoria();
  programaNaMemoria(memoria);
  // cria dispositivos de E/S (o relógio e um terminal)
  let terminal = new Terminal();
  let relogio = new Relogio();
  // cria o controlador de E/S e registra os dispositivos
  let entradaSaida = new EntradaSaida();

  entradaSaida.registraDispositivo(
    0,
    terminal,
    0,
    terminal.le,
    terminal.escreve
  );
  entradaSaida.registraDispositivo(1, relogio, 0, relogio.le, null);
  entradaSaida.registraDispositivo(2, relogio, 1, relogio.le, null);

  // cria a unidade de execução e inicializa com a memória e E/S
  let executor = new Executor(memoria, entradaSaida);

  // executa uma instrução por vez até CPU acusar erro
  let erro;
  do {
    imprimeEstado(executor);
    erro = executor.executa();
    relogio.tictac();
  } while (erro.valor === "ERR_OK");
  console.log("Fim da execução. Estado final:");
  imprimeEstado(executor);
}

// cria memória e inicializa com o conteúdo do programa
function programaNaMemoria(memoria) {
  // programa para executar na nossa CPU
  const data = fs
    .readFileSync("./bin/" + arquivo + ".maq", "utf8")
    .split("\n")
    .filter(Boolean);

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
      console.log("Erro de memória, endereco " + index);
    }
  });
}

/**
 * Imprime o estado da execução
 * @param {Executor} executor
 * @returns
 */
function imprimeEstado(executor) {
  /** @var {Estado} cpuEstado */
  let cpuEstado = executor.cpuEstado;
  // exec_copia_estado(exec, estado);
  console.log(
    `PC=${cpuEstado.pegaPC()} A=${cpuEstado.pegaA()} X=${cpuEstado.pegaX()} E=${
      cpuEstado.pegaErro().valor
    }`
  );
}
main();
