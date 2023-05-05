
const getFolder = id => {
  socket.emit('request-folder-info', id, callback => {
    renderFolder(id, callback)
  })
}

const renderFolder = (id, folderArray) => {
  if (qSelect(`#render-folder-${id}`) != undefined) qSelect(`#render-folder-${id}`).remove()
  let renderFolderWrapper = document.createElement('div')
  let renderFolderHeader = document.createElement('div')
  let renderFolderContent = document.createElement('div')



  renderFolderWrapper.append(renderFolderHeader, renderFolderContent)
  qSelect('#main-wrapper').append(renderFolderWrapper)
}