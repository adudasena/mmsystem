import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TelaPagamentos = () => {
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarPagamentos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pagamentos');
      setPagamentos(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar pagamentos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPagamentos();
  }, []);

  return (
    <div className="p-6 md:p-8 bg-[#dcded0] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2d3a22]">Pagamentos & Lançamentos</h1>
          <p className="text-xs text-gray-600 mt-1">Acompanhamento dos métodos de pagamento e vencimentos.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50/50">
            <h2 className="text-xs font-bold uppercase text-gray-700">Histórico de Lançamentos ({pagamentos.length})</h2>
          </div>

          {loading ? (
            <p className="p-8 text-center text-xs text-gray-500">Carregando pagamentos...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#cbd0c0] font-bold uppercase text-gray-700">
                    <th className="p-3">#ID</th>
                    <th className="p-3">Pedido Ref.</th>
                    <th className="p-3">Método</th>
                    <th className="p-3">Vencimento</th>
                    <th className="p-3">Valor</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pagamentos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center italic text-gray-500">Nenhum pagamento registrado.</td>
                    </tr>
                  ) : (
                    pagamentos.map((pag) => (
                      <tr key={pag.id} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-500">#{pag.id}</td>
                        <td className="p-3 font-bold text-gray-800">Pedido #{pag.pedido?.id}</td>
                        <td className="p-3 font-mono text-gray-700">{pag.metodoPagamento}</td>
                        <td className="p-3 text-gray-600">{pag.dataVencimento || '—'}</td>
                        <td className="p-3 font-bold text-gray-800">R$ {Number(pag.valor).toFixed(2)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            pag.status === 'PAGO' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {pag.status}
                          </span>
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

export default TelaPagamentos;