import * as _ from 'lodash';

import {
    registrarBibliotecaNumericaVisuAlg,
    registrarBibliotecaCaracteresVisuAlg,
} from '../../../bibliotecas/dialetos/visualg';
import { Binario, Construto, FimPara, Logico } from '../../../construtos';
import { EscrevaMesmaLinha, Escreva, Fazer, Leia, Const, Para, Bloco } from '../../../declaracoes';
import { ContinuarQuebra, Quebra, SustarQuebra } from '../../../quebras';
import { InterpretadorComDepuracao } from '../../interpretador-com-depuracao';

import * as comum from './comum';

/**
 * Interpretador com depuração para o dialeto VisuAlg.
 */
export class InterpretadorVisuAlgComDepuracao extends InterpretadorComDepuracao {
    mensagemPrompt: string;

    constructor(diretorioBase: string, funcaoDeRetorno: Function = null, funcaoDeRetornoMesmaLinha: Function = null) {
        super(diretorioBase, funcaoDeRetorno, funcaoDeRetornoMesmaLinha);
        this.mensagemPrompt = '> ';

        registrarBibliotecaNumericaVisuAlg(this, this.pilhaEscoposExecucao);
        registrarBibliotecaCaracteresVisuAlg(this, this.pilhaEscoposExecucao);
    }

    visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        throw new Error('Método não implementado.');
    }

    private async avaliarArgumentosEscrevaVisuAlg(argumentos: Construto[]): Promise<string> {
        let formatoTexto: string = '';

        for (const argumento of argumentos) {
            const resultadoAvaliacao = await this.avaliar(argumento);
            let valor = resultadoAvaliacao?.hasOwnProperty('valor') ? resultadoAvaliacao.valor : resultadoAvaliacao;

            formatoTexto += `${this.paraTexto(valor)}`;
        }

        return formatoTexto;
    }

    /**
     * No VisuAlg, o bloco executa se a condição for falsa.
     * Por isso a reimplementação aqui.
     * @param declaracao A declaração `Fazer`
     * @returns Só retorna em caso de erro na execução, e neste caso, o erro.
     */
    async visitarDeclaracaoFazer(declaracao: Fazer): Promise<any> {
        let retornoExecucao: any;
        do {
            try {
                retornoExecucao = await this.executar(declaracao.caminhoFazer);
                if (retornoExecucao instanceof ContinuarQuebra) {
                    retornoExecucao = null;
                }
            } catch (erro: any) {
                return Promise.reject(erro);
            }
        } while (
            !(retornoExecucao instanceof Quebra) &&
            !this.eVerdadeiro(await this.avaliar(declaracao.condicaoEnquanto))
        );
    }

    /**
     * Execução de uma escrita na saída padrão, sem quebras de linha.
     * Implementada para alguns dialetos, como VisuAlg.
     *
     * Como `readline.question` sobrescreve o que foi escrito antes, aqui
     * definimos `this.mensagemPrompt` para uso com `leia`.
     * No VisuAlg é muito comum usar `escreva()` seguido de `leia()` para
     * gerar um prompt na mesma linha.
     * @param declaracao A declaração.
     * @returns Sempre nulo, por convenção de visita.
     */
    async visitarExpressaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any> {
        try {
            const formatoTexto: string = await this.avaliarArgumentosEscrevaVisuAlg(declaracao.argumentos);
            this.mensagemPrompt = formatoTexto;
            this.funcaoDeRetornoMesmaLinha(formatoTexto);
            return null;
        } catch (erro: any) {
            this.erros.push(erro);
        }
    }

    /**
     * Execução de uma escrita na saída configurada, que pode ser `console` (padrão) ou
     * alguma função para escrever numa página Web.
     * @param declaracao A declaração.
     * @returns Sempre nulo, por convenção de visita.
     */
    async visitarExpressaoEscreva(declaracao: Escreva): Promise<any> {
        try {
            const formatoTexto: string = await this.avaliarArgumentosEscrevaVisuAlg(declaracao.argumentos);
            this.funcaoDeRetorno(formatoTexto);
            return null;
        } catch (erro: any) {
            this.erros.push(erro);
        }
    }

    async visitarExpressaoFimPara(declaracao: FimPara): Promise<any> {
        if (!this.eVerdadeiro(await this.avaliar(declaracao.condicaoPara))) {
            const escopoPara = this.pilhaEscoposExecucao.pilha[this.pilhaEscoposExecucao.pilha.length - 2];
            if (this.comando === 'proximo') {
                escopoPara.declaracaoAtual++;
            }

            escopoPara.emLacoRepeticao = false;
            return new SustarQuebra();
        }

        if (declaracao.incremento === null || declaracao.incremento === undefined) {
            return;
        }

        await this.executar(declaracao.incremento);
    }

    /**
     * Execução da leitura de valores da entrada configurada no
     * início da aplicação.
     * @param expressao Expressão do tipo Leia
     * @returns Promise com o resultado da leitura.
     */
    async visitarExpressaoLeia(expressao: Leia): Promise<any> {
        for (let argumento of expressao.argumentos) {
            const promessaLeitura: Function = () =>
                new Promise((resolucao) =>
                    this.interfaceEntradaSaida.question(this.mensagemPrompt, (resposta: any) => {
                        this.mensagemPrompt = '> ';
                        resolucao(resposta);
                    })
                );

            const valorLido = await promessaLeitura();
            await comum.atribuirVariavel(this, argumento, valorLido);
        }
    }

    async visitarDeclaracaoPara(declaracao: Para): Promise<any> {
        const cloneDeclaracao = _.cloneDeep(declaracao) as Para;
        const corpoExecucao = cloneDeclaracao.corpo as Bloco;
        if (cloneDeclaracao.inicializador !== null) {
            await this.avaliar(cloneDeclaracao.inicializador);
            // O incremento vai ao final do bloco de escopo.
            if (cloneDeclaracao.incrementar !== null) {
                await comum.resolverIncrementoPara(this, cloneDeclaracao);
                corpoExecucao.declaracoes.push(cloneDeclaracao.incrementar);
            }
        }

        const escopoAtual = this.pilhaEscoposExecucao.topoDaPilha();
        switch (this.comando) {
            case 'proximo':
                if (
                    cloneDeclaracao.condicao !== null &&
                    this.eVerdadeiro(await this.avaliar(cloneDeclaracao.condicao))
                ) {
                    escopoAtual.emLacoRepeticao = true;

                    const resultadoBloco = this.executarBloco(corpoExecucao.declaracoes);
                    return resultadoBloco;
                }

                escopoAtual.emLacoRepeticao = false;
                return null;
            default:
                let retornoExecucao: any;
                while (!(retornoExecucao instanceof Quebra) && !this.pontoDeParadaAtivo) {
                    if (
                        cloneDeclaracao.condicao !== null &&
                        !this.eVerdadeiro(await this.avaliar(cloneDeclaracao.condicao))
                    ) {
                        break;
                    }

                    try {
                        retornoExecucao = await this.executar(corpoExecucao);
                        if (retornoExecucao instanceof SustarQuebra) {
                            return null;
                        }

                        if (retornoExecucao instanceof ContinuarQuebra) {
                            retornoExecucao = null;
                        }
                    } catch (erro: any) {
                        return Promise.reject(erro);
                    }
                }

                return retornoExecucao;
        }
    }

    async visitarExpressaoBinaria(expressao: Binario | any): Promise<any> {
        return comum.visitarExpressaoBinaria(this, expressao);
    }

    async visitarExpressaoLogica(expressao: Logico): Promise<any> {
        return comum.visitarExpressaoLogica(this, expressao);
    }
}
