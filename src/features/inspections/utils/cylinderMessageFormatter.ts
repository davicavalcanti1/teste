
export function formatarMensagemInspecao(dados: any) {
    const dataFormatada = new Date(dados.data_referencia).toLocaleDateString('pt-BR');

    // Verificar se há pedido de cilindros
    const temPedido = dados.requer_confirmacao;

    if (!temPedido) {
        // MENSAGEM PADRÃO (sem pedidos)
        return formatarMensagemSemPedido(dados, dataFormatada);
    } else {
        // MENSAGENS DIFERENCIADAS (com pedidos)
        return {
            mensagem_gestora: formatarMensagemGestora(dados, dataFormatada),
            mensagem_grupo: formatarMensagemGrupo(dados, dataFormatada)
        };
    }
}

function formatarMensagemSemPedido(dados: any, dataFormatada: string): string {
    const status = determinarStatus(dados);

    let mensagem = `✅ *Inspeção de Cilindros - ${dados.protocolo}*\n\n`;
    mensagem += `📅 *Data:* ${dataFormatada}\n`;
    mensagem += `👤 *Funcionário:* ${dados.funcionario}\n\n`;
    mensagem += `*Status:* ${status}\n\n`;

    if (dados.observacoes && dados.observacoes.trim() !== '') {
        mensagem += `📝 *Observações:* ${dados.observacoes}\n\n`;
    }

    return mensagem;
}

function formatarMensagemGestora(dados: any, dataFormatada: string): string {
    let mensagem = `🔔 *PEDIDO DE CILINDROS - ${dados.protocolo}*\n\n`;
    mensagem += `📅 *Data:* ${dataFormatada}\n`;
    mensagem += `👤 *Funcionário:* ${dados.funcionario}\n\n`;
    mensagem += `📦 *Cilindros solicitados:*\n`;

    const pedidos = dados.cilindros_pedido || {};

    if (pedidos.oxigenio_grande > 0) {
        mensagem += `• Oxigênio Grande: *${pedidos.oxigenio_grande} unidade(s)*\n`;
    }
    if (pedidos.oxigenio_pequeno > 0) {
        mensagem += `• Oxigênio Pequeno: *${pedidos.oxigenio_pequeno} unidade(s)*\n`;
    }
    if (pedidos.ar_comprimido > 0) {
        mensagem += `• Ar Comprimido: *${pedidos.ar_comprimido} unidade(s)*\n`;
    }

    mensagem += `\n`;

    if (dados.observacoes && dados.observacoes.trim() !== '') {
        mensagem += `📝 *Observações:* ${dados.observacoes}\n\n`;
    }

    mensagem += `✅ *Confirmar pedido:*\n`;
    mensagem += `${dados.confirmation_url}`;

    return mensagem;
}

function formatarMensagemGrupo(dados: any, dataFormatada: string): string {
    let mensagem = `📋 *Inspeção de Cilindros - ${dados.protocolo}*\n\n`;
    mensagem += `📅 *Data:* ${dataFormatada}\n`;
    mensagem += `👤 *Funcionário:* ${dados.funcionario}\n\n`;
    mensagem += `⏳ *Pedido de cilindros aguardando confirmação da gestão.*`;

    return mensagem;
}

function determinarStatus(dados: any): string {
    const temOxigenioGrande = dados.qtd_oxigenio_grande > 0;
    const temOxigenioPequeno = dados.qtd_oxigenio_pequeno > 0;
    const temAr = dados.qtd_ar > 0;

    if (!temOxigenioGrande && !temOxigenioPequeno && !temAr) {
        return 'Sem necessidade de reposição';
    }

    return 'Inspeção concluída';
}
