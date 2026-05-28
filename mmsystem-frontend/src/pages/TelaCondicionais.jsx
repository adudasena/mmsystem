import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TelaCondicionais = () => {
  const [listaCondicionais, setListaCondicionais] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  
  // Controle de Abas: 'ativas' ou 'finalizadas'
  const [abaAtiva, setAbaAtiva] = useState('ativas');

  // Modais de Controle
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [modalBaixaAberto, setModalBaixaAberto] = useState(false);
  const [sacolaParaBaixa, setSacolaParaBaixa] = useState(null);
  const [itensBaixa, setItensBaixa] = useState([]); 
  const [modalExcluir, setModalExcluir] = useState({ aberto: false, id: null });

  const [errosValidacao, setErrosValidacao] = useState([]);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  // Formulário estruturado com suporte nativo a grades de variação
  const [formCondicional, setFormCondicional] = useState({
    clienteId: '',
    dataSaida: new Date().toISOString().split('T')[0],
    dataRetorno: '',
    status: 'ABERTA',
    itens: [{ produtoId: '', quantidade: 1, cor: '', tamanho: '', statusItem: 'EM CONDICIONAL' }]
  });

  // Valores padrão para escolha rápida baseados no padrão visual do MM System
  const tamanhosDisponiveis = ['PP', 'P', 'M', 'G', 'GG', 'G1', 'G2'];
  const coresDisponiveis = ['Preto', 'Branco', 'Rosa', 'Azul', 'Verde', 'Vermelho', 'Laranja', 'Amarelo', 'Roxo'];

  const carregarDadosDoSistema = async () => {
    try {
      const [resCond, resCli, resProd] = await Promise.all([
        api.get('/condicionais'),
        api.get('/clientes'),
        api.get('/produtos')
      ]);
      if (resCond.data) setListaCondicionais(resCond.data);
      if (resCli.data) setClientes(resCli.data);
      if (resProd.data) setProdutos(resProd.data);
    } catch (err) {
      console.error("Erro ao sincronizar ecossistema de dados:", err);
    }
  };

  useEffect(() => { carregarDadosDoSistema(); }, []);

  const abrirNovaSacolaForm = () => {
    setEditandoId(null);
    setErrosValidacao([]);
    setFormCondicional({
      clienteId: '',
      dataSaida: new Date().toISOString().split('T')[0],
      dataRetorno: '',
      status: 'ABERTA',
      itens: [{ produtoId: '', quantidade: 1, cor: 'Preto', tamanho: 'M', statusItem: 'EM CONDICIONAL' }]
    });
    setModalFormAberto(true);
  };

  const prepararEdicaoLocal = (cond) => {
    setEditandoId(cond.id);
    setErrosValidacao([]);
    setFormCondicional({
      clienteId: cond.cliente?.id || '',
      dataSaida: cond.dataSaida || '',
      dataRetorno: cond.dataRetorno || '',
      status: cond.status || 'ABERTA',
      itens: cond.itens.map(it => ({
        produtoId: it.produto?.id || '',
        quantidade: it.quantidade || 1,
        cor: it.cor || 'Preto',
        tamanho: it.tamanho || 'M',
        statusItem: it.statusItem || 'EM CONDICIONAL'
      }))
    });
    setModalFormAberto(true);
  };

  const handleItemChange = (index, campo, valor) => {
    const novosItens = [...formCondicional.itens];
    novosItens[index][campo] = valor;
    setFormCondicional({ ...formCondicional, itens: novosItens });
  };

  const adicionarLinhaProduto = () => {
    setFormCondicional({
      ...formCondicional,
      itens: [...formCondicional.itens, { produtoId: '', quantidade: 1, cor: 'Preto', tamanho: 'M', statusItem: 'EM CONDICIONAL' }]
    });
  };

  const removerLinhaProduto = (index) => {
    const filtrados = formCondicional.itens.filter((_, i) => i !== index);
    setFormCondicional({ ...formCondicional, itens: filtrados });
  };

  const salvarCondicional = async () => {
    if (!formCondicional.clienteId || !formCondicional.dataRetorno) {
      setErrosValidacao(["Vincule um cliente e determine a data limite de devolução."]);
      return;
    }
    try {
      if (editandoId) {
        await api.put(`/condicionais/${editandoId}`, formCondicional);
        setMensagemSucesso("Sacola condicional editada e salva com sucesso!");
      } else {
        await api.post('/condicionais', formCondicional);
        setMensagemSucesso("Nova sacola registrada com sucesso no sistema!");
      }
      setModalFormAberto(false);
      carregarDadosDoSistema();
      setTimeout(() => setMensagemSucesso(''), 3000);
    } catch (err) {
      setErrosValidacao(["Erro ao comunicar com a API do Spring Boot."]);
    }
  };

  // Prepara o Modal de Processamento Item por Item
  const prepararBaixaIndividual = (sacola) => {
    setSacolaParaBaixa(sacola);
    setItensBaixa(sacola.itens.map(it => ({
      id: it.id,
      nome: it.produto?.nome || 'Produto não identificado',
      cor: it.cor || 'Padrão',
      tamanho: it.tamanho || 'M',
      quantidade: it.quantidade || 1,
      statusItem: 'VENDIDO' // Define uma ação padrão inicial
    })));
    setModalBaixaAberto(true);
  };

  const alterarStatusPecaEspecifica = (idx, novoStatus) => {
    const itensAtualizados = [...itensBaixa];
    itensAtualizados[idx].statusItem = novoStatus;
    setItensBaixa(itensAtualizados);
  };

  // Envia a resposta final para o banco salvando o destino de cada linha separadamente
  const finalizarBaixaItemPorItem = async () => {
    try {
      const todosDevolvidos = itensBaixa.every(i => i.statusItem === 'DEVOLVIDO');
      const statusGeralSacola = todosDevolvidos ? 'DEVOLVIDA' : 'FINALIZADA';

      await api.put(`/condicionais/${sacolaParaBaixa.id}`, {
        clienteId: sacolaParaBaixa.cliente?.id,
        dataSaida: sacolaParaBaixa.dataSaida,
        dataRetorno: sacolaParaBaixa.dataRetorno,
        status: statusGeralSacola,
        itens: sacolaParaBaixa.itens.map((original, index) => ({
          produtoId: original.produto?.id,
          quantidade: original.quantidade,
          cor: original.cor,
          tamanho: original.tamanho,
          statusItem: itensBaixa[index].statusItem
        }))
      });

      setModalBaixaAberto(false);
      setMensagemSucesso("Baixa processada de forma individualizada com sucesso!");
      carregarDadosDoSistema();
      setTimeout(() => setMensagemSucesso(''), 4000);
    } catch (err) {
      console.error("Erro ao salvar baixa fracionada:", err);
    }
  };

  const deletarCondicional = async () => {
    await api.delete(`/condicionais/${modalExcluir.id}`);
    setModalExcluir({ aberto: false, id: null });
    setMensagemSucesso("Condicional cancelado e removido.");
    carregarDadosDoSistema();
  };

  // Lógica de Separação de Listas (Ativos x Finalizados)
  const listaFiltrada = listaCondicionais.filter(c => {
    if (abaAtiva === 'ativas') return c.status === 'ABERTA';
    return c.status === 'FINALIZADA' || c.status === 'DEVOLVIDA';
  });

  return (
    <div className="flex-1 p-10 bg-[#d9d9ce] min-h-screen font-sans text-gray-800">
      <header className="mb-6 flex justify-between items-center max-w-5xl">
        <div>
          <h2 className="text-3xl font-serif text-gray-900">Painel Administrativo - Condicionais</h2>
          <p className="text-xs text-gray-600 tracking-wide mt-1">Gerenciamento refinado com triagem por variação e histórico separado.</p>
        </div>
        <button onClick={abrirNovaSacolaForm} className="bg-[#4a5d33] text-white font-bold text-xs uppercase px-4 py-2.5 rounded-sm hover:brightness-110 transition">
          + Nova Sacola Condicional
        </button>
      </header>

      {mensagemSucesso && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-600 p-3 text-green-900 font-semibold text-xs max-w-5xl rounded-sm">
          ✓ {mensagemSucesso}
        </div>
      )}

      {/* SEPARADOR DE TELAS (ABAS) */}
      <div className="flex gap-2 mb-4 max-w-5xl border-b border-gray-400">
        <button 
          onClick={() => setAbaAtiva('ativas')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${abaAtiva === 'ativas' ? 'border-b-2 border-[#4a5d33] text-black font-extrabold bg-white/40' : 'text-gray-500 hover:text-black'}`}
        >
          👜 Condicionais Ativos ({listaCondicionais.filter(c => c.status === 'ABERTA').length})
        </button>
        <button 
          onClick={() => setAbaAtiva('finalizadas')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${abaAtiva === 'finalizadas' ? 'border-b-2 border-[#4a5d33] text-black font-extrabold bg-white/40' : 'text-gray-500 hover:text-black'}`}
        >
          ✅ Histórico de Finalizados ({listaCondicionais.filter(c => c.status !== 'ABERTA').length})
        </button>
      </div>

      {/* TABELA DE REGISTROS */}
      <section className="bg-white rounded-sm shadow-sm border border-gray-300 overflow-hidden max-w-5xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#cbd0c0] text-[11px] font-bold uppercase text-gray-700 border-b border-gray-300">
                <th className="p-3 border-r border-gray-300">Código</th>
                <th className="p-3 border-r border-gray-300">Cliente</th>
                <th className="p-3 border-r border-gray-300">Valor Estimado</th>
                <th className="p-3 border-r border-gray-300">Data Início</th>
                <th className="p-3 border-r border-gray-300">Data Limite</th>
                <th className="p-3 border-r border-gray-300">Status Sacola</th>
                <th className="p-3 border-r border-gray-300">Peças Relacionadas (Variações)</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {listaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400 italic bg-white">Nenhum registro encontrado nesta aba.</td>
                </tr>
              ) : (
                listaFiltrada.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/80 bg-white">
                    <td className="p-3 border-r border-gray-200 font-bold text-gray-700">{String(c.id).padStart(3, '0')}</td>
                    <td className="p-3 border-r border-gray-200 font-semibold">{c.cliente?.nome}</td>
                    <td className="p-3 border-r border-gray-200 font-bold text-gray-900">R$ {Number(c.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 border-r border-gray-200 text-gray-500">{c.dataSaida}</td>
                    <td className="p-3 border-r border-gray-200 text-red-700 font-bold">{c.dataRetorno}</td>
                    <td className="p-3 border-r border-gray-200 uppercase font-mono text-[10px]">
                      <span className={`px-1.5 py-0.5 border ${c.status === 'ABERTA' ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-green-50 text-green-700 border-green-300'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 border-r border-gray-200 text-gray-600 max-w-[240px]">
                      <div className="space-y-1">
                        {(c.itens || []).map((i, idx) => (
                          <div key={idx} className="text-[11px] bg-gray-100 p-1 border rounded-sm flex justify-between">
                            <span>{i.produto?.nome} <strong>({i.cor} / {i.tamanho})</strong></span>
                            <span className="text-[9px] px-1 font-bold bg-white border uppercase text-gray-500">{i.statusItem || 'EM COND.'}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center items-center gap-3">
                        {c.status === 'ABERTA' && (
                          <>
                            <button onClick={() => prepararEdicaoLocal(c)} className="hover:scale-110 transition" title="Editar Sacola">✏️</button>
                            <button onClick={() => prepararBaixaIndividual(c)} className="text-green-600 hover:text-green-900 font-bold text-sm" title="Dar Baixa nas Peças">✓</button>
                          </>
                        )}
                        <button onClick={() => setModalExcluir({ aberto: true, id: c.id })} className="text-red-500 hover:text-red-700 font-bold text-xs" title="Excluir">✕</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL: FORMULÁRIO DE CRIAÇÃO E EDIÇÃO COM VARIANTES */}
      {modalFormAberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-sm w-full max-w-2xl max-h-[90vh] flex flex-col p-6 shadow-2xl border-t-4 border-[#4a5d33]">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="font-serif text-lg text-gray-900">{editandoId ? `Editando Sacola Nº ${editandoId}` : 'Nova Sacola Condicional'}</h3>
              <button onClick={() => setModalFormAberto(false)} className="text-gray-400 hover:text-black font-bold text-xl">×</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Selecione o Cliente</label>
                <select value={formCondicional.clienteId} onChange={e => setFormCondicional({...formCondicional, clienteId: e.target.value})} className="w-full border p-2 bg-gray-50 text-xs outline-none focus:border-gray-400">
                  <option value="">Escolha uma cliente...</option>
                  {clientes.map(cli => <option key={cli.id} value={cli.id}>{cli.nome}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Data de Retirada</label>
                  <input type="date" value={formCondicional.dataSaida} onChange={e => setFormCondicional({...formCondicional, dataSaida: e.target.value})} className="w-full border p-1.5 bg-gray-50 text-xs outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Previsão Devolução</label>
                  <input type="date" value={formCondicional.dataRetorno} onChange={e => setFormCondicional({...formCondicional, dataRetorno: e.target.value})} className="w-full border p-1.5 bg-gray-50 text-xs outline-none" />
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold uppercase text-gray-500">Definição dos Looks e Grades</label>
                  <button type="button" onClick={adicionarLinhaProduto} className="text-[#4a5d33] hover:underline text-[10px] font-bold">+ Inserir Peça</button>
                </div>

                <div className="space-y-2">
                  {formCondicional.itens.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-1.5 bg-gray-50 p-2 border rounded-sm items-center">
                      <div className="col-span-5">
                        <select value={item.produtoId} onChange={e => handleItemChange(idx, 'produtoId', e.target.value)} className="w-full border p-1 bg-white text-xs outline-none">
                          <option value="">Selecione o Look...</option>
                          {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <select value={item.cor} onChange={e => handleItemChange(idx, 'cor', e.target.value)} className="w-full border p-1 bg-white text-xs outline-none">
                          {coresDisponiveis.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <select value={item.tamanho} onChange={e => handleItemChange(idx, 'tamanho', e.target.value)} className="w-full border p-1 bg-white text-xs outline-none">
                          {tamanhosDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="col-span-1">
                        <input type="number" min="1" value={item.quantidade} onChange={e => handleItemChange(idx, 'quantidade', e.target.value)} className="w-full border p-1 text-center bg-white text-xs" />
                      </div>
                      <div className="col-span-1 text-center">
                        {formCondicional.itens.length > 1 && (
                          <button type="button" onClick={() => removerLinhaProduto(idx)} className="text-red-600 font-bold hover:text-red-800">×</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t flex justify-end gap-2">
              <button onClick={() => setModalFormAberto(false)} className="px-4 py-2 bg-gray-200 text-gray-700 text-[10px] font-bold uppercase hover:bg-gray-300">Cancelar</button>
              <button onClick={salvarCondicional} className="px-5 py-2 bg-[#4a5d33] text-white text-[10px] font-bold uppercase hover:brightness-110 shadow-md">Salvar Mudanças</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REFEITO DE TRIAGEM INTERNA ITEM POR ITEM */}
      {modalBaixaAberto && sacolaParaBaixa && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#526442] text-white p-6 shadow-2xl border border-[#3e4c32] max-w-xl w-full rounded-sm">
            <div className="flex justify-between items-center border-b border-white/20 pb-2 mb-4">
              <div>
                <h3 className="font-serif text-base uppercase tracking-wider">Processar Retorno de Peças</h3>
                <p className="text-[11px] text-gray-300">Defina o destino individualizado de cada look retornado.</p>
              </div>
              <button onClick={() => setModalBaixaAberto(false)} className="text-white/70 hover:text-white text-xl">×</button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto mb-4 pr-1">
              {itensBaixa.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#425235] p-2.5 border border-[#37452c] rounded-sm gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{item.nome}</p>
                    <p className="text-[10px] text-gray-300">Grade: <span className="text-amber-300 font-bold">{item.cor} / {item.tamanho}</span> ({item.quantidade}x)</p>
                  </div>
                  
                  {/* Seletores de Estado por Item */}
                  <div className="flex gap-1 bg-[#4d5e3e] p-1 border border-white/10 rounded-sm">
                    <button 
                      type="button"
                      onClick={() => alterarStatusPecaEspecifica(idx, 'VENDIDO')}
                      className={`px-3 py-1 text-[9px] font-bold uppercase transition ${item.statusItem === 'VENDIDO' ? 'bg-white text-gray-900' : 'text-white/80 hover:bg-white/10'}`}
                    >
                      🛍️ Vendido
                    </button>
                    <button 
                      type="button"
                      onClick={() => alterarStatusPecaEspecifica(idx, 'DEVOLVIDO')}
                      className={`px-3 py-1 text-[9px] font-bold uppercase transition ${item.statusItem === 'DEVOLVIDO' ? 'bg-[#425235] text-white border border-white/30' : 'text-white/80 hover:bg-white/10'}`}
                    >
                      🔄 Devolvido
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/20 flex justify-end gap-2">
              <button onClick={() => setModalBaixaAberto(false)} className="px-4 py-2 text-[10px] font-bold text-white/80 uppercase hover:underline">Fechar</button>
              <button onClick={finalizarBaixaItemPorItem} className="px-5 py-2 bg-white text-gray-900 text-[10px] font-bold uppercase hover:bg-gray-100 shadow-md">Confirmar Baixa do Estoque</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EXCLUSÃO */}
      {modalExcluir.aberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-5 max-w-xs w-full rounded-sm border-t-4 border-red-600 shadow-2xl">
            <h4 className="font-serif text-base text-red-700 mb-1">⚠️ Excluir Condicional</h4>
            <p className="text-xs text-gray-600 mb-4">Confirma a remoção permanente deste registro do banco de dados?</p>
            <div className="flex justify-end gap-2 text-[10px] font-bold uppercase">
              <button onClick={() => setModalExcluir({ aberto: false, id: null })} className="px-3 py-1.5 bg-gray-100 text-gray-700">Voltar</button>
              <button onClick={deletarCondicional} className="px-3 py-1.5 bg-red-600 text-white hover:bg-red-700">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelaCondicionais;