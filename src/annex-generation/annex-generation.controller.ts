import { Controller, Get } from '@nestjs/common';
import { AnnexGenerationService } from './annex-generation.service';

@Controller('annex-generation')
export class AnnexGenerationController {
    constructor(private readonly appService: AnnexGenerationService) {}
    @Get()
    async getHello() {
        const list  = await this.appService.generateAnnex();
        return list;
    }
}
