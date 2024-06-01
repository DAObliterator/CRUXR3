import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { AuthenticationPage } from '../pages/AuthenticationPage';
import { HomePage } from '../pages/HomePage';
import { FaHamburger } from 'react-icons/fa';
import './App.css';
import { BrowserRouter as Router , Routes , Route } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { ProfilePage } from '../pages/ProfilePage';

function App() {

  const [sidebar , setSidebar] = useState(false);

  const displayNavbar = (ev) => {
    ev.preventDefault();
    setSidebar(true);

  }

  const destroySideBar = (ev) => {
    ev.preventDefault();
    setSidebar(false);
  }
  

  return (
    <Router>
      <div id="App-Main" >
        {!sidebar && <GiHamburgerMenu style={{ color: "white" , fontSize: "3rem" , position: "absolute" , right: 0}} onClick={(ev) => displayNavbar(ev)} ></GiHamburgerMenu>}
        {sidebar && <Sidebar destroySideBar={destroySideBar} ></Sidebar>}
        <Routes>
          <Route path="/" element={<HomePage></HomePage>}></Route>
          <Route
            path="/authenticate"
            element={<AuthenticationPage></AuthenticationPage>}
          ></Route>
          <Route path='/profile/:username' element={<ProfilePage></ProfilePage>} ></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App
