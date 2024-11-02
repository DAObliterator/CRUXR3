import React, { useEffect, useState } from "react";
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
    <div
      id="HomePage-Main"
      className=" p-4  flex flex-col  min-h-screen justify-evenly "
    >
      <div
        id="Intro"
        className="text-3xl sm:text-4xl md:text-5xl justify-evenly  flex flex-col"
      >
        <h1 id="App-Name">
          Sermo <FaPodcast size={75} color="red"></FaPodcast>
        </h1>
        <p id="Description">
          An App To Create Podcasts and Connect with People
        </p>
      </div>
      <div id="Login-Continue">
        {Object.keys(user).length === 0 ? (
          <div>
            <strong>
              <a href="/authenticate">LOGIN/SIGN UP</a>
            </strong>
          </div>
        ) : (
          <p href="/profile">
            Hello {window.sessionStorage.getItem("name")} To Create Podcast,
            Head to Your
            <a href={`profile/${window.sessionStorage.getItem("name")}`}>
              Profile
            </a>
          </p>
        )}
      </div>
    </div>
  );
};
