import { Router, Route } from '@solidjs/router';
import S1 from './components/S1.tsx';
import S2 from './components/S2.tsx';
import S3 from './components/S3.tsx';
import S5 from './components/S5.tsx';
import S6 from './components/S6.tsx';
import S7 from './components/S7.tsx';

function App() {
  return (
    <Router>
      <Route path="/" component={S1} />
      <Route path="/teamselection" component={S2} />
      <Route path="/waiting" component={S3} />
      <Route path="/bagselect" component={S5} />
      <Route path="/bagmake" component={S6} />
      <Route path="/sceneinfo" component={S7} />
    </Router>
  );
};

export default App;
