
class Settings {

    constructor(storage, callback) {
        this.db = storage.local
        this.callback = callback

        this.storage_keys = {
            enabled: 'latynka:enabled',
        }

        this.cache = {}
        storage.onChanged.addListener((changes, area) => { this.onStorageChange(changes, area) })
        this._reload_cache()
    }

    onStorageChange(changes, area) {
        let has_changes = false
        Object.values(this.storage_keys).forEach((key) => {
            const change = changes[key]
            if (change) {
                this.cache[key] = change.newValue
                has_changes = true
            }
        })
        if (has_changes) {
            this.callback()
        }
    }

    _reload_cache() {
        this.db.get((stored) => {
            const cache = {}
            Object.values(this.storage_keys).forEach((key) => {
                cache[key] = stored[key]
            })
            this.cache = cache
            this.callback()
        })
    }

    _store(key, value) {
        const obj = {}
        obj[key] = value
        this.db.set(obj)
    }

    _get_bool(key) {
        const value = this.cache[key]
        return value === false ? value : true
    }

    get enabled() {
        return this._get_bool(this.storage_keys.enabled)
    }

    set enabled(value) {
        this._store(this.storage_keys.enabled, value)
    }

    save(items) {
        const obj = {}
        for (let key in items) {
            obj[this.storage_keys[key]] = items[key]
        }
        this.db.set(obj)
    }
}
