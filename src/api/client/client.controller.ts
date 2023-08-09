import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ClientService } from './client.service';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';

@Controller('client')
export class ClientController {
    @Inject(ClientService)
    private readonly service: ClientService;

    @Get(':id')
    public getClient(@Param('id', ParseIntPipe)id: number): Promise<Client>{
        return this.service.findOne(id);
    }
    
    @Post()
    public createClient(@Body() body: CreateClientDto): Promise<Client>{
        return this.service.create(body);
    }
        
    @Get()
    public getClients(): Promise<Client[]>{
        return this.service.findAll();
    }

    @Delete(':id')
    public deleteClient(@Param('id', ParseIntPipe)id: number): Promise<Client>{
        return this.service.delete(id);
    }
}
