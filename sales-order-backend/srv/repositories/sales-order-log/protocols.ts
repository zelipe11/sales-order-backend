import { SalesOrderLog } from '@models/sales';

export interface SalesOrderLogRepository {
    create(logs: SalesOrderLog[]): Promise<void>;
}
