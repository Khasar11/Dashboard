
const getFolder = id => {
  socket.emit('request-folder-info', id, callback => {
    renderFolder(id, callback)
  })
}

const renderFolder = (id, fileFolderArray) => {
  if (qSelect(`#render-folder-${id}`) != undefined) qSelect(`#render-folder-${id}`).remove()
  let renderFolderWrapper = document.createElement('div')
  let renderFolderHeader = document.createElement('div')
  let renderFolderContent = document.createElement('div')

  renderFolderWrapper.className = 'form-form'
  renderFolderWrapper.classList.add('min-width-30')
  renderFolderContent.className = 'upload-area'

  let headerTitle = document.createElement('p')
  headerTitle.className = 'fixed-top-small-grayed'
  headerTitle.textContent = id+' files'

  let xOut = document.createElement('div')
  xOut.className = 'form-Xout'
  xOut.innerHTML = '✖'
  xOut.addEventListener('click', _ => { // x out this log view
    renderFolderWrapper.remove()
  })

  let filesDone = 0
  let filesToDo = 0

  const preventDefaults =e => {
    e.preventDefault()
    e.stopPropagation()
  }

  const supportsFileSystemAccessAPI =
    'getAsFileSystemHandle' in DataTransferItem.prototype;
  const supportsWebkitGetAsEntry =
    'webkitGetAsEntry' in DataTransferItem.prototype;
  
  const handleDrop = async e => {
    let dt = e.dataTransfer
    let files = dt.files
    handleFiles(files)
  }

  let progress = document.createElement('progress')
  progress.setAttribute('max', 100)
  progress.value = 0
  
  const initializeProgress = numfiles => {
    progress.value = 0
    filesDone = 0
    filesToDo = numfiles
  }

  const progressDone = _ => {
    filesDone++
    progress.value = filesDone / filesToDo * 100
  }

  const handleFiles = files => {
    initializeProgress(files.length);
    let c = 0
    let delayedUpload = _ => {
      uploadFile(files[c])
      c++
      setTimeout(_ => {
        if (c < files.length) delayedUpload()
      }, 500) // keep a short delay in between uploads
    }
    delayedUpload()
  }
  
  const uploadFile = async file => {
    let uploadContent = {id: id, name: file.name, size: file.size, data: file}
    console.log(uploadContent)
    if (uploadContent.size == 0 || uploadContent.name.split('.').length == 1) {
      alert('File size for ' +file.name +' is 0 or file has no file extension')
      progressDone()
      return
    }
    await socket.emit('file-upload', uploadContent, callback => {
      console.log(callback)
    })
    progressDone()
    setTimeout(_ => { progress.value = 0 }, 3000) // reset progress bar after 3s
  }

  ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => 
    renderFolderContent.addEventListener(eventName, preventDefaults, false))

  renderFolderContent.addEventListener("dragenter", (e) =>
    renderFolderContent.style.outline = "solid red 1px");

  ;['dragleave', 'drop'].forEach(evemtName => 
    renderFolderContent.addEventListener(evemtName, _ => renderFolderContent.style.outline = ""))

  renderFolderContent.addEventListener('drop', handleDrop, false)

  renderFolderHeader.append(headerTitle, progress, xOut)

  renderFolderWrapper.append(renderFolderHeader, renderFolderContent)

  fileFolderArray.forEach(pathString => {
    renderFolderContent.append(resolveStructure(pathString))
  })

  qSelect('#main-wrapper').append(renderFolderWrapper)
}

const resolveStructure = pathString => {
  let isFolder = pathString.split('\\\\').length > 1

  if (isFolder) {

  } else {

  }
}