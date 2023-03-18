
show databases;


create database assistu_db;
select * from student;
SELECT DATE_FORMAT(birth_date, '%d-%m-%Y') AS date FROM student where stu_id = 2003041;


use assistu_db;

drop table admin;

select * from student;

create table admin (
	admin_id int primary key unique not null,
	first_name varchar(20),
    last_name varchar(20),
    email varchar(50) unique not null,
    password varchar(20) not null
);

insert into admin values(1,"Mukesh","Israni","mukeshisrani@gmail.com","muku123");

select concat((left(first_name , 1)),(left(last_name,1))) from student where email = "bhavesh28@gmail.com";
select concat((left(first_name , 1)),(left(last_name,1))) as init from admin where email = "mukeshisrani@gmail.com";
create table student (
	stu_id int primary key unique not null,
    email varchar(50) unique not null,
	first_name varchar(20),
    last_name varchar(20),
    gender char(1),
    passing_year year not null,
    birth_date date,
    password varchar(20) not null
);

insert into student values
(2003015,"khushi31@yahoo.com","Khushi","Batra",'F','2024','2002-12-31',"khushi@123"),
(2003041,"bhavesh28@gmail.com","Bhavesh","Daphale",'M','2024','2002-01-28',"bhavesh@123"); 

select * from student;
    
create table teacher (
    t_id int primary key not null auto_increment,
    first_name varchar(20),
    last_name varchar(20),
    email varchar(50) unique not null,
    password varchar(20) not null
);

create table admin (
    a_id int primary key not null auto_increment,
    first_name varchar(20),
    last_name varchar(20),
    email varchar(50) unique not null,
    password varchar(20) not null
);
    
create table subjects(
    s_id int not null auto_increment primary key,
    subject_name varchar(50), 
    semester int , 
    foreign key(t_id) references teachers.t_id 
);
    
create table assignments(
	assignment_name varchar(100),
    assigning_date date,
    foreign key(s_id) references subjects.s_id ,
    deadline datetime,
    assignment_file LONGBLOB Not Null
);

create table marks(
	foreign key(stu_id) references students.stu_id,
    foreign key(s_id) references subjects.s_id,
    marks int
);

create table notice(
	notice_date date,
    notice varchar(500),
    exp_date date
);