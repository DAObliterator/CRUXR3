import React, { useEffect, useState, useContext } from "react";
import { SocketContext } from "../context/socketContext";
import "./Rooms.css";
import { useNavigate } from "react-router-dom";

export const Rooms = () => {
  const socket = useContext(SocketContext);
  const [allLivePodcasts, setAllLivePodcasts] = useState({});

  const navigate = useNavigate();

  const joinPodcast = (ev , roomID) => {

    ev.preventDefault();

    console.log(`${roomID} = roomID of podcast you joined`);

    navigate(`/rooms/${roomID}`);

  }

  useEffect(() => {
    //need to get info on how to reach the host

    console.log(socket, "inside useEffect in Rooms.jsx");

    //not being logged
    socket.on("connect", () => {
      console.log(socket.id, "in Rooms.jsx");
    });

    
    //this is not working 
    socket.on("room-created", (data) => {
      console.log(`listening to room-created in Rooms.jsx ${JSON.stringify(data)}`)
    })


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

  return (
    <div id="Rooms-Main">
      <div id="Rooms-Heading">
        <h1>JOIN ANY ROOM</h1>
      </div>
      <div id="All-Active-Rooms">
        {Array.isArray(Object.values(allLivePodcasts)) ? (
          Object.values(allLivePodcasts).map((podcast) => {
            return (
              <div id="Podcast-Card" key={podcast.roomID} onClick={(ev ) => joinPodcast(ev , podcast.roomID)} >
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
