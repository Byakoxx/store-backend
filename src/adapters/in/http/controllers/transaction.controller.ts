import {
  Controller,
  Body,
  Post,
  Patch,
  Param,
  Get,
  Inject,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { CreateTransactionUseCase } from 'src/application/use-cases/create-transaction.use-case';
import { Transaction } from 'src/domain/models/transaction.entity';
import { CreateTransactionDto } from 'src/shared/dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from 'src/shared/dto/update-transaction-status.dto';
import { UpdateTransactionStatusUseCase } from 'src/application/use-cases/update-transaction-status.use-case';
import { TransactionRepository } from 'src/domain/ports-out/transaction.repository';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly updateTransactionStatusUseCase: UpdateTransactionStatusUseCase,
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una transacción' })
  @ApiResponse({
    status: 201,
    description: 'Transacción creada',
    type: Transaction,
  })
  async create(@Body() dto: CreateTransactionDto): Promise<Transaction> {
    return this.createTransactionUseCase.execute(dto);
  }
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update transaction status' })
  @ApiParam({ name: 'id', type: String, description: 'ID of the transaction' })
  @ApiResponse({ status: 200, description: 'Transaction updated' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionStatusDto,
  ): Promise<Transaction> {
    return this.updateTransactionStatusUseCase.execute(
      id,
      dto.status,
      dto.paymentId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all transactions' })
  @ApiResponse({
    status: 200,
    description: 'List of transactions',
    type: [Transaction],
  })
  async findAll(): Promise<Transaction[]> {
    return this.transactionRepository.findAll();
  }
}
