import cds, { Request, Service } from '@sap/cds';
import { Customers, Products, SalesOrderItem, SalesOrderItems } from '@models/sales';
import { rejects } from 'assert';

export default (service: Service) => {
    service.after('READ', 'Customers', (results: Customers) => {
        results.forEach(customer => {
            if (!customer.email?.includes('@')) {
                customer.email = `${customer.email}@gmail.com`
            }
        })
    });

    service.before('CREATE', 'SaleOrderHeaders', async (request: Request) => {
        const params = request.data;
        const items: SalesOrderItems = params.items;
        if (!params.customer_id) {
            return request.reject(400, 'Customer invalido')
        }
        if (!params.items || params.items?.length === 0) {
            return request.reject(400, 'Itens invalidos');
        }
        const customerQuery = SELECT.one.from('sales.Customers').where({ id: params.customer_id });
        const customer = await cds.run(customerQuery);
        if (!customer) {
            return request.reject(404, 'Customer não encontrado');
        }
        const productsIds: string[] = params.items.map((item: SalesOrderItem) => item.product_id);
        const productsQuery = SELECT.from('sales.Products').where({ id: productsIds });
        const products: Products = await cds.run(productsQuery);
        const dbProducts = products.map((product) => product.id);
        for (const item of items) {
            const dbProduct = products.find(product => product.id === item.product_id);
            if (!dbProduct) {
                return request.reject(404, `Produto ${item.product_id} não encontrado`);
            }
            if (products.some((product) => product.stock === 0)) {
                return request.reject(400, `Produto ${dbProduct.name}(${dbProduct.id}) sem estoque disponivel`);
            }
        }


    });
}