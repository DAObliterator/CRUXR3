import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { AuthenticationPage } from "./pages/AuthenticationPage";
import { HomePage } from "./pages/HomePage";
import { FaHamburger } from "react-icons/fa";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { ProfilePage } from "./pages/ProfilePage";
import store from "./app/store";
import { Provider } from "react-redux";
import { Rooms } from "./pages/Rooms";
import { Room } from "./pages/Room";
import { SocketProvider } from "./context/socketContext";
import { DummyPage } from "./pages/DummyPage";
import { UsersInPodcastProvider } from "./context/usersInPodcast";

// Import the functions you need from the SDKs you need

function App() {
  const [sidebar, setSidebar] = useState(false);
  const [name, setName] = useState();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem("name")) {
      console.log("Authenticated in App.jsx component");
      setAuthenticated(true);
    } else {
      console.log("Unauthenticated in Sidebar.jsx component");
    }
  }, []);

  const displayNavbar = (ev) => {
    ev.preventDefault();
    setSidebar(true);
  };

  const destroySideBar = (ev) => {
    ev.preventDefault();
    setSidebar(false);
  };

  const isAuthenticated = () => {
    if (window.sessionStorage.getItem("user")) {
      setName(window.sessionStorage.getItem("name"));
    }
  };

  return (
    <Router>
      <SocketProvider>
        <UsersInPodcastProvider>
          <div id="App-Main">
            {!sidebar && (
              <GiHamburgerMenu
                style={{
                  color: "white",
                  fontSize: "3rem",
                  position: "absolute",
                  right: 0,
                }}
                onClick={(ev) => displayNavbar(ev)}
              ></GiHamburgerMenu>
            )}
            {sidebar && <Sidebar destroySideBar={destroySideBar}></Sidebar>}
            <Routes>
              <Route path="/" element={<HomePage></HomePage>}></Route>
              {!authenticated && (
                <Route
                  path="/authenticate"
                  element={<AuthenticationPage></AuthenticationPage>}
                ></Route>
              )}
              {authenticated && (
                <Route
                  path="/profile/:username"
                  element={name !== "" && <ProfilePage></ProfilePage>}
                ></Route>
              )}
              {authenticated && (
                <Route
                  path="/rooms/:roomname"
                  element={name !== "" && <Room></Room>}
                ></Route>
              )}
              {authenticated && (
                <Route
                  path="/rooms"
                  element={name !== "" && <Rooms></Rooms>}
                ></Route>
              )}
              {authenticated && (
                <Route
                  path="/chatrooms"
                  element={name !== "" && <DummyPage></DummyPage>}
                ></Route>
              )}
            </Routes>
          </div>
        </UsersInPodcastProvider>
      </SocketProvider>
    </Router>
  );
}

export default App;
