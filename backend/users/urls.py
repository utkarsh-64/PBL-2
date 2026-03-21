from django.urls import path
from . import views

urlpatterns = [
    # Google OAuth endpoints
    path('google/login/', views.google_login, name='google_login'),
    path('callback/', views.oauth_callback, name='oauth_callback'),
    
    # Manual authentication endpoints
    path('register/', views.register_user, name='register_user'),
    path('login/', views.login_user, name='login_user'),
    
    # Common auth endpoints
    path('verify/', views.verify_token, name='verify_token'),
    path('logout/', views.logout_view, name='logout'),
    
    # User data endpoints
    path("income/add/", views.add_income_status, name="add_income_status"),
    path("income/list/", views.list_income_status, name="list_income_status"),
    path("retirement/add/", views.add_retirement_info, name="add_retirement_info"),
    path("retirement/list/", views.list_retirement_info, name="list_retirement_info"),
    path('user/add/', views.add_user_data, name='add_user_data'),
    path('user/get/', views.get_user_data, name='get_user_data'),
    path("life-expectancy/add/", views.add_life_expectancy, name="add_life_expectancy"),
    path('life-expectancy/skip/', views.skip_life_expectancy, name='skip_life_expectancy'),
]