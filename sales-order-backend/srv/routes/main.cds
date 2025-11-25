using { sales } from '../../db/schema';

@requires: 'authenticated-user'
service MainService {
    entity SaleOrderHeaders as projection on sales.SaleOrderHeaders;
    entity SalesOrderStatuses as projection on sales.SalesOrderStatuses;
    entity Customers as projection on sales.Customers;
    entity Products as projection on sales.Products;
    entity SalesOrderLogs as projection on sales.SalesOrderLogs;
}