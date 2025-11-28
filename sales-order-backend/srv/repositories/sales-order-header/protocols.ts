import { SalesOrderHeaderModel } from 'srv/models/sales-order-header'

export interface SalesOrderHeaderRepository {
    bulkCreate(headers: SalesOrderHeaderModel[]): Promise<void>;
}