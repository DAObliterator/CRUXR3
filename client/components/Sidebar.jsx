import React from 'react';
import "./Sidebar.css";
import { Link } from 'react-router-dom';
import { IoMdClose } from "react-icons/io";


export const Sidebar = ({ destroySideBar }) => {





  return (
    <div id="Sidebar-Main">
      <IoMdClose
        onClick={destroySideBar}
        style={{ color: "blue", fontSize: "3rem" }}
      ></IoMdClose>
      <Link to="/">HOME</Link>
      <Link to="/authenticate">SIGN IN/UP </Link>
    </div>
  );
}
