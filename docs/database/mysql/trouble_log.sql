-- 트러블슈팅 리포트 로그 맵핑 테이블
CREATE TABLE ReportLog (
    report_id INT NOT NULL,
    log_id INT NOT NULL,
    FOREIGN KEY (report_id) REFERENCES Report(report_id)
);
