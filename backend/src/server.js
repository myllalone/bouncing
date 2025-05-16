const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

// Função para enviar mensagem a todos os clientes conectados
function broadcast(data) {
    const message = JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(message);
        }
    });
}

// Função que envia a contagem de usuários online
function broadcastUserCount() {
    broadcast({
        type: "system",
        action: "count",
        count: wss.clients.size
    });
}

wss.on("connection", (ws) => {
    console.log("client connected");

    // Envia nova contagem ao conectar
    broadcastUserCount();

    ws.on("error", console.error);

    ws.on("message", (data) => {
        try {
            const parsed = JSON.parse(data);

            // Repassa a mensagem normalmente para todos
            broadcast(parsed);
        } catch (err) {
            console.error("Erro ao processar mensagem:", err.message);
        }
    });

    ws.on("close", () => {
        console.log("client disconnected");

        // Atualiza contagem ao desconectar
        broadcastUserCount();
    });
});
