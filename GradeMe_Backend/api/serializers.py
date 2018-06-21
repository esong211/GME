from rest_framework import serializers
from api.models import School, User, Course, Assignment, Submission


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email',
                  'password_hash', 'color_pref', 'account_created', 'school')


class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ('id', 'name')


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        always_return_data = True
        model = Course
        fields = ('id', 'name', 'description', 'students', 'tas', 'instructors', 'student_ac', 'ta_ac')


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        always_return_data = True
        model = Assignment
        fields = ('id', 'name', 'description', 'start_date', 'end_date', 'attachment', 'course')


class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        always_return_data = True
        model = Submission
        fields = ('id', 'submission_date', 'graded_date', 'score', 'text', 'attachment', 'assignment', 'submitter')
