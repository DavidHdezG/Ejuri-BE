import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ClientService } from './client.service';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { AuthGuard } from 'src/users/guards/auth.guard';
import { RolesGuard } from 'src/users/guards/roles.guard';
import { Roles } from 'src/users/decorators/roles.decorator';
import { Role } from 'src/users/interfaces/role.interface';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';

@ApiCookieAuth()
@Controller('client')
@UseGuards(AuthGuard, RolesGuard)
export class ClientController {
    @Inject(ClientService)
    private readonly service: ClientService;

    @ApiResponse({ status: 200, description: 'Cliente encontrado' })
    @ApiResponse({ status: 403, description: 'Prohibido.' })
    @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
    @Get(':id')
    public async findOne(@Param('id')id: string): Promise<Client>{
        const client= await this.service.findOne(id);
        if(!client){
            throw new NotFoundException('Client not found');
        }
        return client;
    }

    
    // TODO: Probar la creación de carpetas con clientes nuevos
    @ApiResponse({ status: 200, description: 'Cliente creado' })
    @ApiResponse({ status: 403, description: 'Prohibido.' })
    @Post()
    public create(@Body() createClientDto: CreateClientDto ): Promise<Client>{
        return this.service.create(createClientDto);
    }
        
    @ApiResponse({ status: 200, description: 'Clientes encontrados' })
    @ApiResponse({ status: 403, description: 'Prohibido.' })
    @Get()
    public findAll(): Promise<Client[]>{
        return this.service.findAll();
    }

    @ApiResponse({ status: 200, description: 'Cliente eliminado' })
    @ApiResponse({ status: 403, description: 'Prohibido.' })
    @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
    @Delete(':id')
    @Roles(5)
    public delete(@Param('id')id: string): Promise<Client>{
        return this.service.delete(id);
    }
}
