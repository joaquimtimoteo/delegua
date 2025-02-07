import { AvaliadorSintaticoBirl } from '../../fontes/avaliador-sintatico/dialetos';
import { InterpretadorBirl } from '../../fontes/interpretador/dialetos';
import { LexadorBirl } from '../../fontes/lexador/dialetos';

describe('Interpretador', () => {
    describe('interpretar()', () => {
        let lexador: LexadorBirl;
        let avaliadorSintatico: AvaliadorSintaticoBirl;
        let interpretador: InterpretadorBirl;

        describe('Cenário de sucesso', () => {
            beforeEach(() => {
                lexador = new LexadorBirl();
                avaliadorSintatico = new AvaliadorSintaticoBirl();
                interpretador = new InterpretadorBirl(process.cwd());
            });

            it.skip('Validando string no escreva', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW',
                    '   CE QUER VER ESSA PORRA? (1);',
                    'BIRL'
                ], -1)

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(async () => await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes)).toThrow(Error);
            })

            it('Sucesso - varias argumentos no escreva', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW',
                    '   MONSTRO X = 10;',
                    '   FRANGO FR = "teste";',
                    '   CE QUER VER ESSA PORRA? ("teste %d %s\n", &X, &FR);',
                    '   BORA CUMPADE 0;',
                    'BIRL',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador).toBeTruthy();
                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Fibonacci', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW',
                    '   OH O HOME AI PO(MONSTRO fibonacci(MONSTRO numero))',
                    '       ELE QUE A GENTE QUER?(numero == 0 || numero == 1)',
                    '           BORA CUMPADE 1;',
                    '       BIRL',
                    '       BORA CUMPADE fibonacci(numero - 1) + fibonacci(numero - 2);',
                    '   BIRL',
                    '   MONSTRO numero = 2;',
                    '   MONSTRO fiboResultado = AJUDA O MALUCO TA DOENTE fibonacci(numero);',
                    '   CE QUER VER ESSA PORRA?("fibo: %d", &fiboResultado)',
                    'BIRL',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador).toBeTruthy();
                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - fizzbuzz', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW\n',
                    '    MONSTRO M;\n',
                    '    MAIS QUERO MAIS (M = 1; M <= 100; M++)\n',
                    '        ELE QUE A GENTE QUER? (M % 5 == 0 && M % 3 == 0)\n',
                    '            CE QUER VER ESSA PORRA?("FizzBuzz\n");\n',
                    '        QUE NAO VAI DAR O QUE? (M % 3 == 0)\n',
                    '            CE QUER VER ESSA PORRA?("Fizz\n");\n',
                    '        QUE NAO VAI DAR O QUE? (M % 5 == 0)\n',
                    '            CE QUER VER ESSA PORRA?("Buzz\n");\n',
                    '        NAO VAI DAR NAO\n',
                    '            CE QUER VER ESSA PORRA?("%d\n", &M);\n',
                    '        BIRL\n',
                    '    BIRL\n',
                    '    BORA CUMPADE 0;\n',
                    'BIRL\n',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador).toBeTruthy();
                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - declaração - chamarFuncao', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   OH O HOME AI PO (MONSTRO SOMAR(MONSTRO primeiroParametro, MONSTRO segundoParametro))\n',
                    '       MONSTRO resultado = primeiroParametro + segundoParametro;\n',
                    '       BORA CUMPADE resultado;',
                    '   BIRL',
                    '   MONSTRO primeiro = 5;\n',
                    '   MONSTRO segundo = 10;\n',
                    '   MONSTRO resultado = AJUDA O MALUCO TA DOENTE SOMAR(primeiro, segundo);\n',
                    'BIRL\n',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Verifica tipo LEIA', async () => {
                const respostas = ['5'];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    },
                };
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW',
                    '   MONSTRO X;',
                    '   QUE QUE CE QUER MONSTRAO? ("%d", &X);',
                    '   BORA CUMPADE 0;',
                    'BIRL',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador).toBeTruthy();
                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - declaração - declaracaoFuncao', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   OH O HOME AI PO(MONSTRO NOMEFUNCAO(MONSTRO primeiro, MONSTRO segundo))\n',
                    '       MONSTRO C = primeiro + segundo;\n',
                    '       BORA CUMPADE C;\n',
                    '   BIRL\n',
                    'BIRL\n',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - declaração - continue', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MONSTRO M;\n',
                    '   MAIS QUERO MAIS (M = 0; M < 5; M++)\n',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '       ELE QUE A GENTE QUER? (M > 2)\n',
                    '           SAI FILHO DA PUTA;\n',
                    '       NAO VAI DAR NAO\n',
                    '           VAMO MONSTRO;\n',
                    '       BIRL\n',
                    '   BIRL\n',
                    'BIRL\n',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - declaração - break', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MONSTRO M;\n',
                    '   MAIS QUERO MAIS (M = 0; M < 5; M++)\n',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '       SAI FILHO DA PUTA;\n',
                    '   BIRL\n',
                    'BIRL\n',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - declaração - while', async () => {
                const RetornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MONSTRO X = 5;\n',
                    '   NEGATIVA BAMBAM (X > 2)',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '       X--;\n',
                    '   BIRL\n',
                    'BIRL\n',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(RetornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - maior igual - 1 <= 2', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   ELE QUE A GENTE QUER? (1 <= 2)\n',
                    '     CE QUER VER ESSA PORRA? ("ativo");\n',
                    '   NAO VAI DAR NAO\n',
                    '     CE QUER VER ESSA PORRA? ("desativo");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - maior igual - 1 >= 2', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   ELE QUE A GENTE QUER? (1 >= 2)\n',
                    '     CE QUER VER ESSA PORRA? ("desativo");\n',
                    '   NAO VAI DAR NAO\n',
                    '     CE QUER VER ESSA PORRA? ("ativo");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - maior igual - 1 == 2', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   ELE QUE A GENTE QUER? (1 == 2)\n',
                    '     CE QUER VER ESSA PORRA? ("desativo");\n',
                    '   NAO VAI DAR NAO\n',
                    '     CE QUER VER ESSA PORRA? ("ativo");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Teste - Hello World', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW\n',
                    '   CE QUER VER ESSA PORRA? ("Hello, World! Porra!\n");\n',
                    '   BORA CUMPADE? 0;\n',
                    'BIRL',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - declaração - for - decremento - depois', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MAIS QUERO MAIS (MONSTRO M = 6; M > 5; M--)',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - declaração - for - decremento - antes', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MAIS QUERO MAIS (MONSTRO M = 10; M > 5; --M)',
                    '       CE QUER VER ESSA PORRA? ("%d\n", &M);\n',
                    '   BIRL\n',
                    'BIRL\n',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - declaração - for - incremento - depois', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MAIS QUERO MAIS (MONSTRO M = 0; M < 5; M++)',
                    '       CE QUER VER ESSA PORRA? ("%d\n", &M);\n',
                    '   BIRL\n',
                    'BIRL\n',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - declaração - for - incremento - antes', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MAIS QUERO MAIS (MONSTRO M = 0; M < 5; ++M)',
                    '       CE QUER VER ESSA PORRA? ("%d\n", &M);\n',
                    '   BIRL\n',
                    'BIRL\n',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - declaração - if else', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   ELE QUE A GENTE QUER? (1 > 2)\n',
                    '     CE QUER VER ESSA PORRA? ("teste1");\n',
                    '   NAO VAI DAR NAO\n',
                    '     CE QUER VER ESSA PORRA? ("teste");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - declaração - if', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   ELE QUE A GENTE QUER? (3 > 2)\n',
                    '     CE QUER VER ESSA PORRA? ("teste");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Hello, World! Porra!', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'HORA DO SHOW',
                        '  CE QUER VER ESSA PORRA? ("Hello, World! Porra!\n");',
                        '  BORA CUMPADE 0;',
                        'BIRL',
                    ],
                    -1
                );

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Variavel - Numero', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'HORA DO SHOW \n',
                        '  MONSTRO M1 = 1; \n',
                        '  CE QUER VER ESSA PORRA? ("%d\n", &M1); \n',
                        '  BORA CUMPADE 0; \n',
                        'BIRL \n',
                    ],
                    -1
                );

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Variavel - String', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   FRANGO FR = "testes";\n',
                    '   CE QUER VER ESSA PORRA? ("%s\n", &FR); \n',
                    '   BORA CUMPADE 0; \n',
                    'BIRL \n',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Variavel - Float', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'HORA DO SHOW \n',
                        '  TRAPEZIO M1 = 1.03; \n',
                        '  CE QUER VER ESSA PORRA? ("%d\n", &M1); \n',
                        '  BORA CUMPADE 0; \n',
                        'BIRL \n',
                    ],
                    -1
                );

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Variavel - short int', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '  MONSTRINHO M1 = 1.03; \n',
                    '  CE QUER VER ESSA PORRA? ("%d\n", &M1); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Variavel - long int', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '  MONSTRAO M1 = 16666666; \n',
                    '  CE QUER VER ESSA PORRA? ("%d\n", &M1); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Variavel - double', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '  TRAPEZIO DESCENDENTE TD = 0.37; \n',
                    '  CE QUER VER ESSA PORRA? ("%d\n", &TD); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });
        });
    });
});
