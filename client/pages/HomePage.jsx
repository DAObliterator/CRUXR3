import React from 'react';
import "./HomePage.css";
import { FaBeer, FaThLarge } from "react-icons/fa";
import { IconContext } from 'react-icons/lib';
import { FaPodcast } from "react-icons/fa";
import { FaArrowAltCircleRight } from 'react-icons/fa';




export const HomePage = () => {
  return (
    <div id="HomePage-Main">
      <div id="Intro">
        <h1 id="App-Name">Sermo</h1>
        <p id="Description">
          An App To Create Podcasts and Connect with People
          <FaPodcast
            style={{
              color: "whitesmoke",
              fontSize: "10rem",
              marginLeft: "2rem",
            }}
          ></FaPodcast>
        </p>
      </div>
      <div id="Login-Continue">
        <strong>
          {" "}
          <a href="/authenticate">LOGIN/SIGN UP</a>
        </strong>{" "}
        <p> to Continue </p>
        <FaArrowAltCircleRight
          style={{ color: "whitesmoke", fontSize: "4rem", marginLeft: "1rem" }}
        ></FaArrowAltCircleRight>
      </div>
    </div>
  );
}
