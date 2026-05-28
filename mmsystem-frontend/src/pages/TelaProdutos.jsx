import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TelaProdutos = () => {
  const [editandoId, setEditandoId] = useState(null);
  const [listaProdutos, setListaProdutos] = useState([]);
  
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [errosValidacao, setErrosValidacao] = useState([]);

  const [novoTamanhoTexto, setNovoTamanhoTexto] = useState('');
  const [novaCorNome, setNovaCorNome] = useState('');
  const [novaCorHex, setNovaCorHex] = useState('#000000');
  const [novaCategoriaTexto, setNovaCategoriaTexto] = useState('');

  const [modalEstoqueAberto, setModalEstoqueAberto] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState({ aberto: false, dados: null });
  const [modalExcluir, setModalExcluir] = useState({ aberto: false, id: null });

  const [produto, setProduto] = useState({
    nome: '', categoria: '', descricao: '', preco: '',
    tamanhosSelecionados: [], coresSelecionadas: [], estoqueDetalhado: {},
    fotos: [] 
  });

  const [tamanhos, setTamanhos] = useState(['PP', 'P', 'M', 'G', 'GG', 'G1', 'G2']);
  const [categorias, setCategorias] = useState(['Blusas', 'Vestidos', 'Saias', 'Camisas', 'Calças', 'Shorts']);
  const [listaCores, setListaCores] = useState([
    { nome: 'Vermelho', hex: '#e11d48' }, { nome: 'Amarelo', hex: '#facc15' },
    { nome: 'Laranja', hex: '#ea580c' }, { nome: 'Verde', hex: '#16a34a' }, 
    { nome: 'Branco', hex: '#ffffff' }, { nome: 'Rosa', hex: '#f472b6' },
    { nome: 'Azul', hex: '#2563eb' }, { nome: 'Preto', hex: '#000000' }, 
    { nome: 'Roxo', hex: '#9333ea' },
  ]);

  const buscarProdutos = async () => {
    try {
      const resposta = await api.get('/produtos');
      setListaProdutos(resposta.data);
    } catch (erro) { 
      console.error("Erro ao buscar:", erro); 
    }
  };

  useEffect(() => { buscarProdutos(); }, []);

  const adicionarCategoriaCustomizada = () => {
    const cat = novaCategoriaTexto.trim();
    if (!cat) return;
    const catFormatada = cat.charAt(0).toUpperCase() + cat.slice(1);
    
    if (categorias.some(c => c.toLowerCase() === catFormatada.toLowerCase())) {
      setErrosValidacao(['Esta categoria já está cadastrada.']);
      return;
    }
    setCategorias([...categorias, catFormatada]);
    setProduto({ ...produto, categoria: catFormatada });
    setNovaCategoriaTexto('');
    setErrosValidacao([]);
  };

  const adicionarTamanhoCustomizado = () => {
    const tam = novoTamanhoTexto.trim().toUpperCase();
    if (!tam) return;
    if (tamanhos.includes(tam)) {
      setErrosValidacao(['Este tamanho já está cadastrado.']);
      return;
    }
    setTamanhos([...tamanhos, tam]);
    setNovoTamanhoTexto('');
    setErrosValidacao([]);
  };

  const adicionarCorCustomizada = () => {
    const nome = novaCorNome.trim();
    if (!nome) return;
    if (listaCores.some(c => c.nome.toLowerCase() === nome.toLowerCase())) {
      setErrosValidacao(['Esta cor já está cadastrada.']);
      return;
    }
    setListaCores([...listaCores, { nome, hex: novaCorHex }]);
    setNovaCorNome('');
    setErrosValidacao([]);
  };

  const handleFotos = (e) => {
    const arquivos = Array.from(e.target.files);
    setErrosValidacao([]);
    arquivos.forEach(arquivo => {
      const reader = new FileReader();
      reader.readAsDataURL(arquivo);
      reader.onloadend = () => {
        setProduto(prev => {
          if (prev.fotos.includes(reader.result)) return prev;
          return {
            ...prev,
            fotos: [...prev.fotos, reader.result].slice(0, 4)
          };
        });
      };
    });
  };

  const removerFoto = (index) => {
    setProduto(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index)
    }));
  };

  const prepararEdicao = (p) => {
    setEditandoId(p.id);
    setErrosValidacao([]);
    setMensagemSucesso('');

    const parseSeguro = (dado, tipoDefeito) => {
      if (!dado) return tipoDefeito;
      if (typeof dado === 'object') return dado; // Se já vier convertido do Axios, usa direto
      try { return JSON.parse(dado); } catch (e) { return tipoDefeito; }
    };

    setProduto({
      nome: p.nome || '',
      categoria: p.categoria || '',
      descricao: p.descricao || '',
      preco: p.preco || '',
      tamanhosSelecionados: parseSeguro(p.tamanhosSelecionados, []),
      coresSelecionadas: parseSeguro(p.coresSelecionadas, []),
      estoqueDetalhado: parseSeguro(p.estoqueDetalhado, {}),
      fotos: parseSeguro(p.fotos, [])
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const abrirGestaoEstoque = () => {
    if (produto.coresSelecionadas.length === 0 || produto.tamanhosSelecionados.length === 0) {
      setErrosValidacao(["Defina as cores e tamanhos do produto antes de abrir a gestão de estoque."]);
      return;
    }
    setErrosValidacao([]);
    setModalEstoqueAberto(true);
  };

  const atualizarQtdEstoque = (chave, valor) => {
    const qtd = Math.max(0, parseInt(valor) || 0);
    setProduto(prev => ({
      ...prev,
      estoqueDetalhado: { ...prev.estoqueDetalhado, [chave]: qtd }
    }));
  };

  const validarFormulario = () => {
    const erros = [];
    if (!produto.nome.trim()) erros.push("O nome do produto é obrigatório.");
    if (produto.nome.length > 80) erros.push("O nome do produto não pode conter mais de 80 caracteres.");
    if (!produto.categoria) erros.push("Selecione ou cadastre uma categoria para o produto.");
    if (produto.descricao.length > 500) erros.push("A descrição do produto atingiu o limite máximo de 500 caracteres.");
    
    const precoNum = Number(produto.preco);
    if (!produto.preco || isNaN(precoNum) || precoNum <= 0) {
      erros.push("O preço deve ser um valor numérico válido e maior que R$ 0,00.");
    }
    if (precoNum > 99999.99) {
      erros.push("O preço máximo permitido para cadastro é R$ 99.999,99.");
    }

    if (produto.coresSelecionadas.length === 0) erros.push("Selecione pelo menos uma cor válida.");
    if (produto.tamanhosSelecionados.length === 0) erros.push("Selecione pelo menos um tamanho.");
    if (produto.fotos.length === 0) erros.push("Insira ao menos 1 foto para realizar o cadastro do produto.");

    const totalEstoque = Object.values(produto.estoqueDetalhado).reduce((a, b) => a + b, 0);
    if (totalEstoque === 0) erros.push("Configure a grade de estoque. O estoque total não pode ser zero.");

    return erros;
  };

  const salvarProduto = async () => {
    const erros = validarFormulario();
    if (erros.length > 0) {
      setErrosValidacao(erros);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setErrosValidacao([]);
      
      // Monta o payload garantindo que as listas vão estruturadas para o back-end
      const dadosParaSalvar = {
        ...produto,
        preco: Number(produto.preco)
      };

      if (editandoId) {
        await api.put(`/produtos/${editandoId}`, dadosParaSalvar);
        setMensagemSucesso('Produto atualizado com sucesso no MM System!');
      } else {
        await api.post('/produtos', dadosParaSalvar);
        setMensagemSucesso('Produto cadastrado com sucesso!');
      }

      resetarForm();
      buscarProdutos();
      setTimeout(() => setMensagemSucesso(''), 5000);
    } catch (erro) {
      console.error(erro);
      const backendMsg = erro.response?.data?.message || 'Erro inesperado na validação do servidor Java.';
      setErrosValidacao([backendMsg]);
    }
  };

  const confirmarExclusao = async () => {
    try {
      await api.delete(`/produtos/${modalExcluir.id}`);
      setMensagemSucesso("Produto removido com sucesso do banco de dados.");
      setModalExcluir({ aberto: false, id: null });
      buscarProdutos();
      setTimeout(() => setMensagemSucesso(''), 5000);
    } catch (erro) {
      setErrosValidacao(["Não foi possível processar a exclusão. Verifique se o produto está em um condicional ativo."]);
      setModalExcluir({ aberto: false, id: null });
    }
  };

  const resetarForm = () => {
    setEditandoId(null);
    setErrosValidacao([]);
    setProduto({ nome:'', categoria:'', descricao:'', preco:'', tamanhosSelecionados:[], coresSelecionadas:[], estoqueDetalhado:{}, fotos: [] });
  };

  const verDetalhes = (p) => {
    const parseJSON = (dado) => {
      if (typeof dado === 'object') return dado;
      try { return typeof dado === 'string' ? JSON.parse(dado) : dado; } catch { return {}; }
    };
    setModalDetalhes({
      aberto: true,
      dados: {
        ...p,
        estoqueDetalhado: parseJSON(p.estoqueDetalhado),
        coresC: parseJSON(p.coresSelecionadas),
        tamanhosC: parseJSON(p.tamanhosSelecionados)
      }
    });
  };

  // 🧵 CORREÇÃO COMPORTAMENTAL: Permite apagar o input sem preencher com 0 fixo
  const handlePrecoInput = (e) => {
    const valor = e.target.value;
    if (valor.length <= 8) {
      setProduto({ ...produto, preco: valor });
    }
  };

  return (
    <div className="flex-1 p-10 bg-[#d9d9ce] min-h-screen font-sans text-gray-800 relative">
      <header className="mb-6">
        <h2 className="text-3xl font-serif italic text-gray-700">
          {editandoId ? 'Editando Produto' : 'Novo/Editar Produto'}
        </h2>
      </header>

      {errosValidacao.length > 0 && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-600 p-4 text-red-900 rounded-sm shadow-sm max-w-5xl">
          <p className="font-bold text-xs uppercase tracking-wide mb-1">Inconsistências encontradas:</p>
          <ul className="list-disc list-inside text-xs space-y-0.5">
            {errosValidacao.map((err, index) => <li key={index}>{err}</li>)}
          </ul>
        </div>
      )}

      {mensagemSucesso && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-600 p-3 text-green-900 font-semibold text-xs rounded-sm shadow-sm max-w-5xl">
          ✓ {mensagemSucesso}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 max-w-5xl">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
            <label className="block text-[11px] font-bold uppercase mb-2 text-gray-500">Nome do produto (Max 80 caracteres)</label>
            <input maxLength={80} value={produto.nome} onChange={e => setProduto({...produto, nome: e.target.value})} className="w-full border p-2 bg-gray-50 outline-none focus:border-gray-400" />
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold uppercase mb-2 text-gray-500">Categoria</label>
                <select value={produto.categoria} onChange={e => setProduto({...produto, categoria: e.target.value})} className="w-full border p-2 bg-gray-50 outline-none focus:border-gray-400">
                  <option value="">Selecione...</option>
                  {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <div className="flex gap-1">
                  <input type="text" placeholder="Nova Categoria" value={novaCategoriaTexto} onChange={e => setNovaCategoriaTexto(e.target.value)} className="w-full text-xs border p-2 outline-none bg-gray-50 focus:border-gray-400" />
                  <button type="button" onClick={adicionarCategoriaCustomizada} className="bg-gray-800 text-white text-xs px-3 font-bold hover:bg-black" title="Cadastrar nova categoria">+</button>
                </div>
              </div>
            </div>

            <label className="block text-[11px] font-bold uppercase mt-4 mb-2 text-gray-500">Descrição curta ({produto.descricao.length}/500)</label>
            <textarea maxLength={500} value={produto.descricao} onChange={e => setProduto({...produto, descricao: e.target.value})} className="w-full border p-2 h-28 bg-gray-50 outline-none resize-none focus:border-gray-400" />
          </div>

          <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-[11px] font-bold uppercase text-gray-500">Imagens do produto (Mínimo 1, Máximo 4)</label>
              <span className="text-[10px] font-mono text-gray-400">{produto.fotos.length}/4 Carregadas</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {produto.fotos.length < 4 && (
                <label className="min-w-[100px] h-[100px] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 rounded transition">
                  <span className="text-xl">📸</span>
                  <span className="text-[8px] font-bold uppercase text-gray-500">ADICIONAR</span>
                  <input type="file" accept="image/*" multiple onChange={handleFotos} className="hidden" />
                </label>
              )}
              {produto.fotos.map((foto, i) => (
                <div key={i} className="min-w-[100px] h-[100px] border bg-gray-50 rounded flex items-center justify-center relative overflow-hidden group">
                  <img src={foto} className="w-full h-full object-cover" alt="preview" />
                  <button type="button" onClick={() => removerFoto(i)} className="absolute inset-0 bg-black/70 text-white font-bold opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[10px] uppercase">
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase mb-2 text-gray-500">Preço (R$)</label>
              <input type="number" min="0.01" max="99999.99" step="0.01" value={produto.preco} onChange={handlePrecoInput} placeholder="0.00" className="w-full border p-2 bg-gray-50 outline-none focus:border-gray-400 font-medium" />
            </div>
            <div onClick={abrirGestaoEstoque} className="cursor-pointer group">
              <label className="block text-[11px] font-bold uppercase mb-2 text-gray-500 group-hover:text-black">Grade Estoque ⚙️</label>
              <div className="w-full border p-2 bg-gray-100 font-bold text-center text-[#4a5d33] group-hover:bg-[#4a5d33] group-hover:text-white transition">
                {Object.values(produto.estoqueDetalhado).reduce((a, b) => a + b, 0)} un
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
            <label className="block text-[11px] font-bold uppercase mb-3 text-center text-gray-500">Tamanhos Disponíveis</label>
            <div className="flex flex-wrap gap-1.5 justify-center mb-4">
              {tamanhos.map(t => (
                <button key={t} type="button" onClick={() => {
                  const novos = produto.tamanhosSelecionados.includes(t) ? produto.tamanhosSelecionados.filter(x => x !== t) : [...produto.tamanhosSelecionados, t];
                  setProduto({...produto, tamanhosSelecionados: novos});
                }} className={`w-9 h-9 text-[10px] font-bold border transition-all ${produto.tamanhosSelecionados.includes(t) ? 'bg-black text-white border-black' : 'bg-white text-gray-400 hover:border-gray-400'}`}>{t}</button>
              ))}
            </div>
            <div className="flex gap-1 border-t pt-3">
              <input type="text" placeholder="Novo tamanho (ex: G3)" value={novoTamanhoTexto} onChange={e => setNovoTamanhoTexto(e.target.value)} className="flex-1 text-xs border p-1 outline-none uppercase font-mono" />
              <button type="button" onClick={adicionarTamanhoCustomizado} className="bg-gray-800 text-white text-xs px-3 font-bold hover:bg-black">+</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
            <label className="block text-[11px] font-bold uppercase mb-3 text-gray-500">Cores Disponíveis</label>
            <div className="grid grid-cols-2 gap-y-2.5 max-h-40 overflow-y-auto mb-4 pr-1">
              {listaCores.map(c => (
                <label key={c.nome} className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="w-3 h-3 accent-[#4a5d33]" checked={produto.coresSelecionadas.includes(c.nome)} onChange={() => {
                     const novos = produto.coresSelecionadas.includes(c.nome) ? produto.coresSelecionadas.filter(x => x !== c.nome) : [...produto.coresSelecionadas, c.nome];
                     setProduto({...produto, coresSelecionadas: novos});
                  }}/>
                  <div className="w-3 h-3 rounded-full border border-gray-300" style={{backgroundColor: c.hex}}></div>
                  <span className="text-[10px] text-gray-600 font-semibold">{c.nome}</span>
                </label>
              ))}
            </div>
            <div className="flex flex-col gap-2 border-t pt-3">
              <div className="flex gap-1">
                <input type="text" placeholder="Nome da cor" value={novaCorNome} onChange={e => setNovaCorNome(e.target.value)} className="flex-1 text-xs border p-1 outline-none" />
                <input type="color" value={novaCorHex} onChange={e => setNovaCorHex(e.target.value)} className="w-8 h-7 cursor-pointer border p-0.5" />
                <button type="button" onClick={adicionarCorCustomizada} className="bg-gray-800 text-white text-xs px-3 font-bold hover:bg-black">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mb-12 max-w-5xl">
        <button onClick={resetarForm} className="px-10 py-2 bg-black text-white text-[11px] font-bold uppercase rounded-sm hover:opacity-80">Cancelar</button>
        <button onClick={salvarProduto} className="px-12 py-2 bg-[#4a5d33] text-white text-[11px] font-bold uppercase rounded-sm shadow-md hover:brightness-110">
          {editandoId ? 'Atualizar Produto' : 'Salvar Produto'}
        </button>
      </div>

      <section className="bg-white rounded-sm shadow-sm overflow-hidden border-t-4 border-[#4a5d33] max-w-5xl">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest">Produtos Cadastrados</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 border-b">
              <tr>
                <th className="p-4">Foto</th>
                <th className="p-4">Produto</th>
                <th className="p-4">Preço</th>
                <th className="p-4">Estoque Total</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {listaProdutos.map(p => {
                let totalCalculado = 0;
                try {
                  const est = typeof p.estoqueDetalhado === 'string' ? JSON.parse(p.estoqueDetalhado) : p.estoqueDetalhado;
                  totalCalculado = Object.values(est || {}).reduce((acc, curr) => acc + Number(curr || 0), 0);
                } catch(e){}

                return (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      {(() => {
                        try {
                          const f = typeof p.fotos === 'string' ? JSON.parse(p.fotos) : p.fotos;
                          return <img src={Array.isArray(f) ? f[0] : f} className="w-10 h-10 object-cover rounded border" alt="prod" />;
                        } catch(e) {
                          return <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-gray-300">👗</div>;
                        }
                      })()}
                    </td>
                    <td className="p-4 font-bold text-gray-800">{p.nome}</td>
                    <td className="p-4 text-gray-600 font-medium">
                      R$ {Number(p.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 font-bold text-[#4a5d33]">
                      {totalCalculado} un
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <button onClick={() => prepararEdicao(p)} className="text-blue-600 hover:underline font-bold">EDITAR</button>
                      <button onClick={() => setModalExcluir({ aberto: true, id: p.id })} className="text-red-600 hover:underline font-bold">EXCLUIR</button>
                      <button onClick={() => verDetalhes(p)} className="text-green-700 hover:underline font-bold">DETALHES</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL 1: GRADE ESTOQUE */}
      {modalEstoqueAberto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-sm border-t-4 border-[#4a5d33] w-full max-w-md max-h-[80vh] flex flex-col p-6 shadow-2xl relative">
            <button onClick={() => setModalEstoqueAberto(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold text-xl transition">
              ×
            </button>
            <h3 className="font-serif text-lg text-gray-900 border-b pb-2 mb-4">Lançador de Estoque por Variação</h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {produto.coresSelecionadas.map(cor => 
                produto.tamanhosSelecionados.map(tam => {
                  const chave = `${cor}-${tam}`;
                  return (
                    <div key={chave} className="flex items-center justify-between p-2 bg-gray-50 border rounded-sm">
                      <span className="text-xs font-semibold text-gray-700">{cor} — Tam {tam}</span>
                      <input type="number" min="0" value={produto.estoqueDetalhado[chave] || 0} onChange={e => atualizarQtdEstoque(chave, e.target.value)} className="w-20 text-center border p-1 text-xs font-bold bg-white outline-none focus:border-gray-400" />
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-6 pt-4 border-t flex justify-end">
              <button onClick={() => setModalEstoqueAberto(false)} className="px-6 py-2 bg-[#4a5d33] text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow hover:brightness-110">
                Confirmar Grade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EXCLUSÃO */}
      {modalExcluir.aberto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-sm border-t-4 border-red-600 w-full max-w-sm p-6 shadow-2xl">
            <h3 className="font-serif text-lg text-red-700 mb-2">⚠️ Excluir Registro</h3>
            <p className="text-xs text-gray-600 mb-6">Tem certeza absoluta de que deseja remover este produto? Essa operação apagará permanentemente os dados de estoque e fotos associados.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModalExcluir({ aberto: false, id: null })} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold uppercase text-[10px]">Cancelar</button>
              <button onClick={confirmarExclusao} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-[10px]">Confirmar Exclusão</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DETALHES */}
      {modalDetalhes.aberto && modalDetalhes.dados && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-sm border-t-4 border-gray-700 w-full max-w-lg max-h-[85vh] flex flex-col p-6 shadow-2xl">
            <div className="flex justify-between items-start border-b pb-3 mb-4">
              <div>
                <h3 className="font-serif text-xl text-gray-900 uppercase">{modalDetalhes.dados.nome}</h3>
                <span className="text-[9px] font-mono uppercase bg-gray-100 text-gray-500 px-1 border">ID interno: {modalDetalhes.dados.id}</span>
              </div>
              <button onClick={() => setModalDetalhes({ aberto: false, dados: null })} className="text-gray-400 hover:text-black font-bold text-xl">×</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-gray-700">
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 border">
                <p><strong>📂 Categoria:</strong> {modalDetalhes.dados.categoria}</p>
                <p><strong>💰 Preço Unitário:</strong> R$ {Number(modalDetalhes.dados.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="col-span-2"><strong>🎨 Cores Selecionadas:</strong> {Array.isArray(modalDetalhes.dados.coresC) ? modalDetalhes.dados.coresC.join(', ') : 'Nenhuma'}</p>
                <p className="col-span-2"><strong>📏 Tamanhos Selecionados:</strong> {Array.isArray(modalDetalhes.dados.tamanhosC) ? modalDetalhes.dados.tamanhosC.join(', ') : 'Nenhum'}</p>
              </div>
              {modalDetalhes.dados.descricao && (
                <div className="p-2 border-l-2 border-gray-400 italic bg-gray-50/50">
                  "{modalDetalhes.dados.descricao}"
                </div>
              )}
              <div>
                <p className="font-bold uppercase text-[10px] text-gray-400 tracking-wider mb-2">Grade de Distribuição do Estoque:</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {Object.entries(modalDetalhes.dados.estoqueDetalhado || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b pb-1 font-mono text-[11px]">
                      <span className="text-gray-500">• {key}:</span>
                      <span className="font-bold text-gray-900">{value} unidades</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t">
              <button onClick={() => setModalDetalhes({ aberto: false, dados: null })} className="w-full py-2 bg-gray-800 hover:bg-black text-white font-bold uppercase text-xs tracking-wider">
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelaProdutos;