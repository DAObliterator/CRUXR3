import React, { useEffect , useState } from 'react';
import { Link } from 'react-router-dom';
import { IoMdClose } from "react-icons/io";
import "./Sidebar.css"


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
    <div
      id="Sidebar-Main"
      className="min-h-screen flex flex-col justify-evenly items-center p-2 sm:p-4 md:p-6 w-1/4 sm:w-1/6 bg-gray-900 fixed"
    >
      <IoMdClose
        onClick={destroySideBar}
        size={40}
        color='white'
      ></IoMdClose>
      <Link to="/" className='linkStyle' >HOME</Link>
      {!authenticated && (
        <Link className='linkStyle' to="/authenticate">
          SIGN IN/UP{" "}
        </Link>
      )}
      {authenticated && (
        <Link className='linkStyle' to={`/rooms/${yourRoomId}`}>
          YOUR-ROOM
        </Link>
      )}
      {authenticated && (
        <Link className='linkStyle' to={`/profile/${user}`}>
          PROFILE
        </Link>
      )}
      {authenticated && (
        <Link className='linkStyle' to={`/rooms`}>
          ROOMS
        </Link>
      )}
    </div>
  );
}
