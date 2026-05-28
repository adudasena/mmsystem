import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MenuLateral from './components/MenuLateral';
import TelaProdutos from './pages/TelaProdutos'; 
import TelaCondicionais from './pages/TelaCondicionais'; // ◄ Importação adicionada aqui!

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
            {/* Rota da página inicial */}
            <Route path="/" element={<PainelGeral />} />
            
            {/* Rota da tela de produtos da pasta pages */}
            <Route path="/produtos" element={<TelaProdutos />} />

            {/* Rota da tela de condicionais */}
            <Route path="/condicionais" element={<TelaCondicionais />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;