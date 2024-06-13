import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import "./Room.css";
import { SocketContext } from "../context/socketContext";
import SimplePeer from "simple-peer";
import axios from "axios";
import { IoExit } from "react-icons/io5";
import { UsersInPodcastContext } from "../context/usersInPodcast";

export const Room = () => {
  const { roomname } = useParams();
  const socket = useContext(SocketContext);
  const [hostInfo, setHostInfo] = useState({});
  const [viewers, setViewers] = useState([]);
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const hostAudio = useRef();
  const hostStream = new MediaStream();
  const roomID = roomname;
  const yourName = window.sessionStorage.getItem("name");
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

      //CAPTURING MEDIA FOR HOST...
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          socket.emit("room-created", {
            hostName: window.sessionStorage.getItem("name"),
            roomID: roomID,
            podcastTopic: window.sessionStorage.getItem("podcastTopic"),
            hostProfilePic: window.sessionStorage.getItem("profilePic"),
          });

          setHostInfo({
            hostName: window.sessionStorage.getItem("name"),
            hostProfilePhoto: window.sessionStorage.getItem("profilePic"),
          });

          socket.on("new listener", (data) => {
            console.log(`new listener just joined -- ${JSON.stringify(data)}`);

            let userToSignal = data.userToSignal;
            setPodcastListeners((prevPodcastListeners) =>
              prevPodcastListeners.concat(data.userToSignalInfo)
            );

            const peer = new RTCPeerConnection({
              iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
              ],
            });

            peer.onnegotiationneeded = async () => {
              console.log(`inside onnegotiation `);
              const offer = await peer.createOffer();
              await peer.setLocalDescription(offer);
              socket.emit("offer", {
                userToSignal,
                signal: peer.localDescription,
              });
            };

            peer.onicecandidate = (event) => {
              console.log(`inside onicecandidate - ${event}`);
              if (event.candidate) {
                socket.emit("host-icecandidate", {
                  userToSignal,
                  hostIceCandidate: event.candidate,
                });
              }
            };

            console.log("Connection state:", peer.connectionState);

            stream?.getTracks().forEach((track) => {
              hostStream.addTrack(track);
              peer.addTrack(track, stream);
            });

            socket.on("listener-icecandidate", async (data) => {
              await peer.addIceCandidate(data.listenerIceCandidate);
            });

            socket.on("answer", async (data) => {
              console.log(`host received an answer from client ${JSON.stringify(data)} `)
              const answer = new RTCSessionDescription(data.answer);

              // Set the answer as the remote description
              await peer.setRemoteDescription(answer);
            });
          });
        })
        .catch((error) => {
          console.log(`error accessing media devices ${error}`);
        });
    } else {
      //you are a listener not a host
      console.log(`listener on ${roomID}`);

      socket.emit("join-room", {
        name: window.sessionStorage.getItem("name"),
        profilePhoto: window.sessionStorage.getItem("profilePic"),
        roomID,
      });

      socket.on("offer", async (data) => {
        

        let signalFromHost = data.signal;
        let callerID = data.hostSocketId;

        console.log(`host sent an ${JSON.stringify(data)}  `)

        const peer = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        });

       
        await peer.setRemoteDescription(
          new RTCSessionDescription(signalFromHost)
        );

        
        const answer = await peer.createAnswer();

        
        await peer.setLocalDescription(answer);

        
        socket.emit("answer", { callerID, signal: peer.localDescription });

        peer.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("listener-icecandidate", {
              callerID,
              listenerIceCandidate: event.candidate,
            });
          }
        };

        socket.on("host-icecandidate", async (data) => {
          console.log(data, "data in host-ice-candidate");
          await peer.addIceCandidate(data.hostIceCandidate);
        });

        peer.ontrack = (event) => {
          console.log(event.streams[0], "--streams");
          hostStream.addTrack(event.streams[0].getTracks()[0]);
          hostAudio.current.srcObject = hostStream;
        };
      });

      socket.on("new listener", (data) => {
        console.log(
          `you joined , all usersInRoom ${JSON.stringify(data.usersInRoom)} `
        );

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

          console.log(
            `host info from array --- ${JSON.stringify(
              temp
            )} and ${listenersArray}`
          );

          setHostInfo({
            hostName: temp.name,
            hostProfilePhoto: temp.profilePhoto,
          });
        }
      });

      /*
      start sending media only upon receving permission to receive media 
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        
      });
      */
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
    }
  };

  return (
    <div id="Room-Main">
      <div id="Room-Card">
        <div id="Speakers-Main">
          <h4>SPEAKERS...</h4>
          {console.log(podcastListeners)}
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
          <audio ref={hostAudio} controls autoPlay></audio>
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
                      alt=""
                    />{" "}
                  </div>
                  <div id="Viewer-Name"> {viewer.name} </div>{" "}
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
            onChange={(ev) => setMessage(ev.target.value)}
          />
          <button id="Send-Message">SEND</button>
        </form>
      </div>
    </div>
  );
};
