from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0002_teacherclass_capacity_teacherclass_duration_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="lesson",
            name="hero_media_type",
            field=models.CharField(
                blank=True,
                choices=[("image", "Image"), ("video", "Video")],
                help_text="Type of hero media to display (image or video)",
                max_length=10,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="lesson",
            name="hero_media_url",
            field=models.URLField(
                blank=True,
                help_text="URL for the hero media (image or video)",
                max_length=500,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="topic",
            name="hero_media_type",
            field=models.CharField(
                blank=True,
                choices=[("image", "Image"), ("video", "Video")],
                help_text="Type of hero media to display (image or video)",
                max_length=10,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="topic",
            name="hero_media_url",
            field=models.URLField(
                blank=True,
                help_text="URL for the hero media (image or video)",
                max_length=500,
                null=True,
            ),
        ),
    ]
