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
}

declare class List<T> {
    private inner;
    constructor();
    static of<T>(array: T[]): List<T>;
    len(): number;
    is_valid_index(index: number): boolean;
    get(index: number): T;
    push(value: T): void;
    remove(index: number): void;
    iter(): Generator<T>;
    for_each(fn: (t: T) => void): void;
    map<G>(fn: (t: T) => G): List<G>;
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
    to_list(): List<{
        hash: string;
        value: T;
    }>;
}

declare class HashSet {
    private inner;
    constructor();
    insert(hash: string): void;
    remove(hash: string): void;
    contains(hash: string): boolean;
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
        tol_equals(other: number): boolean;
        delta_equals(other: number, delta: number): boolean;
        min(other: number): number;
        max(other: number): number;
        abs(): number;
        sqrt(): number;
        to_px(): number;
        to_cm(): number;
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

declare class Vec2D {
    x: number;
    y: number;
    constructor(x: number, y: number);
    static zero(): Vec2D;
    clone(): Vec2D;
    shift_to(target: Vec2D): Vec2D;
    norm(): number;
    plus(other: Vec2D): Vec2D;
    flip_y(): Vec2D;
}

declare class AlRect2D {
    center: Vec2D;
    width: number;
    height: number;
    constructor(center: Vec2D, width: number, height: number);
}

declare class UiAlRect {
    tl_vec: Vec2D;
    width: number;
    height: number;
    constructor(tl_vec: Vec2D, width: number, height: number);
    center(): Vec2D;
}

declare class Color {
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(r: number, g: number, b: number, a: number);
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

export { AlRect2D, Color, CoreExtensions, DateExtensions, HashMap, HashSet, type IPromiseSchedulerJob, IdGen, List, Log, NumberExtensions, Opt, PathUtils, PromiseScheduler, Random, Result, SimplePromiseScheduler, StringExtensions, UiAlRect, UniqueHashGenerator, Vec2D, WebWorker, exaustive_switch, sleep };
