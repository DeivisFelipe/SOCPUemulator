import fs from "fs";

/**
 * Esse arquivo é do montador o objetivo dele é converter um código asm para condigo de maquina,
 * para fazer funcionar tem que chamar a função 'inicia(nomeDoArquivo)'
 */

class Montador {
  /**
   * contrustutor
   */
  constructor() {
    /**
     * Memoria
     * Representa a memória do programa -- a saída do montador é colocada aqui
     * Array de números inteiros
     * @var {array} memoria
     */
    this.memoria = [];

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
     * Tabela com os símbolos (labels) já definidos pelo programa, e o valor (endereço) deles
     * Ou contem o endereço de uma label
     * Ou contem o valor de um define
     * Objeto:
     * {
     *  nome: nome,
     *  endereco: endereco,
     * }
     * @var {array} simbolos
     */
    this.simbolos = [];

    /**
     * Tabela com referências a símbolos
     * Contém a linha e o endereço correspondente onde o símbolo foi referenciado
     * Objeto:
     * {
     *    nome: nome,
     *    linha: index,
     *    valor: valor,
     * }
     * @var {array} referencias
     */
    this.referencias = [];
  }

  /**
   * Essa é a primeira função que deve ser chamada ao instanciar o motador
   * Ela recebe o caminho do arquivo com entrada
   * @param {string} arquivo
   */
  inicia(arquivo) {
    this.montaArquivo(arquivo);
    this.memoriaImprime(arquivo);
  }

  /**
   *
   * @param {string} arquivo nome do arquivo que seja compilado
   */
  montaArquivo(arquivo) {
    try {
      const data = fs
        .readFileSync("./src/" + arquivo + ".asm", "utf8")
        .split("\n")
        .filter(Boolean);
      // Percorre todas as linhas do arquivo asm
      data.forEach((linha, index) => {
        let indexReal = index + 1; // É adicionado 1 pois a linha não começa em 0 e sim em 1
        this.montaString(indexReal, linha); // Arruma a linha
      });
      this.referenciaResolve();
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Uma linha montável é formada por [label] instrucao [argumento]
   * O que está entre [] é opcional
   * As partes são separadas por espaço(s)
   * De ';' em diante, ignora-se (comentário)
   * @param {Number} index
   * @param {String} linha
   */
  montaString(index, linha) {
    let label = null;
    let instrucao = null;
    let argumento = null;

    // Primeiro elimina todos o comentario da linha
    linha = this.tiraComentario(linha);
    /**
     * O trim tira os espaços inicias da string e verifica se a string tem algum texto, se não tiver
     * retorna e vai para proxima linha
     */
    if (linha.trim().length == 0) return;

    /**
     * Verifica se a primeira letra da linha é um espaço
     * se não for um espaço quer dizer que é uma label
     * Salva o valor na label
     */
    if (linha[0] != " ") {
      label = linha;
    }

    // Substitui todas os espaço em sequencias por apenas um espaço
    linha = linha.replace(/\s+/g, " ");

    // Divide o texto da linha em um array separado pelos espaços
    linha = linha.trim().split(" ");
    // Verifica se tem 3 textos no array
    if (linha.length === 3) {
      // Bota a label
      label = linha[0];
      // Bota a instrução
      instrucao = linha[1];
      // Bota o argumento
      argumento = linha[2];
    } else if (linha.length === 2) {
      // Verifica se tem dois textos na linha
      // Verifica se é uma label ou só um instrução com parametro
      if (label) {
        // Bota a label
        label = linha[0];
        // Bota a instrução
        instrucao = linha[1];
      } else {
        // É uma instrução com um parametro
        // Bota a instrução
        instrucao = linha[0];
        // Bota o argumento
        argumento = linha[1];
      }
    } else if (linha.length === 1) {
      // Verifica se tem um texto na linha
      // Bota a instrução
      instrucao = linha[0];
    } else {
      // Erro o código não tem mais textos que o esperado
      console.error("linha " + index + " ignorando " + linha.join(" "));
    }

    /**
     * Se for uma label ou uma instrução monta a linha
     */
    if (label != null || instrucao != null) {
      // Chama o montador de linha
      this.montaLinha(index, label, instrucao, argumento);
    }

    return;
  }

  /**
   * Faz a string terminar no início de um comentário
   * @param {string} linha
   */
  tiraComentario(linha) {
    const valor = linha.split(";");
    return valor[0];
  }

  /**
   * Verifica se esta tudo certo e decide o que vai ser feito com a linha
   * Se for DEFINE cria o simbolo e vai para proxima linha
   * Se não for DEFINE, faz os testes para ver se esta tudo correto
   * e cria o simbolo se necessario
   * e cria a instrução
   * @param {number} linha
   * @param {string} label
   * @param {string} instrucao
   * @param {string} argumento
   * @returns
   */
  montaLinha(index, label, instrucao, argumento) {
    /**
     * Recebe o numero da instrução pelo nome da instrução
     * @var number numeroDaInstrucao
     */
    let numeroDaInstrucao = this.instrucaoOpcode(instrucao);

    // Verifica se foi defino argumento, mas a instrução não precisa
    let comando = this.instrucoes.find((item) => {
      return item.nome === "DEFINE";
    });

    console.log(index, label, instrucao, argumento, numeroDaInstrucao);

    /**
     * pseudo-instrução DEFINE tem que ser tratada antes, porque não pode
     * definir o label de forma normal
     */
    // Pega os nomes das instruçõe
    if (numeroDaInstrucao === comando.opcode) {
      /**
       * Para conter o valor numérico do argumento
       * @var {Number} argumentoNumero
       */
      let argumentoNumero = this.temNumero(argumento);
      if (label == null) {
        console.error("ERRO: linha " + index + ": 'DEFINE' exige um label");
      } else if (argumentoNumero === false) {
        console.error(
          "ERRO: linha " + index + ": 'DEFINE' exige valor numérico"
        );
      } else {
        /**
         * Tudo OK, define o símbolo
         * Bota no lugar do endereço o valor do define
         */
        this.simboloNovo(label, argumentoNumero);
      }
      return;
    }

    /**
     * Cria símbolo correspondente ao label, se for o caso
     */
    if (label != null) {
      this.simboloNovo(label, this.memoria.length);
    }

    /**
     * Verifica a existência de instrução e número coreto de argumentos
     */
    if (instrucao == null) return;
    if (numeroDaInstrucao == -1) {
      console.error(
        "ERRO: linha " + index + ": instrucao '" + instrucao + "' desconhecida"
      );
      return;
    }

    // Verifica se foi defino argumento, mas a instrução não precisa
    comando = this.instrucoes.find((item) => {
      return item.nome === instrucao;
    });
    if (comando.numeroArgumentos === 0 && argumento != null) {
      console.error(
        "ERRO: linha " +
          index +
          ": instrucao '" +
          instrucao +
          "' não tem argumento\n"
      );
      return;
    }

    // Verifica se a intruçao precisa de argumento, mas não foi definido
    if (comando.numeroArgumentos === 1 && argumento == null) {
      console.error(
        "ERRO: linha " +
          index +
          ": instrucao '" +
          instrucao +
          "' necessita argumento\n"
      );
      return;
    }

    // Monta a instrução
    this.montaInstrucao(index, numeroDaInstrucao, argumento);
  }

  // INSTRUÇÂO

  /**
   * Realiza a montagem de uma instrução (gera o código para ela na memória),
   * Tendo opcode da instrução e o argumento
   * @param {Number} index
   * @param {Number} opcode
   * @param {string} arg
   */
  montaInstrucao(index, opcode, argumento) {
    /**
     * Para conter o valor numérico do argumento
     * @var {Number} argumentoNumero
     */
    let argumentoNumero = this.temNumero(argumento);

    /**
     * Trata pseudo-opcodes antes
     */
    const commands = this.instrucoes.map((item) => {
      return item.nome;
    });

    if (opcode === commands.indexOf("ESPACO")) {
      // Verifica se o argumento é maior que 0
      if (argumentoNumero === false) {
        argumentoNumero = this.simboloValor(argumento);
      }
      if (argumentoNumero < 1) {
        console.error(
          "ERRO: linha " + index + " 'ESPACO' deve ter valor positivo"
        );
        return;
      }
      // Cria espaços em 0 na memoria
      for (let i = 0; i < argumentoNumero; i++) {
        this.memoriaInsere(0);
      }
      return;
    } else if (opcode === commands.indexOf("VALOR")) {
      // Não faz nada, vai inserir o valor definido em arg
    } else {
      // Instrução real, coloca o opcode da instrução na memória
      this.memoriaInsere(opcode);
    }

    // Verifica se tem argumento, se não tiver vai para a proxima linha
    let comando = this.instrucoes.find((item) => {
      return item.opcode === opcode;
    });
    if (comando.numeroArgumentos == 0) {
      return;
    }
    argumentoNumero = this.temNumero(argumento);
    if (argumentoNumero !== false) {
      // Insere o valor do argumento
      this.memoriaInsere(argumentoNumero);
    } else {
      // Não é número, põe um 0 e insere uma referência para alterar depois
      this.referenciaNova(argumento, index, this.memoria.length);
      this.memoriaInsere(0);
    }
  }

  /**
   * Retorna o opcode da instrução atravez do nome dela
   * @param {string} nome
   * @returns {number}
   */
  instrucaoOpcode(nome) {
    if (nome == null) return -1;
    // Pega todos os nomes de instruções
    const commands = this.instrucoes.map((item) => {
      return item.nome;
    });
    if (commands.includes(nome)) {
      // Retorna o opcode da instrução ( index dentro do array )
      return commands.indexOf(nome);
    }
    return -1;
  }

  /**
   * Retorna true se tem um número na string 'string' (e retorna o número também)
   * Senão retorna false
   * @param {string} string
   * @returns {Number/Boolean}
   */
  temNumero(string) {
    if (this.isNumber(string)) {
      return parseFloat(string);
    }
    return false;
  }

  /**
   * Retorna true se for um numero ou false se não for
   * @param {Number} string
   * @returns {Boolean}
   */
  isNumber(string) {
    return !isNaN(parseFloat(string)) && isFinite(string);
  }

  // FIM INSTRUÇÂO
  // SIMBOLOS

  /**
   * Insere um novo símbolo na tabela
   * @param {string} nome
   * @param {Number} valor
   * @returns
   */
  simboloNovo(nome, valor) {
    if (nome == null) return;
    // Verifica se o simbolo já foi definido
    if (this.simboloValor(nome) != -1) {
      console.error("ERRO: redefinição do simbolo " + nome);
      return;
    }
    let simbolo = {
      nome: nome,
      valor: valor,
    };
    this.simbolos.push(simbolo);
  }

  /**
   * Retorna o valor de um símbolo, ou -1 se não existir na tabela
   * @param {string} *nome
   * @return {Number}
   */
  simboloValor(nome) {
    const simbolo = this.simbolos.find((simb) => simb.nome === nome);
    if (simbolo) {
      return simbolo.valor;
    }
    return -1;
  }

  // FIM SIMBOLOS
  // MEMORIA DE SAIDA

  /**
   * Coloca um valor no final da memória
   * @param {Number} valor
   * @returns
   */
  memoriaInsere(valor) {
    if (valor === null) return;
    this.memoria.push(valor);
  }

  /**
   * Altera o valor em uma posição já ocupada da memória
   * É usado em referências, seja em endereços da label ou valor do define
   * @param {Number} posicao
   * @param {Number} valor
   * @returns
   */
  memoriaAltera(posicao, valor) {
    this.memoria[posicao] = valor;
  }

  /**
   * Imprime o conteúdo da memória no arquivo
   * @param {string} arquivo
   * @returns
   */
  memoriaImprime(arquivo) {
    // Texto que vai ser salvo no arquivo
    let texto = "";
    // Cada linha do arquivo de saida tem apenas 10 números no máximo
    for (let i = 0; i < this.memoria.length; i += 10) {
      let string = "    /* " + i + " */";
      for (let j = i; j < i + 10 && j < this.memoria.length; j++) {
        string += " " + this.memoria[j] + ",";
      }
      texto += string + "\n";
    }
    fs.writeFileSync("./bin/" + arquivo + ".maq", texto);
    console.log("Compilado!");
  }

  // FIM MEMORIA DE SAIDA
  // REFERÊNCIAS

  /**
   * Insere uma nova referência na tabela
   * @param {string} nome
   * @param {Number} index
   * @param {Number} valor
   * @returns
   */
  referenciaNova(nome, index, valor) {
    if (nome == null) return;
    let referencia = {
      nome: nome,
      linha: index,
      valor: valor,
    };
    this.referencias.push(referencia);
  }

  /**
   * Resolve as referências -- para cada referência, coloca o valor do símbolo
   * no endereço onde ele é referenciado
   * @returns
   */
  referenciaResolve() {
    //console.log(this.referencias);
    for (let i = 0; i < this.referencias.length; i++) {
      const valor = this.simboloValor(this.referencias[i].nome);
      //console.log(valor);
      if (valor == -1) {
        console.error(
          "ERRO: simbolo '" +
            this.referencias[i].nome +
            "' referenciado na linha " +
            this.referencias[i].linha +
            " não foi definido"
        );
      }
      this.memoriaAltera(this.referencias[i].valor, valor);
    }
  }

  // FIM REFERÊNCIAS
}

export default Montador;
