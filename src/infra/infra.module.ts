import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: [
    // { provide: 'IFarmRepository', useClass: FarmImplementation },
  ],
  exports: [],
})
export class InfraModule {}
