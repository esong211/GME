"""GradeMe URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from rest_framework import routers

from api import views

router = routers.DefaultRouter()
router.register(r'school', views.SchoolViewSet, base_name="school")
router.register(r'user', views.UserViewSet, base_name="user")
router.register(r'course', views.CourseViewSet, base_name="course")
router.register(r'assignment', views.AssignmentViewSet, base_name="assignment")
router.register(r'submission', views.SubmissionViewSet, base_name="submission")

urlpatterns = router.urls
