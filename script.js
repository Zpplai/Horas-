// ===========================
// CONSTANTES
// ===========================
const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

const SALARIO_BASE = 2240.99;
const HORA_EXTRA_VALOR = (SALARIO_BASE / (22 * 8));
const STORAGE_KEY = 'controle_jornada_final';

// ===========================
// DADOS
// ===========================
let dias = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let diaAtualId = null;

// ===========================
// INIT
// ===========================
renderizarDias();
atualizarTotais();

// ===========================
// CRIAR NOVO DIA
// ===========================
function criarNovoDia() {
    const novoId = Date.now().toString();
    const novoNumero = dias.length + 1;

    const novoDia = {
        id: novoId,
        numero: novoNumero.toString(),
        tipo: 'domingo',
        trabalhou: 'nao',
        entrada: '',
        saida: '',
        almoco: 'sim',
        valor: 0,
        ajudaCusto: 0,
        extraMin: 0
    };

    dias.push(novoDia);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dias));

    renderizarDias();
    abrirModalEdicao(novoId);
}

// ===========================
// RENDERIZAR DIAS (ÚNICA)
// ===========================
function renderizarDias() {
    const container = document.getElementById('dias-container');
    container.innerHTML = '';

    dias.sort((a, b) => parseInt(a.numero) - parseInt(b.numero));

    dias.forEach(dia => {
        const cartao = document.createElement('div');
        cartao.className = 'dia-cartao';
        cartao.onclick = () => abrirModalEdicao(dia.id);

        let corBorda = '';
        switch (dia.tipo) {
            case 'domingo': corBorda = '#4caf50'; break;
            case 'feriado': corBorda = '#f44336'; break;
            case 'folga': corBorda = '#2196f3'; break;
            case 'normal': corBorda = '#ff9800'; break;
            case 'atestado': corBorda = '#9c27b0'; break;
        }
        cartao.style.borderLeftColor = corBorda;

        const diaSemanaTexto = DIAS_SEMANA[(parseInt(dia.numero) - 1) % 7];

        let infoAdicional = 'Dados não preenchidos';
        if (dia.trabalhou === 'sim') {
            if (dia.entrada && dia.saida) {
                const almocoTexto = dia.almoco === 'sim' ? ' | Almoço: Sim' : ' | Almoço: Não';
                infoAdicional = `Entrada: ${dia.entrada} | Saída: ${dia.saida}${almocoTexto}`;
            } else {
                infoAdicional = `Valor: R$ ${dia.valor.toFixed(2).replace('.', ',')}`;
            }
        }

        cartao.innerHTML = `
            <div class="cartao-titulo">
                ${dia.tipo.charAt(0).toUpperCase() + dia.tipo.slice(1)}
            </div>
            <div class="cartao-subtitulo">
                ${dia.numero} - ${diaSemanaTexto}
            </div>
            <div class="cartao-info">
                ${infoAdicional}
            </div>
        `;

        container.appendChild(cartao);
    });
}

// ===========================
// MODAL
// ===========================
function abrirModalEdicao(id) {
    const dia = dias.find(d => d.id === id);
    if (!dia) return;

    diaAtualId = id;

    document.getElementById('modal-numero').textContent = dia.numero;
    document.getElementById('tipo-dia').value = dia.tipo;
    document.getElementById('trabalhou').value = dia.trabalhou;
    document.getElementById('entrada').value = dia.entrada;
    document.getElementById('saida').value = dia.saida;
    document.getElementById('almoco').value = dia.almoco;
    document.getElementById('valor').value = dia.valor;
    document.getElementById('ac-input').value = dia.ajudaCusto;

    mostrarCamposEspecificos();
    adicionarMascaraHora();

    document.getElementById('modal-edicao').style.display = 'block';
}

function fecharModal() {
    document.getElementById('modal-edicao').style.display = 'none';
    diaAtualId = null;
}

// ===========================
// CAMPOS
// ===========================
function mostrarCamposEspecificos() {
    const trabalhou = document.getElementById('trabalhou').value;
    const tipo = document.getElementById('tipo-dia').value;

    ['entrada','saida','almoco','valor','ac'].forEach(id => {
        const el = document.getElementById(`campo-${id}`);
        if (el) el.style.display = 'none';
    });

    if (trabalhou === 'sim') {
        document.getElementById('campo-valor').style.display = 'block';

        if (tipo === 'normal') {
            document.getElementById('campo-entrada').style.display = 'block';
            document.getElementById('campo-saida').style.display = 'block';
            document.getElementById('campo-almoco').style.display = 'block';
        }

        if (tipo === 'domingo' || tipo === 'feriado') {
            document.getElementById('campo-ac').style.display = 'block';
        }
    }
}

// ===========================
// HORA
// ===========================
function adicionarMascaraHora() {
    ['entrada', 'saida'].forEach(id => {
        const campo = document.getElementById(id);
        campo.addEventListener('input', function () {
            let v = this.value.replace(/\D/g, '');
            if (v.length >= 2) v = v.slice(0,2) + ':' + v.slice(2,4);
            this.value = v.slice(0,5);
        });
    });
}

function validarHora(h) {
    if (!h || h.length !== 5) return false;
    const [hh, mm] = h.split(':').map(Number);
    return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59;
}

// ===========================
// EXTRA
// ===========================
function calcularExtra(entrada, saida, almoco) {
    if (!validarHora(entrada) || !validarHora(saida)) return 0;

    const toMin = h => {
        const [hh, mm] = h.split(':').map(Number);
        return hh * 60 + mm;
    };

    const total = toMin(saida) - toMin(entrada);
    const desconto = almoco === 'sim' ? 60 : 0;
    const trabalhado = total - desconto;
    const meta = 460;

    return trabalhado > meta ? trabalhado - meta : 0;
}

// ===========================
// SALVAR
// ===========================
function salvarDadosDia() {
    const dia = dias.find(d => d.id === diaAtualId);
    if (!dia) return;

    dia.tipo = document.getElementById('tipo-dia').value;
    dia.trabalhou = document.getElementById('trabalhou').value;
    dia.entrada = document.getElementById('entrada').value;
    dia.saida = document.getElementById('saida').value;
    dia.almoco = document.getElementById('almoco').value;
    dia.valor = parseFloat(document.getElementById('valor').value) || 0;
    dia.ajudaCusto = parseFloat(document.getElementById('ac-input').value) || 0;
    dia.extraMin = calcularExtra(dia.entrada, dia.saida, dia.almoco);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dias));
    renderizarDias();
    atualizarTotais();
    fecharModal();
}

// ===========================
// REMOVER
// ===========================
function removerDiaAtual() {
    if (!diaAtualId || !confirm('Tem certeza?')) return;

    dias = dias.filter(d => d.id !== diaAtualId);
    dias.forEach((d, i) => d.numero = (i + 1).toString());

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dias));
    renderizarDias();
    atualizarTotais();
    fecharModal();
}

// ===========================
// TOTAIS
// ===========================
function atualizarTotais() {
    let extraMin = 0, folga = 0, fd = 0;

    dias.forEach(d => {
        if (d.trabalhou !== 'sim') return;
        if (d.tipo === 'folga') folga += d.valor;
        if (d.tipo === 'domingo' || d.tipo === 'feriado') fd += d.valor + d.ajudaCusto;
        if (d.tipo === 'normal') extraMin += d.extraMin;
    });

    const total = folga + fd + (extraMin / 60) * HORA_EXTRA_VALOR;

    document.getElementById('extra').textContent =
        `${Math.floor(extraMin / 60)}h${(extraMin % 60).toString().padStart(2,'0')}min`;
    document.getElementById('folga').textContent = folga.toFixed(2).replace('.', ',');
    document.getElementById('fd').textContent = fd.toFixed(2).replace('.', ',');
    document.getElementById('total').textContent = total.toFixed(2).replace('.', ',');
}
window.salvarDadosDia = salvarDadosDia;
window.removerDiaAtual = removerDiaAtual;
window.fecharModal = fecharModal;