const cors = require("cors");
const app = require("express")();
app.use(cors());
const fs = require('fs');

const newLineBuffer = new Buffer('\n')
app.listen(4000, () => {
    console.log("listening...");
});

const sseHeaders = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
};


app.get("/stream", (req, res) => {
    let startAt = 0
    res.writeHead(200, sseHeaders);

    let lineIndQueue = []
    let sendBuffer = ''
    fs.watchFile('log.txt', { persistent: true }, (cur, prev) => {
        if (cur.mtime > prev.mtime) {
            let readStream = fs.createReadStream('log.txt', {
                start: startAt
            })

            let ind = startAt

            readStream.on('data', (chunk) => {
                let currentBuffer = chunk

                let neededLines = ind === 0 ? 10 : 1
                while (ind < currentBuffer.length && lineIndQueue.length < neededLines) {
                    if (currentBuffer[ind] === newLineBuffer[0])
                        lineIndQueue.push(ind)
                    ind++;
                }
                if (lineIndQueue.length > neededLines)
                    lineIndQueue.shift()

                let tmp = currentBuffer.slice(startAt, lineIndQueue[lineIndQueue.length - 1])
                sendBuffer+= tmp.toString()
            })
            
            startAt = lineIndQueue.length > 0 ? lineIndQueue[lineIndQueue.length - 1] + 1 : startAt

            res.write(sendBuffer + "\n\n")
            lineIndQueue = []
            console.log(lineIndQueue, sendBuffer, startAt, '\n----------------------------------------------')
        }
    })

    // req.on('close',()=>{
    //     res.end()
    // })
});

var cron = require('node-cron');
var lineNo = 0
cron.schedule('*/10 * * * * *', () => {
    console.log('running a task every 10sec');
    fs.appendFile('log.txt', `${lineNo} Time Now : ${new Date()} ${lineNo++}\n`, (err) => {
        if (err)
            console.log('error in appending');
        console.log('data added');
    })
    // use {flags: 'a'} to append and {flags: 'w'} to erase and write a new file
    res.send("Logs added")
});