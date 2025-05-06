from app.infra.database.elaticsearch import ElasticsearchClient


class ESRepository:
    def __init__(self, es_client: ElasticsearchClient):
        self.es_client = es_client

    def create_index(self, index: str, ):
        pass

    def save_log(self, index: str, log_data: dict):
        pass

    def search_logs(self, index: str, query: dict):
        pass