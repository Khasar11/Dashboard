
const viewFolder = id => {
  socket.emit('request-folder-info', id, callback => {
    const folderWrapper = document.createElement('div')
    const headerWrapper = document.createElement('div')
    const bodyWrapper = document.createElement('div')



    folderWrapper.append(headerWrapper, bodyWrapper)
  })
}