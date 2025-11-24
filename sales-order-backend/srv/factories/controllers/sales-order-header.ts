import { SalesOrderHeaderControllerImpl } from "srv/controllers/sales-order-header/implementation";
import { SalesOrderHeaderController } from "srv/controllers/sales-order-header/protocols";
import { salesOrderHeaderService } from "../services/sales-order-header";

export const makeSalesOrderHeaderController = (): SalesOrderHeaderController => {
    return new SalesOrderHeaderControllerImpl(salesOrderHeaderService);
}

export const salesOrderHeaderController = makeSalesOrderHeaderController();