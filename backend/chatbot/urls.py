from django.urls import path
from . import views

urlpatterns = [
    path("answer/", views.chat_with_bot, name="chat_with_bot"),
    path("ai/chart-insight/", views.get_chart_insight, name="get_chart_insight"),
    path("ai/bucket-advisory/", views.get_bucket_advisory, name="get_bucket_advisory"),
    path("ai/ask/", views.ask_financial_question, name="ask_financial_question"),
]
