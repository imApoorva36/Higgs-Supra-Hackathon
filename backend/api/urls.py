from django.urls import path
from .views import create_tag, get_tag, actuate_servo, verify_package_content


urlpatterns = [
    path('create_tag/', create_tag),
    path('get_tag/', get_tag),
    path('servo/', actuate_servo),
]
