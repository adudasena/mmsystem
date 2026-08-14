import React, { useState, useEffect } from 'react';
import LogoMariaMorena from '../assets/escritocompleto1linha.svg';

const VitrineProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Filtros conforme o protótipo
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [tamanhoFiltro, setTamanhoFiltro] = useState('');

  // Estados do Modal / Sacola
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [tamanho, setTamanho] = useState('M');
  const [cor, setCor] = useState('Padrão');
  const [quantidade, setQuantidade] = useState(1);
  const [carrinho, setCarrinho] = useState([]);
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8080/produtos')
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao carregar os produtos.');
        return res.json();
      })
      .then((data) => {
        setProdutos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErro('Não foi possível carregar o catálogo.');
        setLoading(false);
      });
  }, []);

  // Adicionar à Sacola
  const adicionarAoCarrinho = () => {
    if (!produtoSelecionado) return;

    const novoItem = {
      produtoId: produtoSelecionado.id,
      nome: produtoSelecionado.nome,
      preco: produtoSelecionado.preco,
      imagemUrl: produtoSelecionado.imagemUrl,
      quantidade: Number(quantidade),
      corEscolhida: cor,
      tamanhoEscolhido: tamanho,
    };

    setCarrinho([...carrinho, novoItem]);
    setProdutoSelecionado(null);
    setQuantidade(1);
  };

  // Finalizar e Enviar via WhatsApp / Backend
  const finalizarPedido = () => {
    if (carrinho.length === 0) return;

    const payload = {
      usuarioId: 1,
      itens: carrinho.map((item) => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        corEscolhida: item.corEscolhida,
        tamanhoEscolhido: item.tamanhoEscolhido,
      })),
    };

    fetch('http://localhost:8080/pedidos/vitrine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao registrar pedido.');
        
        // Mensagem formatada para o WhatsApp
        const resumo = carrinho.map(i => `• ${i.quantidade}x ${i.nome} (${i.tamanhoEscolhido})`).join('\n');
        const msgWhatsapp = encodeURIComponent(`Olá Maria Morena! Gostaria de agendar condicional/compra desses itens:\n\n${resumo}`);
        
        alert('✨ Pedido registrado! Redirecionando para o WhatsApp...');
        window.open(`https://wa.me/5543999999999?text=${msgWhatsapp}`, '_blank');
        
        setCarrinho([]);
        setMostrarCarrinho(false);
      })
      .catch((err) => alert('Erro ao finalizar: ' + err.message));
  };

  // Filtragem local
  const produtosFiltrados = produtos.filter(p => {
    const atendeCategoria = !categoriaFiltro || p.categoria === categoriaFiltro;
    return atendeCategoria;
  });

  const totalCarrinho = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

  return (
    <div className="min-h-screen bg-[#dcded0] text-gray-800 font-sans pb-12">
      {/* HEADER / BARRA SUPERIOR */}
      <header className="bg-[#2c3e1c] text-white py-3 px-4 md:px-8 sticky top-0 z-40 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={LogoMariaMorena} alt="Maria Morena Logo" className="h-9 w-auto" />
        </div>

        <button
          onClick={() => setMostrarCarrinho(true)}
          className="relative bg-[#3d5427] hover:bg-[#48632e] text-white text-sm px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow"
        >
          <span>🛒 Sacola</span>
          {carrinho.length > 0 && (
            <span className="bg-[#dcded0] text-[#2c3e1c] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {carrinho.length}
            </span>
          )}
        </button>
      </header>

      {/* TITULO DA VITRINE + FILTROS DO PROTÓTIPO */}
      <section className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-[#2c3e1c]">Vitrine Digital</h1>
        </div>

        {/* CONTROLES DE FILTRO */}
        <div className="flex gap-3 mb-6">
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none"
          >
            <option value="">Todas as Categoria ▼</option>
            <option value="Vestidos">Vestidos</option>
            <option value="Blusas">Blusas</option>
            <option value="Calças">Calças</option>
            <option value="Saia">Saias</option>
          </select>

          <select
            value={tamanhoFiltro}
            onChange={(e) => setTamanhoFiltro(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none"
          >
            <option value="">Tamanhos ▼</option>
            <option value="PP">PP</option>
            <option value="P">P</option>
            <option value="M">M</option>
            <option value="G">G</option>
            <option value="GG">GG</option>
          </select>
        </div>

        {/* LISTAGEM DOS CARDS */}
        {loading && <p className="text-center py-10 text-gray-600">Carregando peças da coleção...</p>}
        {erro && <p className="text-center py-10 text-red-600">{erro}</p>}

        {!loading && !erro && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {produtosFiltrados.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between border border-gray-200/60 p-2"
              >
                <div>
                  {/* CONTAINER DA IMAGEM COM FALLBACK LIMPO */}
                  <div className="h-56 bg-gray-100 rounded-xl overflow-hidden relative mb-2 flex items-center justify-center text-gray-400">
                    {prod.imagemUrl ? (
                      <img
                        src={prod.imagemUrl}
                        alt={prod.nome}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-xs text-gray-400 italic">Sem imagem</span>
                    )}

                    {/* BADGE DE STATUS (IDENTICO AO PROTÓTIPO) */}
                    <span className="absolute bottom-2 left-2 bg-[#b2c082] text-[#2c3e1c] text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase shadow-sm">
                      {prod.quantidadeEstoque > 0 ? `${prod.quantidadeEstoque || 2} DISPONÍVEIS` : 'EM CONDICIONAL'}
                    </span>
                  </div>

                  {/* INFO DO PRODUTO */}
                  <div className="px-1">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">{prod.nome}</h3>
                    <p className="text-xs font-bold text-gray-800 mb-2">
                      R$ {Number(prod.preco).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>

                {/* BOTÃO DE AÇÃO DO CARD */}
                <button
                  onClick={() => setProdutoSelecionado(prod)}
                  className="w-full bg-[#2c3e1c] hover:bg-[#3d5427] text-white font-medium py-2 rounded-xl text-xs transition shadow-sm"
                >
                  Ver Detalhes / Comprar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MODAL DE SELEÇÃO DE DETALHES */}
      {produtoSelecionado && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#f7f7f5] rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setProdutoSelecionado(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold text-[#2c3e1c]">{produtoSelecionado.nome}</h2>
            <p className="text-[#2c3e1c] font-extrabold text-xl mb-4">
              R$ {Number(produtoSelecionado.preco).toFixed(2).replace('.', ',')}
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Tamanho:</label>
              <div className="flex gap-2">
                {['PP', 'P', 'M', 'G', 'GG'].map((tam) => (
                  <button
                    key={tam}
                    onClick={() => setTamanho(tam)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      tamanho === tam
                        ? 'bg-[#2c3e1c] text-white border-[#2c3e1c]'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    {tam}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Cor:</label>
              <input
                type="text"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                placeholder="Ex: Verde Oliva, Preto..."
                className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs font-medium focus:outline-none"
              />
            </div>

            <button
              onClick={adicionarAoCarrinho}
              className="w-full bg-[#2c3e1c] hover:bg-[#3d5427] text-white py-3 rounded-2xl text-xs font-bold uppercase shadow-lg transition"
            >
              Adicionar à Sacola de Interesse
            </button>
          </div>
        </div>
      )}

      {/* DRAWER DA SACOLA (WHATSAPP) */}
      {mostrarCarrinho && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="bg-white w-full max-w-sm h-full p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h2 className="text-base font-bold text-[#2c3e1c]">Sacola de Interesse 🛍️</h2>
                <button onClick={() => setMostrarCarrinho(false)} className="text-gray-400 font-bold">✕</button>
              </div>

              {carrinho.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-10">Nenhum item adicionado ainda.</p>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {carrinho.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-[#f7f7f5] p-3 rounded-xl border border-gray-100">
                      <div>
                        <h4 className="font-bold text-xs text-gray-800">{item.nome}</h4>
                        <p className="text-[11px] text-gray-500">Tam: {item.tamanhoEscolhido} | Cor: {item.corEscolhida}</p>
                        <p className="text-xs font-extrabold text-[#2c3e1c]">R$ {item.preco.toFixed(2).replace('.', ',')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {carrinho.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-sm font-bold mb-4">
                  <span>Subtotal:</span>
                  <span className="text-[#2c3e1c]">R$ {totalCarrinho.toFixed(2).replace('.', ',')}</span>
                </div>
                <button
                  onClick={finalizarPedido}
                  className="w-full bg-[#2c3e1c] hover:bg-[#3d5427] text-white py-3 rounded-2xl text-xs font-bold uppercase transition shadow-md"
                >
                  FINALIZAR PEDIDO (WhatsApp) 💬
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VitrineProdutos;