using { User, managed } from '@sap/cds/common';

namespace sales;

entity SaleOrderHeaders {
    key id: UUID;
        customer: Association to Customers;
        totalAmount: Decimal(15,2);
        status: Association to SalesOrderStatuses;
        createdAt  : Timestamp @cds.on.insert : $now;
        createdBy  : User      @cds.on.insert : $user;
        modifiedAt : Timestamp @cds.on.insert : $now  @cds.on.update : $now;
        modifiedBy : User      @cds.on.insert : $user @cds.on.update : $user;
        items: Composition of many SalesOrderItems on items.header = $self;
}

entity SalesOrderItems {
    key id: UUID;
        header: Association to SaleOrderHeaders;
        product: Association to Products;
        quantity: Integer;
        price: Decimal(15,2); 
}

entity SalesOrderLogs: managed {
    key id: UUID;
        header: Association to SaleOrderHeaders;
        userData: LargeString;
        orderData: LargeString;
}

entity SalesOrderStatuses {
    key id: String enum {
        COMPLETED = 'COMPLETED';
        PENDING = 'PENDGING';
        REJECTED = 'REJECTED';
    };
    description: localized String;
}

entity Customers {
    key id: UUID;
        firstName: String(20);
        lastName: String(100);
        email: String(255);
}

entity Products {
    key id: UUID;
        name: String(255);
        price: Decimal(15,2);
        stock: Integer;
}