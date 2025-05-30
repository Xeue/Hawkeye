import TSL5 from 'tsl-umd-v5';

const cerebrumIP = '10.40.41.10';
const cerebrumPort = 9000;
const numberOfCourts = 18;
const callWarningTime = 3;

const cerebrum = new TSL5()
cerebrum.listenTCP(9000)


for (let index = 0; index < numberOfCourts; index++) {
    Bun.listen({
        hostname: '0.0.0.0',
        port: 9001+index,
        socket: {
            async data(socket, data) {
                console.log(`HawkEye trigger, port: ${9001+index}`);
                const dat = JSON.parse(data.toString());
                const tally = {
                    "screen": 0,
                    "index": index,
                    "display": {
                        "rh_tally": 0,
                        "text_tally": 0,
                        "lh_tally": 1,
                        "brightness": 3,
                        "text": dat.Decision
                    }
                }
                cerebrum.sendTallyUDP(cerebrumIP, cerebrumPort, tally);
                await sleep(callWarningTime);
                tally.display.lh_tally = 0;
                tally.display.text = "Close Call";
                cerebrum.sendTallyUDP(cerebrumIP, cerebrumPort, tally);
                socket.write('Got Data');
            },
            open(socket) {
                console.log('HawkEye connected');
                socket.write('Oppened');
            },
            close(socket, error) {
                console.log('HawkEye disconnected');
            },
            drain(socket) {
                console.log('Socket is ready for more data');
            },
            error(socket, error) {
                console.error('Socket error:', error);
            },
        }
    })
}

async function sleep(seconds: number) {
    return new Promise(resolve => {
        setTimeout(()=>{resolve(true)}, seconds*1000)
    })
}