import { assign } from './actions';
import { AssignAction, Assigner, EventObject, PropertyAssigner } from './types';
import { mapValues } from './utils';

export interface ContextModel<TC, TE extends EventObject> {
  context: TC | (() => TC);
  actions: {
    [key: string]: Assigner<TC, TE> | PropertyAssigner<TC, TE>;
  };
  withAssigners: <
    T extends {
      [key: string]: Assigner<TC, TE> | PropertyAssigner<TC, TE>;
    }
  >(
    assigners: T
  ) => ContextModel<TC, TE> & {
    actions: {
      [K in keyof T]: T[K] extends Assigner<TC, infer E>
        ? AssignAction<TC, E>
        : T[K] extends PropertyAssigner<TC, infer E>
        ? AssignAction<TC, E>
        : never;
    };
  };
}

export function createModel<TContext, TEvent extends EventObject>(
  initialState: TContext | (() => TContext)
): ContextModel<TContext, TEvent> {
  const model: ContextModel<TContext, TEvent> = {
    context: initialState,
    actions: {},
    withAssigners: (assigners) => {
      return {
        ...model,
        actions: mapValues(assigners, (assignment) => {
          return assign(assignment);
        })
      } as any;
    }
  };

  return model;
}
