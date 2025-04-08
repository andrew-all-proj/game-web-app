import './App.css'
import { useState } from "react";
import MainCharacter from './components/MainCharacter'
import BottomMenu from './components/BottomMenu'
import Pets from './components/Pets';
import Header from './components/Header';


function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        {/* Логотип */}
        <div className="logo-wrapper">
          <div className="logo-placeholder">Logo</div>
        </div>

        <MainCharacter />
        <Pets />

        <div className="counter-wrapper">
          <button className="counter-button" onClick={() => setCount((c) => c + 1)}>
            count is {count}
          </button>
        </div>


      </main>

      <BottomMenu />

    </div>
  );
}

export default App;
