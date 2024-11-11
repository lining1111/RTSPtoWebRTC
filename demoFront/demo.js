let stream = new MediaStream();
let suuid = $('#videoAddr').val();

let config = {
    iceServers: [{
        urls: ["stun:stun.l.google.com:19302"]
    }]
};

const pc = new RTCPeerConnection(config);
pc.onnegotiationneeded = handleNegotiationNeededEvent;

let log = msg => {
    // document.getElementById('div').innerHTML += msg + '<br>'
    console.log(msg)
}

pc.ontrack = function(event) {
    stream.addTrack(event.track);

    document.getElementById('remoteVideo').srcObject = stream;
    log(event.streams.length + ' track is delivered')
}

pc.oniceconnectionstatechange = e => log(pc.iceConnectionState)

async function handleNegotiationNeededEvent() {
    let offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    getRemoteSdp();
}

// $(document).ready(function() {
//     $('#' + suuid).addClass('active');
//     getCodecInfo();
// });
function StartVideo() {
    console.log('addr:',suuid)
    getCodecInfo();
}


function getCodecInfo() {
    $.get("http://localhost:8083/stream/codec/" + suuid, function(data) {
        try {
            data = JSON.parse(data);
        } catch (e) {
            console.log(e);
        } finally {
            $.each(data,function(index,value){
                pc.addTransceiver(value.Type, {
                    'direction': 'sendrecv'
                })
            })
        }
    });
}

let sendChannel = null;

function getRemoteSdp() {
    $.post("http://localhost:8083/stream/receiver/"+ suuid, {
        suuid: suuid,
        data: btoa(pc.localDescription.sdp)
    }, function(data) {
        try {
            pc.setRemoteDescription(new RTCSessionDescription({
                type: 'answer',
                sdp: atob(data)
            }))
        } catch (e) {
            console.warn(e);
        }
    });
}
