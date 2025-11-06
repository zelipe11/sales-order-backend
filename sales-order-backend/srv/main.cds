using { sales } from '../db/schema';

service MainSercice {    
    entity SaleOrderHeaders as projection on sales.SaleOrderHeaders;
    entity Customers as projection on sales.Customers;
    entity Products as projection on sales.Products;
}