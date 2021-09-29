/**
 * Util Spawn
 *
 * @packageDocumentation
 */
/// <reference types="node" />
import * as cp from 'child_process';
import * as out from '../output/';
declare type PF = (v?: unknown) => void;
declare class Spawn {
    output: out.OutputInstance;
    constructor(output: out.OutputInstance);
    exec_sync(command: string): void;
    spin(command: string, context: string, action: string, resolve: PF, reject: PF): cp.ChildProcessWithoutNullStreams;
    log(command: string, context: string, action: string, resolve: PF, reject: PF): cp.ChildProcessWithoutNullStreams;
    verbose_log(command: string, context: string, action: string, resolve: PF, reject: PF): cp.ChildProcessWithoutNullStreams;
    private _spawn;
}
export declare type SpawnInstance = InstanceType<typeof Spawn>;
export declare function create(output: out.OutputInstance): SpawnInstance;
export {};
