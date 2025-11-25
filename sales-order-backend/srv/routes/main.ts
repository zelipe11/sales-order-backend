import '../configs/module-alias';

import cds, { Request, Service } from '@sap/cds';
import { Customers, Product, Products, SaleOrderHeaders, SalesOrderItem, SalesOrderItems } from '@models/sales';
import { customerController } from '../factories/controllers/customer';
import { salesOrderHeaderController } from '../factories/controllers/sales-order-header';
import { FullRequestParams } from './protocols';

export default (service: Service) => {
    service.before('READ', '*', (request: Request) => {
        if (!request.user.is('read_only_user')) {
            return request.reject(403, 'Não autorizado');
        }
    });

    service.before(['WRITE', 'DELETE'], '*', (request: Request) => {
        if (!request.user.is('read_only_user')) {
            return request.reject(403, 'Não autorizada a escrita/criação');
        }
    });

    service.after('READ', 'Customers', (customerList: Customers, request) => {
        (request as unknown as FullRequestParams<Customers>).results = customerController.afterRead(customerList);
    });

    service.before('CREATE', 'SaleOrderHeaders', async (request: Request) => {
        const result = await salesOrderHeaderController.beforeCreate(request.data);
        if (result.hasError) {
            return request.reject(400, result.error?.message as string);
        }
        request.data.totalAmount = result.totalAmount;
    });
    service.after('CREATE', 'SaleOrderHeaders', async (salesOrderHeaders: SaleOrderHeaders, request: Request) => {
        await salesOrderHeaderController.afterCreate(salesOrderHeaders, request.user);
    });
};
