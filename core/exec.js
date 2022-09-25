// uma CPU tem estado, memoria, controlador de ES
class exec_t {
    /** @var cpu_estado_t *estado */
    estado;
    /** @var mem_t *mem */
    mem;
    /** @var es_t *es */
    es;
};

class exec {

    /** 
     * lê um inteiro de um dispositivo
     * retorna ERR_OK se bem sucedido, ou
     * ERR_END_INV se dispositivo desconhecido
     * ERR_OP_INV se operação inválida
     * @param mem_t *mem
     * @param es_t *es
     * @return exec_t
     * */
    static *exec_cria(mem, es){
        /** @var exec_t *self */
        let self;
        self = malloc(sizeof(*self));
        if (self != NULL) {
            self.estado = cpue_cria();
            self.mem = mem;
            self.es = es;
        }
        return self;
    }

    /** 
     * lê um inteiro de um dispositivo
     * @param exec_t *self
     * @return void
     * */
    static exec_destroi(self){
        // eu nao criei memoria, es; quem criou que destrua!
        cpue_destroi(self.estado);
        free(self);
    }

    /** 
     * lê um inteiro de um dispositivo
     * @param exec_t *self
     * @param cpu_estado_t *estado
     * @return void
     * */
    static exec_copia_estado(self, estado){
        cpue_copia(self.estado, estado);
    }

    /** 
     * lê um inteiro de um dispositivo
     * @param exec_t *self
     * @param cpu_estado_t *estado
     * @return void
     * */
    static exec_altera_estado(self, estado){
        cpue_copia(estado, self.estado);
    }


    // ---------------------------------------------------------------------
    // funções auxiliares para usar durante a execução das instruções
    // alteram o estado da CPU caso ocorra erro

    /** 
     * lê um valor da memória
     * @param exec_t *self
     * @param int endereco
     * @param int *pval
     * @return bool
     * */
    static pega_mem(self, endereco, pval){
        /** @var err_t *err */
        let err = mem_le(self.mem, endereco, pval);
        if (err != ERR_OK) {
            cpue_muda_erro(self.estado, err, endereco);
        }
        return err == ERR_OK;
    }

    /** 
     * lê o opcode da instrução no PC
     * @param exec_t *self
     * @param int *popc
     * @return bool
     * */
    static pega_opcode(self, popc){
        return pega_mem(self, cpue_PC(self.estado), popc);
    }

    /** 
     * lê o argumento 1 da instrução no PC
     * @param exec_t *self
     * @param int *popc
     * @return bool
     * */
    static pega_A1(self, pA1){
        return pega_mem(self, cpue_PC(self.estado) + 1, pA1);
    }

    /** 
     * lê o argumento 1 da instrução no PC
     * @param exec_t *self
     * @return void
     * */
    static incrementa_PC(self){
        cpue_muda_PC(self.estado, cpue_PC(self.estado) + 1);
    }

    /** 
     * lê o argumento 1 da instrução no PC
     * @param exec_t *self
     * @return void
     * */
    static incrementa_PC2(self){
        cpue_muda_PC(self.estado, cpue_PC(self.estado) + 2);
    }

    /** 
     * escreve um valor na memória
     * @param exec_t *self
     * @param int endereco
     * @param int val
     * @return bool
     * */
    static poe_mem(self, endereco, val){
        /** @var err_t *err */
        let err = mem_escreve(self.mem, endereco, val);
        if (err != ERR_OK) {
            cpue_muda_erro(self.estado, err, endereco);
        }
        return err == ERR_OK;
    }

    /** 
     * lê um valor da E/S
     * @param exec_t *self
     * @param int dispositivo
     * @param int *pval
     * @return bool
     * */
    static pega_es(self, dispositivo, pval){
        /** @var err_t *err */
        let err = es_le(self.es, dispositivo, pval);
        if (err != ERR_OK) {
            cpue_muda_erro(self.estado, err, dispositivo);
        }
        return err == ERR_OK;
    }

    /** 
     * escreve um valor na E/S
     * @param exec_t *self
     * @param int dispositivo
     * @param int val
     * @return bool
     * */
    static poe_es(self, dispositivo, val){
        /** @var err_t *err */
        let err = es_escreve(self.es, dispositivo, val);
        if (err != ERR_OK) {
            cpue_muda_erro(self.estado, err, dispositivo);
        }
        return err == ERR_OK;
    }

    // ---------------------------------------------------------------------
    // funções auxiliares para implementação de cada instrução

    /** 
     * escreve um valor na E/S
     * @param exec_t *self
     * @return void
     * */
    static op_NOP(self){ // não faz nada
        incrementa_PC(self);
    }

    /** 
     * para a CPU
     * @param exec_t *self
     * @return void
     * */
    static op_PARA(self){
        cpue_muda_erro(self.estado, ERR_CPU_PARADA, 0);
    }

    /** 
     * carrega imediato
     * @param exec_t *self
     * @return void
     * */
    static op_CARGI(self) {
        /** @var int A1 */
        let A1;
        if (pega_A1(self, &A1)) {
            cpue_muda_A(self.estado, A1);
            incrementa_PC2(self);
        }
    }

    /** 
     * carrega da memória
     * @param exec_t *self
     * @return void
     * */
    static op_CARGM(self){
        /** @var int A1 */
        /** @var int mA1 */
        let A1, mA1;
        if (pega_A1(self, &A1) && pega_mem(self, A1, &mA1)) {
            cpue_muda_A(self.estado, mA1);
            incrementa_PC2(self);
        }
    }

    /** 
     * carrega indexado
     * @param exec_t *self
     * @return void
     * */
    static op_CARGX(self) {
        /** @var int A1 */
        /** @var int mA1mX */
        let A1, mA1mX;
        /** @var int X */
        let X = cpue_X(self.estado);
        if (pega_A1(self, &A1) && pega_mem(self, A1+X, &mA1mX)) {
            cpue_muda_A(self.estado, mA1mX);
            incrementa_PC2(self);
        }
    }

    /** 
     * armazena na memória
     * @param exec_t *self
     * @return void
     * */
    static op_ARMM(self) {
        /** @var int A1 */
        let A1;
        if (pega_A1(self, &A1) && poe_mem(self, A1, cpue_A(self.estado))) {
            incrementa_PC2(self);
        }
    }

    /** 
     * armazena indexado
     * @param exec_t *self
     * @return void
     * */
    static op_ARMX(self) {
        /** @var int A1 */
        let A1;
        /** @var int X */
        let X = cpue_X(self.estado);
        if (pega_A1(self, &A1) && poe_mem(self, A1+X, cpue_A(self.estado))) {
            incrementa_PC2(self);
        }
    }

    /** 
     * copia A para X
     * @param exec_t *self
     * @return void
     * */
    static op_MVAX(self){
        cpue_muda_X(self.estado, cpue_A(self.estado));
        incrementa_PC(self);
    }

    /** 
     * copia X para A
     * @param exec_t *self
     * @return void
     * */
    static op_MVXA(self){
        cpue_muda_A(self.estado, cpue_X(self.estado));
        incrementa_PC(self);
    }

    /** 
     * incrementa X
     * @param exec_t *self
     * @return void
     * */
    static op_INCX(self){
        cpue_muda_X(self.estado, cpue_X(self.estado)+1);
        incrementa_PC(self);
    }

    /** 
     * soma
     * @param exec_t *self
     * @return void
     * */
    static op_SOMA(self) {
        /** @var int A1 */
        /** @var int mA1 */
        let A1, mA1;
        if (pega_A1(self, &A1) && pega_mem(self, A1, &mA1)) {
            cpue_muda_A(self.estado, cpue_A(self.estado) + mA1);
            incrementa_PC2(self);
        }
    }

    /** 
     * subtração
     * @param exec_t *self
     * @return void
     * */
    static op_SUB(self){
        /** @var int A1 */
        /** @var int mA1 */
        let A1, mA1;
        if (pega_A1(self, &A1) && pega_mem(self, A1, &mA1)) {
            cpue_muda_A(self.estado, cpue_A(self.estado) - mA1);
            incrementa_PC2(self);
        }
    }

    /** 
     * multiplicação
     * @param exec_t *self
     * @return void
     * */
    static op_MULT(self) {
        /** @var int A1 */
        /** @var int mA1 */
        let A1, mA1;
        if (pega_A1(self, &A1) && pega_mem(self, A1, &mA1)) {
            cpue_muda_A(self.estado, cpue_A(self.estado) * mA1);
            incrementa_PC2(self);
        }
    }

    /** 
     * divisão
     * @param exec_t *self
     * @return void
     * */
    static op_DIV(self) {
        /** @var int A1 */
        /** @var int mA1 */
        let A1, mA1;
        if (pega_A1(self, &A1) && pega_mem(self, A1, &mA1)) {
            cpue_muda_A(self.estado, cpue_A(self.estado) / mA1);
            incrementa_PC2(self);
        }
    }

    /** 
     * resto
     * @param exec_t *self
     * @return void
     * */
    static op_RESTO(self) {
        /** @var int A1 */
        /** @var int mA1 */
        let A1, mA1;
        if (pega_A1(self, &A1) && pega_mem(self, A1, &mA1)) {
            cpue_muda_A(self.estado, cpue_A(self.estado) % mA1);
            incrementa_PC2(self);
        }
    }

    /** 
     * inverte sinal
     * @param exec_t *self
     * @return void
     * */
    static op_NEG(self) 
    {
        cpue_muda_A(self.estado, -cpue_A(self.estado));
        incrementa_PC(self);
    }

    /** 
     * desvio incondicional
     * @param exec_t *self
     * @return void
     * */
    static op_DESV(self) {
        /** @var int A1 */
        let A1;
        if (pega_A1(self, &A1)) {
            cpue_muda_PC(self.estado, A1);
        }
    }

    /** 
     * desvio condicional
     * @param exec_t *self
     * @return void
     * */
    static op_DESVZ(self){
        if (cpue_A(self.estado) == 0) {
            op_DESV(self);
        } else {
            incrementa_PC2(self);
        }
    }

    /** 
     * desvio condicional
     * @param exec_t *self
     * @return void
     * */
    static op_DESVNZ(self){
        if (cpue_A(self.estado) != 0) {
            op_DESV(self);
        } else {
            incrementa_PC2(self);
        }
    }

    /** 
     * leitura de E/S
     * @param exec_t *self
     * @return void
     * */
    static op_LE(self) {
        /** @var int A1 */
        /** @var int dado */
        let A1, dado;
        if (pega_A1(self, &A1) && pega_es(self, A1, &dado)) {
            cpue_muda_A(self.estado, dado);
            incrementa_PC2(self);
        }
    }

    /** 
     * escrita de E/S
     * @param exec_t *self
     * @return void
     * */
    static op_ESCR(self) {
        /** @var int A1 */
        let A1;
        if (pega_A1(self, &A1) && poe_es(self, A1, cpue_A(self.estado))) {
            incrementa_PC2(self);
        }
    }

    /** 
     * escrita de E/S
     * @param exec_t *self
     * @return err_t
     * */
    static exec_executa_1(self){
        // não executa se CPU já estiver em erro
        if (cpue_erro(self.estado) != ERR_OK) {
            return cpue_erro(self.estado);
        }

        /** @var int A1 */
        let opcode;
        if (!pega_opcode(self, & opcode)) {
            return cpue_erro(self.estado);
        }

        switch (opcode) {
            case NOP:    op_NOP(self);    break;
            case PARA:   op_PARA(self);   break;
            case CARGI:  op_CARGI(self);  break;
            case CARGM:  op_CARGM(self);  break;
            case CARGX:  op_CARGX(self);  break;
            case ARMM:   op_ARMM(self);   break;
            case ARMX:   op_ARMX(self);   break;
            case MVAX:   op_MVAX(self);   break;
            case MVXA:   op_MVXA(self);   break;
            case INCX:   op_INCX(self);   break;
            case SOMA:   op_SOMA(self);   break;
            case SUB:    op_SUB(self);    break;
            case MULT:   op_MULT(self);   break;
            case DIV:    op_DIV(self);    break;
            case RESTO:  op_RESTO(self);  break;
            case NEG:    op_NEG(self);    break;
            case DESV:   op_DESV(self);   break;
            case DESVZ:  op_DESVZ(self);  break;
            case DESVNZ: op_DESVNZ(self); break;
            case LE:     op_LE(self);     break;
            case ESCR:   op_ESCR(self);   break;
            default:     cpue_muda_erro(self.estado, ERR_INSTR_INV, 0);
        }

        return cpue_erro(self.estado);
    }

}