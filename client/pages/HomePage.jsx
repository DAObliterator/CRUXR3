import React from 'react';
import "./HomePage.css";
import { FaBeer, FaThLarge } from "react-icons/fa";
import { IconContext } from 'react-icons/lib';
import { FaPodcast } from "react-icons/fa";




export const HomePage = () => {
  return (
    <div id="HomePage-Main">
      <div id="Intro">
        <h1 id="App-Name">[.....]</h1>
        <p id="Description">
          An App To Create Podcasts and Connect with People
          <FaPodcast style={{ color: "white", fontSize: "10rem" }}></FaPodcast>
        </p>
      </div>
    </div>
  );
}
