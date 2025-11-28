import { SalesReportService } from "srv/services/sales-report/protocols";
import { SalesReportController } from "./protocols";
import { ExpectedResult as SalesReportByDays } from "@models/db/types/SalesReportByDays";

export class SalesReportControllerImpl implements SalesReportController {
    constructor(private readonly service: SalesReportService) {}

    public async findByDays(days: number): Promise<SalesReportByDays[]> {
        return this.service.findByDays(days);
    }

    public async findByCustomerId(customerId: string): Promise<SalesReportByDays[]> {
        return this.service.findByCustomerId(customerId);
    }
}