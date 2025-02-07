import { Variavel } from '../../../construtos';
import { Expressao, Leia } from '../../../declaracoes';
import { PilhaEscoposExecucaoInterface } from '../../../interfaces/pilha-escopos-execucao-interface';

/**
 * Execução da leitura de valores da entrada configurada no
 * início da aplicação.
 * @param expressao Expressão do tipo Leia
 * @returns Promise com o resultado da leitura.
 */
export async function visitarExpressaoLeiaComum(
    interfaceEntradaSaida: any,
    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface,
    expressao: Leia
): Promise<any> {
    const mensagem = '> ';
    for (let argumento of expressao.argumentos) {
        const promessaLeitura: Function = () =>
            new Promise((resolucao) =>
                interfaceEntradaSaida.question(mensagem, (resposta: any) => {
                    resolucao(resposta);
                })
            );

        const valorLido = await promessaLeitura();
        const simbolo =
            argumento instanceof Expressao
                ? (<Variavel>(<Expressao>argumento).expressao).simbolo
                : (<Variavel>argumento).simbolo;
        pilhaEscoposExecucao.definirVariavel(simbolo.lexema, valorLido);
    }
}
