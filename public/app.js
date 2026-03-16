const socket = io();

let peer;
let localStream;

const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

async function start() {

  localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  peer = new RTCPeerConnection(config);

  localStream.getTracks().forEach(track => {
    peer.addTrack(track, localStream);
  });

  peer.ontrack = e => {
    const audio = document.createElement("audio");
    audio.srcObject = e.streams[0];
    audio.autoplay = true;
    document.body.appendChild(audio);
  };

  peer.onicecandidate = e => {
    if (e.candidate) {
      socket.emit("signal", { candidate: e.candidate });
    }
  };

  socket.emit("ready");
}

socket.on("user-connected", async () => {

  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);

  socket.emit("signal", { offer });
});

socket.on("signal", async data => {

  if (data.offer) {

    await peer.setRemoteDescription(data.offer);

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit("signal", { answer });
  }

  if (data.answer) {
    await peer.setRemoteDescription(data.answer);
  }

  if (data.candidate) {
    await peer.addIceCandidate(data.candidate);
  }

});

start();