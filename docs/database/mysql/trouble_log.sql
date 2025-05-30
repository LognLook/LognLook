-- 트러블슈팅 리포트 로그 맵핑 테이블
CREATE TABLE ReportLog (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trouble_id INT NOT NULL,
    log_id CHAR NOT NULL,
    FOREIGN KEY (trouble_id) REFERENCES Trouble(trouble_id)
);
