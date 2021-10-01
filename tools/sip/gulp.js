'use strict';

const glob = require('glob')
    , decomment = require('decomment')
    , events = require('events')
    , fs = require('fs')
    , fspath = require('path')
    , merge = require('lodash.merge')
    , yazl = require('yazl')


class Task {
    constructor(block) {
        this.block = block
        this.name = block ? '(lambda)' : undefined
    }

    unwrap() {
        return this.block
    }

    static of(...subtasks) {
        let names = subtasks.map(t => t.name)
        subtasks.reverse()
        let task = new Task((cb) => {
            let chain = cb
            for (let t of subtasks) {
                let f = chain
                chain = () => t.run(f)
            }
            chain()
        })
        task.name = `Series of: ${names.join()}.`
        return task
    }

    run(cb) {
        console.log(`run ${JSON.stringify(this.name)}`)
        let r = this.block(cb)
        return r
    }
}


class Path {
    constructor(path, base=path) {
        this.path = path
        this.base = base
        this.content = undefined
    }

    toString() {
        return `Path(${this.path})`
    }

    exists() {
        return fs.existsSync(this.path)
    }

    get isFile() {
        let stats = fs.statSync(this.path)
        return stats.isFile()
    }

    get parent() {
        return new Path(fspath.dirname(this.path))
    }

    mkdir() {
        return fs.mkdirSync(this.path, {recursive:true})
    }

    readBytes() {
        return fs.readFileSync(this.path)
    }

    read() {
        if (this.content === undefined) {
            this.content = this.readBytes()
        }
        return this.content
    }

    json() {
        return JSON.parse(this.read())
    }

    static extractBase(path, pattern) {
        let base = path
        for (let i = 1; i <= path.length; ++i) {
            if (path.substring(0, i) === pattern.substring(0, i)) {
                base = path.substring(i, path.length)
            }
            else { break }
        }
        return base
    }

    relativeTo(path) {
        return new Path(fspath.join(path.path, this.base))
    }
}


class Pipe extends events.EventEmitter {
    constructor() {
        super()
        this.sink = undefined
    }

    queue(value) {
        value = this.transform(value)
        if (this.sink !== undefined) {
            this.sink.queue(value)
        }
    }

    transform(value) {
        return value
    }

    close() {
        this.emit('end')
        if (this.sink !== undefined) {
            this.sink.close()
        }
    }

    pipe(sink) {
        this.sink = sink
        return this.sink
    }
}


class GlobPipe extends Pipe {
    constructor(patterns) {
        super()

        function inner(self, pattern, cb) {
            glob(pattern, {}, (err, files) => {
                for (let fn of files) {
                    let base = Path.extractBase(fn, pattern)
                    self.queue(new Path(fn, base))
                }
            })
            .on('end', cb)
        }

        const cb = () => this.close()

        if (patterns instanceof Array) {
            patterns = patterns.slice()
            patterns.reverse()
            let chain = cb
            for (let pattern of patterns) {
                let f = chain
                chain = () => inner(this, pattern, f)
            }
            chain()
        }
        else {
            inner(this, patterns, cb)
        }
    }
}


class DestPipe extends Pipe {
    constructor(directory) {
        super()
        this.directory = new Path(directory)
    }

    transform(value) {
        if (value instanceof Path) {
            let dest = value.relativeTo(this.directory)
            if (!dest.parent.exists()) {
                dest.parent.mkdir()
            }
            if (value.content !== undefined) {
                fs.writeFileSync(dest.path, value.content)
            }
            else {
                fs.copyFileSync(value.path, dest.path)
            }
        }
    }
}


class ZipDestPipe extends Pipe {
    constructor(fileName) {
        super()
        this.file = new Path(fileName)
        this.zfile = new yazl.ZipFile()
        this.zfile.outputStream
            .pipe(fs.createWriteStream(fileName))
            .on('close', () => this._on_zip_end())
    }

    _on_zip_end() {
        super.queue(this.file)
        super.close()
    }

    queue(value) {
        if (value instanceof Path) {
            if (!value.isFile) { return; }
            if (value.content !== undefined) {
                this.zfile.addBuffer(value.content, value.base)
            }
            else {
                this.zfile.addFile(value.path, value.base)
            }
        }
    }

    close() {
        this.zfile.end()
    }
}


class EditJsonPipe extends Pipe {
    constructor(editor) {
        super()
        this.editor = editor
    }

    transform(value) {
        if (value instanceof Path) {
            obj = value.json()
            obj = {
                ...obj,
                ...this.editor
            }
            value.content = JSON.stringify(obj, null, '\t')
        }
        return value
    }
}


class MergeJsonPipe extends Pipe {
    constructor(options) {
        super()
        this.options = options
        this.merged = {}
    }

    queue(value) {
        if (value instanceof Path) {
            value = value.json()
        }
        if (this.options.edit !== undefined) {
            value = this.options.edit(value)
        }
        this.merged = merge(this.merged, value)
    }

    close() {
        if (this.options.transform !== undefined) {
            this.merged = this.options.transform(this.merged)
        }
        if (this.sink !== undefined) {
            let file = new Path(this.options.fileName)
            file.content = JSON.stringify(this.merged, null, '\t')
            this.sink.queue(file)
        }
        super.close()
    }
}


class SourcePipe extends Pipe {
    constructor(fileName) {
        super()
        this.file = new Path(fileName)
        this.file.content = Buffer.alloc(0)
    }

    write(chunk) {
        this.file.content = Buffer.concat([this.file.content, chunk])
    }

    end() {
        this.queue(this.file)
        this.close()
    }
}


class StripCommentsPipe extends Pipe {
    transform(value) {
        if (value instanceof Path) {
            let text = value.read().toString()
            text = decomment(text)
            value.content = Buffer.from(text)
        }
        return value
    }
}


let TASK_REGISTRY = new Map()


TASK_REGISTRY.set('default', new Task(() => {}))


function undefined_task(name) {
    throw 'Undefined task: ' + JSON.stringify(name)
}

function task(name, ...blocks) {
    if (!blocks.length) {
        if (name instanceof Task) {
            return name
        }
        return TASK_REGISTRY.get(name) || undefined_task(name)
    }
    let task;
    if (blocks.length === 1) {
        for (let f of blocks) {
            if (typeof(f) === 'function') {
                task = new Task(f)
            }
            else {
                task = f
            }
        }
    }
    else {
        task = Task.of(...blocks.map(f => {
            if (typeof(f) === 'function') {
                return new Task(f)
            }
            return f
        }))
    }
    task.name = name
    TASK_REGISTRY.set(name, task)
}

function series(...names) {
    return Task.of(...names.map(name => task(name)))
}

function parallel(...names) {
    return series(...names)
}

function run(config, ...names) {
    if (!names.length) {
        names = ['default']
    }
    let plan = series(...names)
    plan.run(() => {
    })
}

function src(pattern) {
    return new GlobPipe(pattern)
}

function source(fileName) {
    return new SourcePipe(fileName)
}

function dest(directory) {
    return new DestPipe(directory)
}

function editjson(editor) {
    return new EditJsonPipe(editor)
}

function mergejson(options={}) {
    return new MergeJsonPipe(options)
}

function streamify(plugin) {
    return plugin
}

function stripComments() {
    return new StripCommentsPipe()
}

function zip_dest(fileName) {
    return new ZipDestPipe(fileName)
}

const zip = {
    dest: zip_dest,
}


module.exports = {
    dest,
    editjson,
    mergejson,
    parallel,
    run,
    series,
    source,
    src,
    streamify,
    stripComments,
    task,
    zip,
}
