const socket = io();

let peerConnection;
let localStream;
let room;

const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

async function joinRoom() {

    room = document.getElementById("room").value;
    const username = document.getElementById("username").value;
  
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
    createPeer();
  
    socket.emit("join-room", { room, username });
  }

function createPeer() {

  peerConnection = new RTCPeerConnection(config);

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.onicecandidate = e => {
    if (e.candidate) {
      socket.emit("signal", { room, signal: { candidate: e.candidate } });
    }
  };

  peerConnection.ontrack = e => {
    const audio = document.createElement("audio");
    audio.srcObject = e.streams[0];
    audio.autoplay = true;
    audio.controls = true;
    document.body.appendChild(audio);
  };
}

socket.on("user-joined", async () => {

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  socket.emit("signal", { room, signal: { offer } });
});

socket.on("room-users", users => {

    const list = document.getElementById("users");
  
    list.innerHTML = "";
  
    users.forEach(user => {
      const li = document.createElement("li");
      li.textContent = user;
      list.appendChild(li);
    });
  
  });

socket.on("signal", async signal => {

  if (signal.offer) {

    await peerConnection.setRemoteDescription(signal.offer);

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.emit("signal", { room, signal: { answer } });
  }

  if (signal.answer) {
    await peerConnection.setRemoteDescription(signal.answer);
  }

  if (signal.candidate && peerConnection) {
    await peerConnection.addIceCandidate(signal.candidate);
  }
});