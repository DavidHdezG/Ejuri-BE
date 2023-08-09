import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ClientService } from './client.service';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';

@Controller('client')
export class ClientController {
    @Inject(ClientService)
    private readonly service: ClientService;

    @Get(':id')
    public async findOne(@Param('id', ParseIntPipe)id: number): Promise<Client>{
        const client= await this.service.findOne(id);
        if(!client){
            throw new NotFoundException('Client not found');
        }
        return client;
    }
    
    @Post()
    public create(@Body() body: CreateClientDto): Promise<Client>{
        return this.service.create(body);
    }
        
    @Get()
    public findAll(): Promise<Client[]>{
        return this.service.findAll();
    }

    @Delete(':id')
    public delete(@Param('id', ParseIntPipe)id: number): Promise<Client>{
        return this.service.delete(id);
    }
}
