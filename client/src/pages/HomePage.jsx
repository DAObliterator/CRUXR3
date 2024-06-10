import React, { useEffect , useState } from "react";
import "./HomePage.css";
import { FaBeer, FaThLarge } from "react-icons/fa";
import { IconContext } from "react-icons/lib";
import { FaPodcast } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { FaArrowAltCircleRight } from "react-icons/fa";
import axios from "axios";

export const HomePage = () => {
  const [user, setUser] = useState({});

  

  useEffect(() => {
    axios
      .get(
        `${
          import.meta.env.VITE_ENV === "development"
            ? import.meta.env.VITE_API_DEV + "/profile/getUserDetails"
            : import.meta.env.VITE_API_PROD + "/profile/getUserDetails"
        }`,
        { withCredentials: true }
      )
      .then((response) => {
        console.log(`${JSON.stringify(response.data)} --- response \n`);

        setUser(response.data);

        

        


        if (
          !window.sessionStorage.getItem("name") &&
          !window.sessionStorage.getItem("email") &&
          !window.sessionStorage.getItem("profilePic")
        ) {
          window.sessionStorage.setItem("name", response.data.name);
          window.sessionStorage.setItem("email", response.data.email);
          window.sessionStorage.setItem("profilePic", response.data.profilePic);

        }
      })
      .catch((error) => {
        console.log(
          `${error} --- error happpened while fetching User Details `
        );
      });
  }, []);

  

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
        {Object.keys(user).length === 0 ? (
          <div>
            {" "}
            <strong>
              {" "}
              <a href="/authenticate">LOGIN/SIGN UP</a>
            </strong>{" "}
            <p> to Continue </p>
            <FaArrowAltCircleRight
              style={{
                color: "whitesmoke",
                fontSize: "4rem",
                marginLeft: "1rem",
              }}
            ></FaArrowAltCircleRight>{" "}
          </div>
        ) : (
          <p href="/profile">
            {" "}
            Hello {window.sessionStorage.getItem("name")} To Create Podcast, Head to Your {" "}
            <a
              href={`profile/${
                window.sessionStorage.getItem("name")
              }`}
            >
              Profile
            </a>{" "}
          </p>
        )}
      </div>
    </div>
  );
};


