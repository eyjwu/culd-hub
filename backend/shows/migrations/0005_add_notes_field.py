# Generated by Django 4.1.2 on 2022-12-25 23:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("shows", "0004_show_is_out_of_city"),
    ]

    operations = [
        migrations.AddField(
            model_name="show",
            name="notes",
            field=models.TextField(blank=True),
        ),
    ]
