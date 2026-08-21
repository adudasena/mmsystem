'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, Eye, X, User, Phone, Calendar } from 'lucide-react';
import api from '@/services/api';
// ─── Tipagens e Interfaces ──────────────────────────────────────────────────
export type StatusPedido = 'PENDENTE' | 'PAGO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO';

export interface ClientePedido {
  id?: number;
  nome: string;
  email?: string;
  telefone?: string;
}

export interface ItemPedido {
  id?: number;
  produtoId: number;
  produtoNome: string;
  variacao: string; // Ex: "Preto - Tam M"
  quantidade: number;
  precoUnitario: number;
}

export interface Pedido {
  id: number;
  cliente: ClientePedido;
  dataPedido: string;
  status: StatusPedido;
  valorTotal: number;
  metodoPagamento?: string;
  enderecoEntrega?: string;
  itens?: ItemPedido[];
}

const TelaPedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filtros
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [statusFiltro, setStatusFiltro] = useState<string>('TODOS');

  // Modal de Detalhes
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState<boolean>(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);

  // ─── Efeito de Inicialização (Evita erros de renderização em cadeia) ─────
  useEffect(() => {
    let montado = true;

    const carregarInicial = async () => {
      try {
        setLoading(true);
        const res = await api.get<Pedido[]>('/pedidos');
        if (montado) {
          setPedidos(res.data || []);
        }
      } catch (err) {
        console.error('Erro ao buscar pedidos:', err);
      } finally {
        if (montado) {
          setLoading(false);
        }
      }
    };

    carregarInicial();

    return () => {
      montado = false;
    };
  }, []);

  // Reutilizável para recarregar após alterações
  const carregarPedidos = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await api.get<Pedido[]>('/pedidos');
      setPedidos(res.data || []);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAtualizarStatus = async (pedidoId: number, novoStatus: StatusPedido): Promise<void> => {
    try {
      await api.patch(`/pedidos/${pedidoId}/status`, { status: novoStatus });
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoId ? { ...p, status: novoStatus } : p))
      );
      if (pedidoSelecionado && pedidoSelecionado.id === pedidoId) {
        setPedidoSelecionado({ ...pedidoSelecionado, status: novoStatus });
      }
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
    }
  };

  const dispararWhatsAppComprovante = (pedido: Pedido): void => {
    const nomeCliente = pedido.cliente?.nome || 'Cliente';
    const telefone = pedido.cliente?.telefone?.replace(/\D/g, '') || '';

    const texto =
      `Olá, ${nomeCliente}! ✨\n\n` +
      `Seu pedido *#${pedido.id}* na *Maria Morena* foi registrado!\n` +
      `*Data:* ${pedido.dataPedido}\n` +
      `*Total:* R$ ${Number(pedido.valorTotal).toFixed(2)}\n` +
      `*Status:* ${pedido.status}\n\n` +
      `Obrigada pela preferência! 🛍️`;

    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  const abrirDetalhes = (pedido: Pedido): void => {
    setPedidoSelecionado(pedido);
    setModalDetalhesAberto(true);
  };

  const renderBadgeStatus = (status: StatusPedido) => {
    const estilos: Record<StatusPedido, string> = {
      PENDENTE: 'bg-amber-100 text-amber-800 border-amber-300',
      PAGO: 'bg-blue-100 text-blue-800 border-blue-300',
      ENVIADO: 'bg-purple-100 text-purple-800 border-purple-300',
      ENTREGUE: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      CANCELADO: 'bg-rose-100 text-rose-800 border-rose-300',
    };

    return (
      <span className={`px-2.5 py-0.5 rounded border text-[10px] font-bold uppercase ${estilos[status] || estilos.PENDENTE}`}>
        {status}
      </span>
    );
  };

  const pedidosFiltrados = pedidos.filter((p) => {
    const atendeStatus = statusFiltro === 'TODOS' || p.status === statusFiltro;
    const atendeBusca =
      (p.cliente?.nome || '').toLowerCase().includes(termoBusca.toLowerCase()) ||
      p.id.toString().includes(termoBusca);
    return atendeStatus && atendeBusca;
  });

  return (
    <div className="p-6 md:p-8 bg-[#dcded0] min-h-screen font-sans text-gray-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#2d3a22] flex items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-[#2d3a22]" />
              Gestão de Pedidos
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              Acompanhe todos os pedidos, altere etapas de envio e envie comprovantes via WhatsApp.
            </p>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por #ID do pedido ou nome do cliente..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:outline-none focus:ring-2 focus:ring-[#2d3a22]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:outline-none focus:ring-2 focus:ring-[#2d3a22]"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="PENDENTE">Pendente</option>
              <option value="PAGO">Pago</option>
              <option value="ENVIADO">Enviado</option>
              <option value="ENTREGUE">Entregue</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Tabela Principal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase text-gray-700">
              Pedidos Registrados ({pedidosFiltrados.length})
            </h2>
          </div>

          {loading ? (
            <p className="p-8 text-center text-xs text-gray-500">Carregando pedidos...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#cbd0c0] font-bold uppercase text-gray-700">
                    <th className="p-3">#ID</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Data</th>
                    <th className="p-3">Valor Total</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pedidosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center italic text-gray-500">
                        Nenhum pedido encontrado.
                      </td>
                    </tr>
                  ) : (
                    pedidosFiltrados.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-bold text-gray-500">#{p.id}</td>
                        <td className="p-3 font-bold text-gray-800">{p.cliente?.nome || '—'}</td>
                        <td className="p-3 text-gray-600">{p.dataPedido}</td>
                        <td className="p-3 font-bold text-gray-800">
                          R$ {Number(p.valorTotal || 0).toFixed(2)}
                        </td>
                        <td className="p-3">{renderBadgeStatus(p.status)}</td>
                        <td className="p-3 text-center flex items-center justify-center gap-2">
                          <button
                            onClick={() => dispararWhatsAppComprovante(p)}
                            className="bg-[#25D366] hover:bg-[#1ebd59] text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase shadow-sm flex items-center gap-1 transition-all"
                          >
                            💬 Enviado no Whats
                          </button>
                          <button
                            onClick={() => abrirDetalhes(p)}
                            className="p-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                            title="Ver Detalhes do Pedido"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Detalhes do Pedido */}
        {modalDetalhesAberto && pedidoSelecionado && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border-t-4 border-[#2d3a22] w-full max-w-xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-gray-900">
                    Pedido #{pedidoSelecionado.id}
                  </h3>
                  {renderBadgeStatus(pedidoSelecionado.status)}
                </div>
                <button onClick={() => setModalDetalhesAberto(false)} className="text-gray-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Atualização de Etapa */}
              <div className="bg-gray-50 p-3 rounded-lg border space-y-2">
                <label className="block text-[10px] font-bold uppercase text-gray-500">
                  Alterar Status do Pedido:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['PENDENTE', 'PAGO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'] as StatusPedido[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleAtualizarStatus(pedidoSelecionado.id, st)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase border transition-all ${
                        pedidoSelecionado.status === st
                          ? 'bg-[#2d3a22] text-white border-[#2d3a22]'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Informações do Cliente */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 p-3 rounded-lg border space-y-1">
                  <p className="font-bold text-gray-700 flex items-center gap-1 text-[11px]">
                    <User className="w-3.5 h-3.5 text-[#2d3a22]" /> Cliente
                  </p>
                  <p className="font-semibold text-gray-900">{pedidoSelecionado.cliente?.nome || '—'}</p>
                  <p className="text-gray-500">{pedidoSelecionado.cliente?.email || 'Sem e-mail'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border space-y-1">
                  <p className="font-bold text-gray-700 flex items-center gap-1 text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-[#2d3a22]" /> Contato / Data
                  </p>
                  <p className="text-gray-800">{pedidoSelecionado.cliente?.telefone || 'Sem telefone'}</p>
                  <p className="text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {pedidoSelecionado.dataPedido}
                  </p>
                </div>
              </div>

              {/* Lista de Itens do Pedido */}
              {pedidoSelecionado.itens && pedidoSelecionado.itens.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase text-gray-500">Itens do Pedido</h4>
                  <div className="border rounded-lg divide-y text-xs">
                    {pedidoSelecionado.itens.map((item, idx) => (
                      <div key={idx} className="p-2.5 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-800">{item.produtoNome}</p>
                          <p className="text-gray-500 text-[10px]">Variação: {item.variacao}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600">{item.quantidade}x R$ {item.precoUnitario.toFixed(2)}</p>
                          <p className="font-bold text-gray-900">R$ {(item.quantidade * item.precoUnitario).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rodapé do Modal */}
              <div className="flex justify-between items-center pt-3 border-t">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Total</span>
                  <span className="text-lg font-extrabold text-[#2d3a22]">
                    R$ {Number(pedidoSelecionado.valorTotal || 0).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => setModalDetalhesAberto(false)}
                  className="px-4 py-1.5 bg-gray-800 hover:bg-black text-white rounded text-xs font-bold uppercase"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TelaPedidos;