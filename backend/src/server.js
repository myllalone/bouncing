const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

function broadcast(data) {
    const msg = JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(msg);
        }
    });
}

function broadcastUserCount() {
    broadcast({
        type: "system",
        action: "count",
        count: wss.clients.size
    });
}

wss.on("connection", (ws) => {
    console.log("client connected");

    broadcastUserCount(); // atualiza todos com a nova contagem

    ws.on("error", console.error);

    ws.on("message", (data) => {
        try {
            const parsed = JSON.parse(data);

            // repassa a mensagem recebida para todos
            broadcast(parsed);
        } catch (err) {
            console.error("Erro ao processar mensagem:", err.message);
        }
    });

    ws.on("close", () => {
        console.log("client disconnected");
        broadcastUserCount(); // atualiza todos com a nova contagem
    });
});
