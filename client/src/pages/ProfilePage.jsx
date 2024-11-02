import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import ShortUniqueId from "short-unique-id";
import { useSelector } from "react-redux";
import { MdPodcasts } from "react-icons/md";
import { FaWindowClose } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UploadWidget from "../components/UploadWidget";

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
    ev.preventDefault();
    setStartPodcastBtn(true);
  };

  const destroyCPModal = (ev) => {
    ev.preventDefault();
    setStartPodcastBtn(false);
  };

  const initiatePodcastCreation = async (ev) => {
    ev.preventDefault();
    const uid = new ShortUniqueId({ length: 10 }).rnd();
    const uniquePodcastId = window.sessionStorage.getItem("name") + uid;

    if (
      window.sessionStorage.getItem(podcastTopic) === null &&
      window.sessionStorage.getItem("podcastTopic") === null
    ) {
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
          { withCredentials: true }
        )
        .then((response) => {
          if (response.status === 200) {
            navigate(`/rooms/${uniquePodcastId}`);
          }
        })
        .catch((error) => {
          console.log(`${error} --- error happened while creating a new room`);
        });
    } else {
      alert("You already chose that topic!!");
    }
    setStartPodcastBtn(false);
  };

  useEffect(() => {
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
        console.log(`${error} --- error checking Profile Status`);
      });
  }, []);

  return (
    <div className=" min-h-screen flex items-center justify-center p-4 w-screen">
      {profileStatus ? (
        <div className="w-full max-w-xl mx-auto p-4">
          <Profile handleStartPodcastBtnClick={handleStartPodcastBtnClick} />
        </div>
      ) : (
        <CompleteProfile
          bio={bio}
          setBio={setBio}
          setUsername_={setUsername_}
          username_={username_}
        />
      )}
      {startPodcastBtn && (
        <CreatePodcastModal
          destroyCPModal={destroyCPModal}
          initiatePodcastCreation={initiatePodcastCreation}
          setPodcastTopic={setPodcastTopic}
        />
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
    <div className=" text-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">
        Hello {username}, Finish Setting Up Your Profile...
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="username" className="block text-gray-300">
            Username
          </label>
          <input
            type="text"
            id="username"
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:border-gray-500"
            onChange={(ev) => setUsername_(ev.target.value)}
            placeholder="Username..."
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="bio" className="block text-gray-300">
            Bio
          </label>
          <input
            type="text"
            id="bio"
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:border-gray-500"
            onChange={(ev) => setBio(ev.target.value)}
            placeholder="Bio..."
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold p-2 rounded"
        >
          Submit
        </button>
      </form>
      {alertMessage && <p className="text-red-500 mt-2">{alertMessage}</p>}
    </div>
  );
};

const Profile = ({ handleStartPodcastBtnClick }) => {
  return (
    <div className="flex flex-col items-center space-y-6 justify-evenly">
      {/* Profile Card */}

      <div
        id="Profile-Card"
        className="flex items-center space-x-4 bg-slate-700 rounded-md p-2"
      >
        <img
          src={window.sessionStorage.getItem("profilePic")}
          alt="Profile"
          className="w-20 h-20 rounded-full border-2 border-gray-600"
        />
        <div>
          <h3 className="sm:text-xl text-lg font-semibold">
            {window.sessionStorage.getItem("name")}
          </h3>
          <p className="text-gray-400 text-xs sm:text-lg">
            {window.sessionStorage.getItem("email")}
          </p>
          <p className="text-gray-300 tracking-normal text-xs sm:text-lg">
            {window.sessionStorage.getItem("bio")}
          </p>
        </div>
      </div>

      {/* Start a Podcast Section */}
      <div id="Start-A-Podcast">
        <h1 className="text-4xl sm:text-6xl font-semibold">Start a Podcast</h1>
        <button
          className="bg-red-600 hover:bg-red-500 p-4 rounded-full flex items-center justify-center text-4xl transition duration-200 ease-in-out"
          onClick={handleStartPodcastBtnClick}
        >
          <MdPodcasts className="text-white" />
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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white w-full max-w-lg space-y-4 relative">
        <button
          onClick={destroyCPModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-300"
        >
          <FaWindowClose className="text-2xl" />
        </button>
        <form onSubmit={initiatePodcastCreation} className="space-y-4">
          <label
            htmlFor="Podcast-Topic"
            className="block text-gray-300 font-semibold"
          >
            Enter Podcast Topic
          </label>
          <input
            type="text"
            id="Podcast-Topic"
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:border-gray-500"
            placeholder="Topic..."
            onChange={(ev) => setPodcastTopic(ev.target.value)}
          />
          <button
            type="submit"
            className="btn-primary"
          >
            Create Podcast
          </button>
        </form>
      </div>
    </div>
  );
};
