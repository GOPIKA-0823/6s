import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import ProductChatbot from './components/ProductChatbot';

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <ProductChatbot />
    </BrowserRouter>
  );
}

export default App;