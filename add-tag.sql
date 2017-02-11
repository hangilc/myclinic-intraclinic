create table tag (
	id int not null auto_increment,
	name varchar(255) not null unique,
	primary key(id)
);

create table tag_post (
	post_id int not null,
	tag_id int not null,
	primary key(post_id, tag_id),
	foreign key (post_id) references post (id),
	foreign key (tag_id) references tag (id)
);