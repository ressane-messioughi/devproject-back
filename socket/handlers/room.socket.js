import { connectedUsers } from "../state/userOnline.socket.js";

export default function registerRoomEvents(io, socket) {

socket.on("joinProjectRoom", (data) => {
    const { id_project, user } = data || {};
    if (!id_project || !user) return;

    const room = `project_${id_project}`;

    socket.join(room);

    socket.data.room = room;
    socket.data.userId = user.id;

    if (!connectedUsers[room]) {
      connectedUsers[room] = [];
    }

    const alreadyExist = connectedUsers[room].find(
      (item) => item.id === user.id
    );

    if (!alreadyExist) {
      connectedUsers[room].push({
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      });
      socket.to(room).emit("userConnected", {
    username: user.username,
    avatar: user.avatar,
      });
    }
    

    io.to(room).emit("connectedUsers", connectedUsers[room]);
  });

 socket.on("leaveProjectRoom", () => {
  const room = socket.data.room;
  const userId = socket.data.userId;

  if (!room || !userId) return;

  connectedUsers[room] = connectedUsers[room].filter(
    (user) => user.id !== userId
  );

  io.to(room).emit("connectedUsers", connectedUsers[room]);

  socket.leave(room);
});

 socket.on("getConnectedUsers", ({ id_project }) => {
  const room = `project_${id_project}`;

  socket.emit("connectedUsers", connectedUsers[room] || []);
});

  socket.on("disconnect", () => {
    const room = socket.data.room;
    const userId = socket.data.userId;

    if (!room || !userId) return;

    connectedUsers[room] = connectedUsers[room].filter(
      (user) => user.id !== userId
    );

    io.to(room).emit("connectedUsers", connectedUsers[room]);
  });

}