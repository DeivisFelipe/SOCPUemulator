import Erro from "./Erro.js";
import Memoria from "./Memoria.js";
import Executor from "./Executor.js";
import { EntradaSaida } from "./EntradaSaida.js";

// Dispositivos
import Terminal from "./../resource/Terminal.js";
import Relogio from "./../resource/Relogio.js";

/**
 * Controlador
 * Controla o hardware simulado
 * em especial, contém o laço de execução de instruções e verificação de
 * interrupções, com chamada ao SO para tratá-las
 * concentra os dispositivos de hardware
 */
class Controlador {
  /**
   * Contrustutor
   */
  constructor(tamanho) {
    /**
     * Tamanho da memoria
     * @var {Number} tamanho
     */
    this.tamanho = tamanho;

    /**
     * Instruções
     * O número representa a quantidade de parametros que a instrução tem
     * VALOR  - inicaliza a próxima posição de memória com o valor do argumento
     * ESPACO - reserva tantas palavras de espaço nas próximas posições da
     * memória (corresponde a tantos "VALOR 0")
     * DEFINE - define um valor para um símbolo (obrigatoriamente tem que ter
     * um label, que é definido com o valor do argumento e não com a
     * posição atual da memória) -- ainda não implementado
     * @var {Object} instrucoes
     */
    this.instrucoes = [
      { nome: "NOP", numeroArgumentos: 0, opcode: 0 },
      { nome: "PARA", numeroArgumentos: 0, opcode: 1 },
      { nome: "CARGI", numeroArgumentos: 1, opcode: 2 },
      { nome: "CARGM", numeroArgumentos: 1, opcode: 3 },
      { nome: "CARGX", numeroArgumentos: 1, opcode: 4 },
      { nome: "ARMM", numeroArgumentos: 1, opcode: 5 },
      { nome: "ARMX", numeroArgumentos: 1, opcode: 6 },
      { nome: "MVAX", numeroArgumentos: 0, opcode: 7 },
      { nome: "MVXA", numeroArgumentos: 0, opcode: 8 },
      { nome: "INCX", numeroArgumentos: 0, opcode: 9 },
      { nome: "SOMA", numeroArgumentos: 1, opcode: 10 },
      { nome: "SUB", numeroArgumentos: 1, opcode: 11 },
      { nome: "MULT", numeroArgumentos: 1, opcode: 12 },
      { nome: "DIV", numeroArgumentos: 1, opcode: 13 },
      { nome: "RESTO", numeroArgumentos: 1, opcode: 14 },
      { nome: "NEG", numeroArgumentos: 0, opcode: 15 },
      { nome: "DESV", numeroArgumentos: 1, opcode: 16 },
      { nome: "DESVZ", numeroArgumentos: 1, opcode: 17 },
      { nome: "DESVNZ", numeroArgumentos: 1, opcode: 18 },
      { nome: "DESVN", numeroArgumentos: 1, opcode: 19 },
      { nome: "DESVP", numeroArgumentos: 1, opcode: 20 },
      { nome: "CHAMA", numeroArgumentos: 1, opcode: 21 },
      { nome: "RET", numeroArgumentos: 1, opcode: 22 },
      { nome: "LE", numeroArgumentos: 1, opcode: 23 },
      { nome: "ESCR", numeroArgumentos: 1, opcode: 24 },
      // pseudo-instrucoes
      { nome: "VALOR", numeroArgumentos: 1, opcode: 25 },
      { nome: "ESPACO", numeroArgumentos: 1, opcode: 26 },
      { nome: "DEFINE", numeroArgumentos: 1, opcode: 27 },
    ];

    /**
     * Array com o conteudo da memoria
     * Tipo {Number}
     */
    this.conteudo = [];

    // cria a memória
    this.memoria = new Memoria();
    // cria dispositivos de E/S (o relógio e um terminal)
    this.terminal = new Terminal();
    this.relogio = new Relogio();
    //t_inicio();
    // cria o controlador de E/S e registra os dispositivos
    this.entradaSaida = new EntradaSaida();
    this.entradaSaida.registraDispositivo(
      0,
      this.terminal,
      0,
      this.terminal.le,
      this.terminal.escreve,
      this.terminal.pronto
    );
    this.entradaSaida.registraDispositivo(
      1,
      this.terminal,
      1,
      this.terminal.le,
      this.terminal.escreve,
      this.terminal.pronto
    );
    this.entradaSaida.registraDispositivo(
      2,
      this.relogio,
      0,
      this.relogio.le,
      null,
      null
    );
    this.entradaSaida.registraDispositivo(
      3,
      this.relogio,
      1,
      this.relogio.le,
      null,
      null
    );
    // cria a unidade de execução e inicializa com a memória e E/S
    this.executor = new Executor(this.memoria, this.entradaSaida);
    this.so = null;
  }

  /**
   * Informa ao controlador quem é o SO
   * @param {SO} so
   */
  informaSo(so) {
    this.so = so;
  }

  /**
   * O laço principal da simulação
   */
  laco() {
    // executa uma instrução por vez até CPU acusar erro
    let erro = new Erro();
    do {
      erro = this.executor.executa();
      this.relogio.tictac();
      this.stringEstado();
      //t_atualiza();
    } while (erro.valor === "ERR_OK");

    //t_printf("Fim da execução.");
    //t_printf("relógio: %d\n", rel_agora(self->rel));
  }

  /**
   *  @returns {String}
   */
  stringEstado() {
    // pega o estado da CPU, imprime registradores, opcode, instrução
    /** @var {Estado} cpuEstado */
    let cpuEstado = this.executor.cpuEstado;
    let pc = cpuEstado.PC;
    let opcode = {
      valor: -1,
    };
    let texto = "";
    this.memoria.le(pc, opcode);

    let comando = this.instrucoes.find((item) => {
      return item.opcode === opcode;
    });

    console.log(this.memoria);

    texto += `PC=${cpuEstado.pegaPC().toString().padStart(4, "0")} A=${cpuEstado
      .pegaA()
      .toString()
      .padStart(6, "0")} 
      X=${cpuEstado.pegaX().toString().padStart(6, "0")} ${opcode.valor} ${
      comando.nome
    }`;

    // imprime argumento da instrução, se houver
    if (comando.numeroArgumentos > 0) {
      let A1 = {
        valor: null,
      };
      this.memoria.le(pc + 1, A1);

      texto += " Argumento=" + A1.valor;
    }
    // imprime estado de erro da CPU, se for o caso
    let erro = cpuEstado;
    if (erro.valor != "ERR_OK") {
      texto +=
        " E=" + erro.valor + " complemento=" + cpuEstado.pegaComplemento();
    }
    return texto;
  }

  /**
   * Funções de acesso aos componentes do hardware
   */
  estatosEstado() {
    let s = "";
    s = stringEstado();
    //t_status(s);
  }
}

export default Controlador;
