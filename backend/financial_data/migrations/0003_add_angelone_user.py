from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('financial_data', '0002_alter_zerodhauser_access_token_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='AngelOneUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('auth_token', models.TextField(db_column='auth_token')),
                ('feed_token', models.TextField(blank=True, db_column='feed_token', null=True)),
                ('refresh_token', models.TextField(blank=True, db_column='refresh_token', null=True)),
                ('client_code', models.CharField(blank=True, max_length=100, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='angelone_user',
                    to='auth.user',
                )),
            ],
            options={
                'db_table': 'angelone_user',
            },
        ),
    ]
