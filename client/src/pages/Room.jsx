import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import "./Room.css";
import { SocketContext } from "../context/socketContext";
import SimplePeer from "simple-peer";
import axios from "axios";
import { IoExit } from "react-icons/io5";

export const Room = () => {
  const { roomname } = useParams();
  const socket = useContext(SocketContext);
  const [hostInfo, setHostInfo] = useState({});
  const [peers, setPeers] = useState([]);
  const [viewers, setViewers] = useState([]);
  const userAudio = useRef();
  const hostAudio = useRef();
  const roomID = roomname;

  useEffect(() => {
    axios
      .post(
        `${
          import.meta.env.VITE_ENV === "development"
            ? import.meta.env.VITE_API_DEV + "/rooms/getParticipants"
            : import.meta.env.VITE_API_PROD + "/rooms/getParticipants"
        }`,
        { roomID },
        { withCredentials: true }
      )
      .then((response) => {
        console.log(
          `${JSON.stringify(response.data)} --- from /rooms/getParticipants `
        );
      })
      .catch((error) => {
        console.log(`${error} -- happened while fetching allListeners`);
      });
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log(socket.id);
    });

    //if you have created a podcast and roomId of podcast is same as the current param then you are the host
    if (
      window.sessionStorage.getItem("podcastTopic") !== null &&
      window.sessionStorage.getItem(
        window.sessionStorage.getItem("podcastTopic")
      ) === roomname
    ) {

      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        userAudio.current.srcObject = stream;
        socket.emit("room-created", {
          hostName: window.sessionStorage.getItem("name"),
          roomID: roomID,
          podcastTopic: window.sessionStorage.getItem("podcastTopic"),
          hostProfilePic: window.sessionStorage.getItem("profilePic"),
        });
      });

      socket.on("room-creation-success" , (data) => {
        setHostInfo(data);
      })


    } else {
      //you are a listener not a host
      console.log(`listener on ${roomID}`);

      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        userAudio.current.srcObject = stream;
        //emit join room event only 
        if (window.sessionStorage.getItem("inRoom") === null) {
           socket.emit("join-room", {
             name: window.sessionStorage.getItem("name"),
             profilePic: window.sessionStorage.getItem("profilePic"),
             roomID,
           });
        }
       
      });
      
      socket.on("joined-room", () => {
        window.sessionStorage.setItem("inRoom", roomID);
      });

      socket.on("host-information", (data) => {
        console.log(`host-information for listeners ${JSON.stringify(data)}`);
        setHostInfo(data);
      });
    }

     

    socket.on("new-listener", (data) => {
      console.log(data, " listening to new-listener ");
      setViewers((prevViewers) => prevViewers.concat(data)); 
    });

    return () => {
      socket.off("connect");
      socket.off("new-listener");
    };
  }, []);

  function createPeer() {}

  function addPeer() {}

  return (
    <div id="Room-Main">
      <div id="Room-Card">
        <div id="Speakers-Main">
          {Object.keys(hostInfo).length > 0 ? (
            <div id="Host-Card-Main">
              <div id=" Host-Profile-Pic-Div">
                {" "}
                <img
                  id="Host-Profile-Pic"
                  src={hostInfo.profilePic}
                  alt=""
                />{" "}
              </div>
              <div id="Viewer-Name"> {hostInfo.name} </div>{" "}
            </div>
          ) : <div>NO HOST? ... </div> }
          <audio ref={hostAudio}></audio>
        </div>
        <div id="Breaker"></div>
        <div id="Viewers-Main">
          {Array.isArray(viewers) ? (
            viewers.map((viewer) => {
              return (
                <div id="Viewer-Card-Main" key={viewer.name}>
                  {" "}
                  <div id="Viewer-Profile-Pic-Div">
                    {" "}
                    <img
                      id="Viewer-Profile-Pic"
                      src={viewer.profilePic}
                      alt=""
                    />{" "}
                  </div>
                  <div id="Viewer-Name"> {viewer.name} </div>{" "}
                  <div id="Controls-Panel">
                    <IoExit style={{ color: "red", fontSize: "2rem" }}></IoExit>
                  </div>
                </div>
              );
            })
          ) : (
            <div>
              No Listeners... <p style={{ fontSize: "2rem" }}>😔</p>{" "}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
