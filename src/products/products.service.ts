import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {Prisma} from '@prisma/client'

@Injectable()
export class ProductsService {

  constructor(private prismaService: PrismaService){}

  async create(createProductDto: CreateProductDto) {
    try {
      return await this.prismaService.product.create({
        data: createProductDto
      });
    } catch (error) {
      if(error instanceof Prisma.PrismaClientKnownRequestError){
        if(error.code === 'P2002'){  // codigo que indica registros repetidos por un campo 
          throw new ConflictException(`El producto ${createProductDto.name} ya existe en la bd`)
        }
      }

      throw new InternalServerErrorException();
    }
  }

  findAll() {
    // Es como un select from *
    return this.prismaService.product.findMany();
  }

  async findOne(id: number) {
    const productFound = await this.prismaService.product.findUnique({
      where: {
        id
      }
    });

    if(!productFound) {
      throw new NotFoundException(`El producto con id ${id} no fue encontrado`);
    }

    return productFound;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const productFound = await this.prismaService.product.update({
      where: {
        id
      },
      data: updateProductDto
    });

    if(!productFound){
      throw new NotFoundException(`Producto ${id} no encontrado`)
    }

    return productFound;
  }

  async remove(id: number) {
    const deleteProduct = await this.prismaService.product.delete({
      where: {
        id
      }
    })

    if(!deleteProduct) {
      throw new NotFoundException(`El producto con id ${id} no fue encontrado`)
    }

    return deleteProduct;
  }
}
