// Core
import Montador from "./Montador.js";
import Controlador from "./core/Controlador.js";

// System
import So from "./system/So.js";

const arquivo = "ex2";
function main() {
  let monstador = new Montador();
  monstador.inicia(arquivo);
  inicia();
}

/**
 * Esse é a função teste do sistema
 * @returns
 */
function inicia() {
  let controlador = new Controlador(150);
  let so = new So(controlador, arquivo);
  controlador.informaSo(so);
  controlador.laco();
  return 0;
}

main();
