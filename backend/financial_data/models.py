from django.db import models
from django.contrib.auth.models import User


class ZerodhaUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='zerodha_user')
    access_token = models.TextField()
    refresh_token = models.TextField(blank=True, null=True)
    api_key = models.CharField(max_length=100)
    zerodha_user_id = models.CharField(max_length=100, blank=True, null=True)
    user_name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    mobile = models.CharField(max_length=20, blank=True, null=True)
    broker = models.CharField(max_length=50, blank=True, null=True)
    products = models.JSONField(default=list, blank=True)
    order_types = models.JSONField(default=list, blank=True)
    exchanges = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.user_name or 'Unknown'}"

    class Meta:
        db_table = 'zerodha_user'

class RiskProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='risk_profile')
    risk_score = models.FloatField()
    risk_category = models.CharField(max_length=50)
    last_calculated = models.DateTimeField(auto_now=True)
    stock_exposure = models.JSONField(default=dict)
    mf_exposure = models.JSONField(default=dict)
    fd_value = models.FloatField(default=0.0)
    calculation_mode = models.CharField(max_length=10, choices=[('zerodha', 'Zerodha'), ('manual', 'Manual')], default='zerodha')
    
    def __str__(self):
        return f"{self.user.username} - {self.risk_category} ({self.risk_score})"

    class Meta:
        db_table = 'risk_profile'