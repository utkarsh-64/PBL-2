from django.db import models
from django.contrib.auth.models import User


class Chat(models.Model):
    SENDER_CHOICES = (
        ("user", "User"),
        ("assistant", "Assistant"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chats")
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    content = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username}"
