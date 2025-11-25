import { SaleOrderHeader, SaleOrderHeaders } from '@models/sales';
import { User } from '@sap/cds';

export type CreationPayloadValidationResult = {
    hasError: boolean;
    totalAmount?: number;
    error?: Error;
};

export interface SalesOrderHeaderController {
    beforeCreate(params: SaleOrderHeader): Promise<CreationPayloadValidationResult>;
    afterCreate(params: SaleOrderHeaders, loggedUser: User): Promise<void>;
}
