import React, { useEffect, useState } from "react";
import "./ProfilePage.css";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import ShortUniqueId from "short-unique-id";
import { useSelector } from "react-redux";
import { MdPodcasts } from "react-icons/md";
import { FaWindowClose } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export const ProfilePage = () => {
  const [profileStatus, setProfileStatus] = useState(false);
  const [username_, setUsername_] = useState("");
  const [bio, setBio] = useState("");
  const [startPodcastBtn, setStartPodcastBtn] = useState(false);
  const [cPModal, setCPModal] = useState(false);
  const [podcastTopic, setPodcastTopic] = useState("");
  const [podcastUniqueId, setPodcastUniqueId] = useState("");

  const navigate = useNavigate();


  const handleStartPodcastBtnClick = (ev) => {
    console.log("handleStartPodcastBtnClick function triggered !!!");
    ev.preventDefault();
    setStartPodcastBtn(true);
  };

  const destroyCPModal = (ev) => {
    ev.preventDefault();
    setStartPodcastBtn(false);
  };

  const initiatePodcastCreation = async (ev) => {
    ev.preventDefault();
    console.log(
      `initiatePodcastCreation function triggered!!! ${podcastTopic} --- podcastTopic `
    );

    const uid = new ShortUniqueId({ length: 10 }).rnd();
    const uniquePodcastId = window.sessionStorage.getItem("name") + uid; //creating a unique room id using host id ( displayName in this case ) and a randomId

    console.log(`${uniquePodcastId} --- uniquePodcastId`);

    if (window.sessionStorage.getItem(podcastTopic) === null && window.sessionStorage.getItem("podcastTopic") === null ) {
      window.sessionStorage.setItem(podcastTopic, uniquePodcastId);
      window.sessionStorage.setItem("podcastTopic", podcastTopic);

      axios
        .post(
          `${
            import.meta.env.VITE_ENV === "development"
              ? import.meta.env.VITE_API_DEV
              : import.meta.env.VITE_API_PROD
          }/rooms/createRoom`,
          { podcastTopic, uniquePodcastId },
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          console.log(
            JSON.stringify(response.data),
            " from response data endpoint"
          );

          if (response.status === 200) {
            navigate(`/rooms/${uniquePodcastId}`);
          }
        })
        .catch((error) => {
          console.log(
            `${error} --- error happened while attempting to create a new room`
          );
        });
    } else {
      //podcast with the same topic was created
      alert("You already choose that topic!!");
    }
    setStartPodcastBtn(false);
  };

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
        if (response.data.complete === true) {
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
  }, []);

  return (
    <div id="Profile-Page-Main">
      {profileStatus ? (
        <div id="Final-Profile-Main">
          <Profile
            handleStartPodcastBtnClick={handleStartPodcastBtnClick}
          ></Profile>
        </div>
      ) : (
        <CompleteProfile
          bio={bio}
          setBio={setBio}
          setUsername_={setUsername_}
          username_={username_}
        ></CompleteProfile>
      )}
      {startPodcastBtn && (
        <CreatePodcastModal
          destroyCPModal={destroyCPModal}
          initiatePodcastCreation={initiatePodcastCreation}
          setPodcastTopic={setPodcastTopic}
        ></CreatePodcastModal>
      )}
    </div>
  );
};

const CompleteProfile = ({ username_, setUsername_, bio, setBio }) => {
  const { username } = useParams();
  const [alertMessage, setAlertMessage] = useState("");

  const handleSubmit = async (ev) => {
    ev.preventDefault();

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

      if (response.status === 200) {
        window.sessionStorage.setItem(
          "username",
          response.data.updatedUser.username
        );
        window.sessionStorage.setItem("bio", response.data.updatedUser.bio);
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

const Profile = ({ handleStartPodcastBtnClick }) => {
  return (
    <div id="Profile-Main">
      <div id="Profile-Card-Div">
        <div id="Profile-Card">
          <div id="Profile-Pic-Div">
            <img
              src={window.sessionStorage.getItem("profilePic")}
              alt="profilePic"
              id="Profile-Pic"
            />
          </div>
          <div id="Profile-Details">
            <div id="Profile-Details-Div">
              <div id="Name">{window.sessionStorage.getItem("name")}</div>
              <div id="Email">{window.sessionStorage.getItem("email")}</div>
              <div id="Bio">{window.sessionStorage.getItem("bio")}</div>
            </div>
          </div>
        </div>
      </div>
      <div id="Rest-Profile-Page">
        <h1 id="Start-Podcast-Heading">START A PODCAST</h1>
        <button id="Start-Podcast-Btn" onClick={handleStartPodcastBtnClick}>
          <MdPodcasts
            style={{ fontSize: "4.5rem", color: "white" }}
          ></MdPodcasts>
        </button>
      </div>
    </div>
  );
};

const CreatePodcastModal = ({
  destroyCPModal,
  initiatePodcastCreation,
  setPodcastTopic,
}) => {
  //render this only if the profile is complete and also the start button was clicked

 

  const handlePodcastCreation = (ev) => {
    ev.preventDefault();
    initiatePodcastCreation(ev);
  };

  return (
    <div id="CP-Modal-Main">
      <button id="Close-CP-Modal" onClick={destroyCPModal}>
        {" "}
        <FaWindowClose
          style={{
            color: "white",
            backgroundColor: "black",
            borderRadius: "1.5rem",
          }}
        ></FaWindowClose>{" "}
      </button>
      <form
        action=""
        id="Create-Podcast-Topic"
        onSubmit={(ev) => handlePodcastCreation(ev)}
      >
        <label htmlFor="Podcast-Topic" id="Podcast-Topic-Label">
          Enter Podcast Topic
        </label>
        <input
          type="text"
          id="Podcast-Topic"
          placeholder="TOPIC..."
          onChange={(ev) => setPodcastTopic(ev.target.value)}
        />
        <button id="Topic-Submit-Btn" type="submit">
          Create Podcast
        </button>
      </form>
    </div>
  );
};
