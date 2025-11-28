using { sales } from '../../db/schema';
using { db.types.SalesReportByDays } from '../../db/types/sales-report-by-days';

//Entities
//@requires: 'authenticated-user'
service MainService {
    entity SaleOrderHeaders as projection on sales.SaleOrderHeaders;
    entity SalesOrderStatuses as projection on sales.SalesOrderStatuses;
    entity Customers as projection on sales.Customers;
    entity Products as projection on sales.Products;
    entity SalesOrderLogs as projection on sales.SalesOrderLogs;
}

//Functions
extend service MainService with {
    function getSalesReportByDays(days: SalesReportByDays.Params:days) returns array of SalesReportByDays.ExpectedResult;
}