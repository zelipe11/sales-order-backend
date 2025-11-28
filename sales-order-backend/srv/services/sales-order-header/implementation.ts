import { SaleOrderHeader, SaleOrderHeaders, SalesOrderItem } from '@models/sales';
import { CreationPayloadValidationResult, SalesOrderHeaderService } from './protocols';
import { SalesOrderHeaderModel } from '../../models/sales-order-header';
import { SalesOrderItemModel } from '../../models/sales-order-item';
import { ProductRepository } from '../../repositories/product/protocols';
import { CustomerRepository } from 'srv/repositories/customer/protocols';
import { ProductModel } from 'srv/models/product';
import { CustomerModel } from 'srv/models/customer';
import { SalesOrderLogModel } from 'srv/models/sales-order-log';
import { SalesOrderLogRepository } from 'srv/repositories/sales-order-log/protocols';
import { User } from '@sap/cds';
import { LoggedUserModel } from 'srv/models/logged-user';
import { Payload as BulkCreateSalesOrderPayload } from '@models/db/types/BulkCreateSalesOrder';
import { SalesOrderHeaderRepository } from 'srv/repositories/sales-order-header/protocols';

export class SalesOrderHeaderServiceImpl implements SalesOrderHeaderService {
    constructor(
        private readonly salesOrderHeaderRepository: SalesOrderHeaderRepository,
        private readonly customerRepository: CustomerRepository,
        private readonly productRepository: ProductRepository,
        private readonly salesOrderLogRepository: SalesOrderLogRepository
    ) { }

    public async beforeCreate(params: SaleOrderHeader): Promise<CreationPayloadValidationResult> {
        const productsValidationResults = await this.validateProductsOnCreation(params);
        if (productsValidationResults.hasError) {
            return productsValidationResults;
        }
        const items = this.getSalesOrderItems(params, productsValidationResults.products as ProductModel[]);
        const header = this.getSalesOrderHeader(params, items);
        const customerValidationResult = await this.validateCustomerOnCreation(params);

        if (customerValidationResult.hasError) {
            return customerValidationResult;
        }

        const headerValidationResult = header.validateCreationPayload({ 
            customer_id: (customerValidationResult.customer as CustomerModel).id 
        });

        if (headerValidationResult.hasError) {
            return headerValidationResult;
        }

        return {
            hasError: false,
            totalAmount: header.calculateDiscount()
        };
    }

    public async afterCreate(params: SaleOrderHeaders | BulkCreateSalesOrderPayload[],
        loggedUser: User): Promise<void> {
        const headersAsArray = Array.isArray(params) ? params : ([params] as SaleOrderHeaders);
        const logs: SalesOrderLogModel[] = [];
        for (const header of headersAsArray) {
            const products = (await this.getProductsByIds(header)) as ProductModel[];
            const items = this.getSalesOrderItems(header, products);
            const salesOrderHeader = this.getExistingSalesOrderHeader(header, items);
            const productsData = salesOrderHeader.getProductData();
            for (const product of products) {
                const foundProduct = productsData.find((productData) => productData.id === product.id);
                product.sell(foundProduct?.quantity as number);
                await this.productRepository.updateStock(product);
            }
            const user = this.getLoggedUser(loggedUser);
            const log = this.getSalesOrderLog(salesOrderHeader, user);
            logs.push(log);
        }

        await this.salesOrderLogRepository.create(logs);
    }

    public async bulkCreate(headers: BulkCreateSalesOrderPayload[], loggedUser: User): Promise<CreationPayloadValidationResult> {
        const bulkCreateHeaders: SalesOrderHeaderModel[] = [];
        for (const headerObject of headers) {
            const productValidation = await this.validateProductsOnCreation(headerObject);
            if (productValidation.hasError) {
                return productValidation;
            }
            const items = this.getSalesOrderItems(headerObject, productValidation.products as ProductModel[]);
            const header = this.getSalesOrderHeader(headerObject, items);
            const customerValidationResult = await this.validateCustomerOnCreation(headerObject);

            if (customerValidationResult.hasError) {
                return customerValidationResult;
            }

            const headerValidationResult = header.validateCreationPayload({ 
                customer_id: (customerValidationResult.customer as CustomerModel).id 
            });

            if (headerValidationResult.hasError) {
                return headerValidationResult;
            }
            bulkCreateHeaders.push(header);
        }
        await this.salesOrderHeaderRepository.bulkCreate(bulkCreateHeaders);
        await this.afterCreate(headers, loggedUser);
        return {
            hasError: false
        };
    }

    private async validateProductsOnCreation(header: SaleOrderHeader | BulkCreateSalesOrderPayload
    ): Promise<CreationPayloadValidationResult> {
        const products = await this.getProductsByIds(header);
        if (!products) {
            return {
                hasError: true,
                error: new Error('Nenhum produto da lista de itens foi encontrado')
            };
        }
        return {
            hasError: false,
            products
        };
    }

    private async validateCustomerOnCreation(header: SaleOrderHeader | BulkCreateSalesOrderPayload
    ): Promise<CreationPayloadValidationResult> {
        const customer = await this.getCustomerById(header);
        if (!customer) {
            return {
                hasError: true,
                error: new Error('Customer não encontrado')
            };
        }
        return {
            hasError: false,
            customer
        }
    }

    private async getProductsByIds(params: SaleOrderHeader | BulkCreateSalesOrderPayload
    ): Promise<ProductModel[] | null> {
        const productsIds: string[] = params.items?.map((item) => item.product_id) as string[];
        return this.productRepository.findByIds(productsIds);
    }

    private getSalesOrderItems(params: SaleOrderHeader | BulkCreateSalesOrderPayload,
        products: ProductModel[]): SalesOrderItemModel[] {
        return params.items?.map((item) =>
            SalesOrderItemModel.create({
                price: item.price as number,
                productId: item.product_id as string,
                quantity: item.quantity as number,
                products
            })
        ) as SalesOrderItemModel[];
    }

    private getSalesOrderHeader(params: SaleOrderHeader | BulkCreateSalesOrderPayload,
        items: SalesOrderItemModel[]): SalesOrderHeaderModel {
        return SalesOrderHeaderModel.create({
            customerId: params.customer_id as string,
            items
        });
    }

    private getExistingSalesOrderHeader(params: SaleOrderHeader | BulkCreateSalesOrderPayload,
        items: SalesOrderItemModel[]): SalesOrderHeaderModel {
        return SalesOrderHeaderModel.with({
            id: params.id as string,
            customerId: params.customer_id as string,
            totalAmount: params.totalAmount as number,
            items
        });
    }

    private async getCustomerById(params: SaleOrderHeader | BulkCreateSalesOrderPayload): Promise<CustomerModel | null> {
        const customerId = params.customer_id as string;
        return this.customerRepository.findById(customerId);
    }

    private getLoggedUser(loggedUser: User): LoggedUserModel {
        return LoggedUserModel.create({
            id: loggedUser.id,
            roles: loggedUser.roles as string[],
            attributes: {
                id: loggedUser.attr.id as unknown as number,
                groups: loggedUser.attr.groups as unknown as string[]
            }
        });
    }

    private getSalesOrderLog(salesOrderHeader: SalesOrderHeaderModel, user: LoggedUserModel): SalesOrderLogModel {
        return SalesOrderLogModel.create({
            headerId: salesOrderHeader.id,
            orderData: salesOrderHeader.toStringfiedObject(),
            userData: user.toStringfiedObject()
        });
    }
}
