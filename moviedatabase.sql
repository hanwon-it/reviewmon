use moviedatabase;

CREATE TABLE movieDB (
    movieId INT PRIMARY KEY,
    title VARCHAR(255),
    overview text,
    releaseDate DATE,
    posterPath VARCHAR(255),
    originalTitle varchar(255),
    genre_ids json,
    popularity decimal(10, 4),
    original_language VARCHAR(10),
    ratingIn float
    );
    
drop table movieDB;

ALTER TABLE movieDB ADD COLUMN original_language VARCHAR(10);

select * from movieDB;

select count(*) from movieDB; -- 47860개 2024년 -- 
select avg(popularity) from movieDB; 