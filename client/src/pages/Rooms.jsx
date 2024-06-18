import React, { useEffect, useState, useContext } from "react";
import { SocketContext } from "../context/socketContext";
import "./Rooms.css";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import axios from "axios";

/*const firebaseConfig = {
  apiKey: "AIzaSyBq_FDaRS1UBR2KTAWsmgr_wq6SC-pTyGo",
  authDomain: "sermo-425104.firebaseapp.com",
  projectId: "sermo-425104",
  storageBucket: "sermo-425104.appspot.com",
  messagingSenderId: "492329858386",
  appId: "1:492329858386:web:c3a1337ff6d5a15497368b",
  measurementId: "G-CLV83CMW5G",
};

const firebaseApp = initializeApp(firebaseConfig);

const messaging = getMessaging(firebaseApp);*/

export const Rooms = () => {
  const socket = useContext(SocketContext);
  const [allLivePodcasts, setAllLivePodcasts] = useState({});
  const [matches, setMatches] = useState({});
  const [searchString, setSearchString] = useState([]);

  const navigate = useNavigate();

  /*useEffect(() => {

    getToken(messaging, {
      vapidKey:
        "BPawa04yv7Bg0Kp-vj_GQ4bcqh_G-ByLe5-0a-Dl2z7z6XuVwcy2IEXneF0lb6xThR-i6-_Wa57sUPzjNnMJsYw",
    })
      .then((currentToken) => {
        if (currentToken) {
          // Send the token to your server and update the UI if necessary
          axios
            .post(
              `${
                import.meta.env.VITE_ENV === "development"
                  ? import.meta.env.VITE_API_DEV + "/push-subscription"
                  : import.meta.env.VITE_API_PROD + "/push-subscription"
              }`,
              { token: currentToken },
              { withCredentials: true }
            )
            .then((response) => {})
            .catch((error) => {
              console.log(
                `${error} --- error happened while attempting to push-subscription`
              );
            });
          // ...
        } else {
          // Show permission request UI
          console.log(
            "No registration token available. Request permission to generate one."
          );
          // ...
        }
      })
      .catch((err) => {
        console.log("An error occurred while retrieving token. ", err);
        // ...
      });



  } , [])*/

  const joinPodcast = (ev, roomID) => {
    ev.preventDefault();

    console.log(`${roomID} = roomID of podcast you joined`);

    navigate(`/rooms/${roomID}`);
  };

  useEffect(() => {
    //need to get info on how to reach the host

    console.log(socket, "inside useEffect in Rooms.jsx");

    //not being logged
    socket.on("connect", () => {
      console.log(socket.id, "in Rooms.jsx");
    });

    //this is not working
    socket.on("room-created", (data) => {
      console.log(
        `listening to room-created in Rooms.jsx ${JSON.stringify(data)}`
      );
    });

    socket.emit("created-rooms");

    socket.on("created-rooms", (data) => {
      console.log(
        `listening to created-rooms in Rooms.jsx ${JSON.stringify(data)} `
      );
      setAllLivePodcasts(data);
    });

    return () => {
      socket.off("connect");
      socket.off("room-created");
    };
  }, [socket]);

  const accurateMatches = (ev) => {
    ev.preventDefault();

    if (ev.target.value !== "") {
      setSearchString(ev.target.value);
    } else {
      alert("enter something in the search bar");
    }

    
  };

  useEffect(() => {

    function levenshteinDistance(str1, str2) {
      const len1 = str1.length;
      const len2 = str2.length;

      let matrix = Array(len1 + 1);
      for (let i = 0; i <= len1; i++) {
        matrix[i] = Array(len2 + 1);
      }

      for (let i = 0; i <= len1; i++) {
        matrix[i][0] = i;
      }

      for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
      }

      for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
          if (str1[i - 1] === str2[j - 1]) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j - 1] + 1
            );
          }
        }
      }

      return matrix[len1][len2];
    }
    
    if (searchString !== "") {

      let tempArray = [];
      Array.isArray(Object.values(allLivePodcasts)) &&
        Object.values(allLivePodcasts).forEach((podcast) => {
          let tempObject = {};
          let score = levenshteinDistance(podcast.podcastTopic, searchString);
          tempObject["podcast"] = podcast;
          tempObject["score"] = score;
          tempArray.push(tempObject);
        });

      console.log(tempArray, " --- tempArray \n");

      tempArray.sort((a, b) => {
        return a.score - b.score;
      });

      console.log(tempArray, " ---after sorting \n");

      let tempObject = {};

      tempArray.forEach((object) => {
        tempObject[object.podcast.roomID] = object.podcast;
       
      });

      console.log(JSON.stringify(tempObject), " ---final sorted object \n");

      setMatches(tempObject);

    } else {
      setMatches(allLivePodcasts);
    }
    
   

  } , [searchString])

  return (
    <div id="Rooms-Main">
      <input
        id="Search-For-Rooms"
        placeholder="Search Podcasts"
        onChange={(ev) => accurateMatches(ev)}
      ></input>
      <div id="Rooms-Heading">
        <h1>JOIN ANY ROOM , TYPE TO DISCOVER </h1>
      </div>
      <div id="All-Active-Rooms">
        {Array.isArray(Object.values(matches)) ? (
          Object.values(matches).map((podcast) => {
            return (
              <div
                id="Podcast-Card"
                key={podcast.roomID}
                onClick={(ev) => joinPodcast(ev, podcast.roomID)}
              >
                <div id="HostProfilePic-Div">
                  <img
                    src={podcast.hostProfilePic}
                    alt="HostProfilePic"
                    id="HostProfilePic"
                  />
                </div>
                <div id="HostName">HOST: {podcast.hostName}</div>
                <div id="PodcastTopic">TOPIC: {podcast.podcastTopic}</div>
              </div>
            );
          })
        ) : (
          <div style={{ color: "white" }}>NO PODCASTS LIVE RIGHT NOW... </div>
        )}
      </div>
    </div>
  );
};
