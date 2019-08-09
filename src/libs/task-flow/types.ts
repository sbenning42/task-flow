import { Observable, BehaviorSubject, Subject } from "rxjs";

export type SyncOperation<Arguments extends any[], Result> = (...args: Arguments) => Result;
export type AsyncOperation<Arguments extends any[], Result> = SyncOperation<Arguments, Observable<Result>>;
export type Operation<Arguments extends any[], Result> = SyncOperation<Arguments, Result> | AsyncOperation<Arguments, Result>;

export enum TASK_STATE {
    IDLE = '[TASK STATE] IDLE',
    PENDING = '[TASK STATE] PENDING',
}

export enum TASK_RESULT_STATUS {
    RESOLVED = '[TASK RESULT STATUS] RESOLVED',
    REJECTED = '[TASK RESULT STATUS] REJECTED',
    CANCELED = '[TASK RESULT STATUS] CANCELED',
}

export class Task<Arguments extends any[], Result> {

    state: BehaviorSubject<TASK_STATE> = new BehaviorSubject(TASK_STATE.IDLE);
    resultStatus: Subject<TASK_RESULT_STATUS> = new Subject<TASK_RESULT_STATUS>();
    result: Subject<Result> = new Subject<Result>();
    error: Subject<any> = new Subject<any>();

    constructor(
        public operation: Operation<Arguments, Result>,
    ) {
    }
}

export class TaskFlow {
    constructor() {
    }
}

export class TaskFlowEngine {
    constructor() {
    }
}
