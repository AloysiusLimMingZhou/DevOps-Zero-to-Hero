import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'tasks' }) // Entity here is basically a database table. It lists all the column names & datatype
export class Task {
    @PrimaryGeneratedColumn({}) // Indicate it is primary key and auto incremental for this column
    id!: number

    @Column({ // Indicate column datatype and constraints
        type: "varchar",
        length: 255
    })
    title!: string

    @Column({ // Indicate column datatype
        type: "text"
    })
    text!: string

    @Column({ // Indicate column datatype & default value
        type: "boolean",
        default: false
    })
    completed!: boolean

    @CreateDateColumn({ // Indicate column name & datatype. We explicitly use name when the name of the database is different from TypeORM. Here we follow both database & typescript naming convention (database _ and typescript camelCase)
        name: 'created_at',
        type: "timestamptz"
    })
    createdAt!: Date

    @UpdateDateColumn({ // Indicate column name & datatype
        name: 'updated_at',
        type: "timestamptz"
    })
    updatedAt!: Date
}