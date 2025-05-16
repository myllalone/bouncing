const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const SECRET_TOKEN = process.env.SECRET_TOKEN || "SEU_TOKEN_SEGURO_AQUI";

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

    broadcastUserCount();

    ws.on("error", console.error);

    ws.on("message", (data) => {
        try {
            const parsed = JSON.parse(data);

            // Verifica se a mensagem é do tipo 'entered' ou 'left'
            if (parsed.type === "system" && ["entered", "left"].includes(parsed.action)) {
                if (parsed.secret !== SECRET_TOKEN) {
                    console.log("Mensagem rejeitada: token inválido.");
                    return;
                }
            }

            // Se passou, repassa normalmente
            broadcast(parsed);
        } catch (err) {
            console.error("Erro ao processar mensagem:", err.message);
        }
    });

    ws.on("close", () => {
        console.log("client disconnected");
        broadcastUserCount();
    });
});
