using { sales } from '../schema';

namespace db.types.SalesReport;

type Params {
    days: Integer;
}

type ExpectedResult {
    salesOrderId: sales.SaleOrderHeaders: id;
    salesOrderTotalAmount: sales.SaleOrderHeaders: totalAmount;
    customerId: sales.Customers: id;
    customerFullName: String(120);
};