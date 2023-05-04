
const viewFolder = id => {
  socket.emit('request-folder-info', id, callback => {
    console.log(callback)
  })
}