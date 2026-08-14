import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TelaPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarPedidos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pedidos');
      setPedidos(res.data || []);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  const dispararWhatsAppComprovante = (pedido) => {
    const nomeCliente = pedido.cliente?.nome || 'Cliente';
    const telefone = pedido.cliente?.telefone?.replace(/\D/g, '') || '';
    
    const texto = `Olá, ${nomeCliente}! ✨\n\n` +
      `Seu pedido *#${pedido.id}* na *Maria Morena* foi registrado!\n` +
      `*Data:* ${pedido.dataPedido}\n` +
      `*Total:* R$ ${Number(pedido.valorTotal).toFixed(2)}\n` +
      `*Status:* ${pedido.status}\n\n` +
      `Obrigada pela preferência! 🛍️`;

    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-6 md:p-8 bg-[#dcded0] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2d3a22]">Gestão de Pedidos</h1>
          <p className="text-xs text-gray-600 mt-1">Acompanhe todos os pedidos e disparos de comprovante.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase text-gray-700">Pedidos Registrados ({pedidos.length})</h2>
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
                  {pedidos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center italic text-gray-500">Nenhum pedido encontrado.</td>
                    </tr>
                  ) : (
                    pedidos.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-500">#{p.id}</td>
                        <td className="p-3 font-bold text-gray-800">{p.cliente?.nome || '—'}</td>
                        <td className="p-3 text-gray-600">{p.dataPedido}</td>
                        <td className="p-3 font-bold text-gray-800">R$ {Number(p.valorTotal).toFixed(2)}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => dispararWhatsAppComprovante(p)}
                            className="bg-[#25D366] hover:bg-[#1ebd59] text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase shadow-sm"
                          >
                            💬 Enviado no Whats
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
      </div>
    </div>
  );
};

export default TelaPedidos;