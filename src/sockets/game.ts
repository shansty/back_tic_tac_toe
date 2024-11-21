import io from '../my_socket_io_server';
import { games } from '../datas/games';
import { NotFoundException } from '../exceptions/notFound';
import { ErrorCode } from '../exceptions/root';

export const gamesSocket = io.of("/games");

gamesSocket.on("connection", socket => {

  socket.on("start_game", (user_id, gameId) => {
    console.log("games.start_game.start")

    socket.join(user_id)
    const game = games.find(g => g.gameId === gameId)
    console.log(game)
    if(!game) {
      return
      // throw new NotFoundException("Game not found", ErrorCode.GAME_NOT_FOUND)
    }
    if(user_id === game.player_x) {
      gamesSocket.to(game.player_x).emit("determining_the_order_of_moves", "You are player X")
    } 
    if(user_id == game.player_o){
      gamesSocket.to(game.player_o).emit("determining_the_order_of_moves", "You are player O")
    }

    if ((game.o.length + game.x.length) % 2 == 0) {
      gamesSocket.to(game.player_x).to(game.player_o).emit(`order_of_move`, "X")
    } else {
      gamesSocket.to(game.player_x).to(game.player_o).emit(`order_of_move`, "O")
    }

  })

  socket.on("move", (gameId, user_id, index)  => {
    console.log("game.move.start")
    const game = games.find(g => g.gameId === gameId)
    console.log(game)

    if (!game) {
      return
      // throw new NotFoundException("Game not found", ErrorCode.GAME_NOT_FOUND)
    } 
    if (![game.player_o, game.player_x].includes(user_id)) {
      // throw new NotFoundException("One or two users not found", ErrorCode.GAME_NOT_FOUND)
    }

    if (game.player_x === user_id) {
      if ((game.x.length + game.o.length) % 2 === 1){
        return 
      } 
      game.x.push(index) 
      gamesSocket.to(game.player_x).to(game.player_o).emit(`order_of_move`, "O")
    }

    if (game.player_o === user_id) {
      if ((game.x.length + game.o.length) % 2 === 0) {
        return
      } 
      game.o.push(index)
      gamesSocket.to(game.player_x).to(game.player_o).emit(`order_of_move`, "X")
    }

    gamesSocket.to(game.player_x).to(game.player_o).emit(`update-${gameId}`, game)
  });    
  
  socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
  });
});
