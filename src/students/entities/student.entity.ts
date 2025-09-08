import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Course } from "src/courses/entities/course.entity";


@Table({
    tableName:'students',
    timestamps:true,
    underscored:true
})
export class Student extends Model{
    @Column({
        type:DataType.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    })
    declare id:number;

    @Column({
        type:DataType.STRING,
        allowNull:false
    })
    declare full_name:string;

    @Column({
        type:DataType.STRING,
        unique:true,
        allowNull:false
    })
    declare email:string;

    @Column({
        type:DataType.STRING,
        allowNull:false,
        unique:true
    })
    declare phone:string;

    @ForeignKey(()=>Course)
    @Column({
        type:DataType.INTEGER,
        allowNull:false,
        field:'course_id'
    })
    declare course_id:number

    @BelongsTo(() => Course)
    declare course: Course;
}
