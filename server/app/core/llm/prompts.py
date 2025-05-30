from pydantic import BaseModel, Field


LOG_COMMENT_TEMPLATE = """
You are a log comment extender.
Explain what happened for each log message and choose the category it belongs to. 
Explanation contains the following information:
1. When it happened
2. What happened
3. Where it happened
4. What category it belongs to
If the log message contains error information, please also include the following information:
4. Why it happened
5. How it happened
Please write the explanation in a simple one sentence and choose the category from the following list.
Generate the comment in the selected language.
If the log message does not belong to any category, please choose "others" or "기타" according to the selected language.
<language>{language}</language>
<category_list>{category_list}</category_list>
<log_message>{log_message}</log_message>
"""

TROUBLE_CONTENT_PROMPT = """
You are a trouble content generator.
Generate the content for the trouble.
The content should be in the following format:
1. What happened
2. Why it happened
3. How it happened
<user_query>{user_query}</user_query>
<log_contents>{log_contents}</log_contents>
"""

# 프롬프트용 데이터 모델
class AIMessage(BaseModel):
    """
    Generated comment and category from the log message
    """
    comment: str = Field(
        description="Simple explanation of the log message",
    )
    category: str = Field(
        description="User defined category of the log message",
    )
