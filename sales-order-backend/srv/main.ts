import { Customer, Customers } from '@models/sales'

const customer: Customer = {
    email: 'jfelipem115@gmail.com',
    firstName: 'Jose',
    lastName: 'Martins',
    id: '1234'
};

const customers: Customers = [customer]

const funcao = (variavel: string) => console.log(variavel);
funcao('Teste do TypeScript');