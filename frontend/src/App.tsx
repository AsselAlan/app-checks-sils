import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './views/Home';
import ChecklistForm from './views/ChecklistForm';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/form" element={<ChecklistForm />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
