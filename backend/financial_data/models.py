from django.db import models
from django.contrib.auth.models import User
from financial_data.encryption import encrypt_token, decrypt_token


class ZerodhaUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='zerodha_user')
    # Stored encrypted; use the property accessors below instead of these fields directly
    _access_token = models.TextField(db_column='access_token')
    _refresh_token = models.TextField(blank=True, null=True, db_column='refresh_token')

    @property
    def access_token(self) -> str:
        return decrypt_token(self._access_token)

    @access_token.setter
    def access_token(self, value: str):
        self._access_token = encrypt_token(value)

    @property
    def refresh_token(self):
        return decrypt_token(self._refresh_token) if self._refresh_token else None

    @refresh_token.setter
    def refresh_token(self, value):
        self._refresh_token = encrypt_token(value) if value else None
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

class AngelOneUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='angelone_user')
    # Stored encrypted
    _auth_token = models.TextField(db_column='auth_token')
    _feed_token = models.TextField(blank=True, null=True, db_column='feed_token')
    _refresh_token = models.TextField(blank=True, null=True, db_column='refresh_token')

    @property
    def auth_token(self) -> str:
        return decrypt_token(self._auth_token)

    @auth_token.setter
    def auth_token(self, value: str):
        self._auth_token = encrypt_token(value)

    @property
    def feed_token(self):
        return decrypt_token(self._feed_token) if self._feed_token else None

    @feed_token.setter
    def feed_token(self, value):
        self._feed_token = encrypt_token(value) if value else None

    @property
    def refresh_token(self):
        return decrypt_token(self._refresh_token) if self._refresh_token else None

    @refresh_token.setter
    def refresh_token(self, value):
        self._refresh_token = encrypt_token(value) if value else None

    client_code = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - AngelOne ({self.client_code or 'Unknown'})"

    class Meta:
        db_table = 'angelone_user'

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