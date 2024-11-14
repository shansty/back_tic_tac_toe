import io from '../my_socket_io_server';
import { games } from '../datas/games';

export const gamesSocket = io.of("/games");

gamesSocket.on("connection", socket => {

  socket.on("start_game", (user_id) => {
    console.log("START GAME")
    console.dir({ user_id})
    socket.join(user_id)
  })

  socket.on("move", (gameId, user_id, index)  => {

    console.dir({index, gameId, user_id})

    const game = games.find(g => g.gameId === gameId)

    console.dir({ game })

    if (!game) return // TODO: handle error
    if (![game.player_o, game.player_x].includes(user_id)) return // TODO handle error

    if (game.player_x === user_id) {
      if ((game.x.length + game.o.length) % 2 === 1) return // TODO: handle error (step "o")
      console.log("push to x")
      game.x.push(index) 
    }

    if (game.player_o === user_id) {
      if ((game.x.length + game.o.length) % 2 === 0) return // TODO: handle error (step "x")
      console.log("push to o")
      game.o.push(index)
    }

    gamesSocket.to(game.player_x).to(game.player_o).emit(`update-${gameId}`, game)
  });    
  
  socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
  });
});
