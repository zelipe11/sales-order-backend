import { SalesReportModel } from "srv/models/sales-report-by-days";

export interface SalesReportRepository {
    findByDays(days: number): Promise<SalesReportModel[] | null>;
}