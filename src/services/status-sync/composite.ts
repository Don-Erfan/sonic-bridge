import type { IMood } from '../mood/interface';
import { ISyncReport, IStatusSyncTarget } from './interface';

/**
 * A group of sync targets that is itself a target (Composite). Children run
 * in parallel and their reports are concatenated; a child that breaks its
 * "never reject" contract is still reported instead of failing the group.
 */
export class CompositeStatusSync implements IStatusSyncTarget {
  constructor(
    public readonly id: string,
    private readonly children: readonly IStatusSyncTarget[],
  ) {}

  async sync(mood: IMood | null): Promise<ISyncReport[]> {
    const results = await Promise.all(
      this.children.map((child) =>
        child.sync(mood).catch((error: unknown): ISyncReport[] => [
          {
            targetId: child.id,
            ok: false,
            message: error instanceof Error ? error.message : undefined,
          },
        ]),
      ),
    );
    return results.flat();
  }
}
