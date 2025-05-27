import { Controller, Get, HttpCode } from "@nestjs/common";

@Controller("/")
export class HealthCheckController {
    @Get()
    @HttpCode(200)
    healthCheck(): string {
        return "Payment ms is running :D!";
    }
}