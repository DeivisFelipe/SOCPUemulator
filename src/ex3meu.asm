     CARGI 0  ; a = 0
     MVAX     ; x = a

for  LE 3  ; a = rand()
     ESCR 0 ; print(a)

     INCX ; X++
     MVXA ; a = X
     SUB cont ; a -= cont ( a = x - cont)

     DESVNZ for ; if  a != 0 goto for
     PARA ; return 0
cont VALOR 3 ; cont = 0 