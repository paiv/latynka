
class GitioUrlShortener {
    constructor() {
        this.serviceUrl = 'https://git.io'
    }

    shorten(url, callback) {
        const xhr = new XMLHttpRequest()
        const form = new FormData()

        form.append('url', url)

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 201) {
                callback(xhr.getResponseHeader('Location'))
            }
        }

        xhr.open('POST', this.serviceUrl, true)
        xhr.send(form)
    }
}


function shorten(url, callback) {
    const service = new GitioUrlShortener()
    return service.shorten(url, callback)
}


module.exports = {
    shorten,
}
