class Opt {
    _has_value;
    _value;
    constructor() {
        this._has_value = false;
        this._value = null;
    }
    static none() {
        return new Opt();
    }
    static some(value) {
        let toReturn = Opt.none();
        toReturn._has_value = true;
        toReturn._value = value;
        return toReturn;
    }
    static of_value_or_null(value) {
        if (value === null) {
            return Opt.none();
        }
        else {
            return Opt.some(value);
        }
    }
    is_some() {
        return this._has_value;
    }
    is_none() {
        return !this.is_some();
    }
    unwrap() {
        return this._value;
    }
    value_or(t) {
        if (this.is_none()) {
            return t;
        }
        else {
            return this.value_unchecked();
        }
    }
    value_or_throw() {
        if (this.is_none()) {
            throw new Error();
        }
        else {
            return this.value_unchecked();
        }
    }
    value_unchecked() {
        return this._value;
    }
}

class List {
    inner;
    constructor() {
        this.inner = [];
    }
    static of(array) {
        let isntance = new List();
        isntance.inner = array;
        return isntance;
    }
    len() {
        return this.inner.length;
    }
    is_valid_index(index) {
        return this.len() > 0
            && 0 <= index
            && index < this.len();
    }
    get(index) {
        return this.inner[index];
    }
    push(value) {
        this.inner.push(value);
    }
    remove(index) {
        this.inner.slice(index, 1);
    }
    *iter() {
        for (let value of this.inner) {
            yield value;
        }
    }
    for_each(fn) {
        for (let value of this.inner) {
            fn(value);
        }
    }
    map(fn) {
        let output = new List();
        for (let value of this.iter()) {
            output.push(fn(value));
        }
        return output;
    }
    join(sep) {
        return this.inner.join(sep);
    }
}

class HashMap {
    inner;
    constructor() {
        this.inner = {};
    }
    len() {
        return Object.keys(this.inner).length;
    }
    insert(hash, value) {
        this.inner[hash] = value;
    }
    remove(hash) {
        delete this.inner[hash];
    }
    keys() {
        return Object.keys(this.inner);
    }
    contains_hash(hash) {
        return hash in this.inner;
    }
    get(hash) {
        if (this.contains_hash(hash)) {
            return Opt.some(this.inner[hash]);
        }
        else {
            return Opt.none();
        }
    }
    to_list() {
        let output = new List();
        for (let hash of this.keys()) {
            output.push({ hash, value: this.inner[hash] });
        }
        return output;
    }
}

class HashSet {
    inner;
    constructor() {
        this.inner = new HashMap();
    }
    insert(hash) {
        this.inner.insert(hash, null);
    }
    remove(hash) {
        this.inner.remove(hash);
    }
    contains(hash) {
        return this.inner.contains_hash(hash);
    }
}

var DateExtensions;
(function (DateExtensions) {
    function load() { }
    DateExtensions.load = load;
})(DateExtensions || (DateExtensions = {}));

var NumberExtensions;
(function (NumberExtensions) {
    function load() { }
    NumberExtensions.load = load;
})(NumberExtensions || (NumberExtensions = {}));
const TOL = 0.000_000_1;
Number.prototype.tol_equals = function (other) {
    return (this - other).abs() <= TOL;
};
Number.prototype.delta_equals = function (other, delta) {
    return (this - other).abs() < delta;
};
Number.prototype.min = function (other) {
    return Math.min(this, other);
};
Number.prototype.max = function (other) {
    return Math.max(this, other);
};
Number.prototype.abs = function () {
    return Math.abs(this);
};
Number.prototype.sqrt = function () {
    return Math.sqrt(this);
};
Number.prototype.to_px = function () {
    return this * 96.0 / 2.54;
};
Number.prototype.to_cm = function () {
    return this * 2.54 / 96.0;
};

var StringExtensions;
(function (StringExtensions) {
    function load() { }
    StringExtensions.load = load;
})(StringExtensions || (StringExtensions = {}));
String.prototype.parse_json = function () {
    return JSON.parse(this);
};
String.prototype.parse_int = function () {
    return parseInt(this);
};
String.prototype.parse_float = function () {
    return parseFloat(this);
};
String.prototype.parse_number = function () {
    return Number(this);
};
String.prototype.parse_number_or = function (if_nan) {
    let parsed = Number(this);
    if (isNaN(parsed)) {
        parsed = if_nan;
    }
    return parsed;
};
String.prototype.to_number_or = function (or_value) {
    try {
        let parsed = Number(this);
        return isNaN(parsed) ? or_value : parsed;
    }
    catch {
        return or_value;
    }
};
String.prototype.encode_uri_component = function () {
    return encodeURIComponent(this);
};
String.prototype.decode_uri_component = function () {
    return decodeURIComponent(this);
};
String.prototype.is_whitespace = function () {
    return /\s/.test(this);
};
String.prototype.is_newline = function () {
    return /\n/.test(this);
};
String.prototype.is_digit = function () {
    const char_code = this.charCodeAt(0);
    return char_code >= 48 && char_code <= 57;
};
String.prototype.is_letter = function () {
    const char_code = this.charCodeAt(0);
    return (char_code >= 65 && char_code <= 90) || (char_code >= 97 && char_code <= 122);
};
String.prototype.is_alphanumeric = function () {
    return this.is_digit() || this.is_letter();
};

var CoreExtensions;
(function (CoreExtensions) {
    function load() {
        DateExtensions.load();
        NumberExtensions.load();
        StringExtensions.load();
    }
    CoreExtensions.load = load;
})(CoreExtensions || (CoreExtensions = {}));

class IdGen {
    counter;
    constructor(start_at) {
        this.counter = start_at;
    }
    next() {
        this.counter += 1;
        return this.counter;
    }
}

class Vec2D {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static zero() {
        return new Vec2D(0.0, 0.0);
    }
    clone() {
        return new Vec2D(this.x, this.y);
    }
    shift_to(target) {
        return new Vec2D(target.x - this.x, target.y - this.y);
    }
    norm() {
        return (this.x * this.x + this.y * this.y).sqrt();
    }
    plus(other) {
        return new Vec2D(this.x + other.x, this.y + other.y);
    }
}

class Color {
    r;
    g;
    b;
    a;
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    rgba_string() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
}

function exaustive_switch(_) {
    throw new Error("Didn't expect to get here");
}

var Log;
(function (Log) {
    function json(x, n) {
        let shift = n ?? 2;
        console.log(JSON.stringify(x, null, shift));
    }
    Log.json = json;
})(Log || (Log = {}));

var PathUtils;
(function (PathUtils) {
    function remove_last_extension(filename) {
        const lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex === -1) {
            return filename; // Return the filename as is if there's no dot
        }
        return filename.substring(0, lastDotIndex);
    }
    PathUtils.remove_last_extension = remove_last_extension;
})(PathUtils || (PathUtils = {}));

function sleep(time_ms) {
    return new Promise((res, rej) => {
        setTimeout(() => res(), time_ms);
    });
}

class PromiseScheduler {
    static SLEEP_MS = 1000.0 / 60.0;
    static async run(n_simultanious_jobs, jobs) {
        let scheduler = new PromiseScheduler(n_simultanious_jobs, jobs);
        await scheduler.run();
    }
    n_simultanious_jobs;
    jobs;
    active_jobs;
    current_job_index;
    finished_jobs;
    constructor(n_simultanious_jobs, jobs) {
        this.n_simultanious_jobs = n_simultanious_jobs.min(jobs.len());
        this.jobs = jobs;
        this.active_jobs = new HashMap();
        this.current_job_index = 0;
        this.finished_jobs = 0;
    }
    async run() {
        if (this.jobs.len() === 0) {
            return;
        }
        while (this.finished_jobs < this.jobs.len()) {
            this.clear_finished_jobs();
            if (this.finished_jobs === this.jobs.len()) {
                return;
            }
            if (this.active_jobs.len() < this.n_simultanious_jobs) {
                this.push_next_job();
            }
            await sleep(PromiseScheduler.SLEEP_MS);
        }
    }
    clear_finished_jobs() {
        let keys_that_ended = new List();
        for (let entry of this.active_jobs.to_list().iter()) {
            if (entry.value.is_done()) {
                keys_that_ended.push(entry.hash);
            }
        }
        for (let key_that_ended of keys_that_ended.iter()) {
            this.active_jobs.remove(key_that_ended);
            this.finished_jobs += 1;
        }
    }
    push_next_job() {
        if (this.jobs.is_valid_index(this.current_job_index) === false)
            return;
        let job_to_add = this.jobs.get(this.current_job_index);
        this.active_jobs.insert(this.current_job_index.toString(), job_to_add);
        job_to_add.start();
        this.current_job_index += 1;
    }
}

class SimplePromiseSchedulerJob {
    action;
    isDone = false;
    constructor(action) {
        this.action = action;
    }
    start() {
        this.run();
    }
    is_done() {
        return this.isDone;
    }
    async run() {
        await this.action();
        this.isDone = true;
    }
}
var SimplePromiseScheduler;
(function (SimplePromiseScheduler) {
    async function run_jobs(nJobs, actionList) {
        await PromiseScheduler.run(nJobs, actionList.map(action => new SimplePromiseSchedulerJob(action)));
    }
    SimplePromiseScheduler.run_jobs = run_jobs;
})(SimplePromiseScheduler || (SimplePromiseScheduler = {}));

var Random;
(function (Random) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    function str(length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
        return result;
    }
    Random.str = str;
})(Random || (Random = {}));

class Result {
    _is_ok;
    value;
    error;
    constructor() {
        this._is_ok = false;
        this.value = null;
        this.error = null;
    }
    static error(error) {
        let to_return = new Result();
        to_return._is_ok = false;
        to_return.value = null;
        to_return.error = error;
        return to_return;
    }
    static ok(value) {
        let to_return = new Result();
        to_return._is_ok = true;
        to_return.value = value;
        to_return.error = null;
        return to_return;
    }
    is_ok() { return this._is_ok; }
    is_error() { return this.is_ok() === false; }
    get_value() {
        if (this.is_error())
            throw new Error();
        return this.value;
    }
    get_error() {
        if (this.is_ok())
            throw new Error();
        return this.error;
    }
    value_or_throw() {
        if (this.is_error())
            throw new Error();
        return this.value;
    }
}

class UniqueHashGenerator {
    hash_set;
    constructor() {
        this.hash_set = new HashSet();
    }
    _next(size) {
        let next = Random.str(size);
        while (this.hash_set.contains(next)) {
            next = Random.str(size);
        }
        this.hash_set.insert(next);
        return next;
    }
    _remove(hash) {
        this.hash_set.remove(hash);
    }
    _add_hash(hash) {
        this.hash_set.insert(hash);
    }
}

class WebWorker {
    worker;
    constructor(worker) {
        this.worker = worker;
    }
    static from_uri(url_or_src) {
        let worker = new Worker(url_or_src);
        return new WebWorker(worker);
    }
    run(input) {
        return new Promise((res, rej) => {
            this.worker.onmessage = (r) => {
                res({});
            };
            this.worker.onerror = (r) => {
                rej();
            };
            this.worker.onmessageerror = (r) => {
                rej();
            };
            this.worker.postMessage(input);
        });
    }
}

export { Color, CoreExtensions, DateExtensions, HashMap, HashSet, IdGen, List, Log, NumberExtensions, Opt, PathUtils, PromiseScheduler, Random, Result, SimplePromiseScheduler, StringExtensions, UniqueHashGenerator, Vec2D, WebWorker, exaustive_switch, sleep };
