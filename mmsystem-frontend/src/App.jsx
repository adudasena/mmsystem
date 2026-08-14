import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MenuLateral from './components/MenuLateral';
import TelaProdutos from './pages/TelaProdutos'; 
import TelaCondicionais from './pages/TelaCondicionais';
import TelaUsuarios from './pages/TelaUsuarios';
import TelaPedidos from './pages/TelaPedidos';
import TelaPagamentos from './pages/TelaPagamentos';

const PainelGeral = () => (
  <h2 className="text-2xl font-bold text-gray-800">Bem-vinda, Proprietária! 👋</h2>
);

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-[#dcded0]">
        <MenuLateral />
        
        <main className="flex-1 ml-72 p-10">
          <Routes>
            <Route path="/" element={<PainelGeral />} />
            <Route path="/produtos" element={<TelaProdutos />} />
            <Route path="/condicionais" element={<TelaCondicionais />} />
            <Route path="/usuarios" element={<TelaUsuarios />} />      
            <Route path="/pedidos" element={<TelaPedidos />} />   
          <Route path="/pagamentos" element={<TelaPagamentos />} />     

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;