async function fetcher(url) {
    const data = await fetch(url, {
        method: 'GET'
      }).then((response) => response.text())
      .then(_data => { return _data; })
      .catch(error => { console.error(error); });
    
      return JSON.parse(data);
}