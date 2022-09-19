import fs from "fs";

class Montador {
  /**
   * contrustutor
   */
  constructor() {
    /**
     * Memoria
     */
    this.memoria = [];

    /**
     * Instruções
     */
    this.instrucoes = {
      NOP: 0,
      PARA: 0,
      CARGI: 1,
      CARGM: 1,
      CARGX: 1,
      ARMM: 1,
      ARMX: 1,
      MVAX: 0,
      MVXA: 0,
      INCX: 0,
      SOMA: 1,
      SUB: 1,
      MULT: 1,
      DIV: 1,
      RESTO: 1,
      NEG: 0,
      DESV: 1,
      DESVZ: 1,
      DESVNZ: 1,
      LE: 1,
      ESCR: 1,
      // pseudo-instrucoes
      VALOR: 1,
      ESPACO: 1,
      DEFINE: 1,
    };

    /**
     * tabela com os símbolos (labels) já definidos pelo programa, e o valor (endereço) deles
     */
    this.simbolos = [];
  }

  /**
   *
   * @param {string} arquivo
   */
  inicia(arquivo) {
    this.montaArquivo(arquivo);
    this.memImprime();
  }

  /**
   *
   * @param {string} arquivo nome do arquivo que seja compilado
   */
  montaArquivo(arquivo) {
    try {
      const data = fs.readFileSync(arquivo, "utf8").split("\n").filter(Boolean);
      data.forEach((linha, index) => {
        this.montaString(index, linha);
      });
      //this.ref_resolve();
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * uma linha montável é formada por [label][ instrucao[ argumento]]
   * o que está entre [] é opcional
   * as partes são separadas por espaço(s)
   * de ';' em diante, ignora-se (comentário)
   * a string é alterada, colocando-se NULs no lugar dos espaços, para separá-la em substrings
   * quem precisar guardar essas substrings, deve copiá-las.
   * @param {Number} index
   * @param {String} linha
   */
  montaString(index, linha) {
    let label = null;
    let instrucao = null;
    let arg = null;
    linha = this.tiraComentario(linha);
    if (linha.trim().length == 0) return;
    if (linha[0] != " ") {
      label = linha;
    }
    linha = linha.replace(/\s+/g, " ");
    linha = linha.trim().split(" ");
    if (linha.length === 3) {
      label = linha[0];
      instrucao = linha[1];
      arg = linha[2];
    } else if (linha.length === 2) {
      if (label) {
        label = linha[0];
        instrucao = linha[1];
      } else {
        instrucao = linha[0];
        arg = linha[1];
      }
    } else if (linha.length === 1) {
      instrucao = linha[0];
    } else {
      console.error("linha " + index + " ignorando " + linha.join(" "));
    }

    if (label != null || instrucao != null) {
      this.montaLinha(index, label, instrucao, arg);
    }

    return;
  }

  // faz a string terminar no início de um comentário, se houver
  // aproveita e termina se chegar no fim de linha
  /**
   *
   * @param {*string} linha
   */
  tiraComentario(linha) {
    const valor = linha.split(";");
    return valor[0];
  }

  /**
   *
   * @param {number} linha
   * @param {string} label
   * @param {string} instrucao
   * @param {string} arg
   * @returns
   */
  montaLinha(index, label, instrucao, arg) {
    /**
     * @var number num_instr
     */
    let numInstr = this.instrOpcode(instrucao);

    /**
     * pseudo-instrução DEFINE tem que ser tratada antes, porque não pode
     * definir o label de forma normal
     */
    const commands = Object.keys(this.instrucoes);
    if (numInstr === commands.indexOf("DEFINE")) {
      /**
       * para conter o valor numérico do argumento
       * @var {Number} argn
       */
      let argn;
      if (label == null) {
        console.error("ERRO: linha " + index + ": 'DEFINE' exige um label");
      } else if ((argn = this.temNumero(arg, argn) === false)) {
        console.error(
          "ERRO: linha " + index + ": 'DEFINE' exige valor numérico"
        );
      } else {
        /**
         * tudo OK, define o símbolo
         */
        this.simbNovo(label, argn);
      }
      return;
    }

    /**
     * cria símbolo correspondente ao label, se for o caso
     */
    if (label != null) {
      this.simbNovo(label, this.memoria.length);
    }

    /**
     * verifica a existência de instrução e número coreto de argumentos
     */
    if (instrucao == null) return;
    if (numInstr == -1) {
      console.log(
        "ERRO: linha " + index + ": instrucao '" + instrucao + "' desconhecida"
      );
      return;
    }

    if (this.instrucoes[instrucao] === 0 && arg != null) {
      console.error(
        "ERRO: linha " +
          index +
          ": instrucao '" +
          instrucao +
          "' não tem argumento\n"
      );
      return;
    }

    if (this.instrucoes[instrucao] === 1 && arg == null) {
      console.error(
        "ERRO: linha " +
          index +
          ": instrucao '" +
          instrucao +
          "' necessita argumento\n"
      );
      return;
    }

    if (arg !== null) console.log(this.simbolos);
    this.montaInstrucao(index, numInstr, arg);
  }

  /**
   * realiza a montagem de uma instrução (gera o código para ela na memória),
   * tendo opcode e argumento
   * @param {Number} index
   * @param {Number} opcode
   * @param {string} arg
   */
  montaInstrucao(linha, opcode, arg) {
    /**
     * para conter o valor numérico do argumento
     * @var {Number} argn
     */
    let argn;

    /**
     * trata pseudo-opcodes antes
     */
    const commands = Object.keys(this.instrucoes);
    if (opcode === commands.indexOf("ESPACO")) {
      if (argn = temNumero(arg, &argn) !== false || argn < 1) {
        console.error(stderr, "ERRO: linha %d 'ESPACO' deve ter valor positivo\n",
                linha);
        return;
      }
      for (int i = 0; i < argn; i++) {
        mem_insere(0);
      }
      return;
    }

    /*// trata pseudo-opcodes antes
  if (opcode == ESPACO) {
    if (!tem_numero(arg, &argn) || argn < 1) {
      fprintf(stderr, "ERRO: linha %d 'ESPACO' deve ter valor positivo\n",
              linha);
      return;
    }
    for (int i = 0; i < argn; i++) {
      mem_insere(0);
    }
    return;
  } else if (opcode == VALOR) {
    // nao faz nada, vai inserir o valor definido em arg
  } else {
    // instrução real, coloca o opcode da instrução na memória
    mem_insere(opcode);
  }
  if (instrucoes[opcode].num_args == 0) {
    return;
  }
  if (tem_numero(arg, &argn)) {
    mem_insere(argn);
  } else {
    // não é número, põe um 0 e insere uma referência para alterar depois
    ref_nova(arg, linha, mem_pos);
    mem_insere(0);
  }*/
  }

  /**
   * Retorna o opcode da instrução
   * @param {string} nome
   * @returns {number}
   */
  instrOpcode(nome) {
    if (nome == null) return -1;
    const commands = Object.keys(this.instrucoes);
    if (commands.includes(nome)) {
      return commands.indexOf(nome);
    }
    return -1;
  }

  /**
   * retorna true se tem um número na string s (e retorna o número também)
   * @param {string} s
   * @param {Number} num
   * @returns {Number/Boolean}
   */
  temNumero(s, num) {
    if (this.isNumber(num)) {
      return parseFloat(num);
    }
    return false;
  }

  /**
   * retorna true se for um numero
   * @param {Number} num
   * @returns {Boolean}
   */
  isNumber(num) {
    return !isNaN(parseFloat(num)) && isFinite(num);
  }

  // SIMBOLOS

  /**
   * insere um novo símbolo na tabela
   * @param {string} nome
   * @param {Number} endereco
   * @returns
   */
  simbNovo(nome, endereco) {
    if (nome == null) return;
    if (this.simbEndereco(nome) != -1) {
      console.log("ERRO: redefinicao do simbolo " + nome);
      return;
    }
    let simbolo = {
      nome: nome,
      endereco: endereco,
    };
    this.simbolos.push(simbolo);
  }

  /**
   * retorna o valor de um símbolo, ou -1 se não existir na tabela
   * @param {string} *nome
   * @return {Number}
   */
  simbEndereco(nome) {
    const simbolo = this.simbolos.find((simb) => simb.nome === nome);
    if (simbolo) {
      return this.simbolos[nome].endereco;
    }
    return -1;
  }

  // FIM SIMBOLOS

  /**
   * aborta o programa com uma mensagem de erro
   * @param {string} msg
   */
  erroBrabo(msg) {
    console.error("ERRO FATAL: " + msg);
  }

  memImprime() {}
}

export default Montador;
