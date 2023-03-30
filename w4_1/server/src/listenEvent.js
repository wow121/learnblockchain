const {ethers} = require("ethers");

const erc721abi = require(`../abis/erc721abi.json`)
const {Interface, FormatTypes} = require("ethers/lib/utils");
const sqlite3 = require('sqlite3')

const db = new sqlite3.Database('data.db');
const http = require('http');


function getFunctionID() {
    let transferTopic = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Transfer(address,address,uint256)"));
    console.log("transferTopic:" + transferTopic)
    let id = ethers.utils.id("Transfer(address,address,uint256)")
    console.log("Transfer:" + id);
}

async function parseTransferEvent(event) {
    const TransferEvent = new ethers.utils.Interface(["event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"]);
    let decodedData = TransferEvent.parseLog(event);
    let from = decodedData.args.from;
    let to = decodedData.args.to;
    let ntf_id = decodedData.args.tokenId;
    console.log("from:" + from);
    console.log("to:" + to);
    console.log("value:" + ntf_id);
    const sql = "INSERT INTO ntf_event (addr,ntf_id) values (\'" + to + "\'," + ntf_id + ");"
    console.log("sql:" + sql)
    db.run(sql, (err, row) => {
        console.log("error:" + err)
        console.log(row)
    });

}

async function initDatabase() {
    db.run('CREATE TABLE IF NOT EXISTS ntf_event(id INTEGER PRIMARY KEY, addr VARCHAR(50) NOT NULL, ntf_id INTEGER NOT NULL)', (err, row) => {
        console.log("error:" + err)
        console.log(row)
    })
}

async function initServer() {
    const server = http.createServer((req, res) => {

        const {url} = req;

        const addr = url.split('/')[2];

        const sql = 'select count(0) from ntf_event where addr=\'' + addr + '\'';

        console.log("sql:" + sql)
        db.get(sql, (err, row) => {
            console.log("error:" + err)
            console.log(row)

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({"data": {"count": row['count(0)']}}));
        })
    })

    server.listen(3000, () => {
        console.log('Server running on port 3000');
    });
}

async function main() {
    await initDatabase();
    await initServer();

    const iface = new Interface(erc721abi);
    const humAbi = iface.format(FormatTypes.full);

    let provider = new ethers.providers.WebSocketProvider('ws://127.0.0.1:8545')

    let myerc721 = new ethers.Contract("0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0", humAbi, provider)

    let filter = {
        address: myerc721.address, topics: [ethers.utils.id("Transfer(address,address,uint256)")]
    }

    provider.on(filter, (event) => {
        console.log(event)
        parseTransferEvent(event);
    })
}

main()