import { Router, Route } from '@solidjs/router';
import H1 from './components/H1.tsx';
import H2 from './components/H2.tsx';
import H2_1 from './components/H2-1.tsx';
import H3 from './components/H3.tsx';
import H4 from './components/H4.tsx';
import H5 from './components/H5.tsx';
import H6 from './components/H6.tsx';
import H7 from './components/H7.tsx';
import S0 from './components/S0.tsx';
import S1 from './components/S1.tsx';
import S2 from './components/S2.tsx';
import S3 from './components/S3.tsx';
import S5 from './components/S5.tsx';
import S6 from './components/S6.tsx';
import S7 from './components/S7.tsx';
import S8 from './components/S8.tsx';
function App() {
  return (
    <Router>
      <Route path="/host/start" component={H1} />
      <Route path="/host/roombuild" component={H2} />
      <Route path="/host/notice" component={H2_1} />
      <Route path="/host/waiting" component={H3} />
      <Route path="/host/preinfo" component={H4} />
      <Route path="/host/sceneinfo" component={H5} />
      <Route path="/host/simulinfo" component={H6} />
      <Route path="/host/simulresult" component={H7} />
      <Route path="/" component={S0} />
      <Route path="/start" component={S1} />
      <Route path="/teambuild" component={S2} />
      <Route path="/waiting" component={S3} />
      <Route path="/bagselect" component={S5} />
      <Route path="/bagmake" component={S6} />
      <Route path="/sceneinfo" component={S7} />
      <Route path="/simulinfo" component={S8} />
    </Router>
  );
};

export default App;
