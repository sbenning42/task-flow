import { Observable, of, OperatorFunction, throwError, empty, NEVER, forkJoin } from "rxjs";
import { map, catchError, defaultIfEmpty, switchMap, take, takeUntil } from "rxjs/operators";

export enum RUN_STATUS {
    NONE = '[RUN STATUS] NONE',
    RESOLVED = '[RUN STATUS] RESOLVED',
    REJECTED = '[RUN STATUS] REJECTED',
    CANCELED = '[RUN STATUS] CANCELED',
}

export interface StatusValue<T, E = any> {
    status: RUN_STATUS;
    value?: T | E;
}

export function getStatus<T, E = any>(cancels: Observable<any> = NEVER) {
    return ((source$: Observable<T>) => source$.pipe(
        map(value => ({ status: RUN_STATUS.RESOLVED, value })),
        catchError(error => of({ status: RUN_STATUS.REJECTED, value: error })),
        defaultIfEmpty({ status: RUN_STATUS.CANCELED }),
        takeUntil(cancels),
    )) as OperatorFunction<T, StatusValue<T, E>>;
}

export function mapSwitchStatus<T, E = any>() {
    return ((source$: Observable<StatusValue<T, E>>) => source$.pipe(
        switchMap(({ status, value }: StatusValue<T, E>) => {
            switch (status) {
                case RUN_STATUS.RESOLVED:
                    return of(value as T);
                case RUN_STATUS.REJECTED:
                    return throwError(value as E);
                case RUN_STATUS.CANCELED:
                default:
                    return empty();
            }
        }),
    )) as OperatorFunction<StatusValue<T, E>, T>;
}

export interface Context {
    [key: string]: any;
}

export type Executor<
    ArgumentList extends Array<any>,
    Result
> = (ctx: Context, ...argumentList: ArgumentList) => Observable<Result>;

export type ExecutorFactory<
    ArgumentList extends Array<any>,
    Result
> = (ctx: Context, ...argumentList: ArgumentList) => () => Observable<Result>;

export interface RejectedCall<
    ArgumentList extends Array<any>,
    Err = any
> {
    argumentList: ArgumentList;
    error: Err;
}

export type RetryController<
    ArgumentList extends Array<any>,
    Err = any
> = (ctx: Context, rejectedCalls: RejectedCall<ArgumentList, Err>[]) => ArgumentList | false;

export type ExecutorAll<
    ArgumentListArray extends Array<Array<any>>,
    ResultArray extends Array<any>
> = (ctx: Context, ...argumentListArray: ArgumentListArray) => Observable<ResultArray>;

export function all<
    ArgumentListArray extends Array<Array<any>>,
    ResultArray extends Array<any>
>(...executors: Array<Executor<ArgumentListArray[number], ResultArray[number]>>) {
    return (ctx: Context, ...argumentListArray: ArgumentListArray) => forkJoin(
        executors.map((executor, idx) => executor(ctx, ...argumentListArray[idx]))
    );
}

export function linkOnResolve<
    SrcArgumentList extends Array<any>,
    SrcResult,
    DestArgumentList extends Array<any>,
    DestResult,
>(
    srcExecutor: Executor<SrcArgumentList, SrcResult>,
    destExecutor: Executor<DestArgumentList, DestResult>,
    argumentListFactory: (
        ctx: Context,
        srcArgumentList: SrcArgumentList,
        srcResult: SrcResult
    ) => DestArgumentList,
) {
    return (ctx: Context, ...srcArgumentList: SrcArgumentList) => srcExecutor(ctx, ...srcArgumentList).pipe(
        switchMap((srcResult: SrcResult) => destExecutor(ctx, ...argumentListFactory(ctx, srcArgumentList, srcResult)))
    );
}

export function linkOnReject<
    SrcArgumentList extends Array<any>,
    Err,
    DestArgumentList extends Array<any>,
    DestResult,
>(
    srcExecutor: Executor<SrcArgumentList, any>,
    destExecutor: Executor<DestArgumentList, DestResult>,
    argumentListFactory: (
        ctx: Context,
        srcArgumentList: SrcArgumentList,
        error: Err
    ) => DestArgumentList,
) {
    return (ctx: Context, ...srcArgumentList: SrcArgumentList) => srcExecutor(ctx, ...srcArgumentList).pipe(
        catchError((error: Err) => destExecutor(ctx, ...argumentListFactory(ctx, srcArgumentList, error)))
    );
}

export function linkOnCancel<
    SrcArgumentList extends Array<any>,
    DestArgumentList extends Array<any>,
    DestResult,
>(
    srcExecutor: Executor<SrcArgumentList, any>,
    srcCancels: Observable<any>,
    destExecutor: Executor<DestArgumentList, DestResult>,
    argumentListFactory: (
        ctx: Context,
        srcArgumentList: SrcArgumentList,
    ) => DestArgumentList,
) {
    return (ctx: Context, ...srcArgumentList: SrcArgumentList) => srcExecutor(ctx, ...srcArgumentList).pipe(
        getStatus(srcCancels),
        switchMap(value => {
            if (value.status === RUN_STATUS.CANCELED) {
                return destExecutor(ctx, ...argumentListFactory(ctx, srcArgumentList));
            }
            return of(value).pipe(mapSwitchStatus());
        }),
    );
}

export function execute<
    ArgumentList extends Array<any>,
    Result = any,
    Err = any
>(
    ctx: Context,
    executor: Executor<ArgumentList, Result>,
    retryCtrl: RetryController<ArgumentList, Err>,
    cancels: Observable<any>,
    rxMapFunction = switchMap,
) {
    const rejectedCalls: RejectedCall<ArgumentList, Err>[] = [];
    const andRetry = (argumentList: ArgumentList, error: Err) => {
        rejectedCalls.push({ argumentList, error });
        const argumentListOrFalse = retryCtrl(ctx, rejectedCalls);
        return argumentListOrFalse === false
            ? throwError(rejectedCalls)
            : executor(ctx, ...argumentListOrFalse).pipe(
                catchAndRetry(argumentListOrFalse)
            );
    };
    const catchAndRetry = (argumentList: ArgumentList) => catchError(error => andRetry(argumentList, error));
    return (source$: Observable<ArgumentList>) => source$.pipe(
        rxMapFunction((argumentList: ArgumentList) => executor(ctx, ...argumentList).pipe(
            catchAndRetry(argumentList),
            getStatus<Result, Err>(cancels),
            take(1),
        )),
    );
}



