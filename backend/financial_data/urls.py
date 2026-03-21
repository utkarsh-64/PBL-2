from django.urls import path
from . import views

urlpatterns = [
    path('kite/login-url/', views.get_login_url, name='kite_login_url'),
    path('kite/callback/', views.kite_callback, name='kite_callback'),
    path('kite/profile/', views.kite_profile, name='kite_profile'),
    path('kite/disconnect/', views.disconnect_zerodha, name='disconnect_zerodha'),
    path('kite/holdings/', views.get_user_stock_holdings, name='get_user_holdings'),
    path('risk/calculate/', views.calculate_risk_tolerance, name='calculate_risk'),
    path('risk/profile/', views.get_risk_profile, name='get_risk_profile'),
    path('stocks/details/', views.get_stock_details, name='get_stock_details'),
    path('test-auth/', views.test_auth, name='test_auth'),
    path("api/financial/stocks/", views.get_stock_data, name="get_stock_data"),
]