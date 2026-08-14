import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VitrineProdutos from './pages/VitrineProdutos';
import TelaCondicionais from './pages/TelaCondicionais'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública para a cliente final */}
        <Route path="/" element={<VitrineProdutos />} /> 

        {/* Rotas administrativas da Maria Morena */}
        <Route path="/admin/condicionais" element={<TelaCondicionais />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;