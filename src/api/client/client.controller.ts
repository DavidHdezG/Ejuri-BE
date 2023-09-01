import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ClientService } from './client.service';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { AuthGuard } from 'src/users/guards/auth.guard';
import { RolesGuard } from 'src/users/guards/roles.guard';
import { Roles } from 'src/users/decorators/roles.decorator';
import { Role } from 'src/users/interfaces/role.interface';

@Controller('client')
@UseGuards(AuthGuard, RolesGuard)
export class ClientController {
    @Inject(ClientService)
    private readonly service: ClientService;

    @Get(':id')
    public async findOne(@Param('id')id: string): Promise<Client>{
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
    @Roles(Role.ADMIN)
    public delete(@Param('id')id: string): Promise<Client>{
        return this.service.delete(id);
    }
}
