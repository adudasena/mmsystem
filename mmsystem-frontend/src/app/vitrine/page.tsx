'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, ChangeEvent } from 'react';
import { AxiosError } from 'axios';
import api from '@/services/api';

// ─── Interfaces / Tipagens ──────────────────────────────────────────────────
export interface ProdutoVitrine {
  id: number;
  nome: string;
  descricao?: string;
  preco: number | string;
  categoria: string;
  imagemUrl?: string;
  fotos?: string[] | string;
  quantidadeEstoque?: number;
  coresC?: string[];
  tamanhosC?: string[];
  coresSelecionadas?: string[] | string;
  tamanhosSelecionados?: string[] | string;
  estoqueDetalhado?: Record<string, number> | string;
}

export interface ItemCarrinho {
  produtoId: number;
  nome: string;
  preco: number;
  tamanhoEscolhido: string;
  corEscolhida: string;
  quantidade: number;
  imagemUrl?: string;
}

interface PageSpring<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

interface ApiErrorResponse {
  message?: string;
  erro?: string;
}

export default function VitrineProdutos() {
  const [produtos, setProdutos] = useState<ProdutoVitrine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  // Filtros
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('');
  const [tamanhoFiltro, setTamanhoFiltro] = useState<string>('');

  // Estados do Modal / Sacola
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoVitrine | null>(null);
  const [tamanho, setTamanho] = useState<string>('M');
  const [cor, setCor] = useState<string>('Padrão');
  const [quantidade, setQuantidade] = useState<number>(1);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [mostrarCarrinho, setMostrarCarrinho] = useState<boolean>(false);

  // ─── Efeito de Inicialização Compatível com Paginação ───
  useEffect(() => {
    let montado = true;

    const carregarProdutosInicial = async () => {
      try {
        setLoading(true);
        setErro(null);
        // Busca 50 itens para preencher a vitrine inicial
        const res = await api.get<PageSpring<ProdutoVitrine> | ProdutoVitrine[]>('/produtos?size=50');
        
        if (montado) {
          if (res.data && Array.isArray((res.data as PageSpring<ProdutoVitrine>).content)) {
            // Trata o objeto paginado do Spring Data
            setProdutos((res.data as PageSpring<ProdutoVitrine>).content);
          } else if (Array.isArray(res.data)) {
            // Trata resposta como lista simples se não for paginado
            setProdutos(res.data);
          } else {
            setProdutos([]);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar catálogo da vitrine via Axios:', err);
        if (montado) {
          setErro('Não foi possível carregar o catálogo de produtos.');
          setProdutos([]);
        }
      } finally {
        if (montado) {
          setLoading(false);
        }
      }
    };

    carregarProdutosInicial();

    return () => {
      montado = false;
    };
  }, []);

  // Helper para obter a foto do produto
  const obterImagemUrl = (prod: ProdutoVitrine): string => {
    if (prod.imagemUrl) return prod.imagemUrl;
    if (prod.fotos) {
      try {
        const arr = typeof prod.fotos === 'string' ? JSON.parse(prod.fotos) : prod.fotos;
        if (Array.isArray(arr) && arr.length > 0) return arr[0];
      } catch {
        return '';
      }
    }
    return '';
  };

  // Adicionar à Sacola
  const adicionarAoCarrinho = (): void => {
    if (!produtoSelecionado) return;

    const precoNum = Number(produtoSelecionado.preco || 0);

    const novoItem: ItemCarrinho = {
      produtoId: produtoSelecionado.id,
      nome: produtoSelecionado.nome,
      preco: precoNum,
      imagemUrl: obterImagemUrl(produtoSelecionado),
      quantidade: Number(quantidade),
      corEscolhida: cor,
      tamanhoEscolhido: tamanho,
    };

    setCarrinho((prev) => [...prev, novoItem]);
    setProdutoSelecionado(null);
    setQuantidade(1);
    setMostrarCarrinho(true);
  };

  // Finalizar e Enviar via WhatsApp e Backend Spring Boot
  const finalizarPedido = async (): Promise<void> => {
    if (carrinho.length === 0) return;

    const payload = {
      usuarioId: 1, // ID padrão cliente vitrine
      itens: carrinho.map((item) => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        corEscolhida: item.corEscolhida,
        tamanhoEscolhido: item.tamanhoEscolhido,
      })),
    };

    try {
      await api.post('/pedidos/vitrine', payload);

      const resumo = carrinho
        .map((i) => `• ${i.quantidade}x ${i.nome} (${i.tamanhoEscolhido} / ${i.corEscolhida})`)
        .join('\n');
      const msgWhatsapp = encodeURIComponent(
        `Olá Maria Morena! Gostaria de agendar condicional/compra desses itens:\n\n${resumo}\n\n*Total Estimado:* R$ ${totalCarrinho.toFixed(2)}`
      );

      alert('✨ Pedido registrado! Redirecionando para o WhatsApp...');
      window.open(`https://wa.me/5543999999999?text=${msgWhatsapp}`, '_blank');

      setCarrinho([]);
      setMostrarCarrinho(false);
    } catch (err) {
      const erroAxios = err as AxiosError<ApiErrorResponse>;
      console.error('Erro ao registrar pedido:', erroAxios);
      alert('Erro ao finalizar: ' + (erroAxios.response?.data?.message || 'Falha na conexão com a API.'));
    }
  };

  // Filtragem local segura com Array.isArray
  const produtosFiltrados = (Array.isArray(produtos) ? produtos : []).filter((p) => {
    const atendeCategoria = !categoriaFiltro || p.categoria === categoriaFiltro;
    return atendeCategoria;
  });

  const totalCarrinho = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

  return (
    <div className="min-h-screen bg-[#dcded0] text-gray-800 font-sans pb-12">
      {/* HEADER / BARRA SUPERIOR */}
      <header className="bg-[#2c3e1c] text-white py-3 px-4 md:px-8 sticky top-0 z-40 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img 
            src="/escritocompleto1linha.svg" 
            alt="Maria Morena Logo" 
            className="h-9 w-auto invert brightness-200" 
          />
        </div>

        <button
          type="button"
          onClick={() => setMostrarCarrinho(true)}
          className="relative bg-[#3d5427] hover:bg-[#48632e] text-white text-sm px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow cursor-pointer"
        >
          <span>🛒 Sacola</span>
          {carrinho.length > 0 && (
            <span className="bg-[#dcded0] text-[#2c3e1c] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {carrinho.length}
            </span>
          )}
        </button>
      </header>

      {/* TITULO DA VITRINE + FILTROS */}
      <section className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-[#2c3e1c]">Vitrine Digital</h1>
        </div>

        {/* CONTROLES DE FILTRO */}
        <div className="flex gap-3 mb-6">
          <select
            value={categoriaFiltro}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategoriaFiltro(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none"
          >
            <option value="">Todas as Categorias ▼</option>
            <option value="Vestidos">Vestidos</option>
            <option value="Blusas">Blusas</option>
            <option value="Calças">Calças</option>
            <option value="Saias">Saias</option>
            <option value="Camisas">Camisas</option>
            <option value="Shorts">Shorts</option>
          </select>

          <select
            value={tamanhoFiltro}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setTamanhoFiltro(e.target.value)}
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
        {loading && <p className="text-center py-10 text-gray-600 font-medium">Carregando peças da coleção...</p>}
        {erro && <p className="text-center py-10 text-red-600 font-bold">{erro}</p>}

        {!loading && !erro && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {produtosFiltrados.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500 italic">
                Nenhum produto encontrado para esta categoria.
              </div>
            ) : (
              produtosFiltrados.map((prod) => {
                const srcFoto = obterImagemUrl(prod);

                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between border border-gray-200/60 p-2"
                  >
                    <div>
                      {/* CONTAINER DA IMAGEM */}
                      <div className="h-56 bg-gray-100 rounded-xl overflow-hidden relative mb-2 flex items-center justify-center text-gray-400">
                        {srcFoto ? (
                          <img
                            src={srcFoto}
                            alt={prod.nome}
                            className="w-full h-full object-cover"
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-xs text-gray-400 italic">Sem imagem</span>
                        )}

                        {/* BADGE DE STATUS */}
                        <span className="absolute bottom-2 left-2 bg-[#b2c082] text-[#2c3e1c] text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase shadow-sm">
                          {(prod.quantidadeEstoque ?? 1) > 0
                            ? `${prod.quantidadeEstoque || 2} DISPONÍVEIS`
                            : 'EM CONDICIONAL'}
                        </span>
                      </div>

                      {/* INFO DO PRODUTO */}
                      <div className="px-1">
                        <h3 className="font-semibold text-sm text-gray-900 truncate">{prod.nome}</h3>
                        <p className="text-xs font-bold text-gray-800 mb-2">
                          R$ {Number(prod.preco || 0).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>

                    {/* BOTÃO DE AÇÃO */}
                    <button
                      type="button"
                      onClick={() => {
                        setProdutoSelecionado(prod);
                        setCor('Padrão');
                        setTamanho('M');
                      }}
                      className="w-full bg-[#2c3e1c] hover:bg-[#3d5427] text-white font-medium py-2 rounded-xl text-xs transition shadow-sm cursor-pointer"
                    >
                      Ver Detalhes / Comprar
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>

      {/* MODAL DE SELEÇÃO DE DETALHES */}
      {produtoSelecionado && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#f7f7f5] rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setProdutoSelecionado(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold text-[#2c3e1c]">{produtoSelecionado.nome}</h2>
            <p className="text-[#2c3e1c] font-extrabold text-xl mb-4">
              R$ {Number(produtoSelecionado.preco || 0).toFixed(2).replace('.', ',')}
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Tamanho:</label>
              <div className="flex gap-2">
                {['PP', 'P', 'M', 'G', 'GG'].map((tam) => (
                  <button
                    key={tam}
                    type="button"
                    onClick={() => setTamanho(tam)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
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
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCor(e.target.value)}
                placeholder="Ex: Verde Oliva, Preto..."
                className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs font-medium focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={adicionarAoCarrinho}
              className="w-full bg-[#2c3e1c] hover:bg-[#3d5427] text-white py-3 rounded-2xl text-xs font-bold uppercase shadow-lg transition cursor-pointer"
            >
              Adicionar à Sacola de Interesse
            </button>
          </div>
        </div>
      )}

      {/* DRAWER DA SACOLA */}
      {mostrarCarrinho && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm h-full p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h2 className="text-base font-bold text-[#2c3e1c]">Sacola de Interesse 🛍️</h2>
                <button
                  type="button"
                  onClick={() => setMostrarCarrinho(false)}
                  className="text-gray-400 hover:text-black font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {carrinho.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-10">Nenhum item adicionado ainda.</p>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {carrinho.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-[#f7f7f5] p-3 rounded-xl border border-gray-100"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-gray-800">{item.nome}</h4>
                        <p className="text-[11px] text-gray-500">
                          Tam: {item.tamanhoEscolhido} | Cor: {item.corEscolhida}
                        </p>
                        <p className="text-xs font-extrabold text-[#2c3e1c]">
                          R$ {item.preco.toFixed(2).replace('.', ',')}
                        </p>
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
                  type="button"
                  onClick={finalizarPedido}
                  className="w-full bg-[#2c3e1c] hover:bg-[#3d5427] text-white py-3 rounded-2xl text-xs font-bold uppercase transition shadow-md cursor-pointer"
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
}