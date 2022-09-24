

class Requests {

    get(url, callback) {
        if (self.fetch) {
            return fetch(url).then(r => r.text()).then(t => callback(t))
        }

        var xhr = new XMLHttpRequest()
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                callback(xhr.responseText)
            }
        }
        xhr.open('GET', url, true)
        xhr.send()
    }
}


module.exports = new Requests()
