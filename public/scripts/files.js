
const viewFolder = id => {
  const folderWrapper = document.createElement('div')
  socket.emit('request-folder-info', id, callback => {
    
  })
}
