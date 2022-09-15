// controlador de dispositivos de entrada e saida

// estrutura para definir um dispositivo
class dispositivo_t {
    /** @type f_le_t */
    f_le;     // função para ler um inteiro do dispositivo
    /** @type f_escr_t */
    f_escr; // função para escrever um inteiro no dispositivo
    /** @type void */
    contr;     // descritor do dispositivo (arg das f acima)
    /** @type int */
    id;          // identificador do (sub)dispositivo (arg das f acima)
};

export const N_DISPO = 10 // número máximo de dispositivos suportados

// define a estrutura opaca
class es_t {
    /** @type dispositivo_t */
    dispositivo;
};

class es {
    /** 
     * aloca e inicializa um controlador de E/S
     * retorna NULL em caso de erro
     * @return es_t *
     * */
    static es_cria(){
        es_t *self = calloc(1, sizeof(*self)); // com calloc já zera todos os ptr
        return self;
    }

    /** 
     * libera os recursos ocupados pelo controlador
     * @param es_t *self
     * @return void
     * */
    static es_destroi(self){
        free(self);
    }

    /** 
     * registra um dispositivo, identificado com o valor 'dispositivo', e que
     * será acessado através das funções apontadas pelos ponteiros 'f_le' e
     * 'f_escr'
     * se 'f_le' ou 'f_escr' for NULL, considera-se que a operação correspondente
     * é inválida nesse dispositivo.
     * retorna false se não foi possível registrar
     * @param es_t *self
     * @param int dispositivo
     * @param void *contr
     * @param int id
     * @param f_le_t f_le
     * @param f_escr_t f_escr
     * @return bool
     * */
    static es_registra_dispositivo(self, dispositivo, contr, id, f_le, f_escr){
        if (dispositivo < 0 || dispositivo >= N_DISPO) return false;
        self.dispositivo[dispositivo].f_le = f_le;
        self.dispositivo[dispositivo].f_escr = f_escr;
        self.dispositivo[dispositivo].contr = contr;
        self.dispositivo[dispositivo].id = id;
        return true;
    }
    
    /** 
     * função auxiliar, para verificar se tal acesso a tal dispositivo é ok
     * @param es_t *self
     * @param int dispositivo
     * @param acesso_t tipo
     * @return err_t
     * */
    static verif_acesso(self, dispositivo, tipo){
        if (dispositivo < 0 || dispositivo >= N_DISPO) return ERR_END_INV;
        if (tipo == leitura && self.dispositivo[dispositivo].f_le == NULL) {
            return ERR_OP_INV;
        }
        if (tipo == escrita && self.dispositivo[dispositivo].f_escr == NULL) {
            return ERR_OP_INV;
        }
        return ERR_OK;
    }

    /** 
     * lê um inteiro de um dispositivo
     * retorna ERR_OK se bem sucedido, ou
     * ERR_END_INV se dispositivo desconhecido
     * ERR_OP_INV se operação inválida
     * @param es_t *self
     * @param int dispositivo
     * @param int *pvalor
     * @return err_t
     * */
    static es_le(self, dispositivo, pvalor)
    {
        err_t err = verif_acesso(self, dispositivo, leitura);
        if (err != ERR_OK) return err;
        void *contr = self.dispositivo[dispositivo].contr;
        int id = self.dispositivo[dispositivo].id;
        return self.dispositivo[dispositivo].f_le(contr, id, pvalor);
    }

    /** 
     * escreve um inteiro em um dispositivo
     * retorna ERR_OK se bem sucedido, ou
     * ERR_END_INV se dispositivo desconhecido
     * ERR_OP_INV se operação inválida
     * @param es_t *self
     * @param int dispositivo
     * @param int valor
     * @return err_t
     * */
    static es_escreve(self, dispositivo, valor)
    {
        err_t err = verif_acesso(self, dispositivo, escrita);
        if (err != ERR_OK) return err;
        void *contr = self.dispositivo[dispositivo].contr;
        int id = self.dispositivo[dispositivo].id;
        return self.dispositivo[dispositivo].f_escr(contr, id, valor);
    }
}