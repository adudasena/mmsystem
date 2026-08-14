import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoMariaMorena from '../assets/escritocompleto1linha.svg';

const MenuLateral = () => {
  const location = useLocation();

  const menus = [
    { nome: 'Painel', rota: '/', icone: '📊' },
    { nome: 'Produtos', rota: '/produtos', icone: '👗' }, 
    { nome: 'Condicionais', rota: '/condicionais', icone: '📦' },
    { nome: 'Pagamentos Futuros', rota: '/pagamentos', icone: '💰' },
    { nome: 'Pedidos', rota: '/pedidos', icone: '🛒' },
    { nome: 'Clientes', rota: '/usuarios', icone: '👤' },
    { nome: 'Vitrine', rota: '/vitrine', icone: '🛍️' },
    
  ];

  return (
    <div className="w-72 h-screen bg-[#2c3e1c] text-white flex flex-col p-6 fixed left-0 top-0 shadow-2xl z-50">
      
      {/* SEÇÃO DA LOGO OFICIAL */}
      <div className="mb-12 flex flex-col items-center">
        <img src={LogoMariaMorena} alt="Maria Morena Logo" className="h-16 w-auto mb-2" />
      </div>

      <nav className="flex flex-col gap-2">
        {menus.map((item) => {
          const isActive = location.pathname === item.rota;
          return (
            <Link
              key={item.nome}
              to={item.rota}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-white/15 border-l-4 border-[#dcded0] shadow-inner' // Destaque para o item ativo
                  : 'hover:bg-white/5'
              }`}
            >
              <span className={`text-xl ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.icone}</span>
              <span className={`font-medium ${isActive ? 'text-white' : 'text-white/80'}`}>{item.nome}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/20 pt-4">
        <p className="text-xs opacity-60 italic text-center">A moda ao seu alcance.</p>
      </div>
    </div>
  );
};

export default MenuLateral;