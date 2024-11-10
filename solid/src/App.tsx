import { Router, Routes, Route } from 'solid-app-router';
import S1 from './components/S1.tsx';
import S6 from './components/S6.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" component={S1} />
        <Route path="/bagmake" component={S6} />
      </Routes>
    </Router>
  );
};

export default App;
