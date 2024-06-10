import React, { useEffect , useState } from 'react';
import "./Sidebar.css";
import { Link } from 'react-router-dom';
import { IoMdClose } from "react-icons/io";


export const Sidebar = ({ destroySideBar }) => {

  const [ authenticated , setAuthenticated ] = useState(false);
  const [ user , setUser ] = useState("");
  const [ yourRoomId , setYourRoomId ] = useState("");

  useEffect(() => {

    if (window.sessionStorage.getItem("name")) {
      console.log("Authenticated in Sidebar.jsx component")
      setAuthenticated(true);
      console.log("in Sidebar.jsx", window.sessionStorage.getItem("name"));
      console.log("in Sidebar.jsx podcastTopic --- ", window.sessionStorage.getItem("podcastTopic"));
      console.log(
        "in Sidebar.jsx uniquePodcastId --- ",
        window.sessionStorage.getItem(
          window.sessionStorage.getItem("podcastTopic")
        )
      );

      
      setUser(window.sessionStorage.getItem("name"));
      setYourRoomId(
        window.sessionStorage.getItem(
          window.sessionStorage.getItem("podcastTopic")
        )
      );
    } else {
      console.log("Unauthenticated in Sidebar.jsx component");

    }

  },[])

  return (
    <div id="Sidebar-Main">
      <IoMdClose
        onClick={destroySideBar}
        style={{ color: "blue", fontSize: "3rem" }}
      ></IoMdClose>
      <Link to="/">HOME</Link>
      {!authenticated && <Link to="/authenticate">SIGN IN/UP </Link>}
      {authenticated && <Link to={`/rooms/${yourRoomId}`}>YOUR-ROOM</Link>}
      {authenticated && <Link to={`/profile/${user}`}>PROFILE</Link>}
      {authenticated && <Link to={`/rooms`}>ROOMS</Link>}
    </div>
  );
}
