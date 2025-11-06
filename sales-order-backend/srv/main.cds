using { sales } from '../db/schema';

service MainSercice {    
    entity SaleOrderHeaders as projection on sales.SaleOrderHeaders;
}