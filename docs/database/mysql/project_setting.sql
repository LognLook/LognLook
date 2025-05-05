-- 프로젝트 설정 테이블
CREATE TABLE ProjectSetting (
    project_id INT PRIMARY KEY,
    logstash_config JSON, -- logstash 연결 설정
    log_keywords JSON, -- 로그 키워드 설정
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 설정 최종 수정일
    FOREIGN KEY (project_id) REFERENCES Project(project_id)
);