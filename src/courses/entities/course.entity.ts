import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { Student } from "./../../students/entities/student.entity";

@Table({
    tableName:'courses',
    timestamps:true,
    underscored:true
})
export class Course extends Model{

    @Column({
        type:DataType.INTEGER,
        autoIncrement:true,
        primaryKey:true,
        allowNull:false
    })
    declare id:number;

    @Column({
        type:DataType.STRING,
        allowNull:false
    })
    declare name:string;

    @Column({
        type:DataType.STRING,
        allowNull:false
    })
    declare description:string;

    @Column({
        type:DataType.DATE,
        allowNull:false
    })
    declare start_date:string

   @Column({
        type:DataType.DATE,
        allowNull:false
    })
    declare end_date:string;

    @HasMany(() => Student, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    declare students: Student[];
}
