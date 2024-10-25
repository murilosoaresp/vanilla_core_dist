declare class Opt<T> {
    private _has_value;
    private _value;
    private constructor();
    static none<T>(): Opt<T>;
    static some<T>(value: T): Opt<T>;
    static of_value_or_null<T>(value: T | null): Opt<T>;
    is_some(): boolean;
    is_none(): boolean;
    unwrap(): T | null;
    value_or(t: T): T;
    value_or_throw(): T;
    value_unchecked(): T;
    do_if_some(fn: (t: T) => void): void;
    do_if_none(fn: () => void): void;
    do<G>(fn_some: (t: T) => G, fn_none: () => G): G;
}

declare class HashSet {
    private inner;
    constructor();
    insert(hash: string): void;
    remove(hash: string): void;
    contains(hash: string): boolean;
}

declare class List<T> {
    private inner;
    constructor();
    static of<T>(array: T[]): List<T>;
    get_inner(): T[];
    len(): number;
    is_valid_index(index: number): boolean;
    get(index: number): T;
    push(value: T): void;
    append(other: List<T>): void;
    remove(index: number): void;
    iter(): Generator<T>;
    for_each(fn: (t: T) => void): void;
    map<G>(fn: (t: T) => G): List<G>;
    map_async_all<G>(fn: (t: T) => Promise<G>): Promise<List<G>>;
    filter(fn: (t: T) => boolean): List<T>;
    filter_map<G>(fn: (t: T) => Opt<G>): List<G>;
    to_hash_set(fn: (t: T) => string): HashSet;
    find_first(fn: (t: T) => boolean): Opt<T>;
    join(sep: string): string;
}

declare class HashMap<T> {
    private inner;
    constructor();
    len(): number;
    insert(hash: string, value: T): void;
    remove(hash: string): void;
    keys(): string[];
    contains_hash(hash: string): boolean;
    get(hash: string): Opt<T>;
    iter(): Generator<{
        hash: string;
        value: T;
    }>;
    to_list(): List<{
        hash: string;
        value: T;
    }>;
}

type HashTreeItem<T> = {
    value: T;
    parent_hash: Opt<string>;
    children: List<string>;
};

declare class HashTree<T> {
    private root_hash;
    private value_map;
    private parent_map;
    private children_map;
    constructor();
    get(hash: string): Opt<T>;
    get_item(hash: string): Opt<HashTreeItem<T>>;
    contains(hash: string): boolean;
    remove(hash: string): void;
    insert(hash: string, parent_opt: Opt<string>, value: T): void;
    depth_first_hashes(): List<string>;
    private depth_first_keys_rec;
    private remove_rec;
}

declare class MultiHashTree<T> {
    private trees;
    constructor();
    get(hash: string): Opt<T>;
    get_item(hash: string): Opt<HashTreeItem<T>>;
    contains(hash: string): boolean;
    remove(hash: string): void;
    insert(hash: string, parent_opt: Opt<string>, value: T): void;
    depth_first_hashes(): List<string>;
}

declare namespace CoreExtensions {
    function load(): void;
}

declare namespace DateExtensions {
    function load(): void;
}
declare global {
}

declare namespace NumberExtensions {
    function load(): void;
}
declare global {
    interface Number {
        min(other: number): number;
        max(other: number): number;
        abs(): number;
        sqrt(): number;
    }
}

declare namespace StringExtensions {
    function load(): void;
}
declare global {
    interface String {
        parse_json<T>(): T;
        parse_int(): number;
        parse_float(): number;
        parse_number(): number;
        parse_number_or(if_nan: number): number;
        to_number_or(or_value: number): number;
        encode_uri_component(): string;
        decode_uri_component(): string;
        is_whitespace(): boolean;
        is_newline(): boolean;
        is_digit(): boolean;
        is_letter(): boolean;
        is_alphanumeric(): boolean;
    }
}

declare class IdGen {
    private counter;
    constructor(start_at: number);
    next(): number;
}

declare class Color {
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(r: number, g: number, b: number, a: number);
    static parse_hex_string(hex_string: string): Color;
    with_alpha(alpha: number): Color;
    mix(pct: number, other: Color): Color;
    rgba_string(): string;
}

declare function exaustive_switch(_: never): never;

declare namespace Log {
    function json(x: any, n?: number): void;
}

declare namespace PathUtils {
    function remove_last_extension(filename: string): string;
}

interface IPromiseSchedulerJob {
    start(): void;
    is_done(): boolean;
}
declare class PromiseScheduler<Job extends IPromiseSchedulerJob> {
    private static readonly SLEEP_MS;
    static run<Job extends IPromiseSchedulerJob>(n_simultanious_jobs: number, jobs: List<Job>): Promise<void>;
    private n_simultanious_jobs;
    private jobs;
    private active_jobs;
    private current_job_index;
    private finished_jobs;
    constructor(n_simultanious_jobs: number, jobs: List<Job>);
    private run;
    private clear_finished_jobs;
    private push_next_job;
}

declare namespace SimplePromiseScheduler {
    function run_jobs(nJobs: number, actionList: List<() => Promise<void>>): Promise<void>;
}

declare namespace Random {
    function str(length: number): string;
}

declare class Result<T, E> {
    private _is_ok;
    private value;
    private error;
    private constructor();
    static error<T, E>(error: E): Result<T, E>;
    static ok<T, E>(value: T): Result<T, E>;
    is_ok(): boolean;
    is_error(): boolean;
    get_value(): T;
    get_error(): E;
    value_or_throw(): T;
}

declare function sleep(time_ms: number): Promise<void>;

declare class UniqueHashGenerator {
    private hash_set;
    constructor();
    _next(size: number): string;
    _remove(hash: string): void;
    _add_hash(hash: string): void;
}

declare class WebWorker<Input, Output> {
    private worker;
    constructor(worker: Worker);
    static from_uri(url_or_src: string): WebWorker<unknown, unknown>;
    run(input: Input): Promise<Output>;
}

export { Color, CoreExtensions, DateExtensions, HashMap, HashSet, HashTree, type HashTreeItem, type IPromiseSchedulerJob, IdGen, List, Log, MultiHashTree, NumberExtensions, Opt, PathUtils, PromiseScheduler, Random, Result, SimplePromiseScheduler, StringExtensions, UniqueHashGenerator, WebWorker, exaustive_switch, sleep };
