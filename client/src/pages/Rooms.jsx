import React, { useEffect, useState, useContext } from "react";
import { SocketContext } from "../context/socketContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Rooms = () => {
  const socket = useContext(SocketContext);
  const [allLivePodcasts, setAllLivePodcasts] = useState({});
  const [matches, setMatches] = useState({});
  const [searchString, setSearchString] = useState([]);

  const navigate = useNavigate();

  const joinPodcast = (ev, roomID) => {
    ev.preventDefault();
    console.log(`${roomID} = roomID of podcast you joined`);
    navigate(`/rooms/${roomID}`);
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log(socket.id, "in Rooms.jsx");
    });

    socket.on("room-created", (data) => {
      console.log(`listening to room-created in Rooms.jsx ${JSON.stringify(data)}`);
    });

    socket.emit("created-rooms");

    socket.on("created-rooms", (data) => {
      console.log(`listening to created-rooms in Rooms.jsx ${JSON.stringify(data)} `);
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

      tempArray.sort((a, b) => a.score - b.score);

      let tempObject = {};
      tempArray.forEach((object) => {
        tempObject[object.podcast.roomID] = object.podcast;
      });

      setMatches(tempObject);
    } else {
      setMatches(allLivePodcasts);
    }
  }, [searchString]);

  return (
    <div
      id="Rooms-Main"
      className="w-screen min-h-screen p-4 flex flex-col text-gray-300" // Added background and text color
    >
      <div id="Rooms-Heading" className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-200">JOIN ANY ROOM, TYPE TO DISCOVER</h1> {/* Centered and adjusted text size */}
      </div>

      <input
        id="Search-For-Rooms"
        placeholder="Search Podcasts"
        className="p-3 sm:p-4 w-3/4 h-14 bg-gray-700 focus:outline-none focus:ring focus:ring-indigo-500 text-white m-2 rounded-md shadow-md mx-auto" // Centered and updated border and focus styles
        onChange={(ev) => accurateMatches(ev)}
      />

      <div id="All-Active-Rooms" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6"> {/* Adjusted grid for responsiveness */}
        {Array.isArray(Object.values(matches)) ? (
          Object.values(matches).map((podcast) => {
            return (
              <div
                id="Podcast-Card"
                key={podcast.roomID}
                onClick={(ev) => joinPodcast(ev, podcast.roomID)}
                className="flex flex-col items-center rounded-lg bg-gray-800 p-4 hover:bg-gray-700 transition duration-300 cursor-pointer" // Improved card styling
              >
                <img
                  src={podcast.hostProfilePic}
                  alt="HostProfilePic"
                  id="HostProfilePic"
                  className="h-20 w-20 rounded-full mb-4 border-2 border-indigo-500 shadow-lg" // Added border and shadow to image
                />
                <div id="HostName" className="text-lg font-semibold text-gray-200">HOST: {podcast.hostName}</div>
                <div id="PodcastTopic" className="text-sm text-gray-400">TOPIC: {podcast.podcastTopic}</div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center text-white text-lg">NO PODCASTS LIVE RIGHT NOW...</div> 
        )}
      </div>
    </div>
  );
};

