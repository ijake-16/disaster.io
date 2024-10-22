import Header from './components/Header.tsx';
import MainContent from './components/MainContent.tsx';
import Footer from './components/Footer.tsx';
import Sidebar from './components/Sidebar.tsx';

function App() {
  return (
    <div class="flex flex-col w-screen h-screen">
      <Header />
      <div class="flex flex-row w-full grow">
        <Sidebar />
        <MainContent />
      </div>
      <Footer />
    </div>
  );
};

export default App;
