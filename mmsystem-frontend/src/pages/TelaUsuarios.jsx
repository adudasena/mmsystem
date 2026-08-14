import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TelaUsuarios = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  // Estado para controle de edição
  const [clienteEmEdicao, setClienteEmEdicao] = useState(null);

  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    perfil: 'CLIENTE'
  });

  const carregarClientes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/usuarios');
      setClientes(res.data || []);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
      setErro("Não foi possível carregar a lista de clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  // Máscara dinâmica de WhatsApp
  const formatarTelefoneInput = (valor) => {
    if (!valor) return '';
    const nums = valor.replace(/\D/g, '');
    if (nums.length <= 10) {
      return nums.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    }
    return nums.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'telefone') {
      setFormData((prev) => ({ ...prev, telefone: formatarTelefoneInput(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Prepara o formulário para edição
  const handleEditar = (cliente) => {
    setClienteEmEdicao(cliente);
    setFormData({
      nome: cliente.nome || '',
      telefone: cliente.telefone ? formatarTelefoneInput(cliente.telefone) : '',
      email: cliente.email || '',
      perfil: cliente.perfil || 'CLIENTE'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelarEdicao = () => {
    setClienteEmEdicao(null);
    setFormData({ nome: '', telefone: '', email: '', perfil: 'CLIENTE' });
  };

  // Submissão (Cadastrar ou Atualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagemSucesso('');
    setErro('');

    const dadosParaEnvio = {
      ...formData,
      telefone: formData.telefone.replace(/\D/g, '')
    };

    try {
      if (clienteEmEdicao) {
        // Atualiza via PUT /usuarios/{id}
        await api.put(`/usuarios/${clienteEmEdicao.id}`, dadosParaEnvio);
        setMensagemSucesso("Cliente atualizado com sucesso! ✨");
      } else {
        // Cadastra via POST /usuarios
        await api.post('/usuarios', dadosParaEnvio);
        setMensagemSucesso("Cliente cadastrado com sucesso! ✨");
      }

      handleCancelarEdicao();
      carregarClientes();
      setTimeout(() => setMensagemSucesso(''), 4000);
    } catch (err) {
      console.error("Erro ao salvar cliente:", err);
      setErro("Falha ao salvar. Verifique se o telefone ou e-mail já existem na base.");
    }
  };

  // Exclusão com Soft Delete via DELETE /usuarios/{id}
  const handleExcluir = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir o cadastro de "${nome}"?`)) {
      try {
        await api.delete(`/usuarios/${id}`);
        setMensagemSucesso("Cliente removido com sucesso!");
        carregarClientes();
        setTimeout(() => setMensagemSucesso(''), 4000);
      } catch (err) {
        console.error("Erro ao excluir cliente:", err);
        setErro("Não foi possível excluir o cliente.");
      }
    }
  };

  // Monta a URL válida para disparo direto no WhatsApp
  const linkWhatsApp = (telefone) => {
    if (!telefone) return '#';
    const numLimpo = telefone.replace(/\D/g, '');
    return `https://wa.me/55${numLimpo}`;
  };

  // Filtro da busca
  const clientesFiltrados = clientes.filter(c => 
    c.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    c.telefone?.includes(busca) ||
    c.email?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 bg-[#dcded0] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* CABEÇALHO */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2d3a22]">
            Painel Administrativo - Clientes
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Gerenciamento e histórico de relacionamento com as clientes da loja.
          </p>
        </div>

        {/* METRICAS REAIS (Sem dados fakes fixos) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/80 flex items-center gap-4">
            <div className="p-3 bg-[#e8eae0] text-[#3b4a28] rounded-lg text-xl">
              👥
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Base Total de Clientes</p>
              <h3 className="text-2xl font-extrabold text-gray-800">{clientes.length}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/80 flex items-center gap-4">
            <div className="p-3 bg-[#e8eae0] text-[#3b4a28] rounded-lg text-xl">
              💬
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Com WhatsApp Cadastrado</p>
              <h3 className="text-2xl font-extrabold text-gray-800">
                {clientes.filter(c => c.telefone).length}
              </h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/80 flex items-center gap-4">
            <div className="p-3 bg-[#e8eae0] text-[#3b4a28] rounded-lg text-xl">
              📧
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Com E-mail Vinculado</p>
              <h3 className="text-2xl font-extrabold text-gray-800">
                {clientes.filter(c => c.email).length}
              </h3>
            </div>
          </div>
        </div>

        {/* FEEDBACKS DE MENSAGENS */}
        {mensagemSucesso && (
          <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg text-xs font-bold shadow-sm">
            {mensagemSucesso}
          </div>
        )}
        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg text-xs font-bold shadow-sm">
            {erro}
          </div>
        )}

        {/* CONTEÚDO PRINCIPAL (FORMULÁRIO + TABELA) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* FORMULÁRIO (CADASTRAR OU EDITAR) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#3b4a28]">
                {clienteEmEdicao ? `Editar Cliente (#${clienteEmEdicao.id})` : 'Cadastrar Novo Cliente'}
              </h2>
              {clienteEmEdicao && (
                <button 
                  onClick={handleCancelarEdicao}
                  className="text-[10px] text-red-600 font-bold uppercase hover:underline"
                >
                  Cancelar
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="nome"
                  required
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Ex: Maria Silva"
                  className="w-full border border-gray-300 p-2.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b4a28]/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  WhatsApp / Telefone *
                </label>
                <input
                  type="text"
                  name="telefone"
                  required
                  maxLength={15}
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(43) 99999-8888"
                  className="w-full border border-gray-300 p-2.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b4a28]/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="maria@email.com"
                  className="w-full border border-gray-300 p-2.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b4a28]/50"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#3b4a28] hover:bg-[#2d3a22] text-white font-bold text-xs py-3 px-4 rounded-lg uppercase tracking-wider transition-all shadow-sm"
              >
                {clienteEmEdicao ? 'Atualizar Cliente' : 'Salvar Cliente'}
              </button>
            </form>
          </div>

          {/* TABELA DE CLIENTES */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            <div className="p-4 border-b bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Clientes Cadastrados ({clientesFiltrados.length})
              </h2>
              <input 
                type="text" 
                placeholder="🔍 Buscar por nome, whats ou email..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full sm:w-64 border border-gray-300 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3b4a28]"
              />
            </div>

            {loading ? (
              <p className="p-8 text-center text-xs text-gray-500 font-medium">Carregando lista de clientes...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#cbd0c0] font-bold uppercase text-gray-700">
                      <th className="p-3 border-r border-gray-300/50">ID</th>
                      <th className="p-3 border-r border-gray-300/50">Nome</th>
                      <th className="p-3 border-r border-gray-300/50">WhatsApp</th>
                      <th className="p-3 border-r border-gray-300/50">E-mail</th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {clientesFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center italic text-gray-500">
                          Nenhum cliente cadastrado.
                        </td>
                      </tr>
                    ) : (
                      clientesFiltrados.map((cli) => (
                        <tr key={cli.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="p-3 border-r font-bold text-gray-500">#{cli.id}</td>
                          <td className="p-3 border-r font-bold text-gray-800">{cli.nome}</td>
                          <td className="p-3 border-r text-gray-600 font-mono">
                            {cli.telefone ? formatarTelefoneInput(cli.telefone) : '—'}
                          </td>
                          <td className="p-3 border-r text-gray-600">{cli.email || '—'}</td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              
                              {/* BOTAO WHATSAPP */}
                              {cli.telefone ? (
                                <a
                                  href={linkWhatsApp(cli.telefone)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 bg-[#25D366] hover:bg-[#1ebd59] text-white px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm"
                                  title="Iniciar conversa no WhatsApp"
                                >
                                  💬 Whats
                                </a>
                              ) : null}

                              {/* BOTAO EDITAR */}
                              <button
                                onClick={() => handleEditar(cli)}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm"
                                title="Editar dados da cliente"
                              >
                                ✏️ Editar
                              </button>

                              {/* BOTAO EXCLUIR (SOFT DELETE) */}
                              <button
                                onClick={() => handleExcluir(cli.id, cli.nome)}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm"
                                title="Excluir cliente"
                              >
                                🗑️ Excluir
                              </button>

                            </div>
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
    </div>
  );
};

export default TelaUsuarios;