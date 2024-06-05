import React, { useEffect, useState } from "react";
import "./ProfilePage.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { MdPodcasts } from "react-icons/md";

export const ProfilePage = () => {
  const [profileStatus, setProfileStatus] = useState(false);
  const [username_, setUsername_] = useState("");
  const [bio, setBio] = useState("");

  // Use userDetails as needed in your component

  useEffect(() => {
    //api call to see if bio and username field is popdivated or not
    axios
      .get(
        `${
          import.meta.env.VITE_ENV === "development"
            ? import.meta.env.VITE_API_DEV + "/profile/profileStatus"
            : import.meta.env.VITE_API_PROD + "/profile/profileStatus"
        }`,
        { withCredentials: true }
      )
      .then((response) => {
        console.log(
          `${JSON.stringify(
            response.data
          )} - response.data from profileStatus endpoint \n`
        );
        setProfileStatus(response.data.complete);
        if (response.data.complete === true ) {
          window.sessionStorage.setItem(
            "username",
            response.data.user.username
          );
          window.sessionStorage.setItem("bio", response.data.user.bio);

        }
      })
      .catch((error) => {
        console.log(
          `${error} --- error happpened while checking Profile Status`
        );
      });
  });

  return (
    <div id="Profile-Page-Main">
      {profileStatus ? (
        <Profile></Profile>
      ) : (
        <CompleteProfile
          bio={bio}
          setBio={setBio}
          setUsername_={setUsername_}
          username_={username_}
        ></CompleteProfile>
      )}
    </div>
  );
};

const CompleteProfile = ({ username_, setUsername_, bio, setBio }) => {
  const { username } = useParams();
  const [alertMessage, setAlertMessage] = useState("");

  const handleSubmit = async (ev) => {
    ev.preventDefadivt();

    if (username_ !== "" && bio !== "") {
      const response = await axios.post(
        `${
          import.meta.env.VITE_ENV === "development"
            ? import.meta.env.VITE_API_DEV + "/profile/completeProfile"
            : import.meta.env.VITE_API_PROD + "/profile/completeProfile"
        }`,
        { username_, bio },
        { withCredentials: true }
      );

      if ( response.status === 200 ) {

        window.sessionStorage.setItem("username" , response.data.updatedUser.username);
        window.sessionStorage.setItem(
          "bio",
          response.data.updatedUser.bio
        );

      }

      

    } else {
      setAlertMessage("FIELD EMPTY");
    }
  };

  return (
    <div id="CompleteProfile-Main">
      <h2 id="Complete-Profile-Heading">
        Hello {username} Finish Setting Up Your Profile...
      </h2>
      <div id="Background-CP">
        <form
          action=""
          id="Complete-Profile-Form"
          onSubmit={(ev) => handleSubmit(ev)}
        >
          <h2 id="cp-form-heading">COMPLETE SETTING UP YOUR PROFILE</h2>
          <div id="username-div" className="details-div">
            <label htmlFor="username">USERNAME</label>
            <input
              type="text"
              id="username"
              onChange={(ev) => setUsername_(ev.target.value)}
              placeholder="USERNAME..."
            />
          </div>
          <div id="bio-div" className="details-div">
            <label htmlFor="bio">BIO</label>
            <input
              type="text"
              id="bio"
              onChange={(ev) => setBio(ev.target.value)}
              placeholder="BIO..."
            />
          </div>
          <button type="submit" id="cp-btn">
            SUBMIT
          </button>
        </form>
      </div>
      {alertMessage !== "" && <div id="Fields-Empty">Fields are Empty </div>}
    </div>
  );
};

const Profile = () => {
  return (
    <div id="Profile-Main">
      <div id="Profile-Card-Div">
        <div id="Profile-Card">
          <div id="Profile-Pic-Div">
            <img
              src={window.sessionStorage.getItem("profilePic")}
              alt="profilePic"
              id = "Profile-Pic"
            />
          </div>
          <div id="Profile-Details">
            <div id="Profile-Details-Div" >
              <div id="Name" >{window.sessionStorage.getItem("name")}</div>
              <div id="Email" >{window.sessionStorage.getItem("email")}</div>
              <div id="Bio" >{window.sessionStorage.getItem("bio")}</div>
            </div>
          </div>
        </div>
      </div>
      <div id="Rest-Profile-Page">
        <h1 id="Start-Podcast-Heading" >START A PODCAST</h1>
        <button id="Start-Podcast-Btn" >
          <MdPodcasts style={{ fontSize: "2.5rem" , color: "white"}} ></MdPodcasts>
        </button>
      </div>
    </div>
  );  
};
