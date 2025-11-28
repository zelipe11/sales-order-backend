import cds from '@sap/cds';

import { SalesOrderHeaderModel } from 'srv/models/sales-order-header';
import { SalesOrderHeaderRepository } from './protocols';

export class SalesOrderHeaderRepositoryImpl implements SalesOrderHeaderRepository {
    public async bulkCreate(headers: SalesOrderHeaderModel[]): Promise<void> {
        const headersObjects = headers.map((header) => header.toCreationObject());
        await cds.create('sales.SaleOrderHeaders').entries(headersObjects);
    }
}
