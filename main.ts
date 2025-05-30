import TSL5 from 'tsl-umd-v5';
import { $ } from "bun";

const cerebrumIP = '10.40.41.10';
const cerebrumPort = 9000;
const callWarningTime = 3;
const OBSCourt = 1;

const cerebrum = new TSL5()

const courtsMap = new Map<number, number>([
    [9000, 0],
    [9001, 1],
    [9002, 2],
    [9003, 3],
    [9004, 4],
    [9005, 5],
    [9006, 6],
    [9007, 7],
    [9008, 8],
    [9009, 9],
    [9010, 10],
    [9011, 11],
    [9012, 12],
    [9014, 13],
    [9015, 14],
    [9016, 15],
    [9017, 16],
    [9018, 17],
])

SetGPIO(37, 0);

for (let [port, index] of courtsMap) {
    Bun.listen({
        hostname: '0.0.0.0',
        port: port,
        socket: {
            async data(socket, data) {
                console.log(`HawkEye trigger, port: ${port}`);
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
                if (OBSCourt == index) SetGPIO(36, 1);
                await sleep(callWarningTime);
                tally.display.lh_tally = 0;
                tally.display.text = "Close Call";
                cerebrum.sendTallyUDP(cerebrumIP, cerebrumPort, tally);
                if (OBSCourt == index) SetGPIO(36, 0);
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

async function SetGPIO(pin: number, state: number) {
    await $`sudo gpioset gpiochip1 ${pin}=${state}`;
}