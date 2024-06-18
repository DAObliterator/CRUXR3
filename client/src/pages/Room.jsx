import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import "./Room.css";
import { SocketContext } from "../context/socketContext";
import axios from "axios";
import { IoExit } from "react-icons/io5";
import { UsersInPodcastContext } from "../context/usersInPodcast";
import { Peer } from "peerjs";

export const Room = () => {
  const { roomname } = useParams();
  const socket = useContext(SocketContext);
  const [hostInfo, setHostInfo] = useState({});
  const [message, setMessage] = useState("");
  const [viewers, setViewers] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const hostAudio = useRef(null);
  const roomID = roomname;
  const yourName = window.sessionStorage.getItem("name");
  const serverUrl = "wss://sermo-1ziqsqlh.livekit.cloud";

  const isHost =
    window.sessionStorage.getItem("podcastTopic") !== null &&
    window.sessionStorage.getItem(
      window.sessionStorage.getItem("podcastTopic")
    ) === roomname;
  const { podcastListeners, setPodcastListeners } = useContext(
    UsersInPodcastContext
  );

  useEffect(() => {
    socket.on("connect", () => {
      console.log(socket.id);
    });

    if (isHost) {
      console.log(`host at ${roomID}`);

      setHostInfo({
        hostName: window.sessionStorage.getItem("name"),
        hostProfilePhoto: window.sessionStorage.getItem("profilePic"),
      });

      socket.emit("room-created", {
        hostName: window.sessionStorage.getItem("name"),
        roomID: roomID,
        podcastTopic: window.sessionStorage.getItem("podcastTopic"),
        hostProfilePic: window.sessionStorage.getItem("profilePic"),
      });

      const hostPeer = new Peer(window.sessionStorage.getItem("name"));

      socket.on("new listener", (data) => {
        console.log(`new listener just joined -- ${JSON.stringify(data)}`);

        let userToSignal = data.userToSignal;

        //new person has joined show components so that host can give permission to speak
       setViewers((prevViewers) => {
         const viewerExists = prevViewers.some(
           (viewer) => viewer.name === data.userToSignalInfo.name
         );
         if (!viewerExists) {
           return [...prevViewers, data.userToSignalInfo];
         }
         return prevViewers;
       });

        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            hostAudio.current.srcObject = stream;

            hostPeer.on("open", (id) => {
              console.log(id, "hostPeer connection id ");
            });
            console.log(`audio intended for ${data.userToSignalInfo.name}`);
            const call = hostPeer.call(data.userToSignalInfo.name, stream);
            call.on("error", (err) => {
              console.error("Call error:", err);
            });
          })
          .catch((error) => {
            console.log(`error accessing media devices ${error}`);
          });
      });
    } else {
      //you are a listener not a host
      console.log(`listener on ${roomID}`);

      socket.emit("join-room", {
        name: window.sessionStorage.getItem("name"),
        profilePhoto: window.sessionStorage.getItem("profilePic"),
        roomID,
      });

      const listenerPeer = new Peer(window.sessionStorage.getItem("name"));

      listenerPeer.on("open", (id) => {
        console.log(`${id} of listener `);
      });

      listenerPeer.on(
        "call",
        (call) => {
          console.log(call, "call in listener");

          call.answer();

          call.on("stream", (stream) => {
            console.log(` Stream received: ${stream}`);
            hostAudio.current.srcObject = stream;
          });

          call.on("error", (err) => {
            console.error("Call error:", err);
          });
        },
        (error) => {
          console.log(`${error} - happened when listening to call `);
        }
      );

      socket.on("new listener", (data) => {
        if (data.usersInRoom.length > 0) {
          let temp = {};
          let listenersArray = [];
          data.usersInRoom.forEach((item) => {
            if (item.host === true) {
              temp = item;
            }
          });

          listenersArray = data.usersInRoom.filter((item) => {
            if (item.host === false) {
              return item;
            }
          });

          setHostInfo({
            hostName: temp.name,
            hostProfilePhoto: temp.profilePhoto,
          });
        }
      });
    }

    socket.on("receive message", (data) => {
      console.log(` message received ${JSON.stringify(data)} \n  `);
      setAllMessages((prevAllMessages) => [...prevAllMessages, data]);
    });

    return () => {
      socket.off("connect");
      socket.off("new-listener");
    };
  }, [socket]);

  const sendMessage = (ev) => {
    ev.preventDefault();

    if (message === "") {
      alert("Message input field is empty!!!");
    } else {
      socket.emit("send message", { roomID, message });
      setMessage("");
    }
  };

  return (
    <div id="Room-Main">
      <div id="Room-Card">
        <div id="Speakers-Main">
          <h4>SPEAKERS...</h4>
          {Object.keys(hostInfo).length > 0 ? (
            <div id="Host-Card-Main-Main" key={hostInfo.hostName}>
              <div id="Host-Card-Main">
                <div id=" Host-Profile-Pic-Div">
                  {" "}
                  <img
                    id="Host-Profile-Pic"
                    src={hostInfo.hostProfilePhoto}
                    alt=""
                  />{" "}
                </div>
                <div id="Host-Name"> {hostInfo.hostName} </div>{" "}
              </div>
              {isHost && (
                <div id="Host-Card-Buttons-Panel">
                  <button id="Destory-Channel">END SESSION</button>
                </div>
              )}
            </div>
          ) : (
            <div>NO HOST? ... </div>
          )}
          <audio ref={hostAudio} autoPlay></audio>
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
                      src={viewer.profilePhoto}
                      style={{ height: "4rem", width: "4rem" }}
                      alt=""
                    />{" "}
                  </div>
                  <div id="Viewer-Name" style={{ fontSize: "1rem" }}>
                    {" "}
                    {viewer.name}{" "}
                  </div>{" "}
                  {viewer.name === yourName && (
                    <div id="Controls-Panel">
                      <button id="Viewer-Exit">
                        <IoExit
                          style={{ color: "red", fontSize: "2rem" }}
                        ></IoExit>
                      </button>
                    </div>
                  )}
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
      <div id="Live-Chat-Section">
        <h2
          id="LIVE-CHAT-HEADING"
          style={{
            backgroundColor: "black",
            color: "white",
            padding: "0.5rem",
          }}
        >
          LIVE CHAT SECTION
        </h2>
        <div id="Chat-Section">
          {Array.isArray(allMessages) &&
            allMessages.length > 0 &&
            allMessages.map((item) => {
              return (
                <div id="Main-Message-Div" key={item.name}>
                  <div id="Profile-Name">
                    <div id="Sender-Pic-Div">
                      <img src={item.profilePhoto} alt="" />
                    </div>

                    <div id="Sender-Name"> {item.name} </div>
                  </div>
                  <div id="Message-Time">
                    <div id="Sender-Message">{item.message} </div>
                    <div id="Sender-Time">
                      {" "}
                      <p>{item.time}</p>{" "}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        <form action="" id="Message-Panel" onSubmit={(ev) => sendMessage(ev)}>
          <input
            type="text"
            id="Message-Input"
            placeholder="Send Mssg..."
            value={message}
            onChange={(ev) => setMessage(ev.target.value)}
          />
          <button id="Send-Message">SEND</button>
        </form>
      </div>
    </div>
  );
};
