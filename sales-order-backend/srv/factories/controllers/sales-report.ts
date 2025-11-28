import { SalesReportControllerImpl } from 'srv/controllers/sales-report/implementation';
import { SalesReportController } from 'srv/controllers/sales-report/protocols';
import { salesReportService } from '../services/sales-report';

export const makeSalesReportController = (): SalesReportController => {
    return new SalesReportControllerImpl(salesReportService);
};

export const salesReportController = makeSalesReportController();
