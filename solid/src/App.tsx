import { Router, Route } from '@solidjs/router';
import S1 from './components/S1.tsx';
import S2 from './components/S2.tsx';
import S6 from './components/S6.tsx';

function App() {
  return (
    <Router>
      <Route path="/" component={S1} />
      <Route path="/teamselection" component={S2} />
      <Route path="/bagmake" component={S6} />
    </Router>
  );
};

export default App;
